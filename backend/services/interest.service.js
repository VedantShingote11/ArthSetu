/**
 * Interest & EMI Service
 *
 * Implements RBI-standard reducing balance EMI calculation.
 * All platform fee rules are enforced here as the single source of truth.
 *
 * Rules:
 *  - Base Rate: 12% p.a.
 *  - Credit Score Addon:  800+       → 2%   (total 14%)
 *                         600–799    → 8%   (total 20%)
 *                         < 600      → 15%  (total 27%)
 *  - Borrower Upfront Fee: 4% of principal (one-time, on acceptance)
 *  - Lender Service Fee:   4.5% of each EMI (deducted before crediting lender)
 *  - Prepayment:           After 3 EMIs → free | Before 3 EMIs → 2% of remaining principal
 *  - Missed EMI Penalty:   2% of that EMI amount
 *  - RBI Durations (months): [1, 6, 12, 24, 36]
 */

// ─── Constants ──────────────────────────────────────────────────────────────
const BASE_RATE = 12;                  // % p.a.
const BORROWER_UPFRONT_FEE = 0.04;    // 4% of principal
const LENDER_SERVICE_FEE = 0.045;     // 4.5% per EMI
const FORECLOSURE_FEE_RATE = 0.02;    // 2% of remaining principal
const MISSED_EMI_PENALTY = 0.02;      // 2% of EMI amount
const FREE_PREPAYMENT_AFTER = 3;      // EMIs paid before foreclosure fee kicks in

const ALLOWED_DURATIONS = [1, 6, 12, 24, 36]; // RBI approved months

// ─── Credit Score Rate ───────────────────────────────────────────────────────

/**
 * Returns credit-score-based annual interest addon (%)
 * @param {number} creditScore
 * @returns {number} addon percentage
 */
const getCreditScoreAddon = (creditScore) => {
    if (creditScore >= 800) return 2;
    if (creditScore >= 600) return 8;
    return 15;
};

/**
 * Returns total annual interest rate for a given credit score
 * @param {number} creditScore
 * @returns {number} total annual rate %
 */
const calculateAnnualRate = (creditScore) => {
    return BASE_RATE + getCreditScoreAddon(creditScore);
};

// ─── EMI Calculation ─────────────────────────────────────────────────────────

/**
 * Reducing balance EMI formula (RBI standard — same as LenDenClub, Faircent)
 * EMI = P × r × (1+r)^n / ((1+r)^n − 1)
 *
 * @param {number} principal - Loan amount (₹)
 * @param {number} annualRate - Total annual interest rate (%)
 * @param {number} months - Loan tenure in months
 * @returns {number} Fixed monthly EMI (₹), rounded to 2 decimals
 */
const calculateEMI = (principal, annualRate, months) => {
    if (!ALLOWED_DURATIONS.includes(months)) {
        throw new Error(`Invalid duration. Allowed: ${ALLOWED_DURATIONS.join(', ')} months`);
    }

    const r = annualRate / 12 / 100; // monthly rate

    if (months === 1) {
        // Special case: single EMI = principal + one month interest
        return Math.round((principal + principal * r) * 100) / 100;
    }

    const onePlusR_n = Math.pow(1 + r, months);
    const emi = (principal * r * onePlusR_n) / (onePlusR_n - 1);
    return Math.round(emi * 100) / 100;
};

// ─── EMI Schedule ────────────────────────────────────────────────────────────

/**
 * Generates full reducing-balance EMI schedule
 *
 * @param {number} principal - Loan amount (₹)
 * @param {number} annualRate - Annual interest rate (%)
 * @param {number} months - Tenure in months
 * @param {Date} startDate - Loan acceptance date (first EMI due 1 month later)
 * @returns {Array} EMI schedule rows
 */
