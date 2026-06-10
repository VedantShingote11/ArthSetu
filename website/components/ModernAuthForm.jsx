'use client';

import { useAuth } from '@/context/AuthContext';
import { Check, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function ModernAuthForm({ mode = 'login' }) {
    const router = useRouter();
    const role = 'admin';

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        name: '', // Consolidated name for backend compatibility
        role: 'admin',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [captchaChecked, setCaptchaChecked] = useState(false);
    const [captchaVerifying, setCaptchaVerifying] = useState(false);

    const { login } = useAuth(); // Use login from context

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const endpoint = mode === 'register' ? '/api/auth/register' : '/api/auth/login';
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Authentication failed');
            }

            // Update global auth state
            login(data.user, data.token);

            const dashboardRoutes = {
                borrower: '/borrower/dashboard',
                lender: '/lender/dashboard',
                admin: '/admin/dashboard',
            };

            router.push(dashboardRoutes[data.user.role] || '/dashboard');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modern-auth-form">
            <div className="logo-section mb-4 text-center">
                <Link href="/" className="flex items-center justify-center gap-2" style={{ fontWeight: 700 }}>
                    <img
                        src="/assets/img/Final_Logo.webp"
                        alt="ArthSetu Logo"
                        style={{ height: '48px', width: 'auto' }}
                    />
                    <img
                        src="/assets/img/Final_Header.webp"
                        alt="ArthSetu"
                        style={{ height: '40px', width: 'auto' }}
                    />
                </Link>
            </div>

            <h2 className="auth-header text-center">
                Hey {role.charAt(0).toUpperCase() + role.slice(1)} !
            </h2>
            <p className="auth-subheader text-center mb-4">
                To continue please enter your<br />
                Login Details.
            </p>

            {error && (
                <div className="badge badge-error mb-4 w-full">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                {mode === 'register' && (
                    <div className="flex gap-3 mb-3">
                        <div className="form-group flex-1">
                            <input
                                type="text"
                                className="form-input"
                                placeholder="First Name"
                                value={formData.firstName}
                                onChange={(e) => setFormData({ ...formData, firstName: e.target.value, name: `${e.target.value} ${formData.lastName}` })}
                                required
                                style={{ paddingLeft: '1rem' }}
                            />
                        </div>
                        <div className="form-group flex-1">
                            <input
                                type="text"
                                className="form-input"
                                placeholder="Last Name"
                                value={formData.lastName}
                                onChange={(e) => setFormData({ ...formData, lastName: e.target.value, name: `${formData.firstName} ${e.target.value}` })}
                                required
                                style={{ paddingLeft: '1rem' }}
                            />
                        </div>
                    </div>
                )}

                <div className="form-group mb-3">
                    {/* Using Email/Password functionality but styled cleanly */}
                    <input
                        type="email"
                        className="form-input"
                        placeholder="Email Address"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                        style={{ paddingLeft: '1rem' }}
                    />
                </div>
                <div className="form-group mb-3" style={{ position: 'relative' }}>
                    <input
                        type={showPassword ? "text" : "password"}
                        className="form-input"
                        placeholder="Password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required
                        style={{ paddingLeft: '1rem', paddingRight: '2.75rem' }}
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{
                            position: 'absolute',
                            right: '0.75rem',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'none',
                            border: 'none',
                            color: 'var(--text-muted)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '0',
                            lineHeight: 1,
                        }}
                    >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                </div>

                {/* Realistic CAPTCHA UI */}
                <div style={{
                    border: '1px solid var(--border)',
                    borderRadius: '4px',
                    background: 'var(--surface)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.85rem 1rem',
                    marginBottom: '1rem',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                }}>
                    {/* Left: checkbox + label */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                        <div
                            onClick={() => {
                                if (captchaVerifying) return;
                                if (captchaChecked) {
                                    setCaptchaChecked(false);
                                    return;
                                }
                                setCaptchaVerifying(true);
                                setTimeout(() => {
                                    setCaptchaVerifying(false);
                                    setCaptchaChecked(true);
                                }, 900);
                            }}
                            style={{
                                width: '24px', height: '24px',
                                border: captchaChecked ? 'none' : '2px solid #c1c1c1',
                                borderRadius: '3px',
                                background: captchaChecked ? '#4285f4' : 'white',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                cursor: captchaVerifying ? 'wait' : 'pointer',
                                flexShrink: 0,
                                transition: 'all 0.2s',
                                position: 'relative',
                                overflow: 'hidden',
                            }}
                        >
                            {captchaVerifying && (
                                <div style={{
                                    width: '14px', height: '14px',
                                    border: '2px solid #4285f4',
                                    borderTop: '2px solid transparent',
                                    borderRadius: '50%',
                                    animation: 'captchaSpin 0.7s linear infinite',
                                }} />
                            )}
                            {captchaChecked && (
                                <svg width="14" height="11" viewBox="0 0 14 11" fill="none">
                                    <path d="M1 5L5 9L13 1" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            )}
                        </div>
                        <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 500 }}>I'm not a robot</span>
                    </div>

                    {/* Right: reCAPTCHA branding */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                        <svg width="32" height="32" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="32" cy="32" r="32" fill="#f5f5f5" />
                            <path d="M32 10C20 10 10 20 10 32C10 44 20 54 32 54C44 54 54 44 54 32" stroke="#4285f4" strokeWidth="4" strokeLinecap="round" />
                            <path d="M54 32C54 20 44 10 32 10" stroke="#ea4335" strokeWidth="4" strokeLinecap="round" />
                            <circle cx="32" cy="32" r="10" fill="#4285f4" opacity="0.15" />
                            <circle cx="32" cy="32" r="5" fill="#4285f4" />
                        </svg>
                        <span style={{ fontSize: '0.55rem', color: '#999', letterSpacing: '0.3px', fontWeight: 600 }}>reCAPTCHA</span>
                        <span style={{ fontSize: '0.5rem', color: '#bbb' }}>Privacy · Terms</span>
                    </div>
                </div>


                {mode === 'register' && (
                    <>
                        <div className="terms-checkbox mb-2">
                            <input type="checkbox" id="terms" required />
                            <label htmlFor="terms">
                                By proceeding, I accept the <Link href="/terms">Terms &amp; Conditions</Link> and <Link href="/privacy">Privacy Policy</Link>. I consent to ArthSetu collecting and using my personal data for identity verification, credit assessment, and platform services as described in the Privacy Policy.
                            </label>
                        </div>

                        <div className="terms-checkbox mb-4">
                            <input type="checkbox" id="whatsapp" />
                            <label htmlFor="whatsapp">
                                By proceeding, you permit us to share loan details for approval & updates over WhatsApp.
                            </label>
                        </div>
                    </>
                )}

                <button type="submit" className="btn btn-primary w-full" disabled={loading} style={{ background: '#a5b4fc', color: 'white', border: 'none' }}>
                    {loading ? 'Processing...' : (mode === 'login' ? 'Log In' : 'Register')}
                </button>
            </form>

            <div className="text-center mt-3 text-muted" style={{ fontSize: '0.85rem' }}>
                {mode === 'login' ? "Don't have an account?" : "Already have an account?"} <br />
                <Link href={mode === 'login' ? "/auth/register?role=admin" : "/auth/login?role=admin"} style={{ color: 'var(--primary-dark)', fontWeight: 'bold' }}>
                    {mode === 'login' ? "Register" : "Login"}
                </Link>
            </div>

            <div className="rbi-badge mt-4">
                <Check size={14} /> RBI Certified NBFC- P2P -COR No: N.00 000
            </div>
        </div>
    );
}
