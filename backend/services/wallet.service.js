/**
 * Wallet Service Layer
 * 
 * Handles all INR wallet operations in the hybrid blockchain model
 * Manages balance updates, fund locking, and internal transfers
 * 
 * NOTE: For development with standalone MongoDB, transactions are disabled.
 * For production with MongoDB replica set, enable USE_TRANSACTIONS flag.
 */

const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const mongoose = require('mongoose');

// Set to false for standalone MongoDB (development)
// Set to true for MongoDB replica set (production)
const USE_TRANSACTIONS = false;

/**
 * Create wallet for new user
 * @param {ObjectId} userId - User ID
 * @param {Number} initialBalance - Initial balance (default: 0)
 * @returns {Object} Created wallet
 */
const createWallet = async (userId, initialBalance = 0) => {
    try {
        // Check if wallet already exists
        const existingWallet = await Wallet.findOne({ userId });
        if (existingWallet) {
            throw new Error('Wallet already exists for this user');
        }

        const wallet = new Wallet({
            userId,
            balance: initialBalance,
            lockedBalance: 0,
            currency: 'INR',
            isActive: true
        });

        await wallet.save();

        // Create initial transaction record if there's initial balance
        if (initialBalance > 0) {
            await Transaction.createTransaction({
                userId,
                type: 'ADMIN_CREDIT',
                amount: initialBalance,
                balanceBefore: 0,
                balanceAfter: initialBalance,
                description: 'Initial wallet balance',
                status: 'COMPLETED'
            });
        }

        return wallet;
    } catch (error) {
        console.error('Error creating wallet:', error.message);
        throw error;
    }
};

/**
 * Get wallet by user ID
 * @param {ObjectId} userId - User ID
 * @returns {Object} Wallet
 */
const getWallet = async (userId) => {
    try {
        const wallet = await Wallet.findOne({ userId });
        if (!wallet) {
            throw new Error('Wallet not found');
        }
        return wallet;
    } catch (error) {
        console.error('Error getting wallet:', error.message);
        throw error;
    }
};

/**
 * Get wallet balance
 * @param {ObjectId} userId - User ID
 * @returns {Object} Balance information
 */
const getBalance = async (userId) => {
    try {
        const wallet = await getWallet(userId);
        return {
            balance: wallet.balance,
            lockedBalance: wallet.lockedBalance,
            totalBalance: wallet.totalBalance,
            currency: wallet.currency
        };
    } catch (error) {
        console.error('Error getting balance:', error.message);
        throw error;
    }
};

/**
 * Check if user has sufficient balance
 * @param {ObjectId} userId - User ID
 * @param {Number} amount - Amount to check
 * @returns {Boolean} True if sufficient balance
 */
const hasSufficientBalance = async (userId, amount) => {
    try {
        const wallet = await getWallet(userId);
        return wallet.balance >= amount;
    } catch (error) {
        console.error('Error checking balance:', error.message);
        return false;
    }
};

/**
 * Deduct balance from wallet
 * @param {ObjectId} userId - User ID
 * @param {Number} amount - Amount to deduct
 * @param {String} type - Transaction type
 * @param {Object} reference - Reference to related entity
 * @param {String} description - Transaction description
 * @param {String} blockchainTxHash - Blockchain transaction hash (optional)
 * @returns {Object} Updated wallet and transaction
 */
const deductBalance = async (userId, amount, type, reference = null, description = '', blockchainTxHash = null) => {
    try {
        const wallet = await Wallet.findOne({ userId });
        if (!wallet) {
            throw new Error('Wallet not found');
        }

        if (wallet.balance < amount) {
            throw new Error('Insufficient balance');
        }

        const balanceBefore = wallet.balance;
        wallet.balance -= amount;
        wallet.balance = Math.round(wallet.balance * 100) / 100;
        wallet.lastTransactionAt = new Date();

        await wallet.save();

        // Create transaction record
        const transaction = await Transaction.createTransaction({
            userId,
            type,
            amount,
            balanceBefore,
            balanceAfter: wallet.balance,
            reference,
            description,
            blockchainTxHash,
            status: 'COMPLETED'
        });

        return {
            wallet: wallet.toPublicJSON(),
            transaction: transaction.toPublicJSON()
        };
    } catch (error) {
        console.error('Error deducting balance:', error.message);
        throw error;
    }
};

/**
 * Credit balance to wallet
 * @param {ObjectId} userId - User ID
 * @param {Number} amount - Amount to credit
 * @param {String} type - Transaction type
 * @param {Object} reference - Reference to related entity
 * @param {String} description - Transaction description
 * @param {String} blockchainTxHash - Blockchain transaction hash (optional)
 * @returns {Object} Updated wallet and transaction
 */
const creditBalance = async (userId, amount, type, reference = null, description = '', blockchainTxHash = null) => {
    try {
        const wallet = await Wallet.findOne({ userId });
        if (!wallet) {
            throw new Error('Wallet not found');
        }

        const balanceBefore = wallet.balance;
        wallet.balance += amount;
        wallet.balance = Math.round(wallet.balance * 100) / 100;
        wallet.lastTransactionAt = new Date();

        await wallet.save();

        // Create transaction record
        const transaction = await Transaction.createTransaction({
            userId,
            type,
            amount,
            balanceBefore,
            balanceAfter: wallet.balance,
            reference,
            description,
            blockchainTxHash,
            status: 'COMPLETED'
        });

        return {
            wallet: wallet.toPublicJSON(),
            transaction: transaction.toPublicJSON()
        };
    } catch (error) {
        console.error('Error crediting balance:', error.message);
        throw error;
    }
};

