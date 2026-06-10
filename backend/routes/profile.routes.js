/**
 * Profile Routes
 * 
 * Handles user profile data, portfolio analytics, and history
 */

const express = require('express');
const router = express.Router();
const { authenticate, requireLender, requireBorrower } = require('../middleware/auth.middleware');
const analyticsService = require('../services/analytics.service');
const Investment = require('../models/Investment');
const Repayment = require('../models/Repayment');
const Loan = require('../models/Loan');
const User = require('../models/User');

/**
 * @route   GET /api/profile/lender/portfolio
 * @desc    Get lender's complete portfolio summary
 * @access  Private (Lender)
 */
router.get('/lender/portfolio', [authenticate, requireLender], async (req, res) => {
    try {
        const userId = req.user._id;
        const portfolio = await analyticsService.calculateLenderPortfolio(userId);

        res.status(200).json({
            success: true,
            data: portfolio
        });
    } catch (error) {
        console.error('Get lender portfolio error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch portfolio',
            error: error.message
        });
    }
});

/**
 * @route   GET /api/profile/lender/portfolio/graph
 * @desc    Get portfolio growth graph data
 * @access  Private (Lender)
 * @query   period (monthly/yearly), filter (overall/per-investment)
 */
router.get('/lender/portfolio/graph', [authenticate, requireLender], async (req, res) => {
    try {
        const userId = req.user._id;
        const { period = 'monthly', filter = 'overall' } = req.query;

        // Validate parameters
        if (!['monthly', 'yearly'].includes(period)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid period. Must be "monthly" or "yearly"'
            });
        }

        const graphData = await analyticsService.generatePortfolioGraph(userId, period, filter);

        res.status(200).json({
            success: true,
            data: graphData
        });
    } catch (error) {
        console.error('Get portfolio graph error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate graph data',
            error: error.message
        });
    }
});

/**
 * @route   GET /api/profile/lender/history
 * @desc    Get lender's investment history
 * @access  Private (Lender)
 */
router.get('/lender/history', [authenticate, requireLender], async (req, res) => {
    try {
        const userId = req.user._id;

        const investments = await Investment.find({ lender: userId })
            .populate('loan', 'loanId borrower amount interestRate duration status reason')
            .populate({
                path: 'loan',
                populate: {
                    path: 'borrower',
                    select: 'name email kycDetails.verified'
                }
            })
            .sort({ fundingDate: -1 });

        res.status(200).json({
            success: true,
            count: investments.length,
            data: investments.map(inv => inv.toPublicJSON())
        });
    } catch (error) {
        console.error('Get lender history error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch investment history',
            error: error.message
        });
    }
});

/**
 * @route   GET /api/profile/lender/investment/:id
 * @desc    Get detailed investment information
 * @access  Private (Lender)
 */
router.get('/lender/investment/:id', [authenticate, requireLender], async (req, res) => {
    try {
        const userId = req.user._id;
        const investmentId = req.params.id;

        const investment = await Investment.findOne({
            _id: investmentId,
            lender: userId
        })
            .populate('loan')
            .populate({
                path: 'loan',
                populate: {
                    path: 'borrower',
                    select: 'name email walletAddress kycDetails.verified'
                }
            });

        if (!investment) {
            return res.status(404).json({
                success: false,
                message: 'Investment not found'
            });
        }

        // Get repayment history for this loan
        const repayments = await Repayment.find({
            loan: investment.loan._id,
            'lenderDistributions.lender': userId
        }).sort({ timestamp: -1 });

        res.status(200).json({
            success: true,
            data: {
                investment: investment.toPublicJSON(),
                repayments: repayments.map(r => r.toPublicJSON())
            }
        });
    } catch (error) {
        console.error('Get investment detail error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch investment details',
            error: error.message
        });
    }
});

/**
 * @route   GET /api/profile/borrower/summary
 * @desc    Get borrower's profile summary
 * @access  Private (Borrower)
 */
