'use client';
import { Bot, Database, Shield, Smartphone, Users } from 'lucide-react';

const doesSections = [
    { title: 'Connects verified borrowers and lenders', detail: 'ArthSetu provides a regulated marketplace where KYC-verified Indian individuals can lend to and borrow from each other directly.' },
    { title: 'Provides AI-based credit risk scoring', detail: 'Our machine learning model analyzes bank statements and financial behavior to assign each borrower a risk band (A–D) and a risk-adjusted interest rate.' },
    { title: 'Enables blockchain-based smart contracts', detail: 'Every loan agreement is encoded as a smart contract. Its terms are immutable, digitally signed by both parties, and permanently recorded on the public blockchain.' },
    { title: 'Provides mobile-based secure transactions', detail: 'All financial flows — loan applications, fund disbursements, EMI payments, and repayments — occur exclusively through the ArthSetu mobile application.' },
    { title: 'Operates a Trustee-managed Escrow', detail: 'Funds are held and transferred through an RBI-compliant Escrow managed by an independent Trustee — not by ArthSetu.' },
    { title: 'Offers admin oversight', detail: 'The ArthSetu admin team actively monitors KYC applications, loan statuses, platform activity, and the blockchain audit trail.' },
];

const doesNotSections = [
    { title: 'Does not act as a bank or NBFC', detail: 'ArthSetu is not licensed to accept deposits, issue loans from its own balance sheet, or provide banking or NBFC services.' },
    { title: 'Does not guarantee returns', detail: 'No return or repayment is guaranteed. Lenders bear credit risk directly. Past performance on the platform does not predict future outcomes.' },
    { title: 'Does not lend from its own balance sheet', detail: 'Loans are funded entirely by individual lenders registered on the platform. ArthSetu does not contribute capital to any loan.' },
    { title: 'Does not misuse or hold user funds', detail: 'All funds are held exclusively in a Trustee-operated Escrow. ArthSetu has no access to or control over these funds beyond facilitating the flow.' },
    { title: 'Does not provide financial or investment advice', detail: 'ArthSetu does not advise users on how much to borrow, how much to lend, or where to invest. All decisions are made independently by users.' },
];

const legalPoints = [
    { icon: <Shield size={18} />, title: 'RBI P2P Compliance Awareness', detail: 'ArthSetu operates within the framework of the RBI Master Directions — Non-Banking Financial Company – Peer to Peer Lending Platform (Reserve Bank) Directions, 2017, and all subsequent amendments.' },
    { icon: <Users size={18} />, title: 'Platform as Intermediary', detail: 'ArthSetu is a technology intermediary. It is not a party to any loan agreement. The legal relationship is between the borrower and the lender, mediated through a regulated smart contract.' },
    { icon: <Bot size={18} />, title: 'Risk Disclosure to Lenders', detail: 'Lenders are explicitly informed — before committing any funds — that P2P lending involves risk of partial or total loss of capital in the event of borrower default.' },
];

export default function WhatWeDoPage() {
    return (
        <div style={{ minHeight: '100vh', background: 'var(--background)' }}>
            <div className="sub-navbar">
                <div className="container flex justify-between items-center">
                    <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-primary)' }}>
                        <Database size={24} style={{ color: 'var(--primary)' }} />
                        What ArthSetu Does (And Does Not) Do
                    </h2>
                </div>
            </div>
            <div className="container" style={{ padding: '2rem 1rem', maxWidth: '900px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                    {/* Does */}
                    <div className="card">
                        <h4 style={{ marginBottom: '1.25rem', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Smartphone size={18} /> Section 1: What ArthSetu Does
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                            {doesSections.map((item, i) => (
                                <div key={i} style={{ display: 'flex', gap: '0.75rem', padding: '1rem 0', borderBottom: i < doesSections.length - 1 ? '1px solid var(--border)' : 'none' }}>
                                    <span style={{ color: 'var(--success)', fontWeight: 700, flexShrink: 0, fontSize: '1rem' }}>✓</span>
                                    <div>
                                        <p style={{ fontWeight: 700, margin: '0 0 0.3rem', fontSize: '0.95rem', color: 'var(--text-primary)' }}>{item.title}</p>
                                        <p style={{ margin: 0, fontSize: '0.875rem', lineHeight: 1.65, color: 'var(--text-secondary)' }}>{item.detail}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Does Not */}
                    <div className="card" style={{ borderLeft: '4px solid var(--error)' }}>
                        <h4 style={{ marginBottom: '1.25rem', color: 'var(--error)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            Section 2: What ArthSetu Does NOT Do
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                            {doesNotSections.map((item, i) => (
                                <div key={i} style={{ display: 'flex', gap: '0.75rem', padding: '1rem 0', borderBottom: i < doesNotSections.length - 1 ? '1px solid var(--border)' : 'none' }}>
                                    <span style={{ color: 'var(--error)', fontWeight: 700, flexShrink: 0, fontSize: '1rem' }}>✕</span>
                                    <div>
                                        <p style={{ fontWeight: 700, margin: '0 0 0.3rem', fontSize: '0.95rem', color: 'var(--text-primary)' }}>{item.title}</p>
                                        <p style={{ margin: 0, fontSize: '0.875rem', lineHeight: 1.65, color: 'var(--text-secondary)' }}>{item.detail}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Legal */}
                    <div className="card" style={{ borderLeft: '4px solid var(--primary)' }}>
                        <h4 style={{ marginBottom: '1.25rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Shield size={18} style={{ color: 'var(--primary)' }} /> Section 3: Legal &amp; Regulatory Positioning
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {legalPoints.map((item, i) => (
                                <div key={i} style={{ padding: '1rem', background: 'var(--surface)', borderRadius: '10px', border: '1px solid var(--border)' }}>
                                    <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', marginBottom: '0.4rem', color: 'var(--primary)' }}>
                                        {item.icon}
                                        <p style={{ fontWeight: 700, margin: 0, fontSize: '0.95rem', color: 'var(--text-primary)' }}>{item.title}</p>
                                    </div>
                                    <p style={{ margin: 0, fontSize: '0.875rem', lineHeight: 1.65, color: 'var(--text-secondary)' }}>{item.detail}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
