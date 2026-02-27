/**
 * Loan Routes - Hybrid Blockchain Model
 * 
 * Handles loan creation, funding, disbursement, and repayment
 * Uses wallet service for INR transactions (off-chain)
 * Uses web3 service for audit trail (on-chain)
 */

const express = require('express');
const router = express.Router();
const { body, param, validationResult } = require('express-validator');
const Loan = require('../models/Loan');
const User = require('../models/User');
const Investment = require('../models/Investment');
const Repayment = require('../models/Repayment');
const { authenticate, requireBorrower, requireLender, requireKYC } = require('../middleware/auth.middleware');
const web3Service = require('../services/web3.service');
const walletService = require('../services/wallet.service');
const loanPoolService = require('../services/loanPool.service');
const interestService = require('../services/interest.service');
const { creditSystemWallet } = require('../services/systemWallet.service');

/**
 * @route   POST /api/loan/create
 * @desc    Create a new loan request (Borrower only)
 * @access  Private (Borrower)
 *
 * Interest rate is COMPUTED from borrower's credit score — not user-entered.
 * Duration must be RBI-approved: 1, 6, 12, 24, or 36 months.
 */
router.post('/create', [
    authenticate,
    requireBorrower,
    requireKYC,
    body('amount').isFloat({ min: 1000 }).withMessage('Amount must be at least ₹1,000'),
    body('durationMonths')
        .isInt().withMessage('Duration must be an integer')
        .custom(v => interestService.isValidDuration(Number(v)))
        .withMessage(`Duration must be one of: ${interestService.ALLOWED_DURATIONS.join(', ')} months`),
    body('reason').trim().isLength({ min: 4, max: 500 }).withMessage('Reason must be 4-500 characters')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
        }

        const { amount, durationMonths, reason } = req.body;
        const borrower = req.user;
        const months = Number(durationMonths);

        // ─── Compute interest from credit score ─────────────────────────────
        const creditScore = borrower.creditScore || 650;
        const annualRate = interestService.calculateAnnualRate(creditScore);
        const emiAmount = interestService.calculateEMI(amount, annualRate, months);
        // EMI schedule will be generated on acceptance (when actual start date is known)

        console.log(`📊 Loan create: ₹${amount}, ${months}mo, credit=${creditScore}, rate=${annualRate}%, EMI=₹${emiAmount}`);

        // ─── Blockchain audit trail (non-fatal) ─────────────────────────────
        const borrowerRefAddress = '0x' + borrower._id.toString().padStart(40, '0').substring(0, 40);
        let blockchainResult = { loanId: null, transactionHash: null, warning: 'Blockchain unavailable' };
        try {
            blockchainResult = await web3Service.createLoanOnBlockchain(
                borrowerRefAddress,
                amount,
                Math.floor(annualRate * 100), // basis points
                months * 30,                   // days approximation for blockchain
                reason
            );
        } catch (bcErr) {
            console.warn(`⚠️  Blockchain audit failed (non-fatal): ${bcErr.message}`);
            // blockchainResult stays as the safe default above — loan still saves
        }

        // ─── Save to MongoDB ─────────────────────────────────────────────────
        const loan = new Loan({
            borrower: borrower._id,
            amount,
            durationMonths: months,
            creditScore,
            annualInterestRate: annualRate,
            emiAmount,
            remainingPrincipal: amount,
            reason,
            loanId: blockchainResult.loanId,
            smartContractAddress: web3Service.contractAddress,
            transactionHashes: { creation: blockchainResult.transactionHash },
            status: 'Requested',
            fundedAmount: 0
        });

        await loan.save();
        await loanPoolService.createLoanPool(loan._id, amount);

        // ─── Hard-inquiry credit score deduction (-5) ────────────────────────
        // NOTE: creditScore above was captured BEFORE this write, so the current
        // loan's interest rate is unaffected. Future loans pay the penalty.
        let newCreditScore = null;
        try {
            const scoreUser = await User.findById(borrower._id);
            if (scoreUser) {
                scoreUser.creditScore = Math.min(900, Math.max(300,
                    (scoreUser.creditScore || 650) - 5
                ));
                await scoreUser.save();
                newCreditScore = scoreUser.creditScore;
            }
            console.log(`📊 Credit score hard-inquiry deduction: borrower ${borrower._id}, delta=-5, new=${newCreditScore}`);
        } catch (e) {
            console.error('Credit score deduction error (non-fatal):', e.message);
        }

        res.status(201).json({
            success: true,
            message: 'Loan request created successfully',
            data: {
                loan: loan.toPublicJSON(),
                interestInfo: {
                    creditScore,
                    annualInterestRate: annualRate,
                    monthlyEMI: emiAmount,
                    durationMonths: months,
                    platformFee: interestService.calculateBorrowerFee(amount),
                    platformFeeNote: '4% upfront fee will be deducted on loan acceptance',
                    creditScoreAfterInquiry: newCreditScore,
                    creditScoreNote: 'Hard inquiry: -5 points applied to your credit score'
                },
                blockchain: {
                    transactionHash: blockchainResult.transactionHash ?? null,
                    loanId: blockchainResult.loanId ?? null,
                    warning: blockchainResult.warning ?? null
                }
            }
        });

    } catch (error) {
        console.error('Create loan error:', error);
        res.status(500).json({ success: false, message: 'Failed to create loan', error: error.message });
    }
});

