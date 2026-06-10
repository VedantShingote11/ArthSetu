import { requireRole } from '@/lib/auth/middleware';
import { createBlock } from '@/lib/blockchain';
import BorrowerProfile from '@/lib/models/BorrowerProfile';
import LenderProfile from '@/lib/models/LenderProfile';
import Loan from '@/lib/models/Loan';
import dbConnect from '@/lib/mongodb';
import { NextResponse } from 'next/server';

export async function GET(request) {
    const authCheck = requireRole(request, ['lender']);
    if (!authCheck.authorized) return authCheck.response;

    try {
        await dbConnect();

        const { searchParams } = new URL(request.url);
        const minRisk = searchParams.get('minRisk');
        const maxRisk = searchParams.get('maxRisk');
        const purpose = searchParams.get('purpose');
        const minAmount = searchParams.get('minAmount');
        const maxAmount = searchParams.get('maxAmount');

        // Build query
        const query = { status: 'Requested' };

        if (minRisk || maxRisk) {
            query.creditScore = {};
            if (minRisk) query.creditScore.$gte = parseInt(minRisk);
            if (maxRisk) query.creditScore.$lte = parseInt(maxRisk);
        }

        if (purpose) {
            query.reason = { $regex: purpose, $options: 'i' };
        }

        if (minAmount || maxAmount) {
            query.amount = {};
            if (minAmount) query.amount.$gte = parseInt(minAmount);
            if (maxAmount) query.amount.$lte = parseInt(maxAmount);
        }

        const loans = await Loan.find(query)
            .populate('borrower', 'name email')
            .sort({ createdAt: -1 });

        // Enrich with borrower profiles
        const enrichedLoans = await Promise.all(
            loans.map(async (loan) => {
                const borrowerProfile = await BorrowerProfile.findOne({ userId: loan.borrower._id });
                return {
                    ...loan.toObject(),
                    borrowerProfile: borrowerProfile ? {
                        kycStatus: borrowerProfile.kycStatus,
                        riskScore: borrowerProfile.riskScore,
                        totalLoansCount: borrowerProfile.totalLoansCount,
                    } : null,
                };
            })
        );

        return NextResponse.json({
            success: true,
            loans: enrichedLoans,
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
    const authCheck = requireRole(request, ['lender']);
    if (!authCheck.authorized) return authCheck.response;

    try {
        await dbConnect();

        const { user } = authCheck;
        const { loanId, fundAmount } = await request.json();

        if (!loanId || !fundAmount) {
            return NextResponse.json(
                { error: 'Loan ID and fund amount are required' },
                { status: 400 }
            );
        }

        // Get loan request
        const loan = await Loan.findById(loanId);

        if (!loan) {
            return NextResponse.json(
                { error: 'Loan not found' },
                { status: 404 }
            );
        }

        if (loan.status !== 'Requested' && loan.status !== 'Funded') {
            return NextResponse.json(
                { error: 'Loan is not available for funding' },
                { status: 400 }
            );
        }

        // Get lender profile
        const lenderProfile = await LenderProfile.findOne({ userId: user.userId });

        if (!lenderProfile) {
            return NextResponse.json(
                { error: 'Lender profile not found' },
                { status: 404 }
            );
        }

        // Check wallet balance
        if (lenderProfile.walletBalance < fundAmount) {
            return NextResponse.json(
                { error: 'Insufficient wallet balance' },
                { status: 400 }
            );
        }

        // Update loan
        loan.lenders.push({
            lenderId: user.userId,
            contributionAmount: fundAmount,
            fundedAt: new Date()
        });
        loan.fundedAmount = (loan.fundedAmount || 0) + fundAmount;

        if (loan.fundedAmount >= loan.amount) {
            loan.status = 'Funded';
            loan.fundedAt = new Date();
        }
        await loan.save();

        // Update lender profile
        lenderProfile.walletBalance -= fundAmount;
        lenderProfile.totalInvested += fundAmount;
        lenderProfile.activeLoanCount += 1;
        await lenderProfile.save();

        // Update borrower profile
        const borrowerProfile = await BorrowerProfile.findOne({ userId: loan.borrower });
        if (borrowerProfile) {
            borrowerProfile.activeLoanCount += 1;
            borrowerProfile.totalBorrowed += fundAmount;
            await borrowerProfile.save();
        }

        await createBlock(
            'loan_funded',
            user.userId,
            loan.borrower,
            fundAmount,
            {
                loanId: loan._id.toString(),
                purpose: loan.reason,
                interestRate: loan.annualInterestRate,
                duration: loan.durationMonths,
            }
        );

        return NextResponse.json({
            success: true,
            message: 'Loan funded successfully',
            loan: loan.toObject(),
            newWalletBalance: lenderProfile.walletBalance,
        });

    } catch (error) {
        console.error('Fund loan error:', error);
        return NextResponse.json(
            { error: 'Failed to fund loan' },
            { status: 500 }
        );
    }
}
