/**
 * Migration Script: Create Investment Records for Existing Loans
 * 
 * This script creates Investment records for loans that were funded
 * before the Investment model was added to the system.
 * 
 * Run this once to migrate existing data:
 * node scripts/migrate-investments.js
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Loan = require('../models/Loan');
const Investment = require('../models/Investment');
const User = require('../models/User');

dotenv.config();

async function migrateInvestments() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('✅ Connected to MongoDB');

        // Find all funded or active loans
        const loans = await Loan.find({
            status: { $in: ['Funded', 'Active', 'Repaid'] },
            fundedAmount: { $gt: 0 }
        });

        console.log(`\n📊 Found ${loans.length} loans to process\n`);

        let created = 0;
        let skipped = 0;
        let errors = 0;

        for (const loan of loans) {
            console.log(`Processing Loan #${loan.loanId}...`);

            // Check if loan has lenders array
            if (!loan.lenders || loan.lenders.length === 0) {
                console.log(`  ⚠️  No lenders found, skipping`);
                skipped++;
                continue;
            }

            // Process each lender
            for (const lenderInfo of loan.lenders) {
                try {
                    // Find lender by wallet address
                    const lender = await User.findOne({
                        walletAddress: lenderInfo.lenderAddress,
                        role: 'lender'
                    });

                    if (!lender) {
                        console.log(`  ⚠️  Lender not found: ${lenderInfo.lenderAddress}`);
                        continue;
                    }

                    // Check if Investment record already exists
                    const existingInvestment = await Investment.findOne({
                        lender: lender._id,
                        loan: loan._id
                    });

                    if (existingInvestment) {
                        console.log(`  ℹ️  Investment already exists for ${lender.name}`);
                        skipped++;
                        continue;
                    }

                    // Calculate expected returns
                    const expectedReturns = lenderInfo.contributionAmount +
                        (lenderInfo.contributionAmount * loan.interestRate / 100);

                    // Determine status
                    let status = 'Active';
                    let returnsReceived = 0;

                    if (loan.status === 'Repaid') {
                        status = 'Repaid';
                        returnsReceived = expectedReturns;
                    }

                    // Create Investment record
                    const investment = new Investment({
                        lender: lender._id,
                        loan: loan._id,
                        amountFunded: lenderInfo.contributionAmount,
                        fundingDate: lenderInfo.fundedAt || loan.fundedAt || loan.createdAt,
                        fundingTxHash: loan.transactionHashes?.funding?.[0] || 'MIGRATED',
                        status: status,
                        expectedReturns: expectedReturns,
                        returnsReceived: returnsReceived
                    });

                    await investment.save();
                    console.log(`  ✅ Created investment for ${lender.name}: ${lenderInfo.contributionAmount} ETH`);
                    created++;

                } catch (error) {
                    console.error(`  ❌ Error processing lender:`, error.message);
                    errors++;
                }
            }
        }

        console.log(`\n📈 Migration Summary:`);
        console.log(`   Created: ${created} investments`);
        console.log(`   Skipped: ${skipped} (already exist or no lender found)`);
        console.log(`   Errors: ${errors}`);
        console.log(`\n✅ Migration completed!\n`);

    } catch (error) {
        console.error('❌ Migration failed:', error);
    } finally {
        await mongoose.connection.close();
        console.log('🔌 Disconnected from MongoDB');
    }
}

// Run migration
migrateInvestments();
