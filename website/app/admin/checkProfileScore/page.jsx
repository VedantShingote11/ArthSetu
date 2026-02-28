'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function CheckProfileScore() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const email = searchParams.get('email');

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [calculating, setCalculating] = useState(false);

    useEffect(() => {
        if (!email) {
            alert("No Email provided");
            router.push('/admin/kyc');
            return;
        }

        const fetchUser = async () => {
            const token = localStorage.getItem('token');
            try {
                // Fetching all KYC requests gives us an easy way to find the user by walletId
                // In a real app we'd have a specific /api/admin/users/:walletId endpoint
                const res = await fetch(`/api/admin/kyc`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const data = await res.json();
                if (data.success) {
                    const foundUser = data.kycRequests.find(u => u.email === email || u.userId?.email === email);
                    if (foundUser) {
                        setUser(foundUser);
                    } else {
                        alert("User not found for this Email");
                    }
                }
            } catch (err) {
                console.error("Error fetching user", err);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, [email, router]);

    const handlePredictScore = async () => {
        setCalculating(true);
        const token = localStorage.getItem('token');
        try {
            const res = await fetch('/api/admin/predict-score', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ email: user.email || user.userId?.email })
            });

            const data = await res.json();

            if (data.success) {
                // Update local state to reflect new score
                setUser(prev => ({ ...prev, creditScore: data.score }));

                const dbStatus = data.dbUpdated
                    ? "(Saved permanently to DB!)"
                    : "(WARNING: Displaying score, but failed to save to DB)";

                alert(`Prediction successful! Base Score: ${data.score}, Risk Grade: ${data.grade}\n\n${dbStatus}`);
            } else {
                alert(`Failed to predict score: ${data.error}`);
            }
        } catch (error) {
            console.error("Prediction error:", error);
            alert('An error occurred during prediction request. Check console for details.');
        } finally {
            setCalculating(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen" style={{ background: 'var(--background)' }}>
                <div className="spinner"></div>
            </div>
        );
    }

    if (!user) return null;

    // Calculate circumference for circular progress indicator
    const radius = 60;
    const circumference = 2 * Math.PI * radius;
    const score = user.kycDetails?.creditScore || user.creditScore || 0;
    // Map score (300-900) to percentage (0-100) for the circle
    const percentage = Math.max(0, Math.min(100, ((score - 300) / 600) * 100));
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    let scoreColor = 'var(--error)';
    if (score >= 750) scoreColor = 'var(--success)';
    else if (score >= 600) scoreColor = 'var(--warning)';

    return (
        <div style={{ minHeight: '100vh', background: 'var(--background)' }}>
            <div style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', padding: '1rem 0' }}>
                <div className="container">
                    <Link href="/admin/kyc" style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                        ← Back to KYC Management
                    </Link>
                    <h2 style={{ marginTop: '0.5rem' }}>Profile Score Analysis</h2>
                </div>
            </div>

            <div className="container" style={{ padding: '2rem 1rem' }}>
                <div className="card mb-4">
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <h3 style={{ marginBottom: '0.5rem' }}>{user.name}</h3>
                            <p className="text-muted">{user.email || user.userId?.email}</p>
                            <p className="text-muted mt-1" style={{ fontSize: '0.875rem' }}>Wallet ID: {user.walletId || 'None'}</p>
                        </div>

                        <div className="flex items-center gap-4">
                            <button
                                onClick={handlePredictScore}
                                disabled={calculating}
                                className="btn btn-primary"
                            >
                                {calculating ? 'Analyzing...' : 'Predict Profile Score'}
                            </button>

                            <div style={{ position: 'relative', width: '140px', height: '140px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <svg width="140" height="140" style={{ transform: 'rotate(-90deg)' }}>
                                    <circle
                                        cx="70"
                                        cy="70"
                                        r={radius}
                                        fill="transparent"
                                        stroke="var(--border)"
                                        strokeWidth="10"
                                    />
                                    <circle
                                        cx="70"
                                        cy="70"
                                        r={radius}
                                        fill="transparent"
                                        stroke={scoreColor}
                                        strokeWidth="10"
                                        strokeDasharray={circumference}
                                        strokeDashoffset={strokeDashoffset}
                                        style={{ transition: 'stroke-dashoffset 1s ease-in-out', strokeLinecap: 'round' }}
                                    />
                                </svg>
                                <div style={{ position: 'absolute', textAlign: 'center' }}>
                                    <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{score}</span>
                                    <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>/ 900</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <h3 className="mb-3">Uploaded Documents</h3>
                {user.kycDocuments ? (
                    <div className="grid grid-3 gap-3">
                        {user.kycDocuments.aadhaarUrl && (
                            <div className="card text-center" style={{ padding: '1rem' }}>
                                <p className="mb-2" style={{ fontWeight: 600 }}>Aadhaar Card</p>
                                <img
                                    src={user.kycDocuments.aadhaarUrl}
                                    alt="Aadhaar"
                                    style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--border)' }}
                                />
                                <a href={user.kycDocuments.aadhaarUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline mt-3 w-full" style={{ display: 'block' }}>
                                    View Full Size
                                </a>
                            </div>
                        )}

                        {user.kycDocuments.panUrl && (
                            <div className="card text-center" style={{ padding: '1rem' }}>
                                <p className="mb-2" style={{ fontWeight: 600 }}>PAN Card</p>
                                <img
                                    src={user.kycDocuments.panUrl}
                                    alt="PAN"
                                    style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--border)' }}
                                />
                                <a href={user.kycDocuments.panUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline mt-3 w-full" style={{ display: 'block' }}>
                                    View Full Size
                                </a>
                            </div>
                        )}

                        {user.kycDocuments.selfieUrl && (
                            <div className="card text-center" style={{ padding: '1rem' }}>
                                <p className="mb-2" style={{ fontWeight: 600 }}>Selfie</p>
                                <img
                                    src={user.kycDocuments.selfieUrl}
                                    alt="Selfie"
                                    style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--border)' }}
                                />
                                <a href={user.kycDocuments.selfieUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline mt-3 w-full" style={{ display: 'block' }}>
                                    View Full Size
                                </a>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="card text-center p-4">
                        <p className="text-muted">No documents uploaded</p>
                    </div>
                )}
            </div>
        </div>
    );
}
