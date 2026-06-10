'use client';

import { Camera, CheckCircle, Eye, EyeOff, Key, Lock, Mail, Phone, Save, Shield, User, XCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

function Field({ label, value, onChange, type = 'text', disabled = false, hint }) {
    return (
        <div style={{ marginBottom: '1.1rem' }}>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.4px', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>{label}</label>
            <input
                type={type}
                value={value}
                onChange={e => onChange(e.target.value)}
                disabled={disabled}
                className="form-input"
                style={{ width: '100%', opacity: disabled ? 0.6 : 1, cursor: disabled ? 'not-allowed' : 'auto' }}
            />
            {hint && <p style={{ margin: '0.3rem 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>{hint}</p>}
        </div>
    );
}

function Toast({ msg, type }) {
    if (!msg) return null;
    const color = type === 'success' ? 'var(--success)' : 'var(--error)';
    const icon = type === 'success' ? <CheckCircle size={15} /> : <XCircle size={15} />;
    return (
        <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.2rem', borderRadius: '10px', background: 'var(--surface)', border: `1px solid ${color}`, borderLeft: `4px solid ${color}`, boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', zIndex: 9999 }}>
            <span style={{ color }}>{icon}</span> {msg}
        </div>
    );
}

export default function AdminProfilePage() {
    const router = useRouter();
    const fileRef = useRef(null);

    const [profile, setProfile] = useState({ name: '', email: '', phone: '', adminId: '', joinedAt: '' });
    const [avatar, setAvatar] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);

    const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' });
    const [showPw, setShowPw] = useState({ current: false, next: false, confirm: false });

    const [twoFA, setTwoFA] = useState(false);
    const [sessionLog, setSessionLog] = useState([]);

    const [saving, setSaving] = useState(false);
    const [pwSaving, setPwSaving] = useState(false);
    const [toast, setToast] = useState({ msg: '', type: '' });

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast({ msg: '', type: '' }), 3500);
    };

    // ── Auth guard + initial data load ──
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) { router.push('/auth/login?role=admin'); return; }

        const stored = localStorage.getItem('user');
        if (stored) {
            const u = JSON.parse(stored);
            setProfile({
                name: u.name || '',
                email: u.email || '',
                phone: u.phone || '',
                adminId: u._id || u.id || '—',
                joinedAt: u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : '—',
            });
            setTwoFA(u.twoFA || false);
        }

        // Mock recent session log
        setSessionLog([
            { device: 'Chrome on Windows', ip: '192.168.1.x', time: '2 mins ago', current: true },
            { device: 'Safari on iPhone', ip: '49.x.x.x', time: 'Yesterday, 10:42 PM', current: false },
            { device: 'Chrome on Windows', ip: '192.168.1.x', time: '3 days ago', current: false },
        ]);
    }, [router]);

    // ── Save profile ──
    const handleSaveProfile = async () => {
        setSaving(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/admin/profile', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ name: profile.name, phone: profile.phone }),
            });
            if (!res.ok) throw new Error();
            // Update localStorage
            const stored = JSON.parse(localStorage.getItem('user') || '{}');
            localStorage.setItem('user', JSON.stringify({ ...stored, name: profile.name, phone: profile.phone }));
            showToast('Profile updated successfully', 'success');
        } catch {
            showToast('Failed to update profile', 'error');
        } finally {
            setSaving(false);
        }
    };

    // ── Change password ──
    const handleChangePassword = async () => {
        if (!pwForm.current || !pwForm.next || !pwForm.confirm) { showToast('All password fields are required', 'error'); return; }
        if (pwForm.next !== pwForm.confirm) { showToast('New passwords do not match', 'error'); return; }
        if (pwForm.next.length < 8) { showToast('New password must be at least 8 characters', 'error'); return; }
        setPwSaving(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/admin/change-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ currentPassword: pwForm.current, newPassword: pwForm.next }),
            });
            if (!res.ok) throw new Error();
            setPwForm({ current: '', next: '', confirm: '' });
            showToast('Password changed successfully', 'success');
        } catch {
            showToast('Incorrect current password or server error', 'error');
        } finally {
            setPwSaving(false);
        }
    };

    // ── Toggle 2FA ──
    const handle2FAToggle = async () => {
        const next = !twoFA;
        try {
            const token = localStorage.getItem('token');
            await fetch('/api/admin/2fa', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ enabled: next }),
            });
            setTwoFA(next);
            showToast(`Two-factor authentication ${next ? 'enabled' : 'disabled'}`, 'success');
        } catch {
            showToast('Could not update 2FA setting', 'error');
        }
    };

    // ── Avatar upload ──
    const handleAvatarChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setAvatar(file);
        setAvatarPreview(URL.createObjectURL(file));
    };

    const handleAvatarUpload = async () => {
        if (!avatar) return;
        const fd = new FormData();
        fd.append('avatar', avatar);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/admin/avatar', { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: fd });
            if (!res.ok) throw new Error();
            showToast('Profile photo updated', 'success');
        } catch {
            showToast('Avatar upload failed', 'error');
        }
    };

    const togglePw = (field) => setShowPw(p => ({ ...p, [field]: !p[field] }));

    return (
        <div style={{ minHeight: '100vh', background: 'var(--background)' }}>
            <div className="sub-navbar">
                <div className="container flex justify-between items-center">
                    <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-primary)' }}>
                        <User size={24} style={{ color: 'var(--primary)' }} />
                        Admin Profile
                    </h2>
                </div>
            </div>

            <div className="container" style={{ padding: '2rem 1rem', maxWidth: '860px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                    {/* ── Identity card ── */}
                    <div className="card fade-in border transition-all hover:border-primary hover:shadow-md" style={{ animationDelay: '0.1s' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
                            {/* Avatar */}
                            <div style={{ position: 'relative', flexShrink: 0 }}>
                                <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 800, color: 'white', overflow: 'hidden' }}>
                                    {avatarPreview ? <img src={avatarPreview} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (profile.name?.charAt(0)?.toUpperCase() || <User size={32} />)}
                                </div>
                                <button onClick={() => fileRef.current?.click()} style={{ position: 'absolute', bottom: 0, right: 0, width: 26, height: 26, borderRadius: '50%', background: 'var(--primary)', border: '2px solid var(--surface)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                    <Camera size={12} />
                                </button>
                                <input ref={fileRef} type="file" accept="image/*" onChange={handleAvatarChange} style={{ display: 'none' }} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <h3 style={{ margin: '0 0 0.25rem', fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)' }}>{profile.name || 'Admin'}</h3>
                                <p style={{ margin: '0 0 0.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>{profile.email}</p>
                                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                    <span style={{ padding: '0.25rem 0.65rem', borderRadius: '999px', background: 'var(--surface)', border: '1px solid var(--border)', fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)' }}>Administrator</span>
                                    <span style={{ padding: '0.25rem 0.65rem', borderRadius: '999px', background: 'var(--surface)', border: '1px solid var(--border)', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>ID: {profile.adminId?.slice(-8)}</span>
                                    <span style={{ padding: '0.25rem 0.65rem', borderRadius: '999px', background: 'var(--surface)', border: '1px solid var(--border)', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Joined: {profile.joinedAt}</span>
                                </div>
                            </div>
                            {avatarPreview && (
                                <button onClick={handleAvatarUpload} className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                    <Save size={14} /> Save Photo
                                </button>
                            )}
                        </div>
                    </div>

                    {/* ── Edit profile ── */}
                    <div className="card">
                        <h4 style={{ marginBottom: '1.25rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <User size={16} style={{ color: 'var(--primary)' }} /> Personal Information
                        </h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1.25rem' }}>
                            <Field label="Full Name" value={profile.name} onChange={v => setProfile(p => ({ ...p, name: v }))} />
                            <Field label="Email Address" value={profile.email} onChange={() => { }} disabled hint="Contact tech team to change email." />
                            <Field label="Phone Number" value={profile.phone} onChange={v => setProfile(p => ({ ...p, phone: v }))} type="tel" />
                            <Field label="Admin ID" value={profile.adminId} onChange={() => { }} disabled />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                            <button onClick={handleSaveProfile} disabled={saving} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Save size={15} /> {saving ? 'Saving…' : 'Save Profile'}
                            </button>
                        </div>
                    </div>

                    {/* ── Change password ── */}
                    <div className="card" style={{ borderLeft: '4px solid var(--warning)' }}>
                        <h4 style={{ marginBottom: '1.25rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Key size={16} style={{ color: 'var(--warning)' }} /> Change Password
                        </h4>
                        {[
                            { field: 'current', label: 'Current Password' },
                            { field: 'next', label: 'New Password', hint: 'Minimum 8 characters.' },
                            { field: 'confirm', label: 'Confirm New Password' },
                        ].map(({ field, label, hint }) => (
                            <div key={field} style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.4px', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>{label}</label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type={showPw[field] ? 'text' : 'password'}
                                        value={pwForm[field]}
                                        onChange={e => setPwForm(p => ({ ...p, [field]: e.target.value }))}
                                        className="form-input"
                                        style={{ width: '100%', paddingRight: '2.5rem' }}
                                        placeholder="••••••••"
                                    />
                                    <button onClick={() => togglePw(field)} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}>
                                        {showPw[field] ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                                {hint && <p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>{hint}</p>}
                            </div>
                        ))}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                            <button onClick={handleChangePassword} disabled={pwSaving} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Lock size={15} /> {pwSaving ? 'Changing…' : 'Change Password'}
                            </button>
                        </div>
                    </div>

                    {/* ── Security ── */}
                    <div className="card" style={{ borderLeft: '4px solid var(--success)' }}>
                        <h4 style={{ marginBottom: '1.25rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Shield size={16} style={{ color: 'var(--success)' }} /> Security Settings
                        </h4>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'var(--surface)', borderRadius: '10px', border: '1px solid var(--border)' }}>
                            <div>
                                <p style={{ margin: '0 0 0.25rem', fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>Two-Factor Authentication (2FA)</p>
                                <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                                    {twoFA ? 'Enabled — your account has an extra layer of protection.' : 'Recommended for admin accounts. Enable via authenticator app.'}
                                </p>
                            </div>
                            <button
                                onClick={handle2FAToggle}
                                style={{ width: 48, height: 26, borderRadius: '999px', background: twoFA ? 'var(--success)' : 'var(--border)', border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.25s', flexShrink: 0, marginLeft: '1rem' }}
                            >
                                <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'white', position: 'absolute', top: 3, left: twoFA ? 25 : 3, transition: 'left 0.25s', boxShadow: '0 1px 4px rgba(0,0,0,0.18)' }} />
                            </button>
                        </div>
                    </div>

                    {/* ── Session log ── */}
                    <div className="card">
                        <h4 style={{ marginBottom: '1.25rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Mail size={16} style={{ color: 'var(--info)' }} /> Recent Sessions
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                            {sessionLog.map((s, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.85rem 0', borderBottom: i < sessionLog.length - 1 ? '1px solid var(--border)' : 'none' }}>
                                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                                        <Phone size={15} style={{ color: 'var(--text-muted)', marginTop: '2px', flexShrink: 0 }} />
                                        <div>
                                            <p style={{ margin: 0, fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)' }}>{s.device}</p>
                                            <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)' }}>{s.ip} · {s.time}</p>
                                        </div>
                                    </div>
                                    {s.current
                                        ? <span style={{ padding: '0.2rem 0.6rem', borderRadius: '999px', background: 'var(--success)', color: 'white', fontSize: '0.72rem', fontWeight: 700 }}>Current</span>
                                        : <button style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--error)', background: 'none', border: 'none', cursor: 'pointer' }}>Revoke</button>
                                    }
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>

            <Toast msg={toast.msg} type={toast.type} />
        </div>
    );
}
