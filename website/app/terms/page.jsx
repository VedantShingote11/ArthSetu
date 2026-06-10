'use client';
import { FileText } from 'lucide-react';

const sections = [
    {
        title: '1. Platform Usage',
        paras: [
            "ArthSetu's website is an informational and administrative portal. All financial transactions — including loan applications, fund disbursements, and EMI repayments — occur exclusively within the ArthSetu mobile application.",
            "You agree to use the platform only for lawful purposes and in accordance with these Terms, applicable Indian law, and RBI guidelines for NBFC-P2P platforms.",
        ],
    },
    {
        title: '2. User Accounts',
        paras: [
            "You are responsible for maintaining the confidentiality of your account credentials. Any activity that occurs under your account is your responsibility.",
            "You must notify ArthSetu immediately at support@arthsetu.in if you suspect unauthorized access to your account.",
        ],
    },
    {
        title: '3. User Obligations',
        paras: [
            "Users must provide accurate, complete, and current information during registration and KYC.",
            "Users must not attempt to bypass, disable, or interfere with any security feature of the platform.",
            "Borrowers are contractually obligated to repay all loans per agreed terms. Lenders acknowledge and directly bear the credit risk of loans they fund.",
        ],
    },
    {
        title: '4. Prohibited Activities',
        paras: [
            "The following are strictly prohibited: impersonation; submission of fraudulent or tampered documents; use of the platform for money laundering; unauthorized data scraping; attempting to contact the counterparty of your loan outside the platform.",
        ],
    },
    {
        title: '5. Platform Role & Limitation of Liability',
        paras: [
            "ArthSetu is a technology intermediary. It does not guarantee loan repayment, investment returns, or the creditworthiness of any borrower. ArthSetu's liability is limited to the services it directly provides as a platform.",
            "ArthSetu is not responsible for losses arising from borrower defaults, market changes, or events outside its reasonable control.",
        ],
    },
    {
        title: '6. Intellectual Property',
        paras: [
            "All content, trademarks, and data on this website and the mobile application are the property of ArthSetu Pvt. Ltd. and may not be reproduced without prior written consent.",
        ],
    },
    {
        title: '7. Amendments',
        paras: [
            "ArthSetu reserves the right to update these Terms at any time. Continued use of the platform after any update constitutes acceptance of the new Terms.",
        ],
    },
    {
        title: '8. Governing Law',
        paras: [
            "These Terms are governed by the laws of India. Any disputes shall be subject to the jurisdiction of the courts of India.",
        ],
    },
];

export default function TermsPage() {
    return (
        <div style={{ minHeight: '100vh', background: 'var(--background)' }}>
            <div className="sub-navbar">
                <div className="container flex justify-between items-center">
                    <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-primary)' }}>
                        <FileText size={24} style={{ color: 'var(--primary)' }} />
                        Terms of Use
                    </h2>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>Last updated: February 2026</span>
                </div>
            </div>

            <div className="container" style={{ padding: '2rem 1rem', maxWidth: '900px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                    <div className="card fade-in" style={{ background: 'var(--surface)', border: '1px solid var(--warning)', borderLeft: '4px solid var(--warning)', animationDelay: '0.1s' }}>
                        <p style={{ margin: 0, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.7 }}>
                            By accessing or using the ArthSetu website or mobile application, you agree to these Terms of Use. If you do not agree, please do not use the platform.
                        </p>
                    </div>

                    <div className="card">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                            {sections.map((section, i) => (
                                <div key={i} style={{ padding: '1.25rem 0', borderBottom: i < sections.length - 1 ? '1px solid var(--border)' : 'none' }}>
                                    <h4 style={{ margin: '0 0 0.75rem', color: 'var(--text-primary)', fontSize: '1rem' }}>{section.title}</h4>
                                    {section.paras.map((p, j) => (
                                        <p key={j} style={{ margin: '0 0 0.5rem', fontSize: '0.875rem', lineHeight: 1.75, color: 'var(--text-secondary)' }}>{p}</p>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
