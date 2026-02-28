'use client';

import StatusBadge from '@/components/StatusBadge';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AdminUsers() {
    const router = useRouter();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true);
            const token = localStorage.getItem('token');

            try {
                const res = await fetch(`/api/admin/users?role=${filter}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                const data = await res.json();
                if (data.success) {
                    setUsers(data.users);
                }
            } catch (error) {
                console.error('Error fetching users:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, [filter]);

    return (
        <div style={{ minHeight: '100vh', background: 'var(--background)' }}>
            <div style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', padding: '1rem 0' }}>
                <div className="container">
                    <Link href="/admin/dashboard" style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                        ← Back to Dashboard
                    </Link>
                    <h2 style={{ marginTop: '0.5rem' }}>User Management</h2>
                </div>
            </div>

            <div className="container" style={{ padding: '2rem 1rem' }}>
                {/* Filter Tabs */}
                <div className="flex gap-2 mb-4">
                    <button
                        onClick={() => setFilter('all')}
                        className={`btn btn-sm ${filter === 'all' ? 'btn-primary' : 'btn-outline'}`}
                    >
                        All Users
                    </button>
                    <button
                        onClick={() => setFilter('borrower')}
                        className={`btn btn-sm ${filter === 'borrower' ? 'btn-primary' : 'btn-outline'}`}
                    >
                        Borrowers
                    </button>
                    <button
                        onClick={() => setFilter('lender')}
                        className={`btn btn-sm ${filter === 'lender' ? 'btn-primary' : 'btn-outline'}`}
                    >
                        Lenders
                    </button>
                    <button
                        onClick={() => setFilter('admin')}
                        className={`btn btn-sm ${filter === 'admin' ? 'btn-primary' : 'btn-outline'}`}
                    >
                        Admins
                    </button>
                </div>

                {/* Users List */}
                {loading ? (
                    <div className="text-center" style={{ padding: '3rem' }}>
                        <div className="spinner" style={{ margin: '0 auto' }}></div>
                    </div>
                ) : users.length === 0 ? (
                    <div className="card text-center" style={{ padding: '3rem' }}>
                        <p className="text-muted">No users found</p>
                    </div>
                ) : (
                    <div className="grid gap-3">
                        {users.map((user) => (
                            <div key={user._id} className="card">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <h4 style={{ marginBottom: '0.5rem' }}>{user.name}</h4>
                                        <p className="text-muted" style={{ fontSize: '0.875rem' }}>{user.email}</p>
                                    </div>
                                    <div className="badge badge-info">
                                        {user.role.toUpperCase()}
                                    </div>
                                </div>

                                <div className="grid grid-3 gap-2">
                                    <div>
                                        <p className="text-muted" style={{ fontSize: '0.75rem' }}>KYC Status</p>
                                        <StatusBadge status={user.kycDetails?.kycStatus || user.kycStatus || user.profile?.kycStatus || 'pending'} />
                                    </div>
                                    <div>
                                        <p className="text-muted" style={{ fontSize: '0.75rem' }}>Profile Score</p>
                                        <p style={{ fontWeight: '600' }}>{user.kycDetails?.creditScore || user.creditScore || user.profile?.riskScore || 0}</p>
                                    </div>
                                    {user.role === 'lender' && (
                                        <div>
                                            <p className="text-muted" style={{ fontSize: '0.75rem' }}>Account</p>
                                            <StatusBadge status={user.isActive ? 'active' : 'inactive'} />
                                        </div>
                                    )}
                                </div>

                                <p className="text-muted" style={{ fontSize: '0.75rem', marginTop: '1rem' }}>
                                    Joined: {new Date(user.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