/**
 * @route   GET /api/loan/my-loans
 * @desc    Get user's loans (Borrower: created loans, Lender: funded loans)
 * @access  Private
 */
router.get('/my-loans', authenticate, async (req, res) => {
    try {
        const user = req.user;
        let loans;

        if (user.role === 'borrower') {
            // Get loans created by this borrower
            loans = await Loan.find({ borrower: user._id })
                .sort({ createdAt: -1 })
                .populate('borrower', 'name email');
        } else {
            // Get loans funded by this lender
            loans = await Loan.find({
                'lenders.lenderId': user._id
            })
                .sort({ createdAt: -1 })
                .populate('borrower', 'name email');
        }

        res.status(200).json({
            success: true,
            count: loans.length,
            data: loans.map(loan => loan.toPublicJSON())
        });

    } catch (error) {
        console.error('Get my loans error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch loans',
            error: error.message
        });
    }
});

/**
 * @route   GET /api/loan/all
 * @desc    Get all available loans (Lender view)
 * @access  Private (Lender)
 */
router.get('/all', [authenticate, requireLender], async (req, res) => {
    try {
        const { status, minAmount, maxAmount, maxDuration } = req.query;

        // Build query
        let query = {};

        if (status) {
            query.status = status;
        } else {
            // By default, show only requested loans
            query.status = 'Requested';
        }

        if (minAmount) {
            query.amount = { ...query.amount, $gte: parseFloat(minAmount) };
        }

        if (maxAmount) {
            query.amount = { ...query.amount, $lte: parseFloat(maxAmount) };
        }

        if (maxDuration) {
            query.duration = { $lte: parseInt(maxDuration) };
        }

        const loans = await Loan.find(query)
            .sort({ createdAt: -1 })
            .populate('borrower', 'name email kycDetails.verified');

        res.status(200).json({
            success: true,
            count: loans.length,
            data: loans.map(loan => loan.toPublicJSON())
        });

    } catch (error) {
        console.error('Get all loans error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch loans',
            error: error.message
        });
    }
});

/**
 * @route   GET /api/loan/:id
 * @desc    Get specific loan details
 * @access  Private
 */
router.get('/:id', [
    authenticate,
    param('id').isMongoId().withMessage('Invalid loan ID')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const loan = await Loan.findById(req.params.id)
            .populate('borrower', 'name email kycDetails.verified')
            .populate('loanPoolId');

        if (!loan) {
            return res.status(404).json({
                success: false,
                message: 'Loan not found'
            });
        }

        // Get blockchain data for additional details
        let blockchainData = null;
        if (loan.loanId !== undefined && loan.loanId !== null) {
            try {
                blockchainData = await web3Service.getLoanDetailsFromBlockchain(loan.loanId);
            } catch (error) {
                console.warn('Could not fetch blockchain data:', error.message);
            }
        }

        res.status(200).json({
            success: true,
            data: {
                loan: loan.toPublicJSON(),
                blockchain: blockchainData
            }
        });

    } catch (error) {
        console.error('Get loan error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch loan',
            error: error.message
        });
    }
});

/**
 * @route   POST /api/loan/fund
 * @desc    Fund a loan with INR (Lender only)
 * @access  Private (Lender)
 */
