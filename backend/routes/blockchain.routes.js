/**
 * Blockchain Routes
 * 
 * Provides blockchain query endpoints
 */

const express = require('express');
const router = express.Router();
const { param, validationResult } = require('express-validator');
const { authenticate } = require('../middleware/auth.middleware');
const web3Service = require('../services/web3.service');

/**
 * @route   GET /api/blockchain/transaction/:hash
 * @desc    Get transaction details by hash
 * @access  Private
 */
router.get('/transaction/:hash', [
    authenticate,
    param('hash').matches(/^0x[a-fA-F0-9]{64}$/).withMessage('Invalid transaction hash')
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

        const { hash } = req.params;

        const transactionDetails = await web3Service.getTransactionDetails(hash);

        res.status(200).json({
            success: true,
            data: transactionDetails
        });

    } catch (error) {
        console.error('Get transaction error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch transaction details',
            error: error.message
        });
    }
});

/**
 * @route   GET /api/blockchain/balance/:address
 * @desc    Get wallet balance
 * @access  Private
 */
router.get('/balance/:address', [
    authenticate,
    param('address').matches(/^0x[a-fA-F0-9]{40}$/).withMessage('Invalid Ethereum address')
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

        const { address } = req.params;

        const balance = await web3Service.getBalance(address);

        res.status(200).json({
            success: true,
            data: {
                address,
                balance: balance,
                unit: 'ETH'
            }
        });

    } catch (error) {
        console.error('Get balance error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch balance',
            error: error.message
        });
    }
});

/**
 * @route   GET /api/blockchain/contract-info
 * @desc    Get smart contract information
 * @access  Private
 */
router.get('/contract-info', authenticate, async (req, res) => {
    try {
        res.status(200).json({
            success: true,
            data: {
                contractAddress: web3Service.contractAddress,
                network: 'Ganache Local',
                rpcUrl: process.env.GANACHE_RPC_URL
            }
        });

    } catch (error) {
        console.error('Get contract info error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch contract info',
            error: error.message
        });
    }
});

module.exports = router;
