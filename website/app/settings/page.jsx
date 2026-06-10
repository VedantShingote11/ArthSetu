'use client';

import {
    Bell,
    Globe,
    Lock,
    Save,
    Settings,
    Shield,
    Smartphone,
    User,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AdminSettingsPage() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [saved, setSaved] = useState(false);

    // Admin-only guard
    useEffect(() => {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');
        if (!token || !userData) {
            router.push('/auth/login?role=admin');
            return;
        }
        const parsed = JSON.parse(userData);
        if (parsed.role !== 'admin') {
            router.push('/auth/login?role=admin');
            return;
        }
        setUser(parsed);
    }, [router]);

    const [settings, setSettings] = useState({
        // Account
        displayName: '',
        email: '',
        // Notifications
        notifyKycPending: true,
        notifyLoanDefault: true,
        notifyNewUser: true,
        notifyBlockchainAlert: false,
        notifyDailyDigest: true,
        // Security
        sessionTimeout: '60',
        twoFactorEnabled: false,
        // Platform
        platformMode: 'live',
        maintenanceMode: false,
        maxLoanAmount: '1000000',
        minLoanAmount: '10000',
        defaultLoanTenureMax: '36',
    });

    useEffect(() => {
        if (user) {
            setSettings(prev => ({
                ...prev,
                displayName: user.name || '',
                email: user.email || '',
            }));
        }
    }, [user]);

    const handleSave = (e) => {
        e.preventDefault();
        // In production: PATCH /api/admin/settings
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    const toggle = (key) => setSettings(prev => ({ ...prev, [key]: !prev[key] }));

    if (!user) return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="spinner"></div>
        </div>
    );

    return (
        <div style={{ minHeight: '100vh', background: 'var(--background)' }}>
            {/* Sub-navbar */}
            <div className="sub-navbar">
                <div className="container flex justify-between items-center">
                    <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-primary)' }}>
                        <Settings size={24} style={{ color: 'var(--primary)' }} />
                        Admin Settings
                    </h2>
                    {saved && (
                        <span style={{ color: 'var(--success)', fontWeight: 600, fontSize: '0.9rem' }}>
                            ✓ Settings saved
                        </span>
                    )}
                </div>
            </div>

            <div className="container" style={{ padding: '2rem 1rem', maxWidth: '900px' }}>
                <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                    {/* Account Details */}
                    <div className="card">
                        <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                            <User size={18} style={{ color: 'var(--primary)' }} /> Account Details
                        </h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div className="form-group">
                                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '0.4rem' }}>
                                    Display Name
                                </label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={settings.displayName}
                                    onChange={e => setSettings(p => ({ ...p, displayName: e.target.value }))}
                                    style={{ paddingLeft: '1rem' }}
                                />
                            </div>
                            <div className="form-group">
                                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '0.4rem' }}>
                                    Admin Email
                                </label>
                                <input
                                    type="email"
                                    className="form-input"
                                    value={settings.email}
                                    onChange={e => setSettings(p => ({ ...p, email: e.target.value }))}
                                    style={{ paddingLeft: '1rem' }}
                                    disabled
                                />
                            </div>
                        </div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                            Email cannot be changed from this panel. Contact your system administrator.
                        </p>
                    </div>

                    {/* Notification Preferences */}
                    <div className="card">
                        <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                            <Bell size={18} style={{ color: 'var(--warning)' }} /> Notification Preferences
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                            {[
                                { key: 'notifyKycPending', label: 'New KYC Applications Pending', desc: 'Alert when a new borrower KYC request requires review' },
                                { key: 'notifyLoanDefault', label: 'Loan Default Alerts', desc: 'Alert when a loan is flagged as defaulted or overdue' },
                                { key: 'notifyNewUser', label: 'New User Registration', desc: 'Alert when a new borrower or lender registers on the platform' },
                                { key: 'notifyBlockchainAlert', label: 'Blockchain Write Failures', desc: 'Alert if a blockchain transaction write fails and needs manual review' },
                                { key: 'notifyDailyDigest', label: 'Daily Platform Digest', desc: 'Receive a daily summary of platform activity at 9:00 AM' },
                            ].map(item => (
                                <div key={item.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', background: 'var(--surface)', borderRadius: '10px', border: '1px solid var(--border)' }}>
                                    <div>
                                        <p style={{ fontWeight: 600, margin: 0, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{item.label}</p>
                                        <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)' }}>{item.desc}</p>
                                    </div>
                                    <label style={{ position: 'relative', display: 'inline-block', width: '44px', height: '24px', cursor: 'pointer', flexShrink: 0 }}>
                                        <input type="checkbox" checked={settings[item.key]} onChange={() => toggle(item.key)} style={{ opacity: 0, width: 0, height: 0 }} />
                                        <span style={{
                                            position: 'absolute', inset: 0, borderRadius: '24px',
                                            background: settings[item.key] ? 'var(--primary)' : 'var(--border)',
                                            transition: '0.25s',
                                        }} />
                                        <span style={{
                                            position: 'absolute', left: settings[item.key] ? '22px' : '2px', top: '2px',
                                            width: '20px', height: '20px', borderRadius: '50%', background: 'white',
                                            transition: '0.25s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                                        }} />
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Security */}
                    <div className="card">
                        <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                            <Lock size={18} style={{ color: 'var(--error)' }} /> Security
                        </h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                            <div className="form-group">
                                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '0.4rem' }}>
                                    Session Timeout (minutes)
                                </label>
                                <select
                                    className="form-input"
                                    value={settings.sessionTimeout}
                                    onChange={e => setSettings(p => ({ ...p, sessionTimeout: e.target.value }))}
                                    style={{ paddingLeft: '1rem' }}
                                >
                                    <option value="30">30 minutes</option>
                                    <option value="60">60 minutes</option>
                                    <option value="120">2 hours</option>
                                    <option value="480">8 hours</option>
                                </select>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', background: 'var(--surface)', borderRadius: '10px', border: '1px solid var(--border)' }}>
                                <Smartphone size={18} style={{ color: 'var(--primary)' }} />
                                <div style={{ flex: 1 }}>
                                    <p style={{ fontWeight: 600, margin: 0, fontSize: '0.9rem' }}>Two-Factor Authentication</p>
                                    <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>{settings.twoFactorEnabled ? 'Enabled' : 'Disabled'}</p>
                                </div>
                                <label style={{ position: 'relative', display: 'inline-block', width: '44px', height: '24px', cursor: 'pointer', flexShrink: 0 }}>
                                    <input type="checkbox" checked={settings.twoFactorEnabled} onChange={() => toggle('twoFactorEnabled')} style={{ opacity: 0, width: 0, height: 0 }} />
                                    <span style={{ position: 'absolute', inset: 0, borderRadius: '24px', background: settings.twoFactorEnabled ? 'var(--primary)' : 'var(--border)', transition: '0.25s' }} />
                                    <span style={{ position: 'absolute', left: settings.twoFactorEnabled ? '22px' : '2px', top: '2px', width: '20px', height: '20px', borderRadius: '50%', background: 'white', transition: '0.25s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Platform Configuration */}
                    <div className="card">
                        <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                            <Globe size={18} style={{ color: 'var(--secondary)' }} /> Platform Configuration
                        </h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                            <div className="form-group">
                                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '0.4rem' }}>
                                    Platform Mode
                                </label>
                                <select className="form-input" value={settings.platformMode} onChange={e => setSettings(p => ({ ...p, platformMode: e.target.value }))} style={{ paddingLeft: '1rem' }}>
                                    <option value="live">Live</option>
                                    <option value="sandbox">Sandbox / Testing</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '0.4rem' }}>
                                    Min Loan Amount (₹)
                                </label>
                                <input type="number" className="form-input" value={settings.minLoanAmount} onChange={e => setSettings(p => ({ ...p, minLoanAmount: e.target.value }))} style={{ paddingLeft: '1rem' }} />
                            </div>
                            <div className="form-group">
                                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '0.4rem' }}>
                                    Max Loan Amount (₹)
                                </label>
                                <input type="number" className="form-input" value={settings.maxLoanAmount} onChange={e => setSettings(p => ({ ...p, maxLoanAmount: e.target.value }))} style={{ paddingLeft: '1rem' }} />
                            </div>
                        </div>
                        <div style={{ padding: '0.85rem 1rem', background: '#fef9ec', borderRadius: '10px', border: '1px solid #f59e0b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <p style={{ fontWeight: 600, margin: 0, fontSize: '0.9rem', color: '#92400e' }}>Maintenance Mode</p>
                                <p style={{ margin: 0, fontSize: '0.78rem', color: '#b45309' }}>Enabling this will block all user-facing API requests and display a maintenance notice in the mobile app.</p>
                            </div>
                            <label style={{ position: 'relative', display: 'inline-block', width: '44px', height: '24px', cursor: 'pointer', flexShrink: 0, marginLeft: '1rem' }}>
                                <input type="checkbox" checked={settings.maintenanceMode} onChange={() => toggle('maintenanceMode')} style={{ opacity: 0, width: 0, height: 0 }} />
                                <span style={{ position: 'absolute', inset: 0, borderRadius: '24px', background: settings.maintenanceMode ? '#ef4444' : 'var(--border)', transition: '0.25s' }} />
                                <span style={{ position: 'absolute', left: settings.maintenanceMode ? '22px' : '2px', top: '2px', width: '20px', height: '20px', borderRadius: '50%', background: 'white', transition: '0.25s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
                            </label>
                        </div>
                    </div>

                    {/* RBI Compliance Panel */}
                    <div className="card" style={{ borderLeft: '4px solid var(--primary)' }}>
                        <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                            <Shield size={18} style={{ color: 'var(--primary)' }} /> RBI Compliance Parameters
                        </h4>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>
                            These parameters are set in accordance with RBI Master Directions for NBFC-P2P platforms and cannot be overridden without regulatory review.
                        </p>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                            {[
                                { label: 'Aggregate Borrower Cap', value: '₹50,00,000' },
                                { label: 'Aggregate Lender Cap', value: '₹50,00,000' },
                                { label: 'Max Lender → Single Borrower', value: '₹50,000' },
                                { label: 'Max Loan Tenure', value: '36 months' },
                                { label: 'Escrow Operator', value: 'Trustee-Regulated' },
                                { label: 'Fund Flow Method', value: 'NACH / Bank Transfer' },
                            ].map((item, i) => (
                                <div key={i} style={{ padding: '0.75rem 1rem', background: 'var(--surface)', borderRadius: '10px', border: '1px solid var(--border)' }}>
                                    <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{item.label}</p>
                                    <p style={{ margin: '0.25rem 0 0', fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>{item.value}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Save Button */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 2rem' }}>
                            <Save size={16} /> Save Settings
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}
