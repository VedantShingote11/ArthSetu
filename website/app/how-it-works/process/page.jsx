'use client';
import { Activity } from 'lucide-react';

const steps = [
    { num: '1', title: 'Download the Mobile App', detail: 'All transactions happen exclusively in the ArthSetu mobile app. This website is informational and admin-only. No loan applications are accepted through the website.' },
    { num: '2', title: 'Registration & KYC Verification', detail: 'Both borrowers and lenders complete a digital KYC process: Aadhaar OTP-based identity verification, PAN validation, and a real-time liveness check via the mobile camera. Admin reviews and approves the KYC before any access to lending/borrowing features.' },
    { num: '3', title: 'Borrower Submits a Loan Request', detail: 'Verified borrowers submit a loan request specifying the amount (₹10,000–₹10,00,000), purpose, and tenure (3–36 months). Supporting documents are uploaded securely within the app.' },
    { num: '4', title: 'AI Risk Score Calculation', detail: 'Our machine learning engine evaluates income patterns, bank cash flow, spending behavior, and bureau data to generate a risk band (A, B, C, or D). The risk band determines the interest rate: lower risk = lower rate. This ensures borrowers are priced fairly, and lenders are compensated proportionally for the risk they bear.' },
    { num: '5', title: 'Loan Listing in Marketplace', detail: 'Approved loans are listed on the in-app lending marketplace with all relevant anonymized borrower information — risk band, loan amount, tenure, and interest rate. Lenders can browse and fund one or multiple loans.' },
    { num: '6', title: 'Lender Funds the Loan', detail: 'Lenders can choose to fully or partially fund a loan. Funds are transferred from the lender\'s bank account to the platform\'s Trustee-operated Escrow account — not to ArthSetu directly.' },
    { num: '7', title: 'Smart Contract Activation (Blockchain)', detail: 'Once the loan is fully funded, a smart contract is generated containing all loan terms: amount, rate, tenure, EMI schedule, and penalty clauses. This contract is digitally signed by both parties and its hash is written immutably to the blockchain.' },
    { num: '8', title: 'Fund Disbursement to Borrower', detail: 'The Trustee releases the loan amount from the Escrow account to the borrower\'s verified bank account. ArthSetu never holds these funds. The disbursement is confirmed and logged on the blockchain.' },
    { num: '9', title: 'EMI Tracking via Mobile App', detail: 'The borrower makes monthly EMI payments via NACH mandate (auto-debit). EMI payments are processed by the Trustee through the Escrow and distributed to lenders proportionally. The mobile app provides real-time repayment tracking for both borrowers and lenders.' },
    { num: '10', title: 'Loan Closure', detail: 'Upon full repayment of principal and interest, the smart contract is marked as fulfilled. The loan is closed. Lenders can choose to reinvest the returned capital into new loans, diversifying across the marketplace.' },
];

export default function LendingProcessPage() {
    return (
        <div style={{ minHeight: '100vh', background: 'var(--background)' }}>
            <div className="sub-navbar">
                <div className="container flex justify-between items-center">
                    <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-primary)' }}>
                        <Activity size={24} style={{ color: 'var(--primary)' }} />
                        The ArthSetu Lending Process
                    </h2>
                </div>
            </div>
            <div className="container" style={{ padding: '2rem 1rem', maxWidth: '900px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                    <div className="card fade-in border transition-all hover:border-primary hover:shadow-md" style={{ animationDelay: '0.1s' }}>
                        <p style={{ margin: 0, lineHeight: 1.7, color: 'var(--text-secondary)' }}>
                            A complete technical walkthrough of how ArthSetu connects borrowers and lenders — from app download to loan closure. Every step is mobile-first, AI-driven, and blockchain-transparent.
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
                                        <p style={{ fontWeight: 700, margin: '0 0 0.35rem', fontSize: '0.95rem', color: 'var(--text-primary)' }}>{step.title}</p>
                                        <p style={{ margin: 0, fontSize: '0.875rem', lineHeight: 1.7, color: 'var(--text-secondary)' }}>{step.detail}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="card" style={{ borderLeft: '4px solid var(--primary)' }}>
                        <p style={{ margin: 0, fontSize: '0.875rem', lineHeight: 1.7, color: 'var(--text-secondary)' }}>
                            <strong style={{ color: 'var(--text-primary)' }}>Admin Oversight:</strong> Every step is monitored through the secure ArthSetu admin web portal. The admin can review KYC applications, flag suspicious activity, review loan statuses, and access the complete blockchain audit trail at any time.
                        </p>
                    </div>

                </div>
            </div>
        </div>
    );
}
