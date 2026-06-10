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
        const role = searchParams.get('role');

        const query = {};
        if (role && role !== 'all') {
            query.role = role;
        }

        const users = await User.find(query).select('-password').sort({ createdAt: -1 });

        return NextResponse.json({
            success: true,
            users: users,
        });

    } catch (error) {
        console.error('Get users error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch users' },
            { status: 500 }
        );
    }
}
