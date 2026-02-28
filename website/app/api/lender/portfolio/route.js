import { requireRole } from '@/lib/auth/middleware';
import LenderProfile from '@/lib/models/LenderProfile';
import Loan from '@/lib/models/Loan';
import User from '@/lib/models/User';
import dbConnect from '@/lib/mongodb';
import { NextResponse } from 'next/server';

export async function GET(request) {
    const authCheck = requireRole(request, ['lender']);
    if (!authCheck.authorized) return authCheck.response;

    try {
        await dbConnect();

        const { user } = authCheck;

        const profile = await LenderProfile.findOne({ userId: user.userId });
        const userDetails = await User.findById(user.userId).select('-password');

        if (!profile) {
            return NextResponse.json(
                { error: 'Profile not found' },
                { status: 404 }
            );
        }

        // Get active loans
        const activeLoans = await Loan.find({
            'lenders.lenderId': user.userId,
            status: { $in: ['Funded', 'Active'] },
        }).populate('borrower', 'name email');

        // Get completed loans
        const completedLoans = await Loan.find({
            'lenders.lenderId': user.userId,
            status: 'Repaid',
        });

        // Get defaulted loans
        const defaultedLoans = await Loan.find({
            'lenders.lenderId': user.userId,
            status: 'Cancelled',
        });

        const getMyContribution = (loan) => {
            const lender = loan.lenders.find(l => l.lenderId.toString() === user.userId);
            return lender ? lender.contributionAmount : 0;
        };

        // Calculate metrics
        const totalActiveAmount = activeLoans.reduce((sum, loan) => sum + getMyContribution(loan), 0);
        const totalCompletedAmount = completedLoans.reduce((sum, loan) => sum + getMyContribution(loan), 0);
        const totalDefaultedAmount = defaultedLoans.reduce((sum, loan) => sum + getMyContribution(loan), 0);

        return NextResponse.json({
            success: true,
            profile: {
                ...profile.toObject(),
                user: userDetails,
            },
            portfolio: {
                activeLoans,
                completedLoans,
                defaultedLoans,
                metrics: {
                    totalActiveAmount,
                    totalCompletedAmount,
                    totalDefaultedAmount,
                    activeLoanCount: activeLoans.length,
                    completedLoanCount: completedLoans.length,
                    defaultedLoanCount: defaultedLoans.length,
                },
            },
        });

    } catch (error) {
        console.error('Get portfolio error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch portfolio' },
            { status: 500 }
        );
    }
}
