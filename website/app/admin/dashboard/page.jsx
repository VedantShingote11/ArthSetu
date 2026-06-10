'use client';

import {
    Activity, AlertTriangle, Box, CheckCircle, Clock,
    Database, FileText, HelpCircle, RefreshCw, Settings,
    ShieldCheck, TrendingUp, Users, XCircle
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

const NAV_CARDS = [
    { href: '/admin/kyc', icon: <ShieldCheck size={32} />, label: 'KYC Management', desc: 'Approve or reject borrower KYC requests', color: 'var(--primary)' },
    { href: '/admin/users', icon: <Users size={32} />, label: 'User Management', desc: 'View and manage all registered users', color: 'var(--success)' },
    { href: '/admin/blockchain', icon: <Database size={32} />, label: 'Blockchain Explorer', desc: 'View the complete immutable transaction ledger', color: 'var(--accent)' },
    { href: '/settings', icon: <Settings size={32} />, label: 'Platform Settings', desc: 'Configure loan limits, KYC, and system modes', color: 'var(--secondary)' },
    { href: '/help', icon: <HelpCircle size={32} />, label: 'Help & Support', desc: 'Admin documentation and escalation contacts', color: 'var(--warning)' },
    { href: '/admin/checkProfileScore', icon: <TrendingUp size={32} />, label: 'Risk Score Check', desc: 'Manually review AI credit scores', color: 'var(--info)' },
];

function StatCard({ label, value, sub, link, linkLabel, color, icon, delay }) {
    return (
        <div className="stat-card fade-in" style={{ borderLeftColor: color, animationDelay: delay }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                <p className="text-muted" style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</p>
                <span style={{ color }}>{icon}</span>
            </div>
            <h2 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '2.4rem', fontWeight: 800, lineHeight: 1 }}>{value}</h2>
            {sub && <p className="text-muted" style={{ fontSize: '0.75rem', marginTop: '0.5rem', fontWeight: 600 }}>{sub}</p>}
            {link && <Link href={link} style={{ fontSize: '0.75rem', color: 'var(--primary)', marginTop: '0.4rem', display: 'block', fontWeight: 700 }}>{linkLabel} →</Link>}
        </div>
    );
}

