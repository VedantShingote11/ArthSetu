import { requireRole } from '@/lib/auth/middleware';
import LenderProfile from '@/lib/models/LenderProfile';
import LoanRequest from '@/lib/models/LoanRequest';
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
        const activeLoans = await LoanRequest.find({
            fundedBy: user.userId,
            status: { $in: ['funded', 'active'] },
        }).populate('borrowerId', 'name email');

        // Get completed loans
        const completedLoans = await LoanRequest.find({
            fundedBy: user.userId,
            status: 'repaid',
        });

        // Get defaulted loans
        const defaultedLoans = await LoanRequest.find({
            fundedBy: user.userId,
            status: 'defaulted',
        });

        // Calculate metrics
        const totalActiveAmount = activeLoans.reduce((sum, loan) => sum + loan.fundedAmount, 0);
        const totalCompletedAmount = completedLoans.reduce((sum, loan) => sum + loan.fundedAmount, 0);
        const totalDefaultedAmount = defaultedLoans.reduce((sum, loan) => sum + loan.fundedAmount, 0);

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
