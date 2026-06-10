/**
 * Investment Model
 * 
 * Tracks individual lender investments in loans
 */

const mongoose = require('mongoose');

const investmentSchema = new mongoose.Schema({
    lender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    loan: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Loan',
        required: true,
        index: true
    },
    amountFunded: {
        type: Number,
        required: true,
        min: 0
    },
    fundingDate: {
        type: Date,
        default: Date.now
    },
    fundingTxHash: {
        type: String,
        required: false  // Optional — blockchain tx may be null if fire-and-forget returns null
    },
    status: {
        type: String,
        enum: ['Active', 'Repaid', 'Default'],
        default: 'Active'
    },
    returnsReceived: {
        type: Number,
        default: 0,
        min: 0
    },
    expectedReturns: {
        type: Number,
        required: true,
        min: 0
    },
    roi: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Indexes for efficient queries
investmentSchema.index({ lender: 1, status: 1 });
investmentSchema.index({ loan: 1 });
investmentSchema.index({ fundingDate: -1 });

// Virtual for profit calculation
investmentSchema.virtual('profit').get(function () {
    return this.returnsReceived - this.amountFunded;
});

// Method to calculate ROI percentage
investmentSchema.methods.calculateROI = function () {
    if (this.amountFunded === 0) return 0;
    return ((this.returnsReceived - this.amountFunded) / this.amountFunded) * 100;
};

// Method to update returns when repayment is received
investmentSchema.methods.updateReturns = function (amount) {
    this.returnsReceived += amount;
    this.roi = this.calculateROI();

    if (this.returnsReceived >= this.expectedReturns) {
        this.status = 'Repaid';
    }

    return this.save();
};

// Public JSON representation
investmentSchema.methods.toPublicJSON = function () {
    return {
        id: this._id,
        lender: this.lender,
        loan: this.loan,
        amountFunded: this.amountFunded,
        fundingDate: this.fundingDate,
        fundingTxHash: this.fundingTxHash,
        status: this.status,
        returnsReceived: this.returnsReceived,
        expectedReturns: this.expectedReturns,
        roi: this.roi,
        profit: this.profit
    };
};

// Static method to get lender's portfolio summary
investmentSchema.statics.getPortfolioSummary = async function (lenderId) {
    const investments = await this.find({ lender: lenderId });

    const summary = {
        totalInvested: 0,
        totalReturned: 0,
        activeInvestments: 0,
        completedInvestments: 0,
        profitLoss: 0
    };

    investments.forEach(inv => {
        summary.totalInvested += inv.amountFunded;
        summary.totalReturned += inv.returnsReceived;

        if (inv.status === 'Active') {
            summary.activeInvestments++;
        } else if (inv.status === 'Repaid') {
            summary.completedInvestments++;
        }
    });

    summary.profitLoss = summary.totalReturned - summary.totalInvested;

    return summary;
};

module.exports = mongoose.model('Investment', investmentSchema);
