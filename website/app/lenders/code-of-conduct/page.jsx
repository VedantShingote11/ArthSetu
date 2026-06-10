'use client';
import { AlertTriangle, Scale } from 'lucide-react';

const rules = [
    { title: 'Disclose all lending activity accurately', detail: 'You must not misrepresent the origin of funds invested on the platform. All funds must originate from your verified bank account. Using P2P lending for money laundering or funds of unknown origin is a criminal offence.' },
    { title: 'Stay within RBI exposure limits', detail: 'No lender may have an aggregate outstanding balance exceeding ₹50,00,000 across all P2P platforms. No lender may invest more than ₹50,000 in a single borrower.' },
    { title: 'Do not contact borrowers outside the platform', detail: 'Lenders are strictly prohibited from attempting to identify, contact, or communicate with borrowers outside the ArthSetu platform. Borrower identity is protected. Violations will result in immediate account suspension.' },
    { title: 'Accept and understand the risk you bear', detail: 'By lending, you acknowledge that you alone bear the credit risk of each loan you fund. ArthSetu does not guarantee repayment, and losses from borrower defaults are borne by lenders.' },
    { title: 'Do not collude with borrowers', detail: 'Arrangements between lenders and borrowers that circumvent platform processes — including side agreements to reduce interest rates, waive repayment, or redirect funds outside the Escrow — are strictly prohibited.' },
    { title: 'Report suspicious activity', detail: 'If you suspect fraudulent borrower listings, suspicious activity, or system misuse, report it immediately via the in-app Help & Support section or to support@arthsetu.in. You must not attempt to take independent action.' },
];

export default function CodeOfConductPage() {
    return (
        <div style={{ minHeight: '100vh', background: 'var(--background)' }}>
            <div className="sub-navbar">
                <div className="container flex justify-between items-center">
                    <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-primary)' }}>
                        <Scale size={24} style={{ color: 'var(--primary)' }} />
                        Code of Conduct for Lenders
                    </h2>
                </div>
            </div>
            <div className="container" style={{ padding: '2rem 1rem', maxWidth: '900px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                    <div className="card fade-in border transition-all hover:border-primary hover:shadow-md" style={{ animationDelay: '0.1s' }}>
                        <p style={{ margin: 0, lineHeight: 1.7, color: 'var(--text-secondary)' }}>
                            As a lender on ArthSetu, you are a participant in a regulated peer-to-peer lending marketplace. These conduct requirements protect the integrity of the platform, the privacy of borrowers, and the fairness of the system.
                        </p>
                    </div>

                    <div className="card">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                            {rules.map((item, i) => (
                                <div key={i} style={{ padding: '1.1rem 0', borderBottom: i < rules.length - 1 ? '1px solid var(--border)' : 'none' }}>
                                    <p style={{ fontWeight: 700, margin: '0 0 0.4rem', fontSize: '0.95rem', color: 'var(--text-primary)' }}>{i + 1}. {item.title}</p>
                                    <p style={{ margin: 0, fontSize: '0.875rem', lineHeight: 1.7, color: 'var(--text-secondary)' }}>{item.detail}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="card" style={{ border: '1px solid var(--error)', borderLeft: '4px solid var(--error)', background: 'var(--surface)' }}>
                        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                            <AlertTriangle size={20} style={{ color: 'var(--error)', flexShrink: 0 }} />
                            <div>
                                <p style={{ fontWeight: 700, margin: '0 0 0.3rem', color: 'var(--text-primary)' }}>Consequences of Violations</p>
                                <p style={{ margin: 0, fontSize: '0.875rem', lineHeight: 1.7, color: 'var(--text-secondary)' }}>
                                    Violation of this code may result in immediate account suspension, forfeiture of platform access, and reporting to regulatory authorities. ArthSetu reserves the right to take appropriate legal action in cases of fraud, misrepresentation, or criminal conduct.
                                </p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
