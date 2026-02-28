import mongoose from 'mongoose';

const RepaymentSchema = new mongoose.Schema({
    loanId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'LoanRequest',
        required: true,
    },
    amount: {
        type: Number,
        required: true,
        min: 0,
    },
    dueDate: {
        type: Date,
        required: true,
    },
    paidDate: {
        type: Date,
    },
    status: {
        type: String,
        enum: ['pending', 'paid', 'overdue'],
        default: 'pending',
    },
    installmentNumber: {
        type: Number,
        required: true,
        min: 1,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export default mongoose.models.Repayment || mongoose.model('Repayment', RepaymentSchema);
