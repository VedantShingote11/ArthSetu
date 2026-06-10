import { requireRole } from '@/lib/auth/middleware';
import User from '@/lib/models/User';
import dbConnect from '@/lib/mongodb';
import { NextResponse } from 'next/server';

export async function GET(request) {
    const authCheck = requireRole(request, ['admin']);
    if (!authCheck.authorized) return authCheck.response;

    try {
        await dbConnect();

        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');

        const query = { role: { $in: ['borrower', 'lender'] } };
        if (status) {
            if (status === 'pending') {
                query.kycStatus = { $in: ['pending', 'submitted', 'documents_uploaded'] };
            } else if (status === 'verified' || status === 'approved') {
                query.kycStatus = 'verified';
            } else if (status === 'rejected') {
                query.kycStatus = 'rejected';
            }
        }

        const users = await User.find(query).sort({ updatedAt: -1 });

        return NextResponse.json({
            success: true,
            kycRequests: users,
        });

    } catch (error) {
        console.error('Get KYC requests error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch KYC requests' },
            { status: 500 }
        );
    }
}

export async function PUT(request) {
    const authCheck = requireRole(request, ['admin']);
    if (!authCheck.authorized) return authCheck.response;

    try {
        await dbConnect();

        const { profileId, status } = await request.json();

        if (!profileId || !status) {
            return NextResponse.json(
                { error: 'User ID and status are required' },
                { status: 400 }
            );
        }

        if (!['approved', 'rejected', 'verified', 'submitted'].includes(status)) {
            return NextResponse.json(
                { error: 'Invalid status' },
                { status: 400 }
            );
        }

        const updateData = {
            'kycStatus': status,
            'kycDetails.verified': status === 'verified'
        };

        const user = await User.findByIdAndUpdate(profileId, { $set: updateData }, { new: true });

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: `KYC ${status} successfully`,
            user: user.toObject(),
        });

    } catch (error) {
        console.error('Update KYC error:', error);
        return NextResponse.json(
            { error: 'Failed to update KYC status' },
            { status: 500 }
        );
    }
}
