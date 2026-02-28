import mongoose from 'mongoose';

const LoanRequestSchema = new mongoose.Schema({
    borrowerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    amount: {
        type: Number,
        required: [true, 'Loan amount is required'],
        min: 1000,
    },
    purpose: {
        type: String,
        required: [true, 'Loan purpose is required'],
        trim: true,
    },
    duration: {
        type: Number,
        required: [true, 'Loan duration is required'],
        min: 1, // months
    },
    preferredInterestRate: {
        type: Number,
        min: 0,
        max: 100,
    },
    repaymentFrequency: {
        type: String,
        enum: ['monthly', 'quarterly', 'yearly'],
        default: 'monthly',
    },
    description: {
        type: String,
        trim: true,
    },
    status: {
        type: String,
        enum: ['requested', 'funded', 'active', 'repaid', 'defaulted'],
        default: 'requested',
    },
    fundedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    fundedAmount: {
        type: Number,
        default: 0,
    },
    fundedDate: {
        type: Date,
    },
    interestRate: {
        type: Number, // Final agreed interest rate
    },
    riskScore: {
        type: Number, // Borrower's Profile Score at time of request
        min: 0,
        max: 100,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

// Update timestamp on save
LoanRequestSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

export default mongoose.models.LoanRequest || mongoose.model('LoanRequest', LoanRequestSchema);