const generateEMISchedule = (principal, annualRate, months, startDate) => {
    const r = annualRate / 12 / 100;
    const emiAmount = calculateEMI(principal, annualRate, months);
    const schedule = [];
    let remainingPrincipal = principal;
    const start = new Date(startDate);

    for (let i = 1; i <= months; i++) {
        const dueDate = new Date(start);
        dueDate.setMonth(dueDate.getMonth() + i);

        const interestComponent = Math.round(remainingPrincipal * r * 100) / 100;
        let principalComponent = Math.round((emiAmount - interestComponent) * 100) / 100;

        // Last EMI: clear remaining principal to avoid floating point dust
        if (i === months) {
            principalComponent = Math.round(remainingPrincipal * 100) / 100;
        }

        remainingPrincipal = Math.round((remainingPrincipal - principalComponent) * 100) / 100;
        if (remainingPrincipal < 0) remainingPrincipal = 0;

        schedule.push({
            emiNumber: i,
            dueDate,
            emiAmount: i === months
                ? Math.round((principalComponent + interestComponent) * 100) / 100
                : emiAmount,
            principalComponent,
            interestComponent,
            remainingPrincipal,
            status: 'pending',
            paidAt: null,
            penaltyAmount: 0,
            penaltyPaid: false
        });
    }

    return schedule;
};

// ─── Prepayment ───────────────────────────────────────────────────────────────

/**
 * Calculates prepayment amount and applicable fees
 *
 * Policy:
 *   - After 3 EMIs paid → FREE (0% foreclosure fee)
 *   - Before 3 EMIs    → 2% foreclosure fee on remaining principal
 *
 * @param {number} remainingPrincipal - Outstanding principal
 * @param {number} annualRate - Loan annual rate
 * @param {number} emisPaid - Number of EMIs already paid
 * @returns {Object} prepayment breakdown
 */
const calculatePrepayment = (remainingPrincipal, annualRate, emisPaid) => {
    const r = annualRate / 12 / 100;
    const currentMonthInterest = Math.round(remainingPrincipal * r * 100) / 100;

    const isFree = emisPaid >= FREE_PREPAYMENT_AFTER;
    const foreclosureFee = isFree
        ? 0
        : Math.round(remainingPrincipal * FORECLOSURE_FEE_RATE * 100) / 100;

    const totalPayable = Math.round(
        (remainingPrincipal + currentMonthInterest + foreclosureFee) * 100
    ) / 100;

    return {
        remainingPrincipal,
        currentMonthInterest,
        foreclosureFee,
        totalPayable,
        isFree,
        rule: isFree
            ? 'Prepayment is FREE (paid 3+ EMIs)'
            : `2% foreclosure fee applies (paid ${emisPaid} of 3 required EMIs for free prepayment)`
    };
};

// ─── Penalty ──────────────────────────────────────────────────────────────────

/**
 * Calculate missed-EMI penalty
 * @param {number} emiAmount - Monthly EMI amount
 * @returns {number} Penalty amount (2% of EMI)
 */
const calculatePenalty = (emiAmount) => {
    return Math.round(emiAmount * MISSED_EMI_PENALTY * 100) / 100;
};

// ─── Platform Fee ─────────────────────────────────────────────────────────────

/**
 * Calculate upfront borrower platform fee (4% of principal)
 * @param {number} principal
 * @returns {number}
 */
const calculateBorrowerFee = (principal) => {
    return Math.round(principal * BORROWER_UPFRONT_FEE * 100) / 100;
};

/**
 * Calculate lender service fee deducted per EMI (4.5%)
 * @param {number} emiAmount
 * @returns {{ netToLender: number, serviceFee: number }}
 */
const calculateLenderServiceFee = (emiAmount) => {
    const serviceFee = Math.round(emiAmount * LENDER_SERVICE_FEE * 100) / 100;
    const netToLender = Math.round((emiAmount - serviceFee) * 100) / 100;
    return { serviceFee, netToLender };
};

// ─── Validation ───────────────────────────────────────────────────────────────

const isValidDuration = (months) => ALLOWED_DURATIONS.includes(months);

// ─── Exports ──────────────────────────────────────────────────────────────────

module.exports = {
    // Constants (useful for display in routes)
    BASE_RATE,
    BORROWER_UPFRONT_FEE,
    LENDER_SERVICE_FEE,
    FORECLOSURE_FEE_RATE,
    MISSED_EMI_PENALTY,
    FREE_PREPAYMENT_AFTER,
    ALLOWED_DURATIONS,

    // Functions
    getCreditScoreAddon,
    calculateAnnualRate,
    calculateEMI,
    generateEMISchedule,
    calculatePrepayment,
    calculatePenalty,
    calculateBorrowerFee,
    calculateLenderServiceFee,
    isValidDuration
};
