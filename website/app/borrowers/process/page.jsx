'use client';
import { CheckCircle, Smartphone } from 'lucide-react';

const steps = [
    { num: '1', title: 'Download the App', detail: 'All borrowing takes place in the ArthSetu mobile app. The website is informational only — no loan applications are accepted here.' },
    { num: '2', title: 'Register & Complete KYC', detail: 'Provide your Aadhaar (OTP-based), PAN, and complete the in-app liveness check. The admin team reviews and approves your KYC before you can apply for a loan.' },
    { num: '3', title: 'Submit Your Loan Request', detail: 'Specify the amount (₹10,000 – ₹10,00,000), purpose, and tenure (3–36 months). Upload your bank statement or income proof as required.' },
    { num: '4', title: 'AI Risk Assessment', detail: 'Your bank transaction history and income patterns are analyzed by our ML model to generate a risk band (A–D) and a risk-adjusted interest rate. This is done automatically — no human bias.' },
    { num: '5', title: 'Loan Listed on Marketplace', detail: 'If your loan request is approved, it is listed on the in-app lending marketplace where lenders can view and fund it.' },
    { num: '6', title: 'Smart Contract Signed', detail: 'Once your loan is fully funded, a smart contract containing all loan terms is generated. You digitally sign it in the app. The contract hash is permanently recorded on the blockchain.' },
    { num: '7', title: 'Funds Disbursed', detail: 'The loan amount is released from the Trustee Escrow to your verified bank account, typically within 1–2 business days of contract signing.' },
    { num: '8', title: 'Repay via EMI Auto-Debit', detail: 'Your EMI is auto-debited from your registered bank account on the due date each month via NACH mandate. You are notified with each deduction.' },
    { num: '9', title: 'Track Repayments in App', detail: 'The app shows your repayment schedule, outstanding principal, and completed payments in real time. You can see exactly where you stand at any moment.' },
    { num: '10', title: 'Loan Closure', detail: 'Once you have repaid all principal and interest, your loan is marked closed on the blockchain. Your credit history on ArthSetu is updated, which may improve your risk band for future borrowing.' },
];

export default function BorrowerProcessPage() {
    return (
        <div style={{ minHeight: '100vh', background: 'var(--background)' }}>
            <div className="sub-navbar">
                <div className="container flex justify-between items-center">
                    <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-primary)' }}>
                        <Smartphone size={24} style={{ color: 'var(--primary)' }} />
                        Borrower Process
                    </h2>
                </div>
            </div>
            <div className="container" style={{ padding: '2rem 1rem', maxWidth: '900px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div className="card fade-in border transition-all hover:border-primary hover:shadow-md" style={{ animationDelay: '0.1s' }}>
                        <p style={{ margin: 0, lineHeight: 1.7, color: 'var(--text-secondary)' }}>From applying to receiving funds — your complete borrowing journey on ArthSetu in 10 steps.</p>
                    </div>
                    <div className="card">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {steps.map((step) => (
                                <div key={step.num} style={{ display: 'flex', gap: '1rem', padding: '1.1rem 1rem', background: 'var(--surface)', borderRadius: '10px', border: '1px solid var(--border)' }}>
                                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0, fontSize: '0.9rem' }}>{step.num}</div>
                                    <div>
                                        <p style={{ fontWeight: 700, margin: '0 0 0.3rem', fontSize: '0.95rem', color: 'var(--text-primary)' }}>{step.title}</p>
                                        <p style={{ margin: 0, fontSize: '0.875rem', lineHeight: 1.65, color: 'var(--text-secondary)' }}>{step.detail}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="card" style={{ borderLeft: '4px solid var(--success)' }}>
                        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                            <CheckCircle size={18} style={{ color: 'var(--success)', flexShrink: 0 }} />
                            <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                                Successful repayments improve your ArthSetu risk band over time — meaning lower interest rates on future loans.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