router.get('/borrower/summary', [authenticate, requireBorrower], async (req, res) => {
    try {
        const userId = req.user._id;

        const [summary, user, analyticsScore] = await Promise.all([
            analyticsService.getBorrowerSummary(userId),
            User.findById(userId).select('creditScore'),
            analyticsService.calculateBorrowerCreditScore(userId)
        ]);

        // Use the DB-stored creditScore as the authoritative score.
        // It starts at 650 and is updated on every EMI payment (+5 on-time / -10 late / +10 full repayment).
        // Keep analyticsScore.factors for UI breakdown display.
        const score = user?.creditScore ?? 650;
        let rating;
        if (score >= 800) rating = 'Excellent';
        else if (score >= 650) rating = 'Good';
        else if (score >= 500) rating = 'Fair';
        else if (score >= 300) rating = 'Poor';
        else rating = 'Very Poor';

        res.status(200).json({
            success: true,
            data: {
                ...summary,
                creditScore: {
                    score,
                    rating,
                    factors: analyticsScore.factors ?? {}
                }
            }
        });
    } catch (error) {
        console.error('Get borrower summary error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch borrower summary',
            error: error.message
        });
    }
});

/**
 * @route   GET /api/profile/borrower/history
 * @desc    Get borrower's loan history
 * @access  Private (Borrower)
 */
router.get('/borrower/history', [authenticate, requireBorrower], async (req, res) => {
    try {
        const userId = req.user._id;

        const loans = await Loan.find({ borrower: userId })
            .sort({ createdAt: -1 });

        // Get lender details for each loan
        const loansWithLenders = await Promise.all(
            loans.map(async (loan) => {
                const investments = await Investment.find({ loan: loan._id })
                    .populate('lender', 'name email walletAddress');

                return {
                    ...loan.toPublicJSON(),
                    lenders: investments.map(inv => ({
                        lender: inv.lender,
                        contribution: inv.amountFunded,
                        fundingDate: inv.fundingDate
                    }))
                };
            })
        );

        res.status(200).json({
            success: true,
            count: loansWithLenders.length,
            data: loansWithLenders
        });
    } catch (error) {
        console.error('Get borrower history error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch loan history',
            error: error.message
        });
    }
});

/**
 * @route   GET /api/profile/borrower/repayments/:loanId
 * @desc    Get repayment timeline for a specific loan
 * @access  Private (Borrower)
 */
router.get('/borrower/repayments/:loanId', [authenticate, requireBorrower], async (req, res) => {
    try {
        const userId = req.user._id;
        const loanId = req.params.loanId;

        // Verify loan belongs to borrower
        const loan = await Loan.findOne({
            _id: loanId,
            borrower: userId
        });

        if (!loan) {
            return res.status(404).json({
                success: false,
                message: 'Loan not found'
            });
        }

        const repayments = await Repayment.getLoanRepaymentHistory(loanId);

        res.status(200).json({
            success: true,
            data: {
                loan: loan.toPublicJSON(),
                repayments: repayments.map(r => r.toPublicJSON())
            }
        });
    } catch (error) {
        console.error('Get repayment timeline error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch repayment timeline',
            error: error.message
        });
    }
});

/**
 * @route   POST /api/profile/auto-pay/toggle
 * @desc    Toggle auto-pay on/off for the authenticated borrower
 *          When enabled, EMIs are auto-deducted on their due date.
 * @access  Private (Borrower)
 */
// User already imported at top of file

router.post('/auto-pay/toggle', authenticate, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        // Allow explicit value from body, or just flip the current state
        const newState = req.body.enabled !== undefined
            ? Boolean(req.body.enabled)
            : !user.autoPayEnabled;

        user.autoPayEnabled = newState;
        await user.save();

        res.status(200).json({
            success: true,
            message: `Auto-pay ${newState ? 'enabled' : 'disabled'} successfully`,
            data: { autoPayEnabled: newState }
        });
    } catch (error) {
        console.error('Auto-pay toggle error:', error);
        res.status(500).json({ success: false, message: 'Failed to toggle auto-pay', error: error.message });
    }
});

module.exports = router;
