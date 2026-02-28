import { requireRole } from '@/lib/auth/middleware';
import { createBlock } from '@/lib/blockchain';
import BorrowerProfile from '@/lib/models/BorrowerProfile';
import Loan from '@/lib/models/Loan';
import dbConnect from '@/lib/mongodb';
import { calculateRiskScore, suggestInterestRate } from '@/lib/riskEngine';
import { NextResponse } from 'next/server';

export async function GET(request) {
    const authCheck = requireRole(request, ['borrower']);
    if (!authCheck.authorized) return authCheck.response;

    try {
        await dbConnect();

        const { user } = authCheck;

        const loans = await Loan.find({ borrower: user.userId })
            .populate('fundedBy', 'name email')
            .sort({ createdAt: -1 });

        return NextResponse.json({
            success: true,
            loans,
        });

    } catch (error) {
        console.error('Get loans error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch loans' },
            { status: 500 }
        );
    }
}

export async function POST(request) {
    const authCheck = requireRole(request, ['borrower']);
    if (!authCheck.authorized) return authCheck.response;

    try {
        await dbConnect();

        const { user } = authCheck;
        const {
            amount, purpose, duration, preferredInterestRate, repaymentFrequency, description,
            annual_inc, emp_length, home_ownership, verification_status, dti
        } = await request.json();

        // Validation
        if (!amount || !purpose || !duration || !annual_inc || !emp_length || !home_ownership || !verification_status || !dti) {
            return NextResponse.json(
                { error: 'All fields are required' },
                { status: 400 }
            );
        }

        if (amount < 1000) {
            return NextResponse.json(
                { error: 'Minimum loan amount is ₹1,000' },
                { status: 400 }
            );
        }

        // Get borrower profile
        const borrowerProfile = await BorrowerProfile.findOne({ userId: user.userId });

        if (!borrowerProfile) {
            return NextResponse.json(
                { error: 'Borrower profile not found' },
                { status: 404 }
            );
        }

        // Check KYC status
        if (borrowerProfile.kycStatus !== 'approved') {
            return NextResponse.json(
                { error: 'KYC must be approved before requesting a loan' },
                { status: 403 }
            );
        }

        // Construct the 24 inputs expected by the ML Model
        const mlPayload = {
            loan_amnt: parseFloat(amount),
            term: parseInt(duration) === 60 ? 60 : 36, // Model only accepts 36 or 60
            emp_length: emp_length || '< 1 year',
            annual_inc: parseFloat(annual_inc),
            dti: parseFloat(dti),
            home_ownership: home_ownership,
            verification_status: verification_status,
            purpose: purpose,
            // Defaults for obscure credit history fields
            delinq_2yrs: 0,
            inq_last_6mths: 0,
            open_acc: 5,
            pub_rec: 0,
            revol_bal: 1000,
            revol_util: 30.0,
            total_acc: 10,
            tot_cur_bal: 10000,
            total_rev_hi_lim: 5000,
            acc_open_past_24mths: 1,
            num_accts_ever_120_pd: 0,
            num_rev_accts: 2,
            num_tl_op_past_12m: 1,
            tot_hi_cred_lim: 15000,
            total_bal_ex_mort: 5000,
            earliest_cr_line: "Jan-2015" // Default 10 years
        };

        // Call the Python FastAPI model endpoint
        let riskScore = 400; // default fallback
        let grade = "C";

        try {
            /*
            const mlResponse = await fetch('http://127.0.0.1:8000/predict', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(mlPayload)
            });

            if (mlResponse.ok) {
                const mlData = await mlResponse.json();

                // The model returns a 300-900 score. Keep it as-is.
                if (mlData.raw_score) {
                    riskScore = Math.round(mlData.raw_score);
                } else if (mlData.profile_score) {
                    riskScore = Math.round(mlData.profile_score);
                }
            } else {
                console.warn('ML Model returned non-200:', mlResponse.status, await mlResponse.text());
                riskScore = await calculateRiskScore(borrowerProfile, user.userId);
            }
            */
            // Temporarily use local score logic
            riskScore = await calculateRiskScore(borrowerProfile, user.userId);
        } catch (mlErr) {
            console.error('Failed to calculate risk score:', mlErr);
            riskScore = 400; // fallback
        }

        // Update borrower profile Profile Score
        borrowerProfile.riskScore = riskScore;
        await borrowerProfile.save();

        // Suggest interest rate
        const suggestedRate = suggestInterestRate(riskScore, amount, duration);

        // Create loan record using new schema
        const p = parseFloat(amount);
        const r = suggestedRate / 12 / 100;
        const n = parseInt(duration);
        const emiAmount = r > 0 ? (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1) : (p / n);

        const loan = new Loan({
            borrower: user.userId,
            amount: p,
            reason: description || purpose,
            durationMonths: n,
            creditScore: riskScore,
            annualInterestRate: suggestedRate,
            emiAmount: emiAmount,
            status: 'Requested'
        });

        await loan.save();

        // Update borrower profile
        borrowerProfile.totalLoansCount += 1;
        await borrowerProfile.save();

        // Create blockchain block
        await createBlock(
            'loan_created',
            user.userId,
            null,
            amount,
            {
                loanId: loan._id.toString(),
                reason: description || purpose,
                durationMonths: duration,
                annualInterestRate: suggestedRate,
                riskScore,
            }
        );

        return NextResponse.json({
            success: true,
            message: 'Loan request created successfully',
            loan: loan.toObject(),
            suggestedInterestRate: suggestedRate,
        }, { status: 201 });

    } catch (error) {
        console.error('Create loan error:', error);
        return NextResponse.json(
            { error: 'Failed to create loan request' },
            { status: 500 }
        );
    }
}