router.post('/fund', [
    authenticate,
    requireLender,
    requireKYC,
    body('loanId').isMongoId().withMessage('Invalid loan ID'),
    body('amount').isFloat({ min: 100 }).withMessage('Amount must be at least ₹100')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { loanId, amount } = req.body;
        const lender = req.user;

        // Find loan
        const loan = await Loan.findById(loanId);

        if (!loan) {
            return res.status(404).json({
                success: false,
                message: 'Loan not found'
            });
        }

        // Validate loan status
        if (loan.status !== 'Requested') {
            return res.status(400).json({
                success: false,
                message: 'Loan is not available for funding'
            });
        }

        // Validate funding amount
        const remainingAmount = loan.amount - loan.fundedAmount;
        if (amount > remainingAmount) {
            return res.status(400).json({
                success: false,
                message: `Funding amount exceeds remaining amount (₹${remainingAmount.toFixed(2)})`
            });
        }

        // Check lender has sufficient balance
        const hasFunds = await walletService.hasSufficientBalance(lender._id, amount);
        if (!hasFunds) {
            return res.status(400).json({
                success: false,
                message: 'Insufficient wallet balance'
            });
        }


        // Process contribution through loan pool service
        // This handles: wallet deduction, pool addition, blockchain logging, AND loan updates
        const result = await loanPoolService.addContribution(
            loan._id,
            lender._id,
            amount
        );

        // Create Investment document for analytics and portfolio tracking
        try {
            const lenderShare = amount / loan.amount; // Proportion funded by this lender

            // Compute expected returns:
            // Lender receives their share of all EMI payments (principal + interest),
            // minus the 4.5% platform service fee deducted per EMI.
            let totalEmiSum = 0;
            if (loan.emiSchedule && loan.emiSchedule.length > 0) {
                // Sum of all EMIs * lender share * (1 - 4.5% service fee)
                totalEmiSum = loan.emiSchedule.reduce((acc, e) => acc + (e.emiAmount || 0), 0);
            } else if (loan.annualInterestRate) {
                // Fallback: use annualInterestRate estimate if schedule not generated yet
                const monthlyRate = loan.annualInterestRate / 12 / 100;
                const n = loan.durationMonths || 12;
                const factor = Math.pow(1 + monthlyRate, n);
                const emi = (loan.amount * monthlyRate * factor) / (factor - 1);
                totalEmiSum = emi * n;
            } else {
                // Last resort: principal only (safe default, avoids NaN)
                totalEmiSum = loan.amount;
            }

            const LENDER_SERVICE_FEE_RATE = 0.045; // 4.5% per EMI to platform
            const expectedReturns = Math.round(
                (totalEmiSum * lenderShare * (1 - LENDER_SERVICE_FEE_RATE)) * 100
            ) / 100;


            const investment = new Investment({
                lender: lender._id,
                loan: loan._id,
                amountFunded: amount,
                fundingDate: new Date(),
                fundingTxHash: result.blockchainTxHash,
                status: 'Active',
                returnsReceived: 0,
                expectedReturns: expectedReturns,
                roi: 0
            });

            await investment.save();
            console.log(`✅ Investment document created: ${investment._id} for lender ${lender._id}, amount: ₹${amount}`);
        } catch (investmentError) {
            console.error('❌ ERROR creating Investment document:', investmentError);
            console.error('Investment error stack:', investmentError.stack);
            // Don't fail the whole transaction, but log the error
        }

        // Refresh loan data after loanPool service updated it
        const updatedLoan = await Loan.findById(loan._id);

        res.status(200).json({
            success: true,
            message: updatedLoan.status === 'Funded'
                ? 'Loan fully funded successfully'
                : 'Loan partially funded successfully',
            data: {
                loan: updatedLoan.toPublicJSON(),
                contribution: {
                    amount: amount,
                    remainingAmount: updatedLoan.amount - updatedLoan.fundedAmount,
                    blockchainTxHash: result.blockchainTxHash
                }
            }
        });

    } catch (error) {
        console.error('Fund loan error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fund loan',
            error: error.message
        });
    }
});

/**
 * @route   POST /api/loan/accept
 * @desc    Accept funded loan — disburses principal, deducts 4% platform fee
 * @access  Private (Borrower)
 */
