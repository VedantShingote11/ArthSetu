/**
 * Wallet Routes
 * 
 * Handles wallet-related API endpoints for the hybrid blockchain model
 * Manages INR wallet balances and transaction history
 */

const express = require('express');
const router = express.Router();
const walletService = require('../services/wallet.service');
const { authenticate, requireKYC } = require('../middleware/auth.middleware');

/**
 * @route   GET /api/wallet/balance
 * @desc    Get user's wallet balance
 * @access  Private
 */
router.get('/balance', authenticate, requireKYC, async (req, res) => {
    try {
        const balance = await walletService.getBalance(req.user._id);

        res.json({
            success: true,
            data: balance
        });
    } catch (error) {
        console.error('Error getting wallet balance:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to get wallet balance',
            error: error.message
        });
    }
});

/**
 * @route   GET /api/wallet
 * @desc    Get complete wallet information
 * @access  Private
 */
router.get('/', authenticate, requireKYC, async (req, res) => {
    try {
        const wallet = await walletService.getWallet(req.user._id);

        res.json({
            success: true,
            data: wallet.toPublicJSON()
        });
    } catch (error) {
        console.error('Error getting wallet:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to get wallet information',
            error: error.message
        });
    }
});

/**
 * @route   GET /api/wallet/transactions
 * @desc    Get wallet transaction history
 * @access  Private
 */
router.get('/transactions', authenticate, requireKYC, async (req, res) => {
    try {
        const { limit = 50, skip = 0 } = req.query;

        const transactions = await walletService.getTransactionHistory(
            req.user._id,
            parseInt(limit),
            parseInt(skip)
        );

        res.json({
            success: true,
            count: transactions.length,
            data: transactions
        });
    } catch (error) {
        console.error('Error getting transactions:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to get transaction history',
            error: error.message
        });
    }
});

/**
 * @route   POST /api/wallet/deposit
 * @desc    Deposit INR to wallet (placeholder for payment gateway integration)
 * @access  Private
 */
router.post('/deposit', authenticate, async (req, res) => {
    try {
        const { amount } = req.body;

        // Validate amount
        if (!amount || amount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid deposit amount'
            });
        }

        // TODO: Integrate with payment gateway (Razorpay/Stripe)
        // For now, this is a placeholder that simulates deposit

        const result = await walletService.creditBalance(
            req.user._id,
            amount,
            'DEPOSIT',
            null,
            'Wallet deposit via payment gateway'
        );

        res.json({
            success: true,
            message: 'Deposit successful',
            data: {
                wallet: result.wallet,
                transaction: result.transaction
            }
        });
    } catch (error) {
        console.error('Error processing deposit:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to process deposit',
            error: error.message
        });
    }
});

/**
 * @route   POST /api/wallet/withdraw
 * @desc    Withdraw INR from wallet (placeholder for bank transfer)
 * @access  Private
 */
router.post('/withdraw', authenticate, async (req, res) => {
    try {
        const { amount } = req.body;

        // Validate amount
        if (!amount || amount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid withdrawal amount'
            });
        }

        // Check sufficient balance
        const hasFunds = await walletService.hasSufficientBalance(req.user._id, amount);
        if (!hasFunds) {
            return res.status(400).json({
                success: false,
                message: 'Insufficient balance'
            });
        }

        // TODO: Integrate with bank transfer API
        // For now, this is a placeholder that simulates withdrawal

        const result = await walletService.deductBalance(
            req.user._id,
            amount,
            'WITHDRAWAL',
            null,
            'Wallet withdrawal to bank account'
        );

        res.json({
            success: true,
            message: 'Withdrawal successful',
            data: {
                wallet: result.wallet,
                transaction: result.transaction
            }
        });
    } catch (error) {
        console.error('Error processing withdrawal:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to process withdrawal',
            error: error.message
        });
    }
});

/**
 * @route   POST /api/wallet/admin/credit
 * @desc    Admin endpoint to credit user wallet (for testing/admin purposes)
 * @access  Private (Admin only - TODO: Add admin middleware)
 */
router.post('/admin/credit', authenticate, async (req, res) => {
    try {
        const { userId, amount, description } = req.body;

        // Validate inputs
        if (!userId || !amount || amount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid request parameters'
            });
        }

        // TODO: Add admin role check
        // For now, allowing any authenticated user (for testing)

        const result = await walletService.creditBalance(
            userId,
            amount,
            'ADMIN_CREDIT',
            null,
            description || 'Admin credit'
        );

        res.json({
            success: true,
            message: 'Credit successful',
            data: {
                wallet: result.wallet,
                transaction: result.transaction
            }
        });
    } catch (error) {
        console.error('Error processing admin credit:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to process credit',
            error: error.message
        });
    }
});

module.exports = router;
