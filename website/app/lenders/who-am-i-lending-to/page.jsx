'use client';
import { BarChart2, Shield, Users } from 'lucide-react';

const borrowerProfiles = [
    { band: 'Risk Band A', rate: '12–16% p.a.', profile: 'Salaried earners in formal employment with strong repayment history. Low probability of default.' },
    { band: 'Risk Band B', rate: '16–22% p.a.', profile: 'Self-employed individuals, micro-business owners with stable but variable income. Moderate risk.' },
    { band: 'Risk Band C', rate: '22–28% p.a.', profile: 'Gig workers, seasonal income earners. Income is variable; borrowing need is genuine. Higher risk.' },
    { band: 'Risk Band D', rate: '28–36% p.a.', profile: 'New-to-credit individuals or borrowers with limited bureau history. Maximum risk; maximum interest return for lenders who choose to fund.' },
];

const verificationSteps = [
    'Aadhaar OTP identity verification',
    'PAN card validation',
    'Real-time liveness check (biometric)',
    'Bank statement analysis (6 months)',
    'AI-based risk score calculation',
    'Admin review and approval',
];

export default function WhoAmILendingToPage() {
    return (
        <div style={{ minHeight: '100vh', background: 'var(--background)' }}>
            <div className="sub-navbar">
                <div className="container flex justify-between items-center">
                    <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-primary)' }}>
                        <Users size={24} style={{ color: 'var(--primary)' }} />
                        Who Am I Lending To?
                    </h2>
                </div>
            </div>
            <div className="container" style={{ padding: '2rem 1rem', maxWidth: '900px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                    <div className="card fade-in border transition-all hover:border-primary hover:shadow-md" style={{ animationDelay: '0.1s' }}>
                        <p style={{ margin: 0, lineHeight: 1.7, color: 'var(--text-secondary)' }}>
                            Every borrower on ArthSetu is a verified, KYC-compliant Indian individual. You will never lend to an institution, a business entity, or an anonymous profile. Borrower identities are verified before any loan is listed on the marketplace.
                        </p>
                    </div>

                    <div className="card">
                        <h4 style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
                            <Shield size={18} style={{ color: 'var(--success)' }} /> How Borrowers Are Verified (Before You See Them)
                        </h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
                            {verificationSteps.map((step, i) => (
                                <div key={i} style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', padding: '0.65rem 0.85rem', background: 'var(--surface)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                                    <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'var(--success)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, flexShrink: 0 }}>{i + 1}</div>
                                    <span style={{ fontSize: '0.855rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{step}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="card">
                        <h4 style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
                            <BarChart2 size={18} style={{ color: 'var(--primary)' }} /> Risk Bands &amp; Interest Rates
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                            {borrowerProfiles.map((item, i) => (
                                <div key={i} style={{ padding: '1rem', background: 'var(--surface)', borderRadius: '10px', border: '1px solid var(--border)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                                        <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{item.band}</span>
                                        <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--primary)' }}>{item.rate}</span>
                                    </div>
                                    <p style={{ margin: 0, fontSize: '0.855rem', lineHeight: 1.6, color: 'var(--text-secondary)' }}>{item.profile}</p>
                                </div>
                            ))}
                        </div>
                        <p style={{ margin: '1rem 0 0', fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>Rates are indicative and may vary based on market conditions and platform policy. Diversify across multiple borrowers and risk bands to manage portfolio risk.</p>
                    </div>

                </div>
            </div>
        </div>
    );
}