router.post('/accept', [
    authenticate,
    requireBorrower,
    requireKYC,
    body('loanId').isMongoId().withMessage('Invalid loan ID')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
        }

        const { loanId } = req.body;
        const borrower = req.user;

        const loan = await Loan.findById(loanId);
        if (!loan) return res.status(404).json({ success: false, message: 'Loan not found' });
        if (loan.borrower.toString() !== borrower._id.toString())
            return res.status(403).json({ success: false, message: 'Not authorized' });
        if (loan.status !== 'Funded')
            return res.status(400).json({ success: false, message: 'Loan must be fully funded before acceptance' });

        // ─── Disburse principal to borrower wallet ───────────────────────────
        const result = await loanPoolService.disburseLoan(loan._id, borrower._id);

        // ─── Deduct 4% upfront platform fee from borrower wallet ─────────────
        const platformFee = interestService.calculateBorrowerFee(loan.amount);
        const borrowerWallet = await walletService.getWallet(borrower._id);

        if (borrowerWallet.balance >= platformFee) {
            await walletService.deductBalance(
                borrower._id,
                platformFee,
                'PLATFORM_FEE',
                { referenceType: 'Loan', referenceId: loan._id },
                `Platform facilitation fee (4%) for loan ${loan._id}`
            );
            await creditSystemWallet(
                platformFee,
                'BORROWER_UPFRONT_FEE',
                loan._id,
                borrower._id,
                `4% upfront fee from borrower ${borrower._id} for loan ${loan._id}`
            );
            console.log(`💰 Platform fee ₹${platformFee} collected from borrower`);
        } else {
            console.warn(`⚠️  Borrower has insufficient balance for platform fee — skipping (will collect later)`);
        }

        // ─── Generate EMI schedule from today ────────────────────────────────
        const acceptedAt = new Date();
        const emiSchedule = interestService.generateEMISchedule(
            loan.amount,
            loan.annualInterestRate,
            loan.durationMonths,
            acceptedAt
        );

        // ─── Update loan record ──────────────────────────────────────────────
        await Loan.findByIdAndUpdate(loan._id, {
            acceptedAt,
            autoPayEnabled: borrower.autoPayEnabled || false,
            platformFeeCharged: platformFee,
            emiSchedule,
            remainingPrincipal: loan.amount
        });

        const updatedLoan = await Loan.findById(loan._id);

        res.status(200).json({
            success: true,
            message: `Loan accepted. ₹${loan.amount.toFixed(2)} credited. Platform fee ₹${platformFee.toFixed(2)} deducted.`,
            data: {
                loan: updatedLoan.toPublicJSON(),
                disbursement: { amount: loan.amount, blockchainTxHash: result.blockchainTxHash },
                fees: { platformFee, note: '4% one-time facilitation fee' }
            }
        });

    } catch (error) {
        console.error('Accept loan error:', error);
        res.status(500).json({ success: false, message: 'Failed to accept loan', error: error.message });
    }
});

/**
 * @route   POST /api/loan/repay
 * @desc    Pay the next pending EMI (reducing balance, monthly)
 *          4.5% lender service fee deducted per EMI → system wallet
 * @access  Private (Borrower)
 */
