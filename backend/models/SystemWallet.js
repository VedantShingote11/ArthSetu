/**
 * System Wallet Model
 *
 * A single platform-wide wallet that accumulates all fee revenue:
 *  - 4% borrower upfront fee (on loan acceptance)
 *  - 4.5% lender service fee (on each EMI)
 *  - 2% foreclosure fee (on early prepayment)
 *  - 2% missed-EMI penalty
 *
 * This document is NEVER exposed to end users.
 * Identified by the sentinel identifier: 'PLATFORM_SYSTEM'
 */

const mongoose = require('mongoose');

const systemTransactionSchema = new mongoose.Schema({
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    reason: {
        type: String,
        required: true,
        enum: [
            'BORROWER_UPFRONT_FEE',
            'LENDER_SERVICE_FEE',
            'FORECLOSURE_FEE',
            'MISSED_EMI_PENALTY'
        ]
    },
    loanRef: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Loan',
        required: false
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false
    },
    description: String,
    timestamp: {
        type: Date,
        default: Date.now
    }
}, { _id: true });

const systemWalletSchema = new mongoose.Schema({
    // Sentinel field — always 'PLATFORM_SYSTEM', ensures only one document
    identifier: {
        type: String,
        default: 'PLATFORM_SYSTEM',
        unique: true
    },

    balance: {
        type: Number,
        default: 0,
        min: 0,
        set: (val) => Math.round(val * 100) / 100
    },

    transactions: [systemTransactionSchema]
}, {
    timestamps: true
});

// ============ Statics ============

/**
 * Get (or create) the single system wallet document
 */
systemWalletSchema.statics.getOrCreate = async function () {
    let wallet = await this.findOne({ identifier: 'PLATFORM_SYSTEM' });
    if (!wallet) {
        wallet = new this({ identifier: 'PLATFORM_SYSTEM', balance: 0, transactions: [] });
        await wallet.save();
    }
    return wallet;
};

module.exports = mongoose.model('SystemWallet', systemWalletSchema);
