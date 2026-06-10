'use client';
import { CheckCircle, FileText } from 'lucide-react';

const criteria = [
    { label: 'Age', req: '21 – 58 years' },
    { label: 'Citizenship', req: 'Resident Indian citizen' },
    { label: 'Employment Type', req: 'Salaried, Self-employed, Gig worker, or Micro-entrepreneur' },
    { label: 'KYC Documents', req: 'Valid Aadhaar (linked mobile) + PAN card' },
    { label: 'Bank Account', req: 'Active savings or current account (6 months statement required)' },
    { label: 'Minimum Monthly Income', req: '₹10,000/month or equivalent cash flow' },
    { label: 'CIBIL Score', req: 'Not mandatory — new-to-credit borrowers are welcome' },
    { label: 'Mobile Device', req: 'Android or iOS device to run the ArthSetu mobile app' },
];

const disqualifiers = [
    'Existing undisclosed defaults on formal loans',
    'Fraudulent or mismatched KYC documents',
    'Application from a business entity (only individuals are eligible)',
    'Loan purpose involving prohibited activities under applicable law',
];

export default function CriteriaPage() {
    return (
        <div style={{ minHeight: '100vh', background: 'var(--background)' }}>
            <div className="sub-navbar">
                <div className="container flex justify-between items-center">
                    <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-primary)' }}>
                        <FileText size={24} style={{ color: 'var(--primary)' }} />
                        Borrower Eligibility Criteria
                    </h2>
                </div>
            </div>
            <div className="container" style={{ padding: '2rem 1rem', maxWidth: '900px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div className="card fade-in border transition-all hover:border-primary hover:shadow-md" style={{ animationDelay: '0.1s' }}>
                        <p style={{ margin: 0, lineHeight: 1.7, color: 'var(--text-secondary)' }}>
                            ArthSetu is designed to serve individuals who need access to formal credit but may be underserved by traditional banks. The criteria below are set to be inclusive while ensuring responsible lending within RBI guidelines.
                        </p>
                    </div>
                    <div className="card">
                        <h4 style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
                            <CheckCircle size={18} style={{ color: 'var(--success)' }} /> Eligibility Criteria
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                            {criteria.map((item, i) => (
                                <div key={i} style={{ display: 'flex', gap: '1rem', padding: '0.85rem 0', borderBottom: i < criteria.length - 1 ? '1px solid var(--border)' : 'none', alignItems: 'flex-start' }}>
                                    <span style={{ width: '180px', flexShrink: 0, fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.4px', color: 'var(--text-muted)' }}>{item.label}</span>
                                    <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.875rem' }}>{item.req}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="card" style={{ borderLeft: '4px solid var(--error)' }}>
                        <h4 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>Automatic Disqualifiers</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {disqualifiers.map((d, i) => (
                                <div key={i} style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start', padding: '0.65rem 0.85rem', background: 'var(--surface)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                                    <span style={{ color: 'var(--error)', fontWeight: 700, flexShrink: 0 }}>✕</span>
                                    <span style={{ fontSize: '0.855rem', color: 'var(--text-secondary)' }}>{d}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
