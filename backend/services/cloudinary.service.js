/**
 * Cloudinary Service — KYC Document Storage
 *
 * Handles private, secure upload of KYC documents (Aadhaar, PAN, Selfie)
 * Documents are stored with type:'private' — no public access without signed URL
 * Folder structure: /kyc/{userId}/{docType}
 */

const cloudinary = require('cloudinary').v2;

// Configure Cloudinary from environment variables
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
});

/**
 * Upload a KYC document to Cloudinary using a memory buffer
 * @param {string} userId - MongoDB user ID (used as folder)
 * @param {string} docType - 'aadhaar' | 'pan' | 'selfie'
 * @param {Buffer} fileBuffer - File content in memory
 * @param {string} mimetype - e.g. 'image/jpeg'
 * @returns {Promise<{ secure_url: string, public_id: string }>}
 */
const uploadDoc = (userId, docType, fileBuffer, mimetype) => {
    return new Promise((resolve, reject) => {
        // Determine resource type
        const resourceType = mimetype === 'application/pdf' ? 'raw' : 'image';

        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: `kyc/${userId}`,
                public_id: docType,             // aadhaar | pan | selfie
                resource_type: resourceType,
                type: 'private',                 // NOT publicly accessible
                overwrite: true,                 // re-upload replaces old
                tags: ['kyc', userId, docType],
                context: { uploaded_by: userId, doc_type: docType }
            },
            (error, result) => {
                if (error) return reject(error);
                resolve({
                    secure_url: result.secure_url,
                    public_id: result.public_id
                });
            }
        );

        uploadStream.end(fileBuffer);
    });
};

/**
 * Delete a KYC document from Cloudinary
 * @param {string} publicId - Cloudinary public_id to delete
 * @param {string} resourceType - 'image' | 'raw'
 */
const deleteDoc = async (publicId, resourceType = 'image') => {
    try {
        await cloudinary.uploader.destroy(publicId, {
            type: 'private',
            resource_type: resourceType
        });
    } catch (err) {
        console.warn(`⚠️  Cloudinary delete failed for ${publicId}:`, err.message);
    }
};

/**
 * Generate a temporary signed URL for a private document (admin use)
 * @param {string} publicId - Cloudinary public_id
 * @param {number} expiresInSeconds - default 60 seconds
 */
const getSignedUrl = (publicId, expiresInSeconds = 60) => {
    return cloudinary.utils.private_download_url(publicId, 'jpg', {
        expires_at: Math.floor(Date.now() / 1000) + expiresInSeconds
    });
};

module.exports = { uploadDoc, deleteDoc, getSignedUrl };
