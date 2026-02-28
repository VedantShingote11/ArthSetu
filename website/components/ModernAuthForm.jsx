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
                <div className="form-group mb-3 relative">
                    <input
                        type={showPassword ? "text" : "password"}
                        className="form-input"
                        placeholder="Password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required
                        style={{ paddingLeft: '1rem', paddingRight: '2.5rem' }}
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{
                            position: 'absolute',
                            right: '10px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'none',
                            border: 'none',
                            color: '#64748b',
                            cursor: 'pointer'
                        }}
                    >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                </div>

                <div className="captcha-mockup mb-4">
                    <div className="captcha-box">
                        <input type="checkbox" id="robot-check" className="robot-checkbox" />
                        <label htmlFor="robot-check">I'm not a robot</label>
                        <div className="captcha-logo">
                            <div className="captcha-circle"></div>
                            <span>reCAPTCHA</span>
                            <small>Privacy - Terms</small>
                        </div>
                    </div>
                </div>

                {mode === 'register' && (
                    <>
                        <div className="terms-checkbox mb-2">
                            <input type="checkbox" id="terms" required />
                            <label htmlFor="terms">
                                By proceeding, I accept the <a href="#">Terms & Conditions</a> and <a href="#">Privacy Policy</a>. I consent to ... <a href="#">Read more</a>.
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