/**
 * Lock funds in wallet (for lenders funding loans)
 * @param {ObjectId} userId - User ID
 * @param {Number} amount - Amount to lock
 * @param {ObjectId} loanId - Loan ID
 * @returns {Object} Updated wallet
 */
const lockFunds = async (userId, amount, loanId) => {
    try {
        const wallet = await Wallet.findOne({ userId });
        if (!wallet) {
            throw new Error('Wallet not found');
        }

        if (wallet.balance < amount) {
            throw new Error('Insufficient balance to lock');
        }

        wallet.balance -= amount;
        wallet.lockedBalance += amount;
        wallet.balance = Math.round(wallet.balance * 100) / 100;
        wallet.lockedBalance = Math.round(wallet.lockedBalance * 100) / 100;
        wallet.lastTransactionAt = new Date();

        await wallet.save();

        return wallet.toPublicJSON();
    } catch (error) {
        console.error('Error locking funds:', error.message);
        throw error;
    }
};

/**
 * Unlock funds in wallet
 * @param {ObjectId} userId - User ID
 * @param {Number} amount - Amount to unlock
 * @param {ObjectId} loanId - Loan ID
 * @returns {Object} Updated wallet
 */
const unlockFunds = async (userId, amount, loanId) => {
    try {
        const wallet = await Wallet.findOne({ userId });
        if (!wallet) {
            throw new Error('Wallet not found');
        }

        if (wallet.lockedBalance < amount) {
            throw new Error('Insufficient locked balance');
        }

        wallet.lockedBalance -= amount;
        wallet.balance += amount;
        wallet.balance = Math.round(wallet.balance * 100) / 100;
        wallet.lockedBalance = Math.round(wallet.lockedBalance * 100) / 100;
        wallet.lastTransactionAt = new Date();

        await wallet.save();

        return wallet.toPublicJSON();
    } catch (error) {
        console.error('Error unlocking funds:', error.message);
        throw error;
    }
};

/**
 * Transfer funds between wallets
 * @param {ObjectId} fromUserId - Sender user ID
 * @param {ObjectId} toUserId - Receiver user ID
 * @param {Number} amount - Amount to transfer
 * @param {String} reason - Transfer reason
 * @param {Object} reference - Reference to related entity
 * @returns {Object} Both updated wallets
 */
const transferFunds = async (fromUserId, toUserId, amount, reason, reference = null) => {
    try {
        // Deduct from sender
        const fromWallet = await Wallet.findOne({ userId: fromUserId });
        if (!fromWallet) {
            throw new Error('Sender wallet not found');
        }
        if (fromWallet.balance < amount) {
            throw new Error('Insufficient balance');
        }

        const fromBalanceBefore = fromWallet.balance;
        fromWallet.balance -= amount;
        fromWallet.balance = Math.round(fromWallet.balance * 100) / 100;
        fromWallet.lastTransactionAt = new Date();
        await fromWallet.save();

        // Credit to receiver
        const toWallet = await Wallet.findOne({ userId: toUserId });
        if (!toWallet) {
            throw new Error('Receiver wallet not found');
        }

        const toBalanceBefore = toWallet.balance;
        toWallet.balance += amount;
        toWallet.balance = Math.round(toWallet.balance * 100) / 100;
        toWallet.lastTransactionAt = new Date();
        await toWallet.save();

        // Create transaction records for both users
        await Transaction.createTransaction({
            userId: fromUserId,
            type: 'WITHDRAWAL',
            amount,
            balanceBefore: fromBalanceBefore,
            balanceAfter: fromWallet.balance,
            reference,
            description: `Transfer to user: ${reason}`,
            status: 'COMPLETED'
        });

        await Transaction.createTransaction({
            userId: toUserId,
            type: 'DEPOSIT',
            amount,
            balanceBefore: toBalanceBefore,
            balanceAfter: toWallet.balance,
            reference,
            description: `Transfer from user: ${reason}`,
            status: 'COMPLETED'
        });

        return {
            fromWallet: fromWallet.toPublicJSON(),
            toWallet: toWallet.toPublicJSON()
        };
    } catch (error) {
        console.error('Error transferring funds:', error.message);
        throw error;
    }
};

/**
 * Get transaction history
 * @param {ObjectId} userId - User ID
 * @param {Number} limit - Number of transactions to return
 * @param {Number} skip - Number of transactions to skip
 * @returns {Array} Transaction history
 */
const getTransactionHistory = async (userId, limit = 50, skip = 0) => {
    try {
        const transactions = await Transaction.getUserTransactions(userId, limit, skip);
        return transactions.map(t => t.toPublicJSON());
    } catch (error) {
        console.error('Error getting transaction history:', error.message);
        throw error;
    }
};

module.exports = {
    createWallet,
    getWallet,
    getBalance,
    hasSufficientBalance,
    deductBalance,
    creditBalance,
    lockFunds,
    unlockFunds,
    transferFunds,
    getTransactionHistory
};
