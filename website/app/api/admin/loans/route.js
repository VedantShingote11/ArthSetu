import { requireRole } from '@/lib/auth/middleware';
import LoanRequest from '@/lib/models/LoanRequest';
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

        const loans = await LoanRequest.find(query)
            .populate('borrowerId', 'name email')
            .populate('fundedBy', 'name email')
            .sort({ createdAt: -1 });

        // Calculate statistics
        const totalLoans = loans.length;
        const totalAmount = loans.reduce((sum, loan) => sum + loan.amount, 0);
        const fundedLoans = loans.filter(l => l.status !== 'requested').length;
        const activeLoans = loans.filter(l => l.status === 'active' || l.status === 'funded').length;
        const repaidLoans = loans.filter(l => l.status === 'repaid').length;
        const defaultedLoans = loans.filter(l => l.status === 'defaulted').length;

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
