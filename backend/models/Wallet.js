/**
 * Wallet Model (MongoDB Schema)
 * 
 * Manages user INR wallet balances for the hybrid blockchain model
 * All monetary transactions happen off-chain through this wallet system
 * Blockchain is used only for immutable audit trail
 */

const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['DEPOSIT', 'WITHDRAWAL', 'LOAN_FUNDING', 'LOAN_DISBURSEMENT', 'REPAYMENT_RECEIVED', 'REPAYMENT_PAID'],
        required: true
    },
    amount: {
        type: Number,
        required: true,
        min: [0, 'Transaction amount must be positive']
    },
    balanceBefore: {
        type: Number,
        required: true
    },
    balanceAfter: {
        type: Number,
        required: true
    },
    reference: {
        type: String,  // loanId, transactionId, etc.
        required: false
    },
    description: {
        type: String,
        required: false
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
}, { _id: true });

const walletSchema = new mongoose.Schema({
    // Reference to user
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User reference is required'],
        unique: true
    },

    // Available balance in INR (with 2 decimal precision for paise)
    balance: {
        type: Number,
        required: true,
        default: 0,
        min: [0, 'Balance cannot be negative'],
        set: (val) => Math.round(val * 100) / 100  // Round to 2 decimals
    },

    // Funds locked in active loans (for lenders)
    lockedBalance: {
        type: Number,
        default: 0,
        min: [0, 'Locked balance cannot be negative'],
        set: (val) => Math.round(val * 100) / 100
    },

    // Currency (default INR)
    currency: {
        type: String,
        default: 'INR',
        enum: ['INR']
    },

    // Transaction history (embedded for quick access)
    transactions: [transactionSchema],

    // Wallet status
    isActive: {
        type: Boolean,
        default: true
    },

    // Timestamps
    createdAt: {
        type: Date,
        default: Date.now
    },

    lastTransactionAt: {
        type: Date
    }
}, {
    timestamps: true
});

// ============ Virtual Fields ============

// Total balance (available + locked)
walletSchema.virtual('totalBalance').get(function () {
    return Math.round((this.balance + this.lockedBalance) * 100) / 100;
});

// ============ Methods ============

/**
 * Add transaction to history
 */
walletSchema.methods.addTransaction = function (type, amount, reference, description) {
    const balanceBefore = this.balance;
    const balanceAfter = this.balance;  // Will be updated by caller
    
    this.transactions.push({
        type,
        amount,
        balanceBefore,
        balanceAfter,
        reference,
        description,
        timestamp: new Date()
    });

    this.lastTransactionAt = new Date();
};

/**
 * Get public wallet data
 */
walletSchema.methods.toPublicJSON = function () {
    return {
        id: this._id,
        userId: this.userId,
        balance: this.balance,
        lockedBalance: this.lockedBalance,
        totalBalance: this.totalBalance,
        currency: this.currency,
        isActive: this.isActive,
        lastTransactionAt: this.lastTransactionAt,
        createdAt: this.createdAt
    };
};

/**
 * Get recent transactions
 */
walletSchema.methods.getRecentTransactions = function (limit = 10) {
    return this.transactions
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, limit);
};

// ============ Static Methods ============

/**
 * Find wallet by user ID
 */
walletSchema.statics.findByUserId = async function (userId) {
    return await this.findOne({ userId });
};

/**
 * Check if user has sufficient balance
 */
walletSchema.statics.hasSufficientBalance = async function (userId, amount) {
    const wallet = await this.findOne({ userId });
    if (!wallet) return false;
    return wallet.balance >= amount;
};

// ============ Indexes ============

walletSchema.index({ userId: 1 });
walletSchema.index({ isActive: 1 });
walletSchema.index({ 'transactions.timestamp': -1 });

// Ensure virtuals are included in JSON
walletSchema.set('toJSON', { virtuals: true });
walletSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Wallet', walletSchema);
