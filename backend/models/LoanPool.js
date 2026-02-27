/**
 * LoanPool Model (MongoDB Schema)
 * 
 * Tracks locked funds for each loan in the hybrid blockchain model
 * Manages lender contributions and fund disbursement
 * References blockchain transaction hashes for audit trail
 */

const mongoose = require('mongoose');

const contributionSchema = new mongoose.Schema({
    lenderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    amount: {
        type: Number,
        required: true,
        min: [0, 'Contribution amount must be positive'],
        set: (val) => Math.round(val * 100) / 100  // Round to 2 decimals
    },
    fundedAt: {
        type: Date,
        default: Date.now
    },
    blockchainTxHash: {
        type: String,
        required: false  // Hash of the blockchain record transaction
    }
}, { _id: true });

const loanPoolSchema = new mongoose.Schema({
    // Reference to loan
    loanId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Loan',
        required: [true, 'Loan reference is required'],
        unique: true
    },

    // Total amount locked in pool (INR)
    totalAmount: {
        type: Number,
        required: true,
        default: 0,
        min: [0, 'Total amount cannot be negative'],
        set: (val) => Math.round(val * 100) / 100
    },

    // Target amount (from loan request)
    targetAmount: {
        type: Number,
        required: true,
        min: [0, 'Target amount must be positive'],
        set: (val) => Math.round(val * 100) / 100
    },

    // Lender contributions
    contributions: [contributionSchema],

    // Pool status
    status: {
        type: String,
        enum: ['LOCKED', 'DISBURSED', 'REPAID', 'CANCELLED'],
        default: 'LOCKED'
    },

    // Disbursement details
    disbursedAt: {
        type: Date
    },

    disbursedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },

    disbursementTxHash: {
        type: String  // Blockchain transaction hash for disbursement record
    },

    // Repayment details
    repaidAt: {
        type: Date
    },

    repaymentAmount: {
        type: Number,
        set: (val) => val ? Math.round(val * 100) / 100 : val
    },

    repaymentTxHash: {
        type: String  // Blockchain transaction hash for repayment record
    },

    // Timestamps
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// ============ Virtual Fields ============

// Check if pool is fully funded
loanPoolSchema.virtual('isFullyFunded').get(function () {
    return this.totalAmount >= this.targetAmount;
});

// Get number of lenders
loanPoolSchema.virtual('lenderCount').get(function () {
    return this.contributions.length;
});

// ============ Methods ============

/**
 * Add lender contribution to pool
 */
loanPoolSchema.methods.addContribution = function (lenderId, amount, blockchainTxHash) {
    // Check if lender already contributed
    const existingContribution = this.contributions.find(
        c => c.lenderId.toString() === lenderId.toString()
    );

    if (existingContribution) {
        // Add to existing contribution
        existingContribution.amount += amount;
        existingContribution.fundedAt = new Date();
        if (blockchainTxHash) {
            existingContribution.blockchainTxHash = blockchainTxHash;
        }
    } else {
        // New contribution
        this.contributions.push({
            lenderId,
            amount,
            fundedAt: new Date(),
            blockchainTxHash
        });
    }

    this.totalAmount += amount;
    this.totalAmount = Math.round(this.totalAmount * 100) / 100;
};

/**
 * Get lender's contribution amount
 */
loanPoolSchema.methods.getLenderContribution = function (lenderId) {
    const contribution = this.contributions.find(
        c => c.lenderId.toString() === lenderId.toString()
    );
    return contribution ? contribution.amount : 0;
};

/**
 * Calculate lender's share of repayment
 */
loanPoolSchema.methods.calculateLenderShare = function (lenderId, totalRepayment) {
    const contribution = this.getLenderContribution(lenderId);
    if (contribution === 0 || this.totalAmount === 0) return 0;

    const share = (totalRepayment * contribution) / this.totalAmount;
    return Math.round(share * 100) / 100;
};

/**
 * Get all lender shares for repayment distribution
 */
loanPoolSchema.methods.calculateAllShares = function (totalRepayment) {
    return this.contributions.map(contribution => ({
        lenderId: contribution.lenderId,
        contributionAmount: contribution.amount,
        shareAmount: this.calculateLenderShare(contribution.lenderId, totalRepayment)
    }));
};

/**
 * Mark pool as disbursed
 */
loanPoolSchema.methods.markDisbursed = function (borrowerId, txHash) {
    this.status = 'DISBURSED';
    this.disbursedAt = new Date();
    this.disbursedTo = borrowerId;
    if (txHash) {
        this.disbursementTxHash = txHash;
    }
};

/**
 * Mark pool as repaid
 */
loanPoolSchema.methods.markRepaid = function (repaymentAmount, txHash) {
    this.status = 'REPAID';
    this.repaidAt = new Date();
    this.repaymentAmount = repaymentAmount;
    if (txHash) {
        this.repaymentTxHash = txHash;
    }
};

/**
 * Get public pool data
 */
loanPoolSchema.methods.toPublicJSON = function () {
    return {
        id: this._id,
        loanId: this.loanId,
        totalAmount: this.totalAmount,
        targetAmount: this.targetAmount,
        isFullyFunded: this.isFullyFunded,
        lenderCount: this.lenderCount,
        status: this.status,
        contributions: this.contributions.map(c => ({
            lenderId: c.lenderId,
            amount: c.amount,
            fundedAt: c.fundedAt
        })),
        disbursedAt: this.disbursedAt,
        repaidAt: this.repaidAt,
        createdAt: this.createdAt
    };
};

// ============ Static Methods ============

/**
 * Find pool by loan ID
 */
loanPoolSchema.statics.findByLoanId = async function (loanId) {
    return await this.findOne({ loanId }).populate('contributions.lenderId', 'name email');
};

// ============ Indexes ============

loanPoolSchema.index({ loanId: 1 });
loanPoolSchema.index({ status: 1 });
loanPoolSchema.index({ 'contributions.lenderId': 1 });

// Ensure virtuals are included in JSON
loanPoolSchema.set('toJSON', { virtuals: true });
loanPoolSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('LoanPool', loanPoolSchema);
