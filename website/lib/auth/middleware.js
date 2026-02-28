import { verifyToken } from './jwt.js';

/**
 * Get authenticated user from request
 */
export function getAuthUser(request) {
    try {
        // Try to get token from Authorization header
        const authHeader = request.headers.get('authorization');
        let token = null;

        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.substring(7);
        }

        // Try to get token from cookie
        if (!token) {
            const cookies = request.headers.get('cookie');
            if (cookies) {
                const tokenCookie = cookies.split(';').find(c => c.trim().startsWith('token='));
                if (tokenCookie) {
                    token = tokenCookie.split('=')[1];
                }
            }
        }

        if (!token) {
            return null;
        }

        const decoded = verifyToken(token);
        return decoded;
    } catch (error) {
        return null;
    }
}

/**
 * Require authentication middleware
 */
export function requireAuth(request) {
    const user = getAuthUser(request);

    if (!user) {
        return {
            authorized: false,
            response: new Response(
                JSON.stringify({ error: 'Authentication required' }),
                { status: 401, headers: { 'Content-Type': 'application/json' } }
            ),
        };
    }

    return { authorized: true, user };
}

/**
 * Require specific role(s)
 */
export function requireRole(request, allowedRoles) {
    const authCheck = requireAuth(request);

    if (!authCheck.authorized) {
        return authCheck;
    }

    const { user } = authCheck;

    if (!allowedRoles.includes(user.role)) {
        return {
            authorized: false,
            response: new Response(
                JSON.stringify({ error: 'Insufficient permissions' }),
                { status: 403, headers: { 'Content-Type': 'application/json' } }
            ),
        };
    }

    return { authorized: true, user };
}
