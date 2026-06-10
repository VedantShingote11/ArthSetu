'use client';
import { CheckCircle, Users } from 'lucide-react';

const eligibility = [
    { title: 'Age', req: '18 years or above' },
    { title: 'Citizenship', req: 'Resident Indian citizen' },
    { title: 'Bank Account', req: 'Active savings or current bank account' },
    { title: 'PAN Card', req: 'Valid PAN card issued by the Income Tax Department of India' },
    { title: 'Aadhaar', req: 'Valid Aadhaar number linked to your mobile number' },
    { title: 'Minimum Lending Capacity', req: '₹10,000 (minimum per loan or partial funding)' },
    { title: 'Maximum Aggregate Exposure', req: '₹50,00,000 across all P2P platforms (RBI cap)' },
    { title: 'Max per Borrower', req: '₹50,000 to any single borrower (RBI cap)' },
];

const profiles = [
    'Salaried professionals with investable surplus',
    'Self-employed individuals seeking returns above fixed deposits',
    'Investors who want to diversify beyond traditional instruments',
    'High-net-worth individuals building an alternative asset portfolio',
    'Retired individuals seeking regular income from interest payments',
];

export default function WhoCanLendPage() {
    return (
        <div style={{ minHeight: '100vh', background: 'var(--background)' }}>
            <div className="sub-navbar">
                <div className="container flex justify-between items-center">
                    <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-primary)' }}>
                        <Users size={24} style={{ color: 'var(--primary)' }} />
                        Who Can Become a Lender?
                    </h2>
                </div>
            </div>
            <div className="container" style={{ padding: '2rem 1rem', maxWidth: '900px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                    <div className="card fade-in border transition-all hover:border-primary hover:shadow-md" style={{ animationDelay: '0.1s' }}>
                        <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)' }}>Lend Directly. Earn Meaningfully.</h3>
                        <p style={{ margin: 0, lineHeight: 1.7, color: 'var(--text-secondary)' }}>
                            Any resident Indian adult with a verified bank account and a surplus to invest can become a lender on ArthSetu — subject to the eligibility criteria and RBI-mandated exposure limits below.
                        </p>
                    </div>

                    <div className="card">
                        <h4 style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
                            <CheckCircle size={18} style={{ color: 'var(--success)' }} /> Eligibility Criteria
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                            {eligibility.map((item, i) => (
                                <div key={i} style={{ display: 'flex', gap: '1rem', padding: '0.85rem 0', borderBottom: i < eligibility.length - 1 ? '1px solid var(--border)' : 'none', alignItems: 'flex-start' }}>
                                    <span style={{ width: '200px', flexShrink: 0, fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.4px', color: 'var(--text-muted)' }}>{item.title}</span>
                                    <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }}>{item.req}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="card" style={{ borderLeft: '4px solid var(--primary)' }}>
                        <h4 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>Who Typically Lends on ArthSetu?</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {profiles.map((profile, i) => (
                                <div key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', padding: '0.6rem 0.75rem', background: 'var(--surface)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                                    <CheckCircle size={14} style={{ color: 'var(--success)', flexShrink: 0 }} />
                                    <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{profile}</span>
                                </div>
                            ))}
                        </div>
                        <p style={{ margin: '1rem 0 0', fontSize: '0.82rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>P2P lending involves real risk, including potential loss of capital. Only invest amounts you can afford not to access immediately.</p>
                    </div>

                </div>
            </div>
        </div>
    );
}
