'use client';
import { ArrowRight } from 'lucide-react';

const steps = [
    { num: '1', title: 'Download the Mobile App', detail: 'Lender registration, KYC, and all transactions happen exclusively within the ArthSetu mobile app. The website is informational only.' },
    { num: '2', title: 'Register & Complete KYC', detail: 'Create your account, submit your Aadhaar (OTP-based), PAN, and pass the liveness check. Your KYC is reviewed and approved by the admin team. You cannot fund loans until KYC is verified.' },
    { num: '3', title: 'Add Funds to Your Wallet', detail: 'Transfer funds from your savings/current account to the platform Escrow via the methods available in the app. These funds are held in a Trustee-operated, RBI-compliant Escrow — not by ArthSetu directly.' },
    { num: '4', title: 'Browse the Lending Marketplace', detail: 'Browse active loan listings in the in-app marketplace. Each listing shows the borrower\'s risk band, loan amount, tenure, and interest rate. Borrower identities are anonymized but fully verified.' },
    { num: '5', title: 'Select Loans to Fund', detail: 'Choose to fully fund a loan or contribute a portion (minimum ₹500 per loan). Diversify your capital across multiple risk bands and borrowers to reduce concentration risk.' },
    { num: '6', title: 'Smart Contract Execution', detail: 'Once a loan is fully funded by one or more lenders, a smart contract is generated. You will digitally sign it via the app. The contract hash is written to the blockchain — creating an immutable record.' },
    { num: '7', title: 'Track EMI Repayments', detail: 'The mobile app provides real-time visibility into each borrower\'s repayment schedule. EMIs are auto-debited from borrowers via NACH and distributed to lenders proportionally by the Trustee.' },
    { num: '8', title: 'Receive Principal + Interest', detail: 'As EMIs are collected, your principal and interest portion are credited to your platform wallet. You are notified with each repayment.' },
    { num: '9', title: 'Withdraw or Reinvest', detail: 'Withdraw your earned funds to your registered bank account, or reinvest directly into new loans from the marketplace — compounding your returns over time.' },
];

export default function LenderProcessPage() {
    return (
        <div style={{ minHeight: '100vh', background: 'var(--background)' }}>
            <div className="sub-navbar">
                <div className="container flex justify-between items-center">
                    <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-primary)' }}>
                        <ArrowRight size={24} style={{ color: 'var(--primary)' }} />
                        Lender Process
                    </h2>
                </div>
            </div>
            <div className="container" style={{ padding: '2rem 1rem', maxWidth: '900px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                    <div className="card fade-in border transition-all hover:border-primary hover:shadow-md" style={{ animationDelay: '0.1s' }}>
                        <p style={{ margin: 0, lineHeight: 1.7, color: 'var(--text-secondary)' }}>
                            From app download to receiving your first repayment — here is your complete lending journey on ArthSetu.
                        </p>
                    </div>

                    <div className="card">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {steps.map((step) => (
                                <div key={step.num} style={{ display: 'flex', gap: '1rem', padding: '1.1rem 1rem', background: 'var(--surface)', borderRadius: '10px', border: '1px solid var(--border)' }}>
                                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0, fontSize: '0.9rem' }}>
                                        {step.num}
                                    </div>
                                    <div>
                                        <p style={{ fontWeight: 700, margin: '0 0 0.3rem', fontSize: '0.95rem', color: 'var(--text-primary)' }}>{step.title}</p>
                                        <p style={{ margin: 0, fontSize: '0.875rem', lineHeight: 1.65, color: 'var(--text-secondary)' }}>{step.detail}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
