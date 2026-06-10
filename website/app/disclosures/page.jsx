'use client';
import { AlertTriangle, FileText, Shield } from 'lucide-react';

const rbiParams = [
    { label: 'Aggregate Borrower Cap', value: '₹50,00,000' },
    { label: 'Aggregate Lender Cap', value: '₹50,00,000' },
    { label: 'Max Lender → Single Borrower', value: '₹50,000' },
    { label: 'Max Loan Tenure', value: '36 months' },
    { label: 'Escrow Operator', value: 'Trustee-Regulated' },
    { label: 'Fund Flow Method', value: 'NACH / Bank Transfer' },
];

export default function DisclosuresPage() {
    return (
        <div style={{ minHeight: '100vh', background: 'var(--background)' }}>
            <div className="sub-navbar">
                <div className="container flex justify-between items-center">
                    <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-primary)' }}>
                        <FileText size={24} style={{ color: 'var(--primary)' }} />
                        Regulatory &amp; Statutory Disclosures
                    </h2>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>As required under RBI Guidelines for NBFC-P2P Platforms</span>
                </div>
            </div>
            <div className="container" style={{ padding: '2rem 1rem', maxWidth: '900px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                    <div className="card fade-in" style={{ borderLeft: '4px solid var(--primary)', animationDelay: '0.1s' }}>
                        <h4 style={{ margin: '0 0 0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
                            <Shield size={18} style={{ color: 'var(--primary)' }} /> Certificate of Registration
                        </h4>
                        <p style={{ margin: '0 0 0.5rem', fontSize: '0.875rem', lineHeight: 1.7, color: 'var(--text-secondary)' }}>
                            ArthSetu Pvt. Ltd. is registered / in the process of registration as an NBFC-P2P with the Reserve Bank of India under Section 45-IA of the Reserve Bank of India Act, 1934.
                        </p>
                        <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)' }}>Certificate Number: [To be updated upon RBI registration]</p>
                    </div>

                    <div className="card">
                        <h4 style={{ margin: '0 0 0.75rem', color: 'var(--text-primary)' }}>RBI Compliance Statement</h4>
                        <p style={{ margin: 0, fontSize: '0.875rem', lineHeight: 1.75, color: 'var(--text-secondary)' }}>
                            ArthSetu operates in adherence to the Master Directions — Non-Banking Financial Company – Peer to Peer Lending Platform (Reserve Bank) Directions, 2017, and all subsequent amendments. The platform's operational policies, including fund flow, KYC norms, and exposure limits, are aligned with these directions.
                        </p>
                    </div>

                    <div className="card">
                        <h4 style={{ margin: '0 0 1rem', color: 'var(--text-primary)' }}>Borrower &amp; Lender Exposure Limits</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                            {rbiParams.map((item, i) => (
                                <div key={i} style={{ padding: '0.75rem 1rem', background: 'var(--surface)', borderRadius: '10px', border: '1px solid var(--border)' }}>
                                    <p style={{ margin: '0 0 0.25rem', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)' }}>{item.label}</p>
                                    <p style={{ margin: 0, fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{item.value}</p>
                                </div>
                            ))}
                        </div>
                        <p style={{ margin: '0.75rem 0 0', fontSize: '0.78rem', color: 'var(--text-muted)' }}>Specific limits are disclosed within the ArthSetu mobile application at time of user registration.</p>
                    </div>

                    <div className="card" style={{ border: '1px solid var(--warning)', borderLeft: '4px solid var(--warning)', background: 'var(--surface)' }}>
                        <h4 style={{ margin: '0 0 0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
                            <AlertTriangle size={18} style={{ color: 'var(--warning)' }} /> Risk Disclosure Statement
                        </h4>
                        <p style={{ margin: 0, fontSize: '0.875rem', lineHeight: 1.75, color: 'var(--text-secondary)', fontWeight: 600 }}>
                            Lending through peer-to-peer platforms involves significant financial risk, including loss of principal. ArthSetu does not guarantee returns or the repayment of funds to lenders. Lenders should carefully assess their own risk appetite and invest only surplus funds. Past performance does not guarantee future results.
                        </p>
                    </div>

                    <div className="card">
                        <h4 style={{ margin: '0 0 0.75rem', color: 'var(--text-primary)' }}>Fund Flow Disclosure</h4>
                        <p style={{ margin: 0, fontSize: '0.875rem', lineHeight: 1.75, color: 'var(--text-secondary)' }}>
                            All funds on the ArthSetu platform flow exclusively through an escrow account managed by a Trustee regulated by the Reserve Bank of India. ArthSetu does not hold, control, or operate from these funds at any point. Fund transfers are subject to a NACH-based mechanism for EMI collections.
                        </p>
                    </div>

                    <div className="card" style={{ borderLeft: '4px solid var(--text-muted)' }}>
                        <h4 style={{ margin: '0 0 0.75rem', color: 'var(--text-primary)' }}>Registered Office</h4>
                        <p style={{ margin: '0 0 0.25rem', color: 'var(--text-secondary)' }}>ArthSetu Pvt. Ltd., India</p>
                        <p style={{ margin: 0, color: 'var(--primary)', fontWeight: 600 }}>support@arthsetu.in</p>
                    </div>

                </div>
            </div>
        </div>
    );
}
