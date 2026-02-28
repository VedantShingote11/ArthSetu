import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: 6,
    },
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
    },
    role: {
        type: String,
        enum: ['borrower', 'lender', 'admin'],
        required: true,
    },
    kycDetails: {
        kycStatus: {
            type: String,
            enum: ['not_started', 'documents_uploaded', 'submitted', 'verified', 'rejected', 'pending', 'approved'], // kept a few legacy ones for backward compat
            default: 'not_started',
        },
        creditScore: {
            type: Number,
            default: 0,
        },
    },
    kycStatus: {
        type: String,
        enum: ['not_started', 'documents_uploaded', 'submitted', 'verified', 'rejected', 'pending', 'approved'],
        default: 'not_started',
    },
    kycDocuments: {
        type: Object,
        default: {},
    },
    autoPayEnabled: {
        type: Boolean,
        default: false,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    walletId: {
        type: mongoose.Schema.Types.ObjectId,
    },
    lastLogin: {
        type: Date,
    },
}, { timestamps: true });

// Prevent model recompilation in development
export default mongoose.models.User || mongoose.model('User', UserSchema);
