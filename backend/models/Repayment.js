/**
 * Repayment Model
 * 
 * Tracks all repayment transactions and distributions
 */

const mongoose = require('mongoose');

const repaymentSchema = new mongoose.Schema({
    loan: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Loan',
        required: true,
        index: true
    },
    borrower: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    transactionHash: {
        type: String,
        required: false  // Optional — blockchain tx may be null if fire-and-forget returns null
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    distributionTxHash: {
        type: String
    },
    lenderDistributions: [{
        lender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        amount: {
            type: Number,
            required: true,
            min: 0
        },
        distributionTxHash: {
            type: String
        }
    }]
}, {
    timestamps: true
});

// Indexes for efficient queries
repaymentSchema.index({ loan: 1, timestamp: -1 });
repaymentSchema.index({ borrower: 1, timestamp: -1 });
repaymentSchema.index({ 'lenderDistributions.lender': 1 });

// Method to add lender distribution
repaymentSchema.methods.addDistribution = function (lenderId, amount, txHash) {
    this.lenderDistributions.push({
        lender: lenderId,
        amount: amount,
        distributionTxHash: txHash
    });
    return this.save();
};

// Public JSON representation
repaymentSchema.methods.toPublicJSON = function () {
    return {
        id: this._id,
        loan: this.loan,
        borrower: this.borrower,
        amount: this.amount,
        transactionHash: this.transactionHash,
        timestamp: this.timestamp,
        distributionTxHash: this.distributionTxHash,
        lenderDistributions: this.lenderDistributions.map(dist => ({
            lender: dist.lender,
            amount: dist.amount,
            distributionTxHash: dist.distributionTxHash
        }))
    };
};

// Static method to get repayment history for a loan
repaymentSchema.statics.getLoanRepaymentHistory = async function (loanId) {
    return await this.find({ loan: loanId })
        .sort({ timestamp: -1 })
        .populate('borrower', 'name email')
        .populate('lenderDistributions.lender', 'name email walletAddress');
};

// Static method to get lender's repayment history
repaymentSchema.statics.getLenderRepaymentHistory = async function (lenderId) {
    return await this.find({ 'lenderDistributions.lender': lenderId })
        .sort({ timestamp: -1 })
        .populate('loan')
        .populate('borrower', 'name email');
};

module.exports = mongoose.model('Repayment', repaymentSchema);
