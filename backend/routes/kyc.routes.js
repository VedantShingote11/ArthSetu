/**
 * KYC Routes
 *
 * Handles KYC document upload, status check, and submission.
 * Documents are stored privately on Cloudinary.
 * Only KYC status is stored in MongoDB, never on blockchain.
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const User = require('../models/User');
const cloudinaryService = require('../services/cloudinary.service');
const { authenticate } = require('../middleware/auth.middleware');

// ============ Multer Config ============
// Memory storage — buffer sent directly to Cloudinary (no disk writes)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
    fileFilter: (req, file, cb) => {
        const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
        if (allowed.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Only JPG, PNG, or PDF files are allowed'), false);
        }
    }
});

// Valid document types
const VALID_DOC_TYPES = ['aadhaar', 'pan', 'selfie'];

// ============ Routes ============

/**
 * @route   GET /api/kyc/status
 * @desc    Get current KYC status and which documents are uploaded
 * @access  Private
 */
router.get('/status', authenticate, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const docs = user.kycDocuments || {};

        res.status(200).json({
            success: true,
            data: {
                kycStatus: user.kycStatus || 'not_started',
                documentsUploaded: {
                    aadhaar: !!docs.aadhaarUrl,
                    pan: !!docs.panUrl,
                    selfie: !!docs.selfieUrl
                },
                allUploaded: !!(docs.aadhaarUrl && docs.panUrl && docs.selfieUrl),
                rejectionReason: docs.rejectionReason || null,
                submittedAt: docs.submittedAt || null
            }
        });
    } catch (error) {
        console.error('KYC status error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch KYC status' });
    }
});

/**
 * @route   POST /api/kyc/upload/:docType
 * @desc    Upload a single KYC document (aadhaar | pan | selfie)
 * @access  Private
 */
router.post('/upload/:docType', authenticate, upload.single('document'), async (req, res) => {
    try {
        const { docType } = req.params;

        // Validate docType
        if (!VALID_DOC_TYPES.includes(docType)) {
            return res.status(400).json({
                success: false,
                message: `Invalid document type. Must be one of: ${VALID_DOC_TYPES.join(', ')}`
            });
        }

        // Check file was provided
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded. Please attach a file with field name "document".'
            });
        }

        const user = await User.findById(req.user._id);

        // Block re-upload if already verified
        if (user.kycStatus === 'verified') {
            return res.status(400).json({
                success: false,
                message: 'KYC is already verified. Documents cannot be changed.'
            });
        }

        // Upload to Cloudinary (private)
        console.log(`📤 Uploading KYC ${docType} for user ${user._id}...`);
        const result = await cloudinaryService.uploadDoc(
            user._id.toString(),
            docType,
            req.file.buffer,
            req.file.mimetype
        );

        // Save Cloudinary reference to user document
        if (!user.kycDocuments) user.kycDocuments = {};
        user.kycDocuments[`${docType}Url`] = result.secure_url;
        user.kycDocuments[`${docType}PublicId`] = result.public_id;

        // Update kycStatus if at least one doc exists
        const docs = user.kycDocuments;
        const allUploaded = !!(docs.aadhaarUrl && docs.panUrl && docs.selfieUrl);

        if (user.kycStatus === 'not_started' || user.kycStatus === 'rejected') {
            user.kycStatus = 'documents_uploaded';
        }
        // If they come back from Submitted to re-upload (e.g. rejected), keep submitted status
        // unless status becomes rejected — handled by admin route.

        await user.save();

        console.log(`✅ KYC ${docType} uploaded for user ${user._id}`);

        res.status(200).json({
            success: true,
            message: `${docType} uploaded successfully`,
            data: {
                docType,
                uploaded: true,
                allUploaded,
                kycStatus: user.kycStatus,
                documentsUploaded: {
                    aadhaar: !!docs.aadhaarUrl,
                    pan: !!docs.panUrl,
                    selfie: !!docs.selfieUrl
                }
            }
        });

    } catch (error) {
        // Handle multer errors
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: 'File is too large. Maximum size is 5MB.'
            });
        }
        if (error.message && error.message.includes('Only JPG')) {
            return res.status(400).json({ success: false, message: error.message });
        }
        console.error('KYC upload error:', error);
        res.status(500).json({ success: false, message: 'Upload failed. Please try again.' });
    }
});

/**
 * @route   POST /api/kyc/submit
 * @desc    Submit KYC for verification (requires all 3 documents)
 * @access  Private
 */
router.post('/submit', authenticate, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const docs = user.kycDocuments || {};

        // Already verified
        if (user.kycStatus === 'verified') {
            return res.status(400).json({
                success: false,
                message: 'KYC is already verified.'
            });
        }

        // Already submitted
        if (user.kycStatus === 'submitted') {
            return res.status(400).json({
                success: false,
                message: 'KYC is already submitted and under review.'
            });
        }

        // Check all 3 documents are uploaded
        const missing = [];
        if (!docs.aadhaarUrl) missing.push('Aadhaar Card');
        if (!docs.panUrl) missing.push('PAN Card');
        if (!docs.selfieUrl) missing.push('Selfie');

        if (missing.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Please upload the following before submitting: ${missing.join(', ')}`
            });
        }

        // Mark as submitted
        user.kycStatus = 'submitted';
        user.kycDocuments.submittedAt = new Date();
        await user.save();

        console.log(`📋 KYC submitted for review: user ${user._id}`);

        res.status(200).json({
            success: true,
            message: 'KYC submitted successfully. Verification usually takes 1-2 business days.',
            data: { kycStatus: 'submitted', submittedAt: user.kycDocuments.submittedAt }
        });

    } catch (error) {
        console.error('KYC submit error:', error);
        res.status(500).json({ success: false, message: 'Submission failed. Please try again.' });
    }
});

/**
 * @route   PATCH /api/kyc/admin-verify
 * @desc    Admin endpoint to verify or reject KYC
 * @access  Private (add admin middleware in production)
 * @body    { userId, action: 'verify' | 'reject', reason?: string }
 */
router.patch('/admin-verify', authenticate, async (req, res) => {
    try {
        const { userId, action, reason } = req.body;

        if (!userId || !['verify', 'reject'].includes(action)) {
            return res.status(400).json({
                success: false,
                message: 'Required: userId and action ("verify" or "reject")'
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        if (action === 'verify') {
            user.kycStatus = 'verified';
            user.kycDetails.verified = true;       // keep legacy field in sync
            user.kycDetails.verifiedAt = new Date();
            if (user.kycDocuments) delete user.kycDocuments.rejectionReason;
            console.log(`✅ KYC verified for user ${userId}`);
        } else {
            user.kycStatus = 'rejected';
            user.kycDetails.verified = false;
            if (!user.kycDocuments) user.kycDocuments = {};
            user.kycDocuments.rejectionReason = reason || 'Documents could not be verified.';
            console.log(`❌ KYC rejected for user ${userId}: ${reason}`);
        }

        user.markModified('kycDetails');
        user.markModified('kycDocuments');
        await user.save();

        res.status(200).json({
            success: true,
            message: `KYC ${action === 'verify' ? 'verified' : 'rejected'} successfully`,
            data: {
                userId,
                kycStatus: user.kycStatus,
                rejectionReason: user.kycDocuments?.rejectionReason || null
            }
        });

    } catch (error) {
        console.error('KYC admin verify error:', error);
        res.status(500).json({ success: false, message: 'Verification update failed.' });
    }
});

module.exports = router;
