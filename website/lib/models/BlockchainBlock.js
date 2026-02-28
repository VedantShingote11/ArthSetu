import mongoose from 'mongoose';

const BlockchainBlockSchema = new mongoose.Schema({
    blockIndex: {
        type: Number,
        required: true,
        unique: true,
    },
    timestamp: {
        type: Date,
        default: Date.now,
        required: true,
    },
    transactionType: {
        type: String,
        enum: ['loan_created', 'loan_funded', 'repayment'],
        required: true,
    },
    fromUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    toUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    amount: {
        type: Number,
        required: true,
    },
    previousHash: {
        type: String,
        required: true,
    },
    currentHash: {
        type: String,
        required: true,
        unique: true,
    },
    data: {
        type: mongoose.Schema.Types.Mixed, // Flexible JSON object for transaction details
    },
});

export default mongoose.models.BlockchainBlock || mongoose.model('BlockchainBlock', BlockchainBlockSchema);
