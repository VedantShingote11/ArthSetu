import { requireRole } from '@/lib/auth/middleware';
import Loan from '@/lib/models/Loan';
import dbConnect from '@/lib/mongodb';
import { NextResponse } from 'next/server';

export async function GET(request) {
    const authCheck = requireRole(request, ['admin']);
    if (!authCheck.authorized) return authCheck.response;

    try {
        await dbConnect();

        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');

        const query = {};
        if (status && status !== 'all') {
            query.status = status;
        }

        const loans = await Loan.find(query)
            .populate('borrower', 'name email')
            .populate('lenders.lenderId', 'name email')
            .sort({ createdAt: -1 });

        // Calculate statistics
        const totalLoans = loans.length;
        const totalAmount = loans.reduce((sum, loan) => sum + loan.amount, 0);
        const fundedLoans = loans.filter(l => l.status !== 'Requested').length;
        const activeLoans = loans.filter(l => l.status === 'Active' || l.status === 'Funded').length;
        const repaidLoans = loans.filter(l => l.status === 'Repaid').length;
        const defaultedLoans = loans.filter(l => l.status === 'Cancelled').length;

        return NextResponse.json({
            success: true,
            loans,
            stats: {
                totalLoans,
                totalAmount,
                fundedLoans,
                activeLoans,
                repaidLoans,
                defaultedLoans,
            },
        });

    } catch (error) {
        console.error('Get loans error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch loans' },
            { status: 500 }
        );
    }
}