router.post('/repay', [
    authenticate,
    requireBorrower,
    requireKYC,
    body('loanId').isMongoId().withMessage('Invalid loan ID')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
        }

        const { loanId } = req.body;
        const borrower = req.user;

        const loan = await Loan.findById(loanId).populate('loanPoolId');
        if (!loan) return res.status(404).json({ success: false, message: 'Loan not found' });
        if (loan.borrower.toString() !== borrower._id.toString())
            return res.status(403).json({ success: false, message: 'Not authorized' });
        if (loan.status !== 'Active')
            return res.status(400).json({ success: false, message: 'Loan is not active' });
        if (loan.repaymentCompleted)
            return res.status(400).json({ success: false, message: 'Loan already fully repaid' });

        // ─── Find next pending EMI ───────────────────────────────────────────
        const nextEmiIndex = loan.emiSchedule.findIndex(e => e.status === 'pending');
        if (nextEmiIndex === -1)
            return res.status(400).json({ success: false, message: 'No pending EMIs found' });

        const emiEntry = loan.emiSchedule[nextEmiIndex];
        const emiAmount = emiEntry.emiAmount;

        // Include any pending penalty
        const penaltyDue = emiEntry.penaltyAmount > 0 && !emiEntry.penaltyPaid ? emiEntry.penaltyAmount : 0;
        const totalDue = Math.round((emiAmount + penaltyDue) * 100) / 100;

        // ─── Check balance ───────────────────────────────────────────────────
        const hasFunds = await walletService.hasSufficientBalance(borrower._id, totalDue);
        if (!hasFunds) {
            return res.status(400).json({
                success: false,
                message: `Insufficient wallet balance. Required: ₹${totalDue.toFixed(2)} (EMI: ₹${emiAmount.toFixed(2)}${penaltyDue > 0 ? ` + Penalty: ₹${penaltyDue.toFixed(2)}` : ''})`
            });
        }

        // ─── Debit borrower wallet ───────────────────────────────────────────
        await walletService.deductBalance(
            borrower._id,
            totalDue,
            'REPAYMENT_PAID',
            { referenceType: 'Loan', referenceId: loan._id },
            `EMI ${emiEntry.emiNumber}/${loan.durationMonths} for loan ${loan._id}`
        );

        // ─── Distribute to lenders (minus 4.5% service fee) ─────────────────
        const totalLoanAmount = loan.amount;
        const distributions = [];
        let totalServiceFee = 0;

        for (const lender of loan.lenders) {
            const lenderShare = lender.contributionAmount / totalLoanAmount;
            const lenderEmiShare = Math.round(emiAmount * lenderShare * 100) / 100;
            const { serviceFee, netToLender } = interestService.calculateLenderServiceFee(lenderEmiShare);

            await walletService.creditBalance(
                lender.lenderId,
                netToLender,
                'REPAYMENT_RECEIVED',
                { referenceType: 'Loan', referenceId: loan._id },
                `EMI ${emiEntry.emiNumber} share (after 4.5% fee) for loan ${loan._id}`
            );

            totalServiceFee += serviceFee;
            distributions.push({ lenderId: lender.lenderId, gross: lenderEmiShare, serviceFee, net: netToLender });
        }

        // ─── Route service fees to system wallet ─────────────────────────────
        totalServiceFee = Math.round(totalServiceFee * 100) / 100;
        if (totalServiceFee > 0) {
            await creditSystemWallet(
                totalServiceFee,
                'LENDER_SERVICE_FEE',
                loan._id,
                null,
                `4.5% service fee from EMI ${emiEntry.emiNumber} of loan ${loan._id}`
            );
        }

        // ─── Route penalty to system wallet ─────────────────────────────────
        if (penaltyDue > 0) {
            await creditSystemWallet(
                penaltyDue,
                'MISSED_EMI_PENALTY',
                loan._id,
                borrower._id,
                `Penalty for missed EMI ${emiEntry.emiNumber}`
            );
        }

        // ─── Update EMI schedule & loan state ───────────────────────────────
        loan.emiSchedule[nextEmiIndex].status = 'paid';
        loan.emiSchedule[nextEmiIndex].paidAt = new Date();
        if (penaltyDue > 0) loan.emiSchedule[nextEmiIndex].penaltyPaid = true;

        loan.emisPaid = (loan.emisPaid || 0) + 1;
        loan.totalPrincipalPaid = Math.round(((loan.totalPrincipalPaid || 0) + emiEntry.principalComponent) * 100) / 100;
        loan.remainingPrincipal = Math.max(0, Math.round((emiEntry.remainingPrincipal) * 100) / 100);

        const isLastEmi = loan.emisPaid >= loan.durationMonths;
        if (isLastEmi) {
            loan.status = 'Repaid';
            loan.repaymentCompleted = true;
            loan.repaidAt = new Date();
        }

        loan.markModified('emiSchedule');
        await loan.save();

        // ─── Update borrower credit score ─────────────────────────────────────
        let creditScoreDelta = 0;
        let newCreditScore = null;
        try {
            // Late payment (had penalty) → small hit; on-time → reward
            if (penaltyDue > 0) {
                creditScoreDelta = -20;  // paid late
            } else {
                creditScoreDelta = 5;    // paid on time
            }
            // Bonus for completing the entire loan
            if (isLastEmi) creditScoreDelta += 10;

            const scoreUser = await User.findById(borrower._id);
            if (scoreUser) {
                scoreUser.creditScore = Math.min(900, Math.max(300,
                    (scoreUser.creditScore || 650) + creditScoreDelta
                ));
                await scoreUser.save();   // triggers timestamps + validators
                newCreditScore = scoreUser.creditScore;
            }
            console.log(`📊 Credit score updated: borrower ${borrower._id}, delta=${creditScoreDelta > 0 ? '+' : ''}${creditScoreDelta}, new=${newCreditScore}`);
        } catch (e) {
            console.error('Credit score update error (non-fatal):', e.message);
        }

        // ─── Blockchain audit trail ──────────────────────────────────────────
        let blockchainTxHash = null;
        try {
            const lenderShares = distributions.map(d => d.net);
            const bcResult = await web3Service.logRepaymentOnBlockchain(loan.loanId, emiAmount, lenderShares);
            blockchainTxHash = bcResult?.transactionHash || null;
        } catch (e) { console.warn('Blockchain audit failed (non-fatal):', e.message); }

        // ─── Update investments ──────────────────────────────────────────────
        if (isLastEmi) {
            const investments = await Investment.find({ loan: loan._id, status: 'Active' });
            for (const inv of investments) {
                inv.returnsReceived = (inv.returnsReceived || 0) + inv.amountFunded;
                inv.status = 'Repaid';
                await inv.save();
            }
        }

        // ─── Repayment record ────────────────────────────────────────────────
        try {
            await new Repayment({
                loan: loan._id,
                borrower: borrower._id,
                amount: totalDue,
                transactionHash: blockchainTxHash,
                lenderDistributions: distributions.map(d => ({ lender: d.lenderId, amount: d.net }))
            }).save();
        } catch (e) { console.error('Repayment doc error (non-fatal):', e.message); }

        res.status(200).json({
            success: true,
            message: isLastEmi ? '🎉 Final EMI paid! Loan fully repaid.' : `EMI ${emiEntry.emiNumber}/${loan.durationMonths} paid successfully.`,
            data: {
                emiNumber: emiEntry.emiNumber,
                emiAmount,
                penaltyPaid: penaltyDue,
                totalPaid: totalDue,
                remainingPrincipal: loan.remainingPrincipal,
                emisPaid: loan.emisPaid,
                emisRemaining: loan.durationMonths - loan.emisPaid,
                lenderServiceFee: totalServiceFee,
                isLoanRepaid: isLastEmi,
                distributions,
                creditScore: newCreditScore,
                creditScoreDelta
            }
        });

    } catch (error) {
        console.error('Repay loan error:', error);
        res.status(500).json({ success: false, message: 'Failed to process EMI repayment', error: error.message });
    }
});

