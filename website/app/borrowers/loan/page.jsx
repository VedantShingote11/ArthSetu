'use client';
import { Smartphone } from 'lucide-react';

const steps = [
    { num: '1', title: 'Download the Mobile App', detail: 'All loan applications are processed exclusively in the ArthSetu mobile app. This website does not accept loan applications.' },
    { num: '2', title: 'Register & Complete KYC', detail: 'Provide your Aadhaar (OTP-based), PAN, and pass the liveness check. Your KYC is reviewed by the admin team before you can apply.' },
    { num: '3', title: 'Submit Your Loan Application', detail: 'Enter the loan amount (₹10,000–₹10,00,000), purpose, and tenure (3–36 months). Upload required documents in-app.' },
    { num: '4', title: 'Receive Your AI Risk Score', detail: 'Our ML model assesses your bank data and assigns your risk band (A–D). Your interest rate is generated automatically — fairly, without human bias.' },
    { num: '5', title: 'Review & Accept Your Loan Offer', detail: 'If approved, review the full loan terms — amount, rate, tenure, EMI schedule, and all fees — in the app. Accept only if you are fully satisfied.' },
    { num: '6', title: 'Funds Disbursed to Your Account', detail: 'After lenders fund your loan and both parties sign the smart contract, the Trustee releases the funds to your verified bank account within 1–2 business days.' },
];

export default function LoanPage() {
    return (
        <div style={{ minHeight: '100vh', background: 'var(--background)' }}>
            <div className="sub-navbar">
                <div className="container flex justify-between items-center">
                    <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-primary)' }}>
                        <Smartphone size={24} style={{ color: 'var(--primary)' }} />
                        Apply for a Loan
                    </h2>
                </div>
            </div>
            <div className="container" style={{ padding: '2rem 1rem', maxWidth: '900px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                    <div className="card fade-in border transition-all hover:border-primary hover:shadow-md" style={{ borderLeft: '4px solid var(--info)', animationDelay: '0.1s' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <Smartphone size={18} style={{ color: 'var(--info)' }} />
                            <p style={{ margin: 0, fontWeight: 700, color: 'var(--text-primary)' }}>Applications are Mobile-Only</p>
                        </div>
                        <p style={{ margin: 0, fontSize: '0.875rem', lineHeight: 1.7, color: 'var(--text-secondary)' }}>
                            Loan applications can only be submitted through the ArthSetu mobile application. Download the app to begin. The website is informational only.
                        </p>
                    </div>

                    <div className="card">
                        <h4 style={{ marginBottom: '1.25rem', color: 'var(--text-primary)' }}>How to Apply — 6 Steps</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {steps.map((step) => (
                                <div key={step.num} style={{ display: 'flex', gap: '1rem', padding: '1.1rem 1rem', background: 'var(--surface)', borderRadius: '10px', border: '1px solid var(--border)' }}>
                                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0, fontSize: '0.9rem' }}>{step.num}</div>
                                    <div>
                                        <p style={{ fontWeight: 700, margin: '0 0 0.3rem', fontSize: '0.95rem', color: 'var(--text-primary)' }}>{step.title}</p>
                                        <p style={{ margin: 0, fontSize: '0.875rem', lineHeight: 1.65, color: 'var(--text-secondary)' }}>{step.detail}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="card" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                        {[
                            { label: 'Loan Range', value: '₹10,000 – ₹10,00,000' },
                            { label: 'Tenure', value: '3 – 36 months' },
                            { label: 'Interest Rate', value: '12% – 36% p.a.' },
                        ].map((item, i) => (
                            <div key={i} style={{ padding: '0.85rem 1rem', background: 'var(--surface)', borderRadius: '10px', border: '1px solid var(--border)', textAlign: 'center' }}>
                                <p style={{ margin: '0 0 0.25rem', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>{item.label}</p>
                                <p style={{ margin: 0, fontWeight: 700, fontSize: '0.95rem', color: 'var(--primary)' }}>{item.value}</p>
                            </div>
                        ))}
                    </div>

                </div>
            </div>
        </div>
    );
}
