/**
 * Loan Pool Service Layer
 * 
 * Manages loan pool operations in the hybrid blockchain model
 * Handles fund locking, disbursement, and proportional repayment distribution
 * 
 * NOTE: For development with standalone MongoDB, transactions are disabled.
 * For production with MongoDB replica set, transactions can be re-enabled.
 */

const LoanPool = require('../models/LoanPool');
const Loan = require('../models/Loan');
const walletService = require('./wallet.service');
const web3Service = require('./web3.service');
const mongoose = require('mongoose');

/**
 * Create loan pool for a new loan
 * @param {ObjectId} loanId - Loan ID
 * @param {Number} targetAmount - Target amount to raise
 * @returns {Object} Created loan pool
 */
const createLoanPool = async (loanId, targetAmount) => {
    try {
        // Check if pool already exists
        const existingPool = await LoanPool.findOne({ loanId });
        if (existingPool) {
            throw new Error('Loan pool already exists for this loan');
        }

        const pool = new LoanPool({
            loanId,
            targetAmount,
            totalAmount: 0,
            contributions: [],
            status: 'LOCKED'
        });

        await pool.save();
        return pool;
    } catch (error) {
        console.error('Error creating loan pool:', error.message);
        throw error;
    }
};

/**
 * Add lender contribution to pool
 * @param {ObjectId} loanId - Loan ID
 * @param {ObjectId} lenderId - Lender user ID
 * @param {Number} amount - Contribution amount in INR
 * @returns {Object} Updated pool and wallet info
 */
const addContribution = async (loanId, lenderId, amount) => {
    try {
        // Get loan pool
        const pool = await LoanPool.findOne({ loanId });
        if (!pool) {
            throw new Error('Loan pool not found');
        }

        if (pool.status !== 'LOCKED') {
            throw new Error('Loan pool is not accepting contributions');
        }

        // Check if contribution would exceed target
        if (pool.totalAmount + amount > pool.targetAmount) {
            throw new Error('Contribution exceeds loan target amount');
        }

        // Check lender has sufficient balance
        const hasFunds = await walletService.hasSufficientBalance(lenderId, amount);
        if (!hasFunds) {
            throw new Error('Insufficient wallet balance');
        }

        // Lock funds in lender wallet
        await walletService.lockFunds(lenderId, amount, loanId);

        // Record contribution on blockchain
        const loan = await Loan.findById(loanId);
        const lenderRefAddress = '0x' + lenderId.toString().padStart(40, '0').substring(0, 40);

        const blockchainResult = await web3Service.recordContributionOnBlockchain(
            loan.loanId,
            lenderRefAddress,
            amount
        );

        // Add contribution to pool
        pool.addContribution(lenderId, amount, blockchainResult.transactionHash);
        await pool.save();

        // Update loan document
        if (loan) {
            loan.fundedAmount = pool.totalAmount;

            // Update lenders array
            const existingLender = loan.lenders.find(
                l => l.lenderId.toString() === lenderId.toString()
            );

            if (existingLender) {
                existingLender.contributionAmount += amount;
            } else {
                loan.lenders.push({
                    lenderId,
                    contributionAmount: amount,
                    fundedAt: new Date()
                });
            }

            // Update status if fully funded
            if (pool.isFullyFunded && loan.status === 'Requested') {
                loan.status = 'Funded';
                loan.fundedAt = new Date();
            }

            await loan.save();
        }

        return {
            pool: pool.toPublicJSON(),
            blockchainTxHash: blockchainResult.transactionHash,
            isFullyFunded: pool.isFullyFunded
        };
    } catch (error) {
        console.error('Error adding contribution:', error.message);
        throw error;
    }
};

/**
 * Disburse loan funds to borrower
 * @param {ObjectId} loanId - Loan ID
 * @param {ObjectId} borrowerId - Borrower user ID
 * @returns {Object} Updated pool and borrower wallet
 */
const disburseLoan = async (loanId, borrowerId) => {
    try {
        // Get loan pool
        const pool = await LoanPool.findOne({ loanId });
        if (!pool) {
            throw new Error('Loan pool not found');
        }

        if (pool.status !== 'LOCKED') {
            throw new Error('Loan pool cannot be disbursed');
        }

        if (!pool.isFullyFunded) {
            throw new Error('Loan is not fully funded');
        }

        // Get loan
        const loan = await Loan.findById(loanId);
        if (!loan) {
            throw new Error('Loan not found');
        }

        // Unlock funds from all lenders and transfer to borrower
        for (const contribution of pool.contributions) {
            await walletService.unlockFunds(contribution.lenderId, contribution.amount, loanId);
        }

        // Transfer total amount to borrower
        const walletResult = await walletService.creditBalance(
            borrowerId,
            pool.totalAmount,
            'LOAN_DISBURSEMENT',
            {
                referenceType: 'Loan',
                referenceId: loanId
            },
            `Loan disbursement for loan ${loanId}`
        );

        // Record activation on blockchain
        const blockchainResult = await web3Service.activateLoanOnBlockchain(loan.loanId);

        // Mark pool as disbursed
        pool.markDisbursed(borrowerId, blockchainResult.transactionHash);
        await pool.save();

        // Update loan status
        loan.status = 'Active';
        loan.acceptedAt = new Date();
        loan.transactionHashes.acceptance = blockchainResult.transactionHash;
        await loan.save();

        return {
            pool: pool.toPublicJSON(),
            wallet: walletResult.wallet,
            transaction: walletResult.transaction,
            blockchainTxHash: blockchainResult.transactionHash
        };
    } catch (error) {
        console.error('Error disbursing loan:', error.message);
        throw error;
    }
};

