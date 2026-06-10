'use client';
import Link from 'next/link';
import { ArrowRight, Bot, Database, FileText, LayoutDashboard, Smartphone, Users } from 'lucide-react';

const steps = [
    { num: '1', icon: <Smartphone size={20} />, title: 'Download the Mobile App', desc: 'All borrowing and lending transactions happen exclusively within the ArthSetu mobile application. The website is informational and admin-only.' },
    { num: '2', icon: <Users size={20} />, title: 'Register & Complete KYC', desc: 'Create an account and complete video-based KYC — Aadhaar OTP verification, PAN validation, and a liveness check. All verified on the mobile app.' },
    { num: '3', icon: <FileText size={20} />, title: 'Borrower Submits a Loan Request', desc: 'Verified borrowers submit a loan request within the app — specifying the amount, purpose, and tenure. The platform runs an AI risk assessment.' },
    { num: '4', icon: <Bot size={20} />, title: 'AI Risk Score is Calculated', desc: 'Our ML engine evaluates income patterns, cash flow, and repayment behavior to generate a risk band (A–D) and assign a risk-based interest rate.' },
    { num: '5', icon: <LayoutDashboard size={20} />, title: 'Loan Listed on the Marketplace', desc: 'Approved loan requests are listed on the in-app lending marketplace where lenders can review and fund them — with full anonymized borrower details.' },
    { num: '6', icon: <Database size={20} />, title: 'Smart Contract & Disbursement', desc: 'Upon full funding, a blockchain-anchored smart contract is executed. Funds are disbursed to the borrower via the Trustee Escrow account.' },
];

const subLinks = [
    { href: '/about-us/what-we-do', label: 'What ArthSetu Does (And Does Not) Do' },
    { href: '/how-it-works/process', label: 'The Full 10-Step Process' },
    { href: '/how-it-works/funds-transfer', label: 'Transfer of Funds & EMI Payments' },
    { href: '/how-it-works/agreement', label: 'Lender – Borrower Sample Agreement' },
    { href: '/how-it-works/experience', label: 'The ArthSetu Experience' },
];

export default function HowItWorksOverviewPage() {
    return (
        <div style={{ minHeight: '100vh', background: 'var(--background)' }}>
            <div className="sub-navbar">
                <div className="container">
                    <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>How ArthSetu Works</h2>
                </div>
            </div>
            <div className="container" style={{ padding: '2rem 1rem', maxWidth: '900px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                    <div className="card fade-in border transition-all hover:border-primary hover:shadow-md" style={{ animationDelay: '0.1s' }}>
                        <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)' }}>A Transparent Bridge Between Borrowers and Lenders</h3>
                        <p style={{ margin: 0, lineHeight: 1.7, color: 'var(--text-secondary)' }}>
                            ArthSetu is a technology intermediary — not a bank. We connect creditworthy borrowers with individual lenders using AI-based risk scoring and blockchain-backed smart contracts. All transactions happen exclusively on the ArthSetu mobile application.
                        </p>
                    </div>

                    <div className="card">
                        <h4 style={{ marginBottom: '1.25rem', color: 'var(--text-primary)' }}>How It Works — 6 Key Steps</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {steps.map((step) => (
                                <div key={step.num} style={{ display: 'flex', gap: '1rem', padding: '1rem', background: 'var(--surface)', borderRadius: '10px', border: '1px solid var(--border)' }}>
                                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0, fontSize: '0.9rem' }}>
                                        {step.num}
                                    </div>
                                    <div>
                                        <p style={{ fontWeight: 700, margin: '0 0 0.3rem', fontSize: '0.95rem', color: 'var(--text-primary)' }}>{step.title}</p>
                                        <p style={{ margin: 0, fontSize: '0.875rem', lineHeight: 1.65, color: 'var(--text-secondary)' }}>{step.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="card" style={{ borderLeft: '4px solid var(--primary)' }}>
                        <h4 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>Explore in Detail</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {subLinks.map((item, i) => (
                                <Link key={i} href={item.href} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.8rem 1rem', background: 'var(--surface)', borderRadius: '10px', border: '1px solid var(--border)', textDecoration: 'none', color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.9rem', transition: 'border-color 0.15s' }}
                                    onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                                    onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                                >
                                    {item.label}
                                    <ArrowRight size={16} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                                </Link>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
