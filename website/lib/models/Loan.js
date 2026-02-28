/**
 * Loan Model (MongoDB Schema)
 *
 * Stores loan metadata OFF-CHAIN including:
 * - Loan details (amount, duration, computed interest)
 * - EMI schedule (reducing balance method)
 * - Status tracking
 * - Blockchain references
 *
 * NOTE: Actual loan contract logic is ON-CHAIN in Solidity.
 * Interest rate is NEVER user-provided — always computed from credit score.
 */

import mongoose from 'mongoose';

// ─── EMI Schedule Entry ───────────────────────────────────────────────────────
const emiEntrySchema = new mongoose.Schema({
    emiNumber: { type: Number, required: true },
    dueDate: { type: Date, required: true },
    emiAmount: { type: Number, required: true },
    principalComponent: { type: Number, required: true },
    interestComponent: { type: Number, required: true },
    remainingPrincipal: { type: Number, required: true },
    status: { type: String, enum: ['pending', 'paid', 'missed'], default: 'pending' },
    paidAt: { type: Date, default: null },
    penaltyAmount: { type: Number, default: 0 },
    penaltyPaid: { type: Boolean, default: false }
}, { _id: false });

// ─── Loan Schema ──────────────────────────────────────────────────────────────
const loanSchema = new mongoose.Schema({
    // Reference to borrower
    borrower: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Borrower reference is required']
    },

    // ─── Core Loan Details ───────────────────────────────────────────────
    amount: {
        type: Number,
        required: [true, 'Loan amount is required'],
        min: [1000, 'Minimum loan amount is ₹1,000'],
        set: (val) => Math.round(val * 100) / 100
    },

    // RBI-approved durations only: 1, 6, 12, 24, 36 months
    durationMonths: {
        type: Number,
        required: [true, 'Loan duration (months) is required'],
        enum: {
            values: [1, 6, 12, 24, 36],
            message: 'Duration must be one of: 1, 6, 12, 24, 36 months (RBI approved)'
        }
    },

    reason: {
        type: String,
        required: [true, 'Loan reason is required'],
        trim: true,
        minlength: [4, 'Reason must be at least 4 characters'],
        maxlength: [500, 'Reason cannot exceed 500 characters']
    },

    // ─── Interest (computed, never user-provided) ────────────────────────
    creditScore: {
        type: Number,
        required: true    // Snapshot of borrower credit score at loan creation time
    },

    annualInterestRate: {
        type: Number,
        required: true    // = BASE_RATE + creditScoreAddon, computed by interest.service
    },

    // ─── EMI Engine ──────────────────────────────────────────────────────
    emiAmount: {
        type: Number,
        required: true,
        set: (val) => Math.round(val * 100) / 100
    },

    emiSchedule: [emiEntrySchema],

    emisPaid: {
        type: Number,
        default: 0
    },

    remainingPrincipal: {
        type: Number,
        set: (val) => Math.round(val * 100) / 100
    },

    totalPrincipalPaid: {
        type: Number,
        default: 0,
        set: (val) => Math.round(val * 100) / 100
    },

    // ─── Platform Fees ───────────────────────────────────────────────────
    platformFeeCharged: {
        type: Number,
        default: 0,
        set: (val) => Math.round(val * 100) / 100
    },  // 4% upfront borrower fee, deducted on acceptance

    // ─── Prepayment ──────────────────────────────────────────────────────
    prepaidAt: { type: Date },
    prepaymentAmount: { type: Number, set: (val) => Math.round(val * 100) / 100 },
    foreclosureFeeCharged: { type: Number, default: 0, set: (val) => Math.round(val * 100) / 100 },
    isPrepaid: { type: Boolean, default: false },

    // ─── Auto-pay ────────────────────────────────────────────────────────
    autoPayEnabled: {
        type: Boolean,
        default: false
    },

    // ─── Funding ─────────────────────────────────────────────────────────
    fundedAmount: {
        type: Number,
        default: 0,
        min: [0, 'Funded amount cannot be negative'],
        set: (val) => Math.round(val * 100) / 100
    },

    loanPoolId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'LoanPool',
        required: false
    },

    lenders: [{
        lenderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        contributionAmount: {
            type: Number,
            min: [0, 'Contribution must be positive'],
            set: (val) => Math.round(val * 100) / 100
        },
        fundedAt: {
            type: Date,
            default: Date.now
        }
    }],

    // ─── Status ──────────────────────────────────────────────────────────
    status: {
        type: String,
        enum: ['Requested', 'Funded', 'Active', 'Repaid', 'Cancelled'],
        default: 'Requested'
    },

    repaymentCompleted: {
        type: Boolean,
        default: false
    },

    // ─── Blockchain References ───────────────────────────────────────────
    loanId: { type: Number, required: false },

    smartContractAddress: { type: String, required: false },

    transactionHashes: {
        creation: String,
        funding: [String],
        acceptance: String,
        repayment: String
    },

    // ─── Timestamps ──────────────────────────────────────────────────────
    fundedAt: { type: Date },
    acceptedAt: { type: Date },
    repaidAt: { type: Date }

}, { timestamps: true });

// ─── Virtuals ────────────────────────────────────────────────────────────────

loanSchema.virtual('isFullyFunded').get(function () {
    return this.fundedAmount >= this.amount;
});

loanSchema.virtual('progressPercent').get(function () {
    return Math.min(100, Math.round((this.fundedAmount / this.amount) * 100));
});

loanSchema.virtual('nextEmi').get(function () {
    return this.emiSchedule
        ? this.emiSchedule.find(e => e.status === 'pending') || null
        : null;
});

// ─── Public JSON ─────────────────────────────────────────────────────────────

loanSchema.methods.toPublicJSON = function () {
    return {
        id: this._id,
        loanId: this.loanId,
        borrower: this.borrower,
        loanPoolId: this.loanPoolId,
        amount: this.amount,
        durationMonths: this.durationMonths,
        creditScore: this.creditScore,
        annualInterestRate: this.annualInterestRate,
        emiAmount: this.emiAmount,
        emisPaid: this.emisPaid,
        remainingPrincipal: this.remainingPrincipal,
        platformFeeCharged: this.platformFeeCharged,
        fundedAmount: this.fundedAmount,
        reason: this.reason,
        status: this.status,
        autoPayEnabled: this.autoPayEnabled,
        isPrepaid: this.isPrepaid,
        isFullyFunded: this.isFullyFunded,
        progressPercent: this.progressPercent,
        nextEmi: this.nextEmi,
        emiSchedule: this.emiSchedule,
        lenders: this.lenders,
        createdAt: this.createdAt,
        fundedAt: this.fundedAt,
        acceptedAt: this.acceptedAt,
        repaidAt: this.repaidAt,
        transactionHashes: this.transactionHashes
    };
};

// ─── Indexes ──────────────────────────────────────────────────────────────────

loanSchema.index({ borrower: 1 });
loanSchema.index({ loanPoolId: 1 });
loanSchema.index({ status: 1 });
loanSchema.index({ loanId: 1 });
loanSchema.index({ 'lenders.lenderId': 1 });

loanSchema.set('toJSON', { virtuals: true });
loanSchema.set('toObject', { virtuals: true });

export default mongoose.models.Loan || mongoose.model('Loan', loanSchema);
