/**
 * Analytics Service
 * 
 * Handles portfolio calculations, graph data generation, and credit scoring
 */

const Investment = require('../models/Investment');
const Repayment = require('../models/Repayment');
const Loan = require('../models/Loan');

/**
 * Calculate lender's complete portfolio summary
 */
async function calculateLenderPortfolio(userId) {
    try {
        // Get all investments
        const investments = await Investment.find({ lender: userId })
            .populate('loan', 'status loanAmount interestRate');

        const summary = {
            totalInvested: 0,
            totalReturned: 0,
            activeInvestments: 0,
            completedInvestments: 0,
            profitLoss: 0,
            averageROI: 0,
            investments: []
        };

        let totalROI = 0;
        let completedCount = 0;

        investments.forEach(inv => {
            summary.totalInvested += inv.amountFunded;
            summary.totalReturned += inv.returnsReceived;

            if (inv.status === 'Active') {
                summary.activeInvestments++;
            } else if (inv.status === 'Repaid') {
                summary.completedInvestments++;
                totalROI += inv.roi;
                completedCount++;
            }

            summary.investments.push({
                id: inv._id,
                loanId: inv.loan._id,
                amount: inv.amountFunded,
                returns: inv.returnsReceived,
                expectedReturns: inv.expectedReturns,
                roi: inv.roi,
                status: inv.status,
                fundingDate: inv.fundingDate
            });
        });

        summary.profitLoss = summary.totalReturned - summary.totalInvested;
        summary.averageROI = completedCount > 0 ? totalROI / completedCount : 0;

        return summary;
    } catch (error) {
        console.error('Calculate portfolio error:', error);
        throw error;
    }
}

/**
 * Generate portfolio growth graph data
 */
async function generatePortfolioGraph(userId, period = 'monthly', filter = 'overall') {
    try {
        const investments = await Investment.find({ lender: userId })
            .populate('loan', 'repaidAt status')
            .sort({ fundingDate: 1 });

        const repayments = await Repayment.find({ 'lenderDistributions.lender': userId })
            .sort({ timestamp: 1 });

        // Determine time grouping
        const now = new Date();
        const dataPoints = [];

        if (period === 'monthly') {
            // Last 12 months
            for (let i = 11; i >= 0; i--) {
                const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
                const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

                dataPoints.push({
                    period: monthKey,
                    label: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
                    invested: 0,
                    returned: 0,
                    profit: 0,
                    roi: 0
                });
            }
        } else {
            // Last 5 years
            for (let i = 4; i >= 0; i--) {
                const year = now.getFullYear() - i;

                dataPoints.push({
                    period: String(year),
                    label: String(year),
                    invested: 0,
                    returned: 0,
                    profit: 0,
                    roi: 0
                });
            }
        }

        // Aggregate investment data
        investments.forEach(inv => {
            const date = new Date(inv.fundingDate);
            const key = period === 'monthly'
                ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
                : String(date.getFullYear());

            const dataPoint = dataPoints.find(dp => dp.period === key);
            if (dataPoint) {
                dataPoint.invested += inv.amountFunded;
            }
        });

        // Aggregate repayment data from Investment records (more reliable)
        investments.forEach(inv => {
            if (inv.returnsReceived > 0) {
                // Use the loan's repaidAt date if available, otherwise use current date
                const repaymentDate = inv.loan?.repaidAt ? new Date(inv.loan.repaidAt) : new Date();
                const key = period === 'monthly'
                    ? `${repaymentDate.getFullYear()}-${String(repaymentDate.getMonth() + 1).padStart(2, '0')}`
                    : String(repaymentDate.getFullYear());

                const dataPoint = dataPoints.find(dp => dp.period === key);
                if (dataPoint) {
                    dataPoint.returned += inv.returnsReceived;
                }
            }
        });

        // Calculate cumulative values and ROI
        let cumulativeInvested = 0;
        let cumulativeReturned = 0;

        dataPoints.forEach(dp => {
            cumulativeInvested += dp.invested;
            cumulativeReturned += dp.returned;

            dp.profit = dp.returned - dp.invested;
            dp.roi = dp.invested > 0 ? ((dp.returned - dp.invested) / dp.invested) * 100 : 0;

            // Add cumulative values
            dp.cumulativeInvested = cumulativeInvested;
            dp.cumulativeReturned = cumulativeReturned;
            dp.cumulativeProfit = cumulativeReturned - cumulativeInvested;
        });

        return {
            period,
            filter,
            dataPoints
        };
    } catch (error) {
        console.error('Generate graph error:', error);
        throw error;
    }
}

