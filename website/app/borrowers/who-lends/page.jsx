'use client';
import { Heart, Shield, Users } from 'lucide-react';

const lenderTypes = [
    { title: 'Salaried Professionals', desc: 'Employed individuals with stable income and investable surplus looking for returns above fixed deposits.' },
    { title: 'Self-Employed Earners', desc: 'Professionals and business owners who want to deploy surplus capital productively across diversified loans.' },
    { title: 'Retirees Seeking Regular Income', desc: 'Individuals who rely on interest income and value monthly EMI repayments as a source of regular cash flow.' },
    { title: 'Impact Investors', desc: 'Individuals who want their money to actively support financial inclusion — funding small loans for micro-entrepreneurs and gig workers across India.' },
];

const protections = [
    'Lender identity is never disclosed to borrowers',
    'All loans are funded via a Trustee-operated Escrow — not lender direct transfer',
    'Both lenders and borrowers are verified through the same rigorous KYC process',
    'All disputes are handled through a structured Grievance Redressal process',
    'Lenders cannot contact borrowers outside the platform',
];

export default function WhoLendsPage() {
    return (
        <div style={{ minHeight: '100vh', background: 'var(--background)' }}>
            <div className="sub-navbar">
                <div className="container flex justify-between items-center">
                    <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-primary)' }}>
                        <Users size={24} style={{ color: 'var(--primary)' }} />
                        From Whom Am I Borrowing?
                    </h2>
                </div>
            </div>
            <div className="container" style={{ padding: '2rem 1rem', maxWidth: '900px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div className="card fade-in border transition-all hover:border-primary hover:shadow-md" style={{ animationDelay: '0.1s' }}>
                        <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-primary)' }}>Real People. Verified Lenders.</h3>
                        <p style={{ margin: 0, lineHeight: 1.7, color: 'var(--text-secondary)' }}>
                            Your loan is funded by verified, KYC-compliant Indian individuals — not institutions, NBFCs, or anonymous pools of money. Lender identities are protected, but their funds, verification status, and participation are fully regulated.
                        </p>
                    </div>
                    <div className="card">
                        <h4 style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
                            <Heart size={18} style={{ color: 'var(--primary)' }} /> Who Lends on ArthSetu?
                        </h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            {lenderTypes.map((item, i) => (
                                <div key={i} style={{ padding: '1rem', background: 'var(--surface)', borderRadius: '10px', border: '1px solid var(--border)' }}>
                                    <p style={{ fontWeight: 700, margin: '0 0 0.3rem', fontSize: '0.95rem', color: 'var(--text-primary)' }}>{item.title}</p>
                                    <p style={{ margin: 0, fontSize: '0.855rem', lineHeight: 1.65, color: 'var(--text-muted)' }}>{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="card" style={{ borderLeft: '4px solid var(--success)' }}>
                        <h4 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
                            <Shield size={18} style={{ color: 'var(--success)' }} /> Borrower Protections
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {protections.map((p, i) => (
                                <div key={i} style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', padding: '0.6rem 0.85rem', background: 'var(--surface)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                                    <span style={{ color: 'var(--success)', fontWeight: 700, flexShrink: 0 }}>✓</span>
                                    <span style={{ fontSize: '0.855rem', color: 'var(--text-secondary)' }}>{p}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
