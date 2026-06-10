/**
 * Authentication Routes
 * 
 * Handles user registration and login
 */

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const walletService = require('../services/wallet.service');

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user (Borrower or Lender) and create INR wallet
 * @access  Public
 */
router.post('/register', [
    // Validation middleware
    body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
    body('email').isEmail().normalizeEmail().withMessage('Invalid email address'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role').isIn(['borrower', 'lender']).withMessage('Role must be either borrower or lender'),
    body('kycDetails.phone').matches(/^\+?[\d\s-()]+$/).withMessage('Invalid phone number'),
    body('kycDetails.aadhaar').matches(/^\d{12}$/).withMessage('Aadhaar must be 12 digits'),
    body('kycDetails.address.street').notEmpty().withMessage('Street address is required'),
    body('kycDetails.address.city').notEmpty().withMessage('City is required'),
    body('kycDetails.address.state').notEmpty().withMessage('State is required'),
    body('kycDetails.address.pincode').matches(/^\d{6}$/).withMessage('Pincode must be 6 digits')
], async (req, res) => {
    try {
        // Check validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { name, email, password, role, kycDetails } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Email already registered'
            });
        }

        // Create new user
        const user = new User({
            name,
            email,
            password,
            role,
            kycDetails
        });

        await user.save();

        // Create INR wallet for user (hybrid blockchain model)
        const wallet = await walletService.createWallet(user._id, 0);

        // Update user with wallet reference
        user.walletId = wallet._id;
        await user.save();

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                user: user.toPublicJSON(),
                wallet: wallet.toPublicJSON(),
                token
            }
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Registration failed',
            error: error.message
        });
    }
});

/**
 * @route   POST /api/auth/login
 * @desc    Login user and return JWT token
 * @access  Public
 */
router.post('/login', [
    // Validation middleware
    body('email').isEmail().normalizeEmail().withMessage('Invalid email address'),
    body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
    try {
        // Check validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { email, password } = req.body;

        // Find user by email (include password for comparison)
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Check if account is active
        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Account is deactivated. Please contact support.'
            });
        }

        // Verify password
        const isPasswordValid = await user.comparePassword(password);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Update last login
        user.lastLogin = new Date();
        await user.save();

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );

        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: {
                user: user.toPublicJSON(),
                token
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Login failed',
            error: error.message
        });
    }
});

/**
 * @route   GET /api/auth/me
 * @desc    Get current authenticated user's data (for refreshing client state)
 * @access  Private
 */
const { authenticate } = require('../middleware/auth.middleware');

router.get('/me', authenticate, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        res.status(200).json({ success: true, data: user.toPublicJSON() });
    } catch (error) {
        console.error('Get me error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch user', error: error.message });
    }
});

module.exports = router;