/**
 * @route   POST /api/loan/prepay
 * @desc    Prepay (foreclose) an active loan early
 *          After 3 EMIs → FREE | Before 3 EMIs → 2% foreclosure fee
 * @access  Private (Borrower)
 */
router.post('/prepay', [
    authenticate,
    requireBorrower,
    requireKYC,
    body('loanId').isMongoId().withMessage('Invalid loan ID')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
        }

        const { loanId } = req.body;
        const borrower = req.user;

        const loan = await Loan.findById(loanId);
        if (!loan) return res.status(404).json({ success: false, message: 'Loan not found' });
        if (loan.borrower.toString() !== borrower._id.toString())
            return res.status(403).json({ success: false, message: 'Not authorized' });
        if (loan.status !== 'Active')
            return res.status(400).json({ success: false, message: 'Loan is not active' });
        if (loan.isPrepaid || loan.repaymentCompleted)
            return res.status(400).json({ success: false, message: 'Loan already repaid or prepaid' });

        // ─── Calculate prepayment ────────────────────────────────────────────
        const prepayCalc = interestService.calculatePrepayment(
            loan.remainingPrincipal,
            loan.annualInterestRate,
            loan.emisPaid
        );

        const hasFunds = await walletService.hasSufficientBalance(borrower._id, prepayCalc.totalPayable);
        if (!hasFunds) {
            return res.status(400).json({
                success: false,
                message: `Insufficient balance. Required: ₹${prepayCalc.totalPayable.toFixed(2)}`,
                prepaymentBreakdown: prepayCalc
            });
        }

        // ─── Debit borrower ──────────────────────────────────────────────────
        await walletService.deductBalance(
            borrower._id,
            prepayCalc.totalPayable,
            'PREPAYMENT',
            { referenceType: 'Loan', referenceId: loan._id },
            `Prepayment of loan ${loan._id}`
        );

        // ─── Distribute principal to lenders (minus 4.5% on interest) ───────
        const totalLoanAmount = loan.amount;
        let totalServiceFee = 0;

        for (const lender of loan.lenders) {
            const lenderShare = lender.contributionAmount / totalLoanAmount;
            const lenderPrincipal = Math.round(prepayCalc.remainingPrincipal * lenderShare * 100) / 100;
            const lenderInterest = Math.round(prepayCalc.currentMonthInterest * lenderShare * 100) / 100;
            const { serviceFee: intFee, netToLender: netInterest } = interestService.calculateLenderServiceFee(lenderInterest);
            const lenderTotal = Math.round((lenderPrincipal + netInterest) * 100) / 100;

            await walletService.creditBalance(
                lender.lenderId,
                lenderTotal,
                'REPAYMENT_RECEIVED',
                { referenceType: 'Loan', referenceId: loan._id },
                `Prepayment share for loan ${loan._id}`
            );
            totalServiceFee += intFee;
        }

        // ─── Fees to system wallet ───────────────────────────────────────────
        totalServiceFee = Math.round(totalServiceFee * 100) / 100;
        if (totalServiceFee > 0)
            await creditSystemWallet(totalServiceFee, 'LENDER_SERVICE_FEE', loan._id, null, 'Service fee on prepayment interest');
        if (prepayCalc.foreclosureFee > 0)
            await creditSystemWallet(prepayCalc.foreclosureFee, 'FORECLOSURE_FEE', loan._id, borrower._id, `2% foreclosure fee on loan ${loan._id}`);

        // ─── Close loan ──────────────────────────────────────────────────────
        loan.status = 'Repaid';
        loan.repaymentCompleted = true;
        loan.isPrepaid = true;
        loan.prepaidAt = new Date();
        loan.prepaymentAmount = prepayCalc.totalPayable;
        loan.foreclosureFeeCharged = prepayCalc.foreclosureFee;
        loan.remainingPrincipal = 0;
        loan.emiSchedule = loan.emiSchedule.map(e =>
            e.status === 'pending' ? { ...e.toObject(), status: 'paid', paidAt: new Date() } : e
        );
        loan.markModified('emiSchedule');
        await loan.save();

        res.status(200).json({
            success: true,
            message: '✅ Loan prepaid successfully.',
            data: {
                prepaymentBreakdown: prepayCalc,
                totalPaid: prepayCalc.totalPayable,
                loanStatus: 'Repaid'
            }
        });

    } catch (error) {
        console.error('Prepay loan error:', error);
        res.status(500).json({ success: false, message: 'Failed to prepay loan', error: error.message });
    }
});

