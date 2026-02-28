import { requireRole } from '@/lib/auth/middleware';
import BorrowerProfile from '@/lib/models/BorrowerProfile';
import User from '@/lib/models/User';
import dbConnect from '@/lib/mongodb';
import { calculateRiskScore } from '@/lib/riskEngine';
import { NextResponse } from 'next/server';

export async function GET(request) {
    const authCheck = requireRole(request, ['borrower']);
    if (!authCheck.authorized) return authCheck.response;

    try {
        await dbConnect();

        const { user } = authCheck;

        const profile = await BorrowerProfile.findOne({ userId: user.userId });
        const userDetails = await User.findById(user.userId).select('-password');

        if (!profile) {
            return NextResponse.json(
                { error: 'Profile not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            profile: {
                ...profile.toObject(),
                user: userDetails,
            },
        });

    } catch (error) {
        console.error('Get profile error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch profile' },
            { status: 500 }
        );
    }
}

export async function PUT(request) {
    const authCheck = requireRole(request, ['borrower']);
    if (!authCheck.authorized) return authCheck.response;

    try {
        await dbConnect();

        const { user } = authCheck;
        const { aadhaarNumber, riskScore, creditScoreInputs, creditScoreCalculatedAt } = await request.json();

        const profile = await BorrowerProfile.findOne({ userId: user.userId });

        if (!profile) {
            return NextResponse.json(
                { error: 'Profile not found' },
                { status: 404 }
            );
        }

        // Update Aadhaar and set KYC to pending
        if (aadhaarNumber) {
            profile.aadhaarNumber = aadhaarNumber;
            profile.kycStatus = 'pending';
        }

        // Apply new ML Score
        if (riskScore !== undefined && riskScore !== null) {
            profile.riskScore = Math.round(Number(riskScore));
        } else if (!profile.riskScore) {
            // First time default sync
            profile.riskScore = 50;
        }

        // Store ML form inputs for audit trail
        if (creditScoreInputs) {
            profile.creditScoreInputs = creditScoreInputs;
        }

        // Store when the score was calculated
        if (creditScoreCalculatedAt) {
            profile.creditScoreCalculatedAt = new Date(creditScoreCalculatedAt);
        } else if (riskScore !== undefined && riskScore !== null) {
            // If a score is being saved but no timestamp provided, set it now
            profile.creditScoreCalculatedAt = new Date();
        }

        await profile.save();

        return NextResponse.json({
            success: true,
            message: 'Profile updated successfully',
            profile: profile.toObject(),
        });

    } catch (error) {
        console.error('Update profile error:', error);
        return NextResponse.json(
            { error: `Error: ${error.message} - ${error.stack}` },
            { status: 500 }
        );
    }
}
