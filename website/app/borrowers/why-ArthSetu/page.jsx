'use client';
import { CheckCircle, Star } from 'lucide-react';

const reasons = [
    { title: 'No CIBIL Score Required', desc: 'Our AI risk model evaluates your bank statement, income, and cash flow — not just a bureau score. First-time borrowers and new-to-credit individuals are welcome.' },
    { title: 'Risk-Based Fair Pricing', desc: 'Your interest rate is assigned automatically by the AI model — no agent negotiation, no hidden favoritism. The same formula applies to everyone.' },
    { title: 'Fast Digital Process', desc: 'No branch visits, no paper forms. From KYC to fund receipt — everything happens in the mobile app.' },
    { title: 'No Collateral Required', desc: 'ArthSetu loans are unsecured. You do not need to pledge any asset to qualify.' },
    { title: 'Transparent Loan Terms', desc: 'Your full EMI schedule, interest calculation, and penalty clauses are shown clearly in the app — before you sign.' },
    { title: 'Blockchain-Backed Agreement', desc: 'Your loan agreement is digitally signed and its hash is recorded on the public blockchain. Neither you nor any other party can alter the terms post-signing.' },
];

export default function WhyArthSetuPage() {
    return (
        <div style={{ minHeight: '100vh', background: 'var(--background)' }}>
            <div className="sub-navbar">
                <div className="container flex justify-between items-center">
                    <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-primary)' }}>
                        <Star size={24} style={{ color: 'var(--primary)' }} />
                        Why Borrow on ArthSetu?
                    </h2>
                </div>
            </div>
            <div className="container" style={{ padding: '2rem 1rem', maxWidth: '900px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div className="card fade-in border transition-all hover:border-primary hover:shadow-md" style={{ animationDelay: '0.1s' }}>
                        <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-primary)' }}>Fair Access. Transparent Terms. Digital-First.</h3>
                        <p style={{ margin: 0, lineHeight: 1.7, color: 'var(--text-secondary)' }}>
                            ArthSetu was built for individuals who need credit access but have been bypassed by traditional banks. Here is why borrowers choose ArthSetu.
                        </p>
                    </div>
                    <div className="card">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                            {reasons.map((item, i) => (
                                <div key={i} style={{ display: 'flex', gap: '0.85rem', padding: '1rem', background: 'var(--surface)', borderRadius: '10px', border: '1px solid var(--border)' }}>
                                    <CheckCircle size={18} style={{ color: 'var(--success)', flexShrink: 0, marginTop: '2px' }} />
                                    <div>
                                        <p style={{ fontWeight: 700, margin: '0 0 0.3rem', fontSize: '0.95rem', color: 'var(--text-primary)' }}>{item.title}</p>
                                        <p style={{ margin: 0, fontSize: '0.875rem', lineHeight: 1.65, color: 'var(--text-secondary)' }}>{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="card" style={{ borderLeft: '4px solid var(--warning)' }}>
                        <p style={{ margin: 0, fontSize: '0.855rem', lineHeight: 1.7, color: 'var(--text-secondary)' }}>
                            <strong style={{ color: 'var(--text-primary)' }}>Important:</strong> Borrowers are contractually and legally obligated to repay all loans as per agreed terms. Non-repayment will result in penal interest, default classification, and lawful recovery proceedings. Borrow only what you can repay.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
