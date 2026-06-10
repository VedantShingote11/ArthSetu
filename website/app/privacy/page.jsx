'use client';
import { Lock } from 'lucide-react';

const sections = [
    {
        title: '1. What Data We Collect',
        paras: [
            "We collect the following categories of data: Identity data (name, Aadhaar verification, PAN), Contact data (mobile number, email), Financial data (bank account details, bank statements), Device data (device ID, IP address), and Usage data (app interactions, session logs).",
            "We access Aadhaar details solely through the Aadhaar OTP authentication flow. We do not store raw Aadhaar numbers — only the verification confirmation.",
        ],
    },
    {
        title: '2. How We Use Your Data',
        paras: [
            "Identity Verification & KYC: To comply with RBI's KYC norms for P2P platforms.",
            "Credit Assessment: Your bank statements and financial data are analyzed by our AI engine solely to generate your risk score and determine loan eligibility.",
            "Transaction Processing: To facilitate secure fund flows through the Trustee Escrow.",
            "Platform Communication: To send you notifications about your loans, repayments, and support responses.",
        ],
    },
    {
        title: '3. How We Protect Your Data',
        paras: [
            "All data in transit is encrypted using industry-standard TLS. All data at rest is encrypted using AES-256 encryption.",
            "The mobile application uses biometric authentication and device-binding to prevent unauthorized access from unrecognized devices.",
            "We conduct regular security audits and vulnerability assessments of our infrastructure.",
        ],
    },
    {
        title: '4. Data Sharing',
        paras: [
            "We do not sell your personal data to any third party under any circumstances.",
            "We share data only with: (a) our Trustee partner for Escrow management, (b) KYC and bureau data partners for verification, and (c) regulatory authorities when legally required.",
            "All third-party data processors are contractually bound to handle your data in compliance with applicable law.",
        ],
    },
    {
        title: '5. Data Localization',
        paras: [
            "All user data is stored on servers located within India, in compliance with RBI data localization requirements.",
        ],
    },
    {
        title: '6. Your Rights',
        paras: [
            "You have the right to: request access to your personal data, request correction of inaccurate data, and request deletion of your data (subject to regulatory retention requirements).",
            "To exercise these rights, raise a request via the in-app Help & Support section or email support@arthsetu.in.",
        ],
    },
    {
        title: '7. Governing Law',
        paras: [
            "This policy is governed by the laws of India including the Information Technology Act, 2000 and applicable RBI regulations.",
        ],
    },
];

export default function PrivacyPolicyPage() {
    return (
        <div style={{ minHeight: '100vh', background: 'var(--background)' }}>
            <div className="sub-navbar">
                <div className="container flex justify-between items-center">
                    <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-primary)' }}>
                        <Lock size={24} style={{ color: 'var(--primary)' }} />
                        Privacy &amp; Security Policy
                    </h2>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>Last updated: February 2026</span>
                </div>
            </div>

            <div className="container" style={{ padding: '2rem 1rem', maxWidth: '900px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                    <div className="card fade-in border transition-all hover:border-primary hover:shadow-md" style={{ borderLeft: '4px solid var(--success)', animationDelay: '0.1s' }}>
                        <p style={{ margin: 0, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.7 }}>
                            ArthSetu does not sell your personal data. All data is stored within India, encrypted at rest and in transit, and used only as described below.
                        </p>
                    </div>

                    <div className="card">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
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
