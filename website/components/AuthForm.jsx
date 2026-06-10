'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function AuthForm({ mode = 'login' }) {
    const router = useRouter();

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        name: '',
        role: 'admin',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            // Check if response is JSON
            const contentType = res.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                const text = await res.text();
                console.error('Non-JSON response:', text);
                throw new Error('Server error: Please check your database connection and try again.');
            }

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Authentication failed');
            }

            // Store token
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));

            // Redirect based on role
            const dashboardRoutes = {
                borrower: '/borrower/dashboard',
                lender: '/lender/dashboard',
                admin: '/admin/dashboard',
            };

            router.push(dashboardRoutes[data.user.role]);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--gradient-primary)',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Background decoration */}
            <div style={{
                position: 'absolute',
                top: '-50%',
                right: '-50%',
                width: '200%',
                height: '200%',
                background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
                animation: 'spin 20s linear infinite'
            }}></div>

            <div className="card fade-in" style={{
                width: '100%',
                maxWidth: '450px',
                position: 'relative',
                zIndex: 1,
                background: 'rgba(255, 255, 255, 0.98)',
                backdropFilter: 'blur(10px)',
                boxShadow: 'var(--shadow-2xl)',
                border: '1px solid rgba(255, 255, 255, 0.3)'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{
                        display: 'inline-block',
                        padding: '0.75rem 1.5rem',
                        background: 'var(--gradient-primary)',
                        borderRadius: '50px',
                        marginBottom: '1.5rem',
                        color: 'white',
                        fontWeight: '700',
                        fontSize: '0.875rem'
                    }}>
                        {formData.role.charAt(0).toUpperCase() + formData.role.slice(1)} Portal
                    </div>
                    <h2 style={{
                        fontSize: '2rem',
                        fontWeight: '800',
                        marginBottom: '0.5rem',
                        background: 'var(--gradient-primary)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>
                        {mode === 'login' ? 'Welcome Back' : 'Create Account'}
                    </h2>
                    <p className="text-muted" style={{ fontSize: '0.9375rem' }}>
                        {mode === 'login'
                            ? 'Sign in to continue to your dashboard'
                            : 'Join our platform and start your journey'}
                    </p>
                </div>

                {error && (
                    <div className="badge badge-error fade-in" style={{
                        width: '100%',
                        marginBottom: '1.5rem',
                        padding: '1rem',
                        borderRadius: 'var(--radius-lg)',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        animation: 'pulse 2s infinite'
                    }}>
                        <span>⚠️</span> {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    {mode === 'register' && (
                        <div className="form-group">
                            <label className="form-label">Full Name</label>
                            <input
                                type="text"
                                className="form-input"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>
                    )}

                    <div className="form-group">
                        <label className="form-label">Email</label>
                        <input
                            type="email"
                            className="form-input"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input
                            type="password"
                            className="form-input"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required
                            minLength={6}
                        />
                    </div>



                    <button
                        type="submit"
                        className="btn btn-primary btn-lg"
                        style={{
                            width: '100%',
                            marginTop: '1rem',
                            padding: '1rem',
                            fontSize: '1rem',
                            fontWeight: '700'
                        }}
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <span className="spinner" style={{ width: '20px', height: '20px', borderWidth: '2px' }}></span>
                                Please wait...
                            </>
                        ) : (
                            <>
                                {mode === 'login' ? 'Sign In' : 'Create Account'} →
                            </>
                        )}
                    </button>
                </form>

                <div className="text-center mt-3">
                    {mode === 'login' ? (
                        <p className="text-muted">
                            Don't have an account?{' '}
                            <Link href={`/auth/register?role=admin`} style={{ color: 'var(--primary)', fontWeight: '500' }}>
                                Register
                            </Link>
                        </p>
                    ) : (
                        <p className="text-muted">
                            Already have an account?{' '}
                            <Link href={`/auth/login?role=admin`} style={{ color: 'var(--primary)', fontWeight: '500' }}>
                                Login
                            </Link>
                        </p>
                    )}
                </div>

                <div className="text-center mt-2">
                    <Link href="/" style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                        ← Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
}
