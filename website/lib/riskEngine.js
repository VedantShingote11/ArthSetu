import LoanRequest from './models/LoanRequest.js';

/**
 * Calculate Profile Score for a borrower (300-900)
 * Higher score = lower risk = better borrower
 */
export async function calculateRiskScore(borrowerProfile, borrowerId) {
    let score = 400; // Start with base risk

    // Get borrower's loan history
    const loans = await LoanRequest.find({ borrowerId }).sort({ createdAt: -1 });

    if (loans.length === 0) {
        // New borrower
        return 500;
    }

    // Factor 1: Repayment history (Up to +200 points)
    const completedLoans = loans.filter(loan => loan.status === 'repaid');
    const defaultedLoans = loans.filter(loan => loan.status === 'defaulted');

    if (completedLoans.length > 0) {
        const repaymentRate = completedLoans.length / loans.length;
        score += repaymentRate * 150; // Good repayment increases score
    }

    if (defaultedLoans.length > 0) {
        score -= defaultedLoans.length * 100; // Defaults decrease score
    }

    // Factor 2: Active loan burden
    const activeLoans = loans.filter(loan => loan.status === 'active' || loan.status === 'funded');
    if (activeLoans.length > 3) {
        score -= 50; // Too many active loans = lower score
    } else if (activeLoans.length === 0 && completedLoans.length > 0) {
        score += 50; // No active loans but good history = higher score
    }

    // Factor 3: Total borrowed vs repaid
    if (borrowerProfile.totalBorrowed > 0) {
        const repaymentRatio = borrowerProfile.totalRepaid / borrowerProfile.totalBorrowed;
        if (repaymentRatio > 0.9) {
            score += 100; // Excellent repayment
        } else if (repaymentRatio < 0.5) {
            score -= 100; // Poor repayment
        }
    }

    // Factor 4: Loan amount consistency
    const avgLoanAmount = loans.reduce((sum, loan) => sum + loan.amount, 0) / loans.length;
    const lastLoan = loans[0];
    if (lastLoan && lastLoan.amount > avgLoanAmount * 2) {
        score -= 50; // Requesting much more than usual = lower score
    }

    // Ensure score is within bounds
    score = Math.max(300, Math.min(900, score));

    return Math.round(score);
}

/**
 * Get risk label based on score
 */
export function getRiskLabel(score) {
    if (score >= 700) return 'Low Risk';
    if (score >= 500) return 'Medium Risk';
    return 'High Risk';
}

/**
 * Get risk color for UI
 */
export function getRiskColor(score) {
    if (score >= 700) return 'green';
    if (score >= 500) return 'orange';
    return 'red';
}

/**
 * Suggest interest rate based on Profile Score
 * Higher score = lower interest rate
 */
export function suggestInterestRate(riskScore, amount, duration) {
    // Base rate
    let rate = 18; // 18% base for worst scores

    // Risk adjustment (Score 300->18%, Score 900->6%) 
    // Example: (900 - riskScore) / 600 * 12
    const riskAdjustment = ((900 - riskScore) / 600) * 12;
    rate = 6 + riskAdjustment;

    // Amount adjustment (larger loans get slightly better rates)
    if (amount > 100000) {
        rate -= 1;
    } else if (amount < 10000) {
        rate += 1;
    }

    // Duration adjustment (longer duration = higher rate)
    if (duration > 24) {
        rate += 2;
    } else if (duration > 12) {
        rate += 1;
    }

    // Ensure rate is reasonable
    rate = Math.max(6, Math.min(25, rate));

    return Math.round(rate * 10) / 10; // Round to 1 decimal
}

/**
 * Calculate monthly EMI (Equated Monthly Installment)
 */
export function calculateEMI(principal, annualRate, durationMonths) {
    const monthlyRate = annualRate / 12 / 100;
    const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, durationMonths)) /
        (Math.pow(1 + monthlyRate, durationMonths) - 1);
    return Math.round(emi * 100) / 100;
}

/**
 * Generate repayment schedule
 */
export function generateRepaymentSchedule(loanAmount, interestRate, duration, frequency = 'monthly') {
    const schedule = [];
    let installmentCount;

    switch (frequency) {
        case 'quarterly':
            installmentCount = Math.ceil(duration / 3);
            break;
        case 'yearly':
            installmentCount = Math.ceil(duration / 12);
            break;
        default: // monthly
            installmentCount = duration;
    }

    const emi = calculateEMI(loanAmount, interestRate, duration);

    for (let i = 1; i <= installmentCount; i++) {
        schedule.push({
            installmentNumber: i,
            amount: emi,
            dueDate: new Date(Date.now() + i * 30 * 24 * 60 * 60 * 1000), // Simplified: 30 days per month
        });
    }

    return schedule;
}
