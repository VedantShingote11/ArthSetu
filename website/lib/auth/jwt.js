import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

/**
 * Generate JWT token
 */
export function generateToken(userId, role, email, name) {
    return jwt.sign(
        { userId, role, email, name },
        JWT_SECRET,
        { expiresIn: '7d' }
    );
}

/**
 * Verify JWT token
 */
export function verifyToken(token) {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        return null;
    }
}
