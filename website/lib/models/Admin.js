import mongoose from 'mongoose';

const AdminSchema = new mongoose.Schema({
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
        default: 'admin',
    },
}, { timestamps: true });

// Prevent model recompilation in development
export default mongoose.models.Admin || mongoose.model('Admin', AdminSchema);