/**
 * @route   GET /api/loan/prepay-quote/:loanId
 * @desc    Get prepayment quote (breakdown + rule) without actually paying
 * @access  Private (Borrower)
 */
router.get('/prepay-quote/:loanId', authenticate, requireBorrower, async (req, res) => {
    try {
        const loan = await Loan.findById(req.params.loanId);
        if (!loan) return res.status(404).json({ success: false, message: 'Loan not found' });
        if (loan.borrower.toString() !== req.user._id.toString())
            return res.status(403).json({ success: false, message: 'Not authorized' });
        if (loan.status !== 'Active')
            return res.status(400).json({ success: false, message: 'Loan is not active' });

        const quote = interestService.calculatePrepayment(
            loan.remainingPrincipal,
            loan.annualInterestRate,
            loan.emisPaid
        );

        res.json({ success: true, data: { ...quote, emisPaid: loan.emisPaid, durationMonths: loan.durationMonths } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * @route   GET /api/loan/detail/:loanId
 * @desc    Full loan detail including EMI schedule
 * @access  Private
 */
router.get('/detail/:loanId', authenticate, async (req, res) => {
    try {
        const loan = await Loan.findById(req.params.loanId).populate('borrower', 'name email creditScore');
        if (!loan) return res.status(404).json({ success: false, message: 'Loan not found' });

        // Build next EMI details
        const nextEmi = loan.emiSchedule ? loan.emiSchedule.find(e => e.status === 'pending') : null;

        // Prepayment quote if active
        let prepayQuote = null;
        if (loan.status === 'Active') {
            prepayQuote = interestService.calculatePrepayment(
                loan.remainingPrincipal,
                loan.annualInterestRate,
                loan.emisPaid
            );
        }

        res.json({
            success: true,
            data: {
                loan: loan.toPublicJSON(),
                nextEmi,
                prepayQuote,
                interestRules: {
                    annualRate: loan.annualInterestRate,
                    durationMonths: loan.durationMonths,
                    emiAmount: loan.emiAmount,
                    platformFee: '4% upfront (on acceptance)',
                    lenderServiceFee: '4.5% per EMI',
                    prepaymentPolicy: loan.emisPaid >= 3 ? 'FREE prepayment' : `2% foreclosure fee (paid ${loan.emisPaid}/3 EMIs needed for free prepayment)`
                }
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * LEGACY DELETE BLOCKER — old repay block follows, replaced above
 * @route   POST /api/loan/repay
 * @desc    Repay loan with INR (Borrower only)
 * @access  Private (Borrower)
 */
router.post('/repay-legacy-disabled', [
    authenticate,
    requireBorrower,
    requireKYC,
    body('loanId').isMongoId().withMessage('Invalid loan ID')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { loanId } = req.body;
        const borrower = req.user;

        // Find loan
        const loan = await Loan.findById(loanId).populate('loanPoolId');

        if (!loan) {
            return res.status(404).json({
                success: false,
                message: 'Loan not found'
            });
        }

        // Verify borrower
        if (loan.borrower.toString() !== borrower._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to repay this loan'
            });
        }

        // Validate loan status
        if (loan.status !== 'Active') {
            return res.status(400).json({
                success: false,
                message: 'Loan is not active'
            });
        }

        if (loan.repaymentCompleted) {
            return res.status(400).json({
                success: false,
                message: 'Loan already repaid'
            });
        }

        // Calculate repayment amount (principal + interest)
        const interest = (loan.amount * loan.interestRate) / 100;
        const totalRepayment = loan.amount + interest;

        // Check borrower has sufficient balance
        const hasFunds = await walletService.hasSufficientBalance(borrower._id, totalRepayment);
        if (!hasFunds) {
            return res.status(400).json({
                success: false,
                message: `Insufficient wallet balance. Required: ₹${totalRepayment.toFixed(2)}`
            });
        }

        // Distribute repayment through loan pool service
        // This handles: borrower deduction, proportional lender credits, blockchain logging, loan status update
        const result = await loanPoolService.distributeRepayment(
            loan._id,
            borrower._id,
            totalRepayment
        );

        // Update Investment documents for all lenders
        const investments = await Investment.find({ loan: loan._id, status: 'Active' });

        for (const investment of investments) {
            const lenderShare = investment.amountFunded / loan.amount;
            const lenderReturns = totalRepayment * lenderShare;

            investment.returnsReceived = lenderReturns;
            investment.roi = ((lenderReturns - investment.amountFunded) / investment.amountFunded) * 100;
            investment.status = 'Repaid';

            await investment.save();
            console.log(`✅ Investment ${investment._id} updated: returns=₹${lenderReturns.toFixed(2)}, ROI=${investment.roi.toFixed(2)}%`);
        }
        console.log(`✅ Repayment complete: ${investments.length} investment(s) updated`);

        // Create Repayment document for audit trail
        try {
            const repayment = new Repayment({
                loan: loan._id,
                borrower: borrower._id,
                amount: totalRepayment,
                transactionHash: result.blockchainTxHash || null,
                timestamp: new Date(),
                lenderDistributions: (result.distributions || []).map(d => ({
                    lender: d.lenderId,
                    amount: d.shareAmount,
                    distributionTxHash: result.blockchainTxHash || null
                }))
            });
            await repayment.save();
            console.log(`✅ Repayment document created: ${repayment._id}`);
        } catch (repaymentError) {
            console.error('❌ ERROR creating Repayment document:', repaymentError.message);
            // Non-fatal — don't fail the repayment response
        }

        // Refresh loan from DB (loanPoolService already updated status to 'Repaid')
        const repaidLoan = await Loan.findById(loan._id);

        res.status(200).json({
            success: true,
            message: 'Loan repaid successfully',
            data: {
                loan: repaidLoan.toPublicJSON(),
                repayment: {
                    totalAmount: totalRepayment,
                    principal: loan.amount,
                    interest: interest,
                    lenderDistributions: result.distributions,
                    blockchainTxHash: result.blockchainTxHash
                }
            }
        });

    } catch (error) {
        console.error('Repay loan error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to repay loan',
            error: error.message
        });
    }
});

/**
 * @route   POST /api/loan/cancel
 * @desc    Cancel a loan request (Borrower only, before funding)
 * @access  Private (Borrower)
 */
router.post('/cancel', [
    authenticate,
    requireBorrower,
    body('loanId').isMongoId().withMessage('Invalid loan ID')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { loanId } = req.body;
        const borrower = req.user;

        // Find loan
        const loan = await Loan.findById(loanId);

        if (!loan) {
            return res.status(404).json({
                success: false,
                message: 'Loan not found'
            });
        }

        // Verify borrower
        if (loan.borrower.toString() !== borrower._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to cancel this loan'
            });
        }

        // Can only cancel if not yet funded or partially funded
        if (loan.status !== 'Requested') {
            return res.status(400).json({
                success: false,
                message: 'Cannot cancel loan in current status'
            });
        }

        // If there are any contributions, refund them
        if (loan.fundedAmount > 0 && loan.loanPoolId) {
            // Refund all lenders through loan pool service
            const loanPool = await loanPoolService.getLoanPool(loan._id);

            for (const contribution of loanPool.contributions) {
                await walletService.creditBalance(
                    contribution.lenderId,
                    contribution.amount,
                    'REFUND',
                    { referenceType: 'Loan', referenceId: loan._id },
                    `Refund for cancelled loan`
                );
            }
        }

        // Cancel on blockchain
        const blockchainResult = await web3Service.cancelLoanOnBlockchain(loan.loanId);

        // Update loan status
        loan.status = 'Cancelled';
        loan.transactionHashes.cancellation = blockchainResult.transactionHash;

        await loan.save();

        res.status(200).json({
            success: true,
            message: 'Loan cancelled successfully',
            data: {
                loan: loan.toPublicJSON(),
                blockchain: {
                    transactionHash: blockchainResult.transactionHash
                }
            }
        });

    } catch (error) {
        console.error('Cancel loan error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to cancel loan',
            error: error.message
        });
    }
});

module.exports = router;
