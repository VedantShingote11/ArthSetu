'use client';
import { Scale } from 'lucide-react';

const principles = [
    { title: 'Transparent Communication', desc: 'ArthSetu communicates with all users in a clear, honest, and non-misleading manner. All fees, charges, risks, and product features are disclosed in plain language before any commitment is made.' },
    { title: 'Fair and Non-Discriminatory Assessment', desc: 'All loan applications are assessed exclusively on the basis of the AI risk model\'s objective evaluation of financial data. We do not discriminate on the basis of religion, caste, gender, language, or region.' },
    { title: 'Transparent Pricing', desc: 'The interest rate, processing fee, and any applicable penal charges are communicated to the borrower before loan acceptance. No charges may be levied that were not disclosed during the application process.' },
    { title: 'No Coercive Recovery Practices', desc: 'In the event of a loan default, ArthSetu engages with borrowers for repayment recovery through respectful, lawful, and non-threatening communication. Intimidation, harassment, or any unlawful recovery method is strictly prohibited.' },
    { title: 'Borrower Protection', desc: 'Borrowers have the right to complete information about their loan terms, a structured grievance process, and the right to approach relevant regulatory authorities in case of an unresolved dispute.' },
    { title: 'Lender Fairness', desc: 'Lenders are provided accurate, timely, and complete information about the borrowers they fund (on an anonymized basis) and about the platform\'s performance. We do not misrepresent target returns or historical data.' },
    { title: 'RBI Compliance', desc: 'This Fair Practices Code is adopted in alignment with the RBI\'s guidelines for NBFC-P2P platforms. We commit to reviewing and updating this code annually or upon any regulatory change.' },
];

export default function FairPracticesPage() {
    return (
        <div style={{ minHeight: '100vh', background: 'var(--background)' }}>
            <div className="sub-navbar">
                <div className="container flex justify-between items-center">
                    <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-primary)' }}>
                        <Scale size={24} style={{ color: 'var(--primary)' }} />
                        Fair Practices Code
                    </h2>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>In accordance with RBI Guidelines for NBFC-P2P Platforms</span>
                </div>
            </div>

            <div className="container" style={{ padding: '2rem 1rem', maxWidth: '900px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                    <div className="card fade-in border transition-all hover:border-primary hover:shadow-md" style={{ borderLeft: '4px solid var(--primary)', animationDelay: '0.1s' }}>
                        <p style={{ margin: 0, lineHeight: 1.7, color: 'var(--text-secondary)' }}>
                            ArthSetu adopts this Fair Practices Code to ensure ethical, transparent, and non-discriminatory conduct in all interactions with borrowers, lenders, and the general public, in compliance with RBI directions.
                        </p>
                    </div>

                    <div className="card">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                            {principles.map((item, i) => (
                                <div key={i} style={{ padding: '1.25rem 0', borderBottom: i < principles.length - 1 ? '1px solid var(--border)' : 'none' }}>
                                    <h4 style={{ margin: '0 0 0.5rem', color: 'var(--text-primary)', fontSize: '1rem' }}>{item.title}</h4>
                                    <p style={{ margin: 0, fontSize: '0.875rem', lineHeight: 1.75, color: 'var(--text-secondary)' }}>{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
