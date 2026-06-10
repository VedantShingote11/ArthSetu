'use client';
import { Star } from 'lucide-react';

const features = [
    { title: 'AI-Based Risk Scoring', desc: 'Your interest rate is determined by an objective AI model — not a human\'s subjective judgment. This means fairer pricing for creditworthy borrowers, even those without a traditional credit history.' },
    { title: 'Blockchain-Backed Agreements', desc: 'Every loan agreement is digitally signed and its hash is permanently recorded on the public blockchain. Neither ArthSetu nor any party can alter the record once written.' },
    { title: 'Trustee-Operated Escrow', desc: 'Your money never sits with ArthSetu. All funds flow through a Trustee-operated, RBI-compliant Escrow account. This protects both borrowers and lenders from platform insolvency risk.' },
    { title: 'End-to-End Mobile Experience', desc: 'From KYC to loan closure, everything happens in the ArthSetu mobile app — secure, intuitive, and available 24/7. No branch visits, no paperwork, no waiting.' },
    { title: 'Real-Time Transparency', desc: 'Both borrowers and lenders can track every step of their loan — disbursement, EMI payments, repayment history — with a full audit trail linked to the blockchain.' },
    { title: 'Admin-Monitored Platform', desc: 'Our admin team actively monitors all KYC applications, loan statuses, and blockchain entries. No transaction goes unreviewed. The platform maintains institutional-grade oversight at all times.' },
    { title: 'No Hidden Fees', desc: 'All fees — platform fee, processing charge, and penal interest — are disclosed before you commit to a loan. What you see is what you pay.' },
    { title: 'Grievance Support', desc: 'A structured, RBI-mandated Grievance Redressal process ensures that every complaint is acknowledged within 2 business days and resolved within 30 — or escalated to the RBI Ombudsman.' },
];

const trustPoints = [
    { label: 'Regulatory Frame', value: 'RBI NBFC-P2P Master Directions' },
    { label: 'Fund Security', value: 'Trustee Escrow (not ArthSetu)' },
    { label: 'Agreement Type', value: 'Blockchain-anchored Smart Contract' },
    { label: 'Transactions', value: 'Mobile App Only' },
    { label: 'Data Encryption', value: 'TLS in transit · AES-256 at rest' },
    { label: 'KYC Method', value: 'Aadhaar OTP + PAN + Liveness' },
];

export default function ExperiencePage() {
    return (
        <div style={{ minHeight: '100vh', background: 'var(--background)' }}>
            <div className="sub-navbar">
                <div className="container flex justify-between items-center">
                    <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-primary)' }}>
                        <Star size={24} style={{ color: 'var(--primary)' }} />
                        The ArthSetu Experience
                    </h2>
                </div>
            </div>
            <div className="container" style={{ padding: '2rem 1rem', maxWidth: '900px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                    <div className="card fade-in border transition-all hover:border-primary hover:shadow-md" style={{ animationDelay: '0.1s' }}>
                        <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)' }}>Built for Trust. Designed for Clarity.</h3>
                        <p style={{ margin: 0, lineHeight: 1.7, color: 'var(--text-secondary)' }}>
                            For first-time fintech users, ArthSetu is designed to be as transparent and predictable as possible. Here is what you can expect from the platform.
                        </p>
                    </div>

                    <div className="card">
                        <h4 style={{ marginBottom: '1.25rem', color: 'var(--text-primary)' }}>What Makes ArthSetu Different</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                            {features.map((item, i) => (
                                <div key={i} style={{ padding: '1rem', background: 'var(--surface)', borderRadius: '10px', border: '1px solid var(--border)' }}>
                                    <p style={{ fontWeight: 700, margin: '0 0 0.3rem', fontSize: '0.95rem', color: 'var(--text-primary)' }}>{item.title}</p>
                                    <p style={{ margin: 0, fontSize: '0.875rem', lineHeight: 1.65, color: 'var(--text-secondary)' }}>{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="card" style={{ borderLeft: '4px solid var(--primary)' }}>
                        <h4 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>Why Users Trust ArthSetu</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                            {trustPoints.map((item, i) => (
                                <div key={i} style={{ padding: '0.75rem 1rem', background: 'var(--surface)', borderRadius: '10px', border: '1px solid var(--border)' }}>
                                    <p style={{ margin: '0 0 0.2rem', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)' }}>{item.label}</p>
                                    <p style={{ margin: 0, fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)' }}>{item.value}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
