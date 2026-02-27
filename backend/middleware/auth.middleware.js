/**
 * Authentication Middleware
 * 
 * Handles JWT token verification and role-based access control
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Verify JWT token and attach user to request
 */
const authenticate = async (req, res, next) => {
    try {
        // Get token from header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'No token provided. Please login to access this resource.'
            });
        }

        // Extract token
        const token = authHeader.split(' ')[1];

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Get user from database
        const user = await User.findById(decoded.userId).select('-password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User not found. Token is invalid.'
            });
        }

        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Account is deactivated. Please contact support.'
            });
        }

        // Attach user to request object
        req.user = user;
        req.userId = user._id;
        req.userRole = user.role;

        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token. Please login again.'
            });
        }

        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expired. Please login again.'
            });
        }

        return res.status(500).json({
            success: false,
            message: 'Authentication failed',
            error: error.message
        });
    }
};

/**
 * Check if user has borrower role
 */
const requireBorrower = (req, res, next) => {
    if (req.userRole !== 'borrower') {
        return res.status(403).json({
            success: false,
            message: 'Access denied. This action is only available to borrowers.'
        });
    }
    next();
};

/**
 * Check if user has lender role
 */
const requireLender = (req, res, next) => {
    if (req.userRole !== 'lender') {
        return res.status(403).json({
            success: false,
            message: 'Access denied. This action is only available to lenders.'
        });
    }
    next();
};

/**
 * Allow both borrowers and lenders
 */
const requireAuthenticated = (req, res, next) => {
    // User is already authenticated by the authenticate middleware
    // This is just a semantic middleware for clarity
    next();
};

/**
 * Require KYC to be verified before accessing core features
 * Returns 403 with kycStatus so Flutter can redirect to KYC screen
 */
const requireKYC = (req, res, next) => {
    if (req.user.kycStatus !== 'verified') {
        return res.status(403).json({
            success: false,
            message: 'KYC verification required. Please complete your identity verification.',
            kycRequired: true,
            kycStatus: req.user.kycStatus || 'not_started'
        });
    }
    next();
};

module.exports = {
    authenticate,
    requireBorrower,
    requireLender,
    requireAuthenticated,
    requireKYC
};
