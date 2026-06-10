/**
 * User Model (MongoDB Schema)
 * 
 * Stores user information OFF-CHAIN including:
 * - Authentication credentials
 * - KYC details
 * - Role (Borrower/Lender)
 * - Wallet address
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    // Basic Information
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        minlength: [2, 'Name must be at least 2 characters'],
        maxlength: [100, 'Name cannot exceed 100 characters']
    },

    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
    },

    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters'],
        select: false  // Don't return password by default in queries
    },

    // Role-based access
    role: {
        type: String,
        enum: ['borrower', 'lender'],
        required: [true, 'Role is required']
    },

    // KYC Details (Off-chain only)
    kycDetails: {
        phone: {
            type: String,
            required: [true, 'Phone number is required'],
            match: [/^\+?[\d\s-()]+$/, 'Please provide a valid phone number']
        },

        aadhaar: {
            type: String,
            required: [true, 'Aadhaar number is required'],
            match: [/^\d{12}$/, 'Aadhaar must be 12 digits']
        },

        address: {
            street: {
                type: String,
                required: true
            },
            city: {
                type: String,
                required: true
            },
            state: {
                type: String,
                required: true
            },
            pincode: {
                type: String,
                required: true,
                match: [/^\d{6}$/, 'Pincode must be 6 digits']
            }
        },

        verified: {
            type: Boolean,
            default: false
        },

        verifiedAt: {
            type: Date
        }
    },

    // KYC document status (off-chain only)
    kycStatus: {
        type: String,
        enum: ['not_started', 'documents_uploaded', 'submitted', 'verified', 'rejected'],
        default: 'not_started'
    },

    kycDocuments: {
        aadhaarUrl: { type: String },      // Cloudinary secure URL
        aadhaarPublicId: { type: String }, // Cloudinary public_id for management
        panUrl: { type: String },
        panPublicId: { type: String },
        selfieUrl: { type: String },
        selfiePublicId: { type: String },
        submittedAt: { type: Date },
        rejectionReason: { type: String }  // set if rejected
    },

    // Reference to user's INR wallet (hybrid blockchain model)
    walletId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Wallet',
        required: false  // Will be created after user registration
    },

    // Credit Score — determines interest rate band
    // 800+ → 14% p.a. | 600–799 → 20% p.a. | <600 → 27% p.a.
    creditScore: {
        type: Number,
        default: 650,  // Default: 20% band
        min: 300,
        max: 900
    },

    // Auto-pay: deduct EMI from wallet on last day of month automatically
    autoPayEnabled: {
        type: Boolean,
        default: false
    },

    // Account status
    isActive: {
        type: Boolean,
        default: true
    },

    // Timestamps
    createdAt: {
        type: Date,
        default: Date.now
    },

    lastLogin: {
        type: Date
    }
}, {
    timestamps: true
});

// ============ Middleware ============

// Hash password before saving
userSchema.pre('save', async function (next) {
    // Only hash if password is modified
    if (!this.isModified('password')) {
        return next();
    }

    try {
        // Generate salt and hash password
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// ============ Methods ============

// Compare password for login
userSchema.methods.comparePassword = async function (candidatePassword) {
    try {
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        throw new Error('Password comparison failed');
    }
};

// Get public user data (without sensitive info)
userSchema.methods.toPublicJSON = function () {
    const docs = this.kycDocuments || {};
    return {
        id: this._id,
        name: this.name,
        email: this.email,
        role: this.role,
        walletId: this.walletId,
        creditScore: this.creditScore ?? 650,
        autoPayEnabled: this.autoPayEnabled ?? false,
        kycVerified: this.kycDetails?.verified || false,
        kycStatus: this.kycStatus || 'not_started',
        kycDocumentsUploaded: {
            aadhaar: !!docs.aadhaarUrl,
            pan: !!docs.panUrl,
            selfie: !!docs.selfieUrl
        },
        kycRejectionReason: docs.rejectionReason || null,
        createdAt: this.createdAt
    };
};

// ============ Indexes ============

// Create indexes for faster queries
userSchema.index({ email: 1 });
userSchema.index({ walletId: 1 });
userSchema.index({ role: 1 });

module.exports = mongoose.model('User', userSchema);