/**
 * Calculate borrower's credit score (basic algorithm)
 */
async function calculateBorrowerCreditScore(userId) {
    try {
        const loans = await Loan.find({ borrower: userId });

        if (loans.length === 0) {
            return {
                score: 0,
                rating: 'New Borrower',
                factors: {
                    totalLoans: 0,
                    repaidLoans: 0,
                    activeLoans: 0,
                    defaultedLoans: 0,
                    onTimeRepayments: 0,
                    repaymentRate: 0
                }
            };
        }

        const factors = {
            totalLoans: loans.length,
            repaidLoans: loans.filter(l => l.status === 'Repaid').length,
            activeLoans: loans.filter(l => l.status === 'Active').length,
            defaultedLoans: 0, // TODO: Implement default detection
            onTimeRepayments: 0,
            repaymentRate: 0
        };

        // Calculate repayment rate
        factors.repaymentRate = factors.totalLoans > 0
            ? (factors.repaidLoans / factors.totalLoans) * 100
            : 0;

        // Simple credit score calculation (0-1000)
        let score = 300; // Base score

        // Add points for repaid loans (max 400 points)
        score += Math.min(factors.repaidLoans * 40, 400);

        // Add points for repayment rate (max 300 points)
        score += (factors.repaymentRate / 100) * 300;

        // Deduct points for active loans (slight penalty)
        score -= factors.activeLoans * 10;

        // Ensure score is within bounds
        score = Math.max(0, Math.min(1000, score));

        // Determine rating
        let rating;
        if (score >= 800) rating = 'Excellent';
        else if (score >= 650) rating = 'Good';
        else if (score >= 500) rating = 'Fair';
        else if (score >= 300) rating = 'Poor';
        else rating = 'Very Poor';

        return {
            score: Math.round(score),
            rating,
            factors
        };
    } catch (error) {
        console.error('Calculate credit score error:', error);
        throw error;
    }
}

/**
 * Calculate ROI for a specific investment
 */
function calculateROI(investment) {
    if (investment.amountFunded === 0) return 0;
    return ((investment.returnsReceived - investment.amountFunded) / investment.amountFunded) * 100;
}

/**
 * Get borrower's loan summary
 */
async function getBorrowerSummary(userId) {
    try {
        const loans = await Loan.find({ borrower: userId });

        const summary = {
            totalLoans: loans.length,
            totalBorrowed: 0,
            totalRepaid: 0,
            activeLoans: 0,
            completedLoans: 0,
            requestedLoans: 0
        };

        loans.forEach(loan => {
            if (loan.status === 'Active' || loan.status === 'Repaid') {
                summary.totalBorrowed += loan.amount;
            }

            if (loan.status === 'Repaid') {
                summary.totalRepaid += loan.totalRepayment || 0;
                summary.completedLoans++;
            } else if (loan.status === 'Active') {
                summary.activeLoans++;
            } else if (loan.status === 'Requested' || loan.status === 'Funded') {
                summary.requestedLoans++;
            }
        });

        return summary;
    } catch (error) {
        console.error('Get borrower summary error:', error);
        throw error;
    }
}

module.exports = {
    calculateLenderPortfolio,
    generatePortfolioGraph,
    calculateBorrowerCreditScore,
    calculateROI,
    getBorrowerSummary
};
