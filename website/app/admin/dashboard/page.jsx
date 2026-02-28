'use client';

import { Box, Clock, Database, FileText, Settings, ShieldCheck, Users } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AdminDashboard() {
    const router = useRouter();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                router.push('/auth/login?role=admin');
                return;
            }

            try {
                const [usersRes, loansRes, kycRes, blockchainRes] = await Promise.all([
                    fetch('/api/admin/users', { headers: { Authorization: `Bearer ${token}` } }),
                    fetch('/api/admin/loans', { headers: { Authorization: `Bearer ${token}` } }),
                    fetch('/api/admin/kyc?status=pending', { headers: { Authorization: `Bearer ${token}` } }),
                    fetch('/api/admin/blockchain', { headers: { Authorization: `Bearer ${token}` } }),
                ]);

                const [usersData, loansData, kycData, blockchainData] = await Promise.all([
                    usersRes.json(),
                    loansRes.json(),
                    kycRes.json(),
                    blockchainRes.json(),
                ]);

                setStats({
                    users: usersData.users || [],
                    loans: loansData.stats || {},
                    pendingKYC: kycData.kycRequests?.length || 0,
                    blockchain: blockchainData.stats || {},
                });
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [router]);

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="spinner"></div>
            </div>
        );
    }

    const borrowerCount = stats?.users?.filter(u => u.role === 'borrower').length || 0;
    const lenderCount = stats?.users?.filter(u => u.role === 'lender').length || 0;
    const verifiedBorrowers = stats?.users?.filter(u => u.role === 'borrower' && u.kycDetails?.kycStatus === 'verified').length || 0;

    return (
        <div style={{ minHeight: '100vh', background: 'var(--background)' }}>
            {/* Dashboard Navigation */}
            <div className="sub-navbar">
                <div className="container flex justify-between items-center">
                    <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-primary)' }}>
                        <Settings size={24} style={{ color: 'var(--primary)' }} />
                        Admin Dashboard
                    </h2>
                </div>
            </div>

            <div className="container" style={{ padding: '2rem 1rem' }}>
                {/* Stats Grid */}
                <div className="grid grid-4 mb-4">
                    <div className="stat-card fade-in" style={{ borderLeftColor: 'var(--primary)', animationDelay: '0.1s' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                            <p className="text-muted" style={{ fontSize: '0.875rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                Total Users
                            </p>
                            <Users size={20} style={{ color: 'var(--primary)' }} />
                        </div>
                        <h2 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '2.5rem', fontWeight: '800' }}>
                            {stats?.users?.length || 0}
                        </h2>
                        <p className="text-muted" style={{ fontSize: '0.75rem', marginTop: '0.5rem', fontWeight: '600' }}>
                            {borrowerCount} Borrowers • {lenderCount} Lenders
                        </p>
                        <p className="text-success" style={{ fontSize: '0.75rem', marginTop: '0.25rem', fontWeight: '600' }}>
                            ✓ {verifiedBorrowers} Verified
                        </p>
                    </div>
                    <div className="stat-card fade-in" style={{ borderLeftColor: 'var(--warning)', animationDelay: '0.2s' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                            <p className="text-muted" style={{ fontSize: '0.875rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                Pending KYC
                            </p>
                            <Clock size={20} style={{ color: 'var(--warning)' }} />
                        </div>
                        <h2 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '2.5rem', fontWeight: '800' }}>
                            {stats?.pendingKYC || 0}
                        </h2>
                        <Link href="/admin/kyc" style={{ fontSize: '0.75rem', color: 'var(--primary)', marginTop: '0.5rem', display: 'block', fontWeight: '600' }}>
                            Review KYC →
                        </Link>
                    </div>
                    <div className="stat-card fade-in" style={{ borderLeftColor: 'var(--secondary)', animationDelay: '0.3s' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                            <p className="text-muted" style={{ fontSize: '0.875rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                Total Loans
                            </p>
                            <FileText size={20} style={{ color: 'var(--secondary)' }} />
                        </div>
                        <h2 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '2.5rem', fontWeight: '800' }}>
                            {stats?.loans?.totalLoans || 0}
                        </h2>
                        <p className="text-muted" style={{ fontSize: '0.75rem', marginTop: '0.5rem', fontWeight: '600' }}>
                            ₹{stats?.loans?.totalAmount?.toLocaleString() || 0}
                        </p>
                    </div>
                    <div className="stat-card fade-in" style={{ borderLeftColor: 'var(--accent)', animationDelay: '0.4s' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                            <p className="text-muted" style={{ fontSize: '0.875rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                Blockchain Blocks
                            </p>
                            <Box size={20} style={{ color: 'var(--accent)' }} />
                        </div>
                        <h2 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '2.5rem', fontWeight: '800' }}>
                            {stats?.blockchain?.totalBlocks || 0}
                        </h2>
                        <Link href="/admin/blockchain" style={{ fontSize: '0.75rem', color: 'var(--primary)', marginTop: '0.5rem', display: 'block', fontWeight: '600' }}>
                            View Explorer →
                        </Link>
                    </div>
                </div>

                <div className="grid grid-3 mb-4">
                    <Link href="/admin/kyc" className="card fade-in flex flex-col items-center justify-center p-6 border transition-all hover:border-primary hover:shadow-md" style={{
                        textDecoration: 'none',
                        color: 'inherit',
                        animationDelay: '0.1s'
                    }}>
                        <div className="mb-4 p-4 rounded-full bg-primary/10 text-primary">
                            <ShieldCheck size={36} />
                        </div>
                        <h4 style={{ marginBottom: '0.5rem', fontSize: '1.25rem', fontWeight: '600' }}>KYC Management</h4>
                        <p className="text-muted text-center" style={{ fontSize: '0.875rem', lineHeight: '1.5' }}>
                            Approve or reject borrower KYC requests
                        </p>
                    </Link>

                    <Link href="/admin/users" className="card fade-in flex flex-col items-center justify-center p-6 border transition-all hover:border-primary hover:shadow-md" style={{
                        textDecoration: 'none',
                        color: 'inherit',
                        animationDelay: '0.2s'
                    }}>
                        <div className="mb-4 p-4 rounded-full bg-success/10 text-success">
                            <Users size={36} />
                        </div>
                        <h4 style={{ marginBottom: '0.5rem', fontSize: '1.25rem', fontWeight: '600' }}>User Management</h4>
                        <p className="text-muted text-center" style={{ fontSize: '0.875rem', lineHeight: '1.5' }}>
                            View all users and their profiles
                        </p>
                    </Link>

                    <Link href="/admin/blockchain" className="card fade-in flex flex-col items-center justify-center p-6 border transition-all hover:border-primary hover:shadow-md" style={{
                        textDecoration: 'none',
                        color: 'inherit',
                        animationDelay: '0.3s'
                    }}>
                        <div className="mb-4 p-4 rounded-full bg-accent/10 text-accent">
                            <Database size={36} />
                        </div>
                        <h4 style={{ marginBottom: '0.5rem', fontSize: '1.25rem', fontWeight: '600' }}>Blockchain Explorer</h4>
                        <p className="text-muted text-center" style={{ fontSize: '0.875rem', lineHeight: '1.5' }}>
                            View the complete transaction ledger
                        </p>
                    </Link>
                </div>

                {/* Loan Statistics */}
                <div className="card">
                    <h4 className="mb-3">Loan Statistics</h4>
                    <div className="grid grid-4 gap-3">
                        <div>
                            <p className="text-muted" style={{ fontSize: '0.75rem' }}>Active Loans</p>
                            <p style={{ fontWeight: '600', fontSize: '1.5rem', color: 'var(--success)' }}>
                                {stats?.loans?.activeLoans || 0}
                            </p>
                        </div>
                        <div>
                            <p className="text-muted" style={{ fontSize: '0.75rem' }}>Funded Loans</p>
                            <p style={{ fontWeight: '600', fontSize: '1.5rem', color: 'var(--info)' }}>
                                {stats?.loans?.fundedLoans || 0}
                            </p>
                        </div>
                        <div>
                            <p className="text-muted" style={{ fontSize: '0.75rem' }}>Repaid Loans</p>
                            <p style={{ fontWeight: '600', fontSize: '1.5rem', color: 'var(--secondary)' }}>
                                {stats?.loans?.repaidLoans || 0}
                            </p>
                        </div>
                        <div>
                            <p className="text-muted" style={{ fontSize: '0.75rem' }}>Defaulted Loans</p>
                            <p style={{ fontWeight: '600', fontSize: '1.5rem', color: 'var(--error)' }}>
                                {stats?.loans?.defaultedLoans || 0}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
