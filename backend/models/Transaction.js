/**
 * Transaction Model (MongoDB Schema)
 * 
 * Records all off-chain INR transactions in the system
 * Provides complete audit trail separate from blockchain
 * Links to blockchain transaction hashes where applicable
 */

const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    // User involved in transaction
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User reference is required']
    },

    // Transaction type
    type: {
        type: String,
        enum: [
            'DEPOSIT',              // User deposits INR to wallet
            'WITHDRAWAL',           // User withdraws INR from wallet
            'LOAN_FUNDING',         // Lender funds a loan
            'LOAN_DISBURSEMENT',    // Borrower receives loan funds
            'REPAYMENT_PAID',       // Borrower repays loan (full or EMI)
            'REPAYMENT_RECEIVED',   // Lender receives repayment share
            'PLATFORM_FEE',         // 4% borrower upfront facilitation fee
            'PREPAYMENT',           // Borrower pre-closes loan early
            'EMI_PENALTY',          // 2% penalty on missed EMI
            'LENDER_SERVICE_FEE',   // 4.5% service fee deducted from lender share
            'REFUND',               // Refund for cancelled loan
            'ADMIN_CREDIT',         // Admin credits wallet
            'ADMIN_DEBIT'           // Admin debits wallet
        ],
        required: [true, 'Transaction type is required']
    },

    // Amount in INR (with 2 decimal precision)
    amount: {
        type: Number,
        required: [true, 'Transaction amount is required'],
        min: [0, 'Amount must be positive'],
        set: (val) => Math.round(val * 100) / 100
    },

    // Wallet balance before transaction
    balanceBefore: {
        type: Number,
        required: true,
        set: (val) => Math.round(val * 100) / 100
    },

    // Wallet balance after transaction
    balanceAfter: {
        type: Number,
        required: true,
        set: (val) => Math.round(val * 100) / 100
    },

    // Reference to related entity (loan, etc.)
    reference: {
        referenceType: {
            type: String,
            enum: ['Loan', 'LoanPool', 'User', 'Other'],
            required: false
        },
        referenceId: {
            type: mongoose.Schema.Types.ObjectId,
            required: false
        }
    },

    // Description/notes
    description: {
        type: String,
        maxlength: [500, 'Description cannot exceed 500 characters']
    },

    // Blockchain reference (if applicable)
    blockchainTxHash: {
        type: String,
        required: false,
        match: [/^0x[a-fA-F0-9]{64}$/, 'Invalid transaction hash format']
    },

    // Transaction status
    status: {
        type: String,
        enum: ['PENDING', 'COMPLETED', 'FAILED', 'CANCELLED'],
        default: 'COMPLETED'
    },

    // Metadata (flexible field for additional data)
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        required: false
    },

    // Timestamps
    createdAt: {
        type: Date,
        default: Date.now
    },

    completedAt: {
        type: Date
    }
}, {
    timestamps: true
});

// ============ Methods ============

/**
 * Mark transaction as completed
 */
transactionSchema.methods.markCompleted = function () {
    this.status = 'COMPLETED';
    this.completedAt = new Date();
};

/**
 * Mark transaction as failed
 */
transactionSchema.methods.markFailed = function () {
    this.status = 'FAILED';
};

/**
 * Get public transaction data
 */
transactionSchema.methods.toPublicJSON = function () {
    return {
        id: this._id,
        userId: this.userId,
        type: this.type,
        amount: this.amount,
        balanceBefore: this.balanceBefore,
        balanceAfter: this.balanceAfter,
        description: this.description,
        status: this.status,
        blockchainTxHash: this.blockchainTxHash,
        createdAt: this.createdAt,
        completedAt: this.completedAt
    };
};

// ============ Static Methods ============

/**
 * Get user's transaction history
 */
transactionSchema.statics.getUserTransactions = async function (userId, limit = 50, skip = 0) {
    return await this.find({ userId })
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip)
        .populate('reference.referenceId');
};

/**
 * Get transactions by type
 */
transactionSchema.statics.getTransactionsByType = async function (userId, type, limit = 50) {
    return await this.find({ userId, type })
        .sort({ createdAt: -1 })
        .limit(limit);
};

/**
 * Get transactions by reference
 */
transactionSchema.statics.getTransactionsByReference = async function (referenceType, referenceId) {
    return await this.find({
        'reference.referenceType': referenceType,
        'reference.referenceId': referenceId
    }).sort({ createdAt: -1 });
};

/**
 * Create transaction record
 */
transactionSchema.statics.createTransaction = async function (data) {
    const transaction = new this({
        userId: data.userId,
        type: data.type,
        amount: data.amount,
        balanceBefore: data.balanceBefore,
        balanceAfter: data.balanceAfter,
        reference: data.reference,
        description: data.description,
        blockchainTxHash: data.blockchainTxHash,
        status: data.status || 'COMPLETED',
        metadata: data.metadata
    });

    if (transaction.status === 'COMPLETED') {
        transaction.completedAt = new Date();
    }

    return await transaction.save();
};

// ============ Indexes ============

transactionSchema.index({ userId: 1, createdAt: -1 });
transactionSchema.index({ type: 1 });
transactionSchema.index({ status: 1 });
transactionSchema.index({ blockchainTxHash: 1 });
transactionSchema.index({ 'reference.referenceType': 1, 'reference.referenceId': 1 });

module.exports = mongoose.model('Transaction', transactionSchema);