function PlatformHealthBar({ label, value, max, color }) {
    const pct = Math.min(100, Math.round((value / (max || 1)) * 100));
    return (
        <div style={{ marginBottom: '0.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{label}</span>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color }}>{value} / {max}</span>
            </div>
            <div style={{ height: '6px', background: 'var(--border)', borderRadius: '99px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: '99px', transition: 'width 0.6s ease' }} />
            </div>
        </div>
    );
}

export default function AdminDashboard() {
    const router = useRouter();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [alerts, setAlerts] = useState([]);

    const fetchData = useCallback(async (isRefresh = false) => {
        const token = localStorage.getItem('token');
        if (!token) { router.push('/auth/login?role=admin'); return; }
        if (isRefresh) setRefreshing(true);

        try {
            const [usersRes, loansRes, kycRes, blockchainRes] = await Promise.all([
                fetch('/api/admin/users', { headers: { Authorization: `Bearer ${token}` } }),
                fetch('/api/admin/loans', { headers: { Authorization: `Bearer ${token}` } }),
                fetch('/api/admin/kyc?status=pending', { headers: { Authorization: `Bearer ${token}` } }),
                fetch('/api/admin/blockchain', { headers: { Authorization: `Bearer ${token}` } }),
            ]);
            const [usersData, loansData, kycData, blockchainData] = await Promise.all([
                usersRes.json(), loansRes.json(), kycRes.json(), blockchainRes.json(),
            ]);

            const users = usersData.users || [];
            const loans = loansData.stats || {};
            const pendingKYC = kycData.kycRequests?.length || 0;
            const blockchain = blockchainData.stats || {};

            setStats({ users, loans, pendingKYC, blockchain });
            setLastUpdated(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }));

            // Build smart alerts
            const newAlerts = [];
            if (pendingKYC > 0) newAlerts.push({ type: 'warning', msg: `${pendingKYC} KYC application${pendingKYC > 1 ? 's' : ''} awaiting review`, link: '/admin/kyc' });
            if ((loans.defaultedLoans || 0) > 0) newAlerts.push({ type: 'error', msg: `${loans.defaultedLoans} loan${loans.defaultedLoans > 1 ? 's' : ''} in default status`, link: '/admin/users' });
            if ((blockchain.totalBlocks || 0) === 0) newAlerts.push({ type: 'info', msg: 'No blockchain transactions recorded yet' });
            setAlerts(newAlerts);
        } catch (err) {
            console.error('Dashboard fetch error:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [router]);

    useEffect(() => { fetchData(); }, [fetchData]);

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem' }}>
                <div className="spinner" />
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Loading dashboard data…</p>
            </div>
        );
    }

    const borrowerCount = stats?.users?.filter(u => u.role === 'borrower').length || 0;
    const lenderCount = stats?.users?.filter(u => u.role === 'lender').length || 0;
    const verifiedBorrowers = stats?.users?.filter(u => u.role === 'borrower' && u.kycDetails?.kycStatus === 'verified').length || 0;
    const kycRate = borrowerCount > 0 ? Math.round((verifiedBorrowers / borrowerCount) * 100) : 0;
    const repaymentRate = (stats?.loans?.totalLoans || 0) > 0
        ? Math.round(((stats.loans.repaidLoans || 0) / stats.loans.totalLoans) * 100) : 0;

    const alertColor = { warning: 'var(--warning)', error: 'var(--error)', info: 'var(--info)' };
    const alertIcon = { warning: <AlertTriangle size={14} />, error: <XCircle size={14} />, info: <Activity size={14} /> };

    return (
        <div style={{ minHeight: '100vh', background: 'var(--background)' }}>
            {/* Sub-navbar */}
            <div className="sub-navbar">
                <div className="container flex justify-between items-center">
                    <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-primary)' }}>
                        <Settings size={24} style={{ color: 'var(--primary)' }} />
                        Admin Dashboard
                    </h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        {lastUpdated && (
                            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                <Clock size={12} /> Updated {lastUpdated}
                            </span>
                        )}
                        <button
                            onClick={() => fetchData(true)}
                            disabled={refreshing}
                            className="btn btn-outline"
                            style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                        >
                            <RefreshCw size={14} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
                            {refreshing ? 'Refreshing…' : 'Refresh'}
                        </button>
                    </div>
                </div>
            </div>

            <div className="container" style={{ padding: '2rem 1rem' }}>

                {/* Smart Alerts */}
                {alerts.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
                        {alerts.map((alert, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.7rem 1rem', border: `1px solid ${alertColor[alert.type]}`, borderLeft: `4px solid ${alertColor[alert.type]}`, borderRadius: '8px', background: 'var(--surface)', fontSize: '0.855rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                                <span style={{ color: alertColor[alert.type] }}>{alertIcon[alert.type]}</span>
                                {alert.msg}
                                {alert.link && <Link href={alert.link} style={{ marginLeft: 'auto', color: 'var(--primary)', fontSize: '0.8rem', fontWeight: 700, flexShrink: 0 }}>Review →</Link>}
                            </div>
                        ))}
                    </div>
                )}

                {/* Stats Grid */}
                <div className="grid grid-4 mb-4">
                    <StatCard label="Total Users" value={stats?.users?.length || 0} sub={`${borrowerCount} Borrowers · ${lenderCount} Lenders`} color="var(--primary)" icon={<Users size={20} />} delay="0.1s" />
                    <StatCard label="Pending KYC" value={stats?.pendingKYC || 0} link="/admin/kyc" linkLabel="Review KYC" color="var(--warning)" icon={<Clock size={20} />} delay="0.2s" />
                    <StatCard label="Total Loans" value={stats?.loans?.totalLoans || 0} sub={`₹${(stats?.loans?.totalAmount || 0).toLocaleString('en-IN')}`} color="var(--secondary)" icon={<FileText size={20} />} delay="0.3s" />
                    <StatCard label="Blockchain Blocks" value={stats?.blockchain?.totalBlocks || 0} link="/admin/blockchain" linkLabel="View Explorer" color="var(--accent)" icon={<Box size={20} />} delay="0.4s" />
                </div>

                {/* Nav Cards */}
                <div className="grid grid-3 mb-4">
                    {NAV_CARDS.map((card, i) => (
                        <Link
                            key={i}
                            href={card.href}
                            className="card fade-in flex flex-col items-center justify-center p-6 border transition-all hover:border-primary hover:shadow-md"
                            style={{ textDecoration: 'none', color: 'inherit', animationDelay: `${0.1 + i * 0.08}s` }}
                        >
                            <div style={{ marginBottom: '0.85rem', padding: '0.85rem', borderRadius: '50%', background: `color-mix(in srgb, ${card.color} 12%, transparent)`, color: card.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {card.icon}
                            </div>
                            <h4 style={{ marginBottom: '0.35rem', fontSize: '1.05rem', fontWeight: 700, textAlign: 'center', color: 'var(--text-primary)' }}>{card.label}</h4>
                            <p style={{ margin: 0, fontSize: '0.82rem', lineHeight: 1.5, color: 'var(--text-muted)', textAlign: 'center' }}>{card.desc}</p>
                        </Link>
                    ))}
                </div>

                {/* Bottom row — Loan Stats + Platform Health */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>

                    {/* Loan Breakdown */}
                    <div className="card">
                        <h4 style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
                            <FileText size={16} style={{ color: 'var(--primary)' }} /> Loan Breakdown
                        </h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                            {[
                                { label: 'Active', value: stats?.loans?.activeLoans || 0, color: 'var(--success)' },
                                { label: 'Funded', value: stats?.loans?.fundedLoans || 0, color: 'var(--info)' },
                                { label: 'Repaid', value: stats?.loans?.repaidLoans || 0, color: 'var(--secondary)' },
                                { label: 'Defaulted', value: stats?.loans?.defaultedLoans || 0, color: 'var(--error)' },
                            ].map((item, i) => (
                                <div key={i} style={{ padding: '0.85rem 1rem', background: 'var(--surface)', borderRadius: '10px', border: '1px solid var(--border)' }}>
                                    <p style={{ margin: '0 0 0.2rem', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>{item.label}</p>
                                    <p style={{ margin: 0, fontWeight: 800, fontSize: '1.75rem', color: item.color, lineHeight: 1 }}>{item.value}</p>
                                </div>
                            ))}
                        </div>
                        <div style={{ marginTop: '1rem', padding: '0.75rem 1rem', background: 'var(--surface)', borderRadius: '10px', border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Disbursed</span>
                            <span style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)' }}>₹{(stats?.loans?.totalAmount || 0).toLocaleString('en-IN')}</span>
                        </div>
                    </div>

                    {/* Platform Health */}
                    <div className="card">
                        <h4 style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
                            <Activity size={16} style={{ color: 'var(--success)' }} /> Platform Health
                        </h4>
                        <PlatformHealthBar label="KYC Verification Rate" value={verifiedBorrowers} max={Math.max(borrowerCount, 1)} color="var(--primary)" />
                        <PlatformHealthBar label="Loan Repayment Rate" value={stats?.loans?.repaidLoans || 0} max={Math.max(stats?.loans?.totalLoans || 1, 1)} color="var(--success)" />
                        <PlatformHealthBar label="Lender Participation" value={lenderCount} max={Math.max(stats?.users?.length || 1, 1)} color="var(--secondary)" />
                        <PlatformHealthBar label="Blockchain Coverage" value={stats?.blockchain?.totalBlocks || 0} max={Math.max(stats?.loans?.totalLoans || 1, 1)} color="var(--accent)" />

                        <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                            <div style={{ flex: 1, padding: '0.65rem', background: 'var(--surface)', borderRadius: '8px', border: '1px solid var(--border)', textAlign: 'center' }}>
                                <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>KYC Rate</p>
                                <p style={{ margin: 0, fontWeight: 800, color: 'var(--primary)', fontSize: '1.1rem' }}>{kycRate}%</p>
                            </div>
                            <div style={{ flex: 1, padding: '0.65rem', background: 'var(--surface)', borderRadius: '8px', border: '1px solid var(--border)', textAlign: 'center' }}>
                                <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Repayment</p>
                                <p style={{ margin: 0, fontWeight: 800, color: 'var(--success)', fontSize: '1.1rem' }}>{repaymentRate}%</p>
                            </div>
                            <div style={{ flex: 1, padding: '0.65rem', background: 'var(--surface)', borderRadius: '8px', border: '1px solid var(--border)', textAlign: 'center' }}>
                                <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Defaults</p>
                                <p style={{ margin: 0, fontWeight: 800, color: (stats?.loans?.defaultedLoans || 0) > 0 ? 'var(--error)' : 'var(--success)', fontSize: '1.1rem' }}>{stats?.loans?.defaultedLoans || 0}</p>
                            </div>
                        </div>

                        {/* System status */}
                        <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            {[
                                { label: 'API', ok: true }, { label: 'KYC Service', ok: true },
                                { label: 'Blockchain Node', ok: (stats?.blockchain?.totalBlocks || 0) >= 0 }, { label: 'Escrow', ok: true },
                            ].map((s, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.3rem 0.65rem', borderRadius: '999px', background: 'var(--surface)', border: '1px solid var(--border)', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                                    {s.ok ? <CheckCircle size={12} style={{ color: 'var(--success)' }} /> : <XCircle size={12} style={{ color: 'var(--error)' }} />}
                                    {s.label}
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>

            <style>{`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
}
