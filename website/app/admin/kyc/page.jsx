'use client';

import StatusBadge from '@/components/StatusBadge';
import { Check, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AdminKYC() {
    const router = useRouter();
    const [kycRequests, setKycRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('pending');

    const fetchKYC = async () => {
        setLoading(true);
        const token = localStorage.getItem('token');

        try {
            const res = await fetch(`/api/admin/kyc?status=${filter}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const data = await res.json();
            if (data.success) {
                setKycRequests(data.kycRequests);
            }
        } catch (error) {
            console.error('Error fetching KYC:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchKYC();
    }, [filter]);

    const handleKYCAction = async (profileId, status) => {
        const token = localStorage.getItem('token');

        try {
            const res = await fetch('/api/admin/kyc', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ profileId, status }),
            });

            const data = await res.json();

            if (data.success) {
                alert(`KYC ${status} successfully!`);
                fetchKYC();
            } else {
                alert(data.error || 'Failed to update KYC');
            }
        } catch (error) {
            alert('Error updating KYC');
        }
    };

    return (
        <div style={{ minHeight: '100vh', background: 'var(--background)' }}>
            <div style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', padding: '1rem 0' }}>
                <div className="container">
                    <Link href="/admin/dashboard" style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                        ← Back to Dashboard
                    </Link>
                    <h2 style={{ marginTop: '0.5rem' }}>KYC Management</h2>
                </div>
            </div>

            <div className="container" style={{ padding: '2rem 1rem' }}>
                {/* Filter Tabs */}
                <div className="flex gap-2 mb-4">
                    <button
                        onClick={() => setFilter('pending')}
                        className={`btn ${filter === 'pending' ? 'btn-primary' : 'btn-outline'}`}
                    >
                        Pending
                    </button>
                    <button
                        onClick={() => setFilter('verified')}
                        className={`btn ${filter === 'verified' ? 'btn-primary' : 'btn-outline'}`}
                    >
                        Verified
                    </button>
                    <button
                        onClick={() => setFilter('rejected')}
                        className={`btn ${filter === 'rejected' ? 'btn-primary' : 'btn-outline'}`}
                    >
                        Rejected
                    </button>
                    <button
                        onClick={() => setFilter('')}
                        className={`btn ${filter === '' ? 'btn-primary' : 'btn-outline'}`}
                    >
                        All
                    </button>
                </div>

                {/* KYC Requests */}
                {loading ? (
                    <div className="text-center" style={{ padding: '3rem' }}>
                        <div className="spinner" style={{ margin: '0 auto' }}></div>
                    </div>
                ) : kycRequests.length === 0 ? (
                    <div className="card text-center" style={{ padding: '3rem' }}>
                        <p className="text-muted">No {filter ? filter : 'KYC'} requests found</p>
                    </div>
                ) : (
                    <div className="grid gap-3">
                        {kycRequests.map((request) => (
                            <div key={request._id} className="card">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <h4 style={{ marginBottom: '0.5rem' }}>{request.name || request.userId?.name}</h4>
                                        <p className="text-muted" style={{ fontSize: '0.875rem' }}>
                                            {request.email || request.userId?.email}
                                        </p>
                                    </div>
                                    <StatusBadge status={request.kycStatus || 'pending'} />
                                </div>

                                <div className="grid grid-2 gap-2 mb-3">
                                    <div>
                                        <p className="text-muted" style={{ fontSize: '0.75rem' }}>Aadhaar Number</p>
                                        <p style={{ fontWeight: '600' }}>
                                            {(request.kycDetails?.aadhaar || request.aadhaarNumber) ? `****-****-${(request.kycDetails?.aadhaar || request.aadhaarNumber).slice(-4)}` : 'Not provided'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-muted" style={{ fontSize: '0.75rem' }}>Profile Score</p>
                                        <p style={{ fontWeight: '600' }}>{request.creditScore || 0}</p>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-muted" style={{ fontSize: '0.75rem', marginBottom: '0.5rem' }}>
                                        Submitted: {new Date(request.updatedAt).toLocaleDateString()}
                                    </p>
                                </div>

                                <div className="flex gap-2 mt-3">
                                    {(request.kycStatus !== 'verified') && (
                                        <>
                                            <button
                                                onClick={() => handleKYCAction(request._id, 'verified')}
                                                className="btn btn-secondary flex items-center justify-center gap-2"
                                            >
                                                <Check size={16} /> Verify
                                            </button>
                                            <button
                                                onClick={() => handleKYCAction(request._id, 'rejected')}
                                                className="btn btn-danger flex items-center justify-center gap-2"
                                            >
                                                <X size={16} /> Reject
                                            </button>
                                        </>
                                    )}
                                    <Link
                                        href={`/admin/checkProfileScore?email=${encodeURIComponent(request.email || request.userId?.email)}`}
                                        className="btn btn-outline flex items-center justify-center gap-2"
                                        style={{ textDecoration: 'none', color: 'inherit' }}
                                    >
                                        Check Profile Score
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