/**
 * Calculate lender's share of repayment
 * @param {ObjectId} loanId - Loan ID
 * @param {ObjectId} lenderId - Lender user ID
 * @param {Number} totalRepayment - Total repayment amount
 * @returns {Number} Lender's share
 */
const calculateLenderShare = async (loanId, lenderId, totalRepayment) => {
    try {
        const pool = await LoanPool.findOne({ loanId });
        if (!pool) {
            throw new Error('Loan pool not found');
        }

        return pool.calculateLenderShare(lenderId, totalRepayment);
    } catch (error) {
        console.error('Error calculating lender share:', error.message);
        throw error;
    }
};

/**
 * Distribute repayment to all lenders proportionally
 * @param {ObjectId} loanId - Loan ID
 * @param {ObjectId} borrowerId - Borrower user ID
 * @param {Number} totalRepayment - Total repayment amount
 * @returns {Object} Distribution details
 */
const distributeRepayment = async (loanId, borrowerId, totalRepayment) => {
    try {
        // Get loan pool
        const pool = await LoanPool.findOne({ loanId });
        if (!pool) {
            throw new Error('Loan pool not found');
        }

        if (pool.status !== 'DISBURSED') {
            throw new Error('Loan has not been disbursed');
        }

        // Check borrower has sufficient balance
        const hasFunds = await walletService.hasSufficientBalance(borrowerId, totalRepayment);
        if (!hasFunds) {
            throw new Error('Insufficient balance for repayment');
        }

        // Get loan
        const loan = await Loan.findById(loanId);
        if (!loan) {
            throw new Error('Loan not found');
        }

        // Calculate shares for blockchain logging
        const shares = pool.calculateAllShares(totalRepayment);
        const lenderShares = shares.map(s => s.shareAmount);

        // Record repayment on blockchain
        const blockchainResult = await web3Service.logRepaymentOnBlockchain(
            loan.loanId,
            totalRepayment,
            lenderShares
        );

        // Deduct from borrower wallet
        const borrowerWalletResult = await walletService.deductBalance(
            borrowerId,
            totalRepayment,
            'REPAYMENT_PAID',
            {
                referenceType: 'Loan',
                referenceId: loanId
            },
            `Repayment for loan ${loanId}`,
            blockchainResult.transactionHash
        );

        // Calculate and distribute shares to each lender
        const distributions = [];

        for (const share of shares) {
            const lenderWalletResult = await walletService.creditBalance(
                share.lenderId,
                share.shareAmount,
                'REPAYMENT_RECEIVED',
                {
                    referenceType: 'Loan',
                    referenceId: loanId
                },
                `Repayment received for loan ${loanId}`,
                blockchainResult.transactionHash
            );

            distributions.push({
                lenderId: share.lenderId,
                contributionAmount: share.contributionAmount,
                shareAmount: share.shareAmount,
                wallet: lenderWalletResult.wallet
            });
        }

        // Mark pool as repaid
        pool.markRepaid(totalRepayment, blockchainResult.transactionHash);
        await pool.save();

        // Update loan status
        loan.status = 'Repaid';
        loan.repaidAt = new Date();
        loan.repaymentCompleted = true;
        loan.totalRepayment = totalRepayment;
        loan.transactionHashes.repayment = blockchainResult.transactionHash;
        await loan.save();

        return {
            pool: pool.toPublicJSON(),
            borrowerWallet: borrowerWalletResult.wallet,
            distributions,
            totalDistributed: totalRepayment,
            blockchainTxHash: blockchainResult.transactionHash
        };
    } catch (error) {
        console.error('Error distributing repayment:', error.message);
        throw error;
    }
};

/**
 * Get loan pool details
 * @param {ObjectId} loanId - Loan ID
 * @returns {Object} Loan pool
 */
const getLoanPool = async (loanId) => {
    try {
        const pool = await LoanPool.findByLoanId(loanId);
        if (!pool) {
            throw new Error('Loan pool not found');
        }
        return pool.toPublicJSON();
    } catch (error) {
        console.error('Error getting loan pool:', error.message);
        throw error;
    }
};

module.exports = {
    createLoanPool,
    addContribution,
    disburseLoan,
    calculateLenderShare,
    distributeRepayment,
    getLoanPool
};
