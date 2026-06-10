import { generateToken } from '@/lib/auth/jwt';
import Admin from '@/lib/models/Admin';
import User from '@/lib/models/User';
import dbConnect from '@/lib/mongodb';
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        // Check if MongoDB URI is configured
        if (!process.env.MONGODB_URI) {
            return NextResponse.json(
                { error: 'Database configuration error. Please check MONGODB_URI environment variable.' },
                { status: 500 }
            );
        }

        await dbConnect();

        const { email, password, role } = await request.json();

        // Validation
        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email and password are required' },
                { status: 400 }
            );
        }

        // Find user
        let user;
        if (role === 'admin') {
            user = await Admin.findOne({ email: email.toLowerCase() });
        } else {
            user = await User.findOne({ email: email.toLowerCase() });
        }
        if (!user) {
            return NextResponse.json(
                { error: 'Invalid email or password' },
                { status: 401 }
            );
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return NextResponse.json(
                { error: 'Invalid email or password' },
                { status: 401 }
            );
        }

        // Generate JWT token
        const token = generateToken(user._id.toString(), user.role, user.email, user.name);

        return NextResponse.json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                role: user.role,
            },
        });

    } catch (error) {
        console.error('Login error:', error);

        // Handle specific error types
        if (error.name === 'MongoServerError' || error.name === 'MongooseError') {
            return NextResponse.json(
                { error: 'Database connection failed. Please check your MongoDB connection.' },
                { status: 500 }
            );
        }

        if (error.message && error.message.includes('MONGODB_URI')) {
            return NextResponse.json(
                { error: 'Database configuration error. Please check your environment variables.' },
                { status: 500 }
            );
        }

        return NextResponse.json(
            { error: error.message || 'Login failed. Please try again.' },
            { status: 500 }
        );
    }
}
