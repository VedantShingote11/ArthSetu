/**
 * System Wallet Service
 *
 * Credits platform fees to the single SystemWallet document.
 * Call this whenever fees are collected from borrowers/lenders.
 */

const SystemWallet = require('../models/SystemWallet');

/**
 * Credit an amount to the system wallet
 *
 * @param {number} amount - Fee amount (₹)
 * @param {string} reason - Fee type (see SystemWallet.reason enum)
 * @param {ObjectId|null} loanRef - Loan reference
 * @param {ObjectId|null} userId - User who paid the fee
 * @param {string} description - Human-readable description
 */
const creditSystemWallet = async (amount, reason, loanRef = null, userId = null, description = '') => {
    try {
        const wallet = await SystemWallet.getOrCreate();
        const balanceBefore = wallet.balance;

        wallet.balance = Math.round((wallet.balance + amount) * 100) / 100;
        wallet.transactions.push({ amount, reason, loanRef, userId, description });

        await wallet.save();

        console.log(`💰 System Wallet +₹${amount} [${reason}] | Total: ₹${wallet.balance}`);
        return { balanceBefore, balanceAfter: wallet.balance, credited: amount };
    } catch (error) {
        // Non-fatal: log but don't break the main flow
        console.error('System wallet credit error:', error.message);
    }
};

/**
 * Get system wallet balance and recent transactions
 */
const getSystemWallet = async () => {
    try {
        return await SystemWallet.getOrCreate();
    } catch (error) {
        console.error('Error reading system wallet:', error.message);
        throw error;
    }
};

module.exports = { creditSystemWallet, getSystemWallet };
