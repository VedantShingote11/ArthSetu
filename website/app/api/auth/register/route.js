import { generateToken } from '@/lib/auth/jwt';
import Admin from '@/lib/models/Admin';
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

        const { email, password, name, role } = await request.json();

        // Validation
        if (!email || !password || !name || !role) {
            return NextResponse.json(
                { error: 'All fields are required' },
                { status: 400 }
            );
        }

        if (role !== 'admin') {
            return NextResponse.json(
                { error: 'Invalid role' },
                { status: 400 }
            );
        }

        if (password.length < 6) {
            return NextResponse.json(
                { error: 'Password must be at least 6 characters' },
                { status: 400 }
            );
        }

        // Check if admin already exists
        const existingAdmin = await Admin.findOne({ email: email.toLowerCase() });
        if (existingAdmin) {
            return NextResponse.json(
                { error: 'User with this email already exists' },
                { status: 400 }
            );
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create admin
        const user = new Admin({
            email: email.toLowerCase(),
            password: hashedPassword,
            name,
            role,
        });

        await user.save();

        // Generate JWT token
        const token = generateToken(user._id.toString(), user.role, user.email, user.name);

        return NextResponse.json({
            success: true,
            message: 'User registered successfully',
            token,
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                role: user.role,
            },
        }, { status: 201 });

    } catch (error) {
        console.error('Registration error:', error);

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
            { error: error.message || 'Registration failed. Please try again.' },
            { status: 500 }
        );
    }
}
