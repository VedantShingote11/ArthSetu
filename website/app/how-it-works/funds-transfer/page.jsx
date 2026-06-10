'use client';
import { ArrowRight, Database, Lock, Smartphone } from 'lucide-react';

const flowSteps = [
    { step: '1', title: 'Lender Deposits Funds', desc: 'The lender transfers funds from their verified bank account to the platform\'s Trustee-operated Escrow. Funds never touch ArthSetu\'s own accounts.' },
    { step: '2', title: 'Loan Listed & Funded', desc: 'The approved loan is listed on the in-app marketplace. One or more lenders fund the loan amount. The smart contract is triggered once full funding is confirmed.' },
    { step: '3', title: 'Smart Contract Executed', desc: 'The blockchain-anchored smart contract records the loan agreement — amount, rate, tenure, EMI schedule, and penalty clauses — immutably on the public ledger.' },
    { step: '4', title: 'Disbursement via Escrow', desc: 'The Trustee releases the loan amount from Escrow to the borrower\'s bank account. The disbursement event is logged on the blockchain.' },
    { step: '5', title: 'EMI Auto-Debit via NACH', desc: 'The borrower\'s bank auto-debits EMIs on the due date via NACH mandate. The Trustee distributes principal + interest to each lender proportionally.' },
    { step: '6', title: 'Repayment to Lenders', desc: 'Lenders receive their principal + interest in their platform wallet, accessible in the mobile app. They can withdraw or reinvest.' },
];

const failureHandling = [
    { title: 'NACH Bounce', desc: 'A grace period of 3 days applies. A penal interest is triggered as per the loan agreement. The borrower is notified via the mobile app.' },
    { title: 'Persistent Non-Payment', desc: 'The loan is flagged as delinquent. Admin is alerted. Recovery communication begins via authorized channels only.' },
    { title: 'Transaction Write Failure', desc: 'If a blockchain write fails, the system retries automatically. The financial transaction remains unaffected. The admin is notified for manual resolution.' },
];

export default function FundsTransferPage() {
    return (
        <div style={{ minHeight: '100vh', background: 'var(--background)' }}>
            <div className="sub-navbar">
                <div className="container flex justify-between items-center">
                    <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-primary)' }}>
                        <ArrowRight size={24} style={{ color: 'var(--primary)' }} />
                        Transfer of Funds &amp; EMI Payments
                    </h2>
                </div>
            </div>
            <div className="container" style={{ padding: '2rem 1rem', maxWidth: '900px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                    <div className="card fade-in border transition-all hover:border-primary hover:shadow-md" style={{ borderLeft: '4px solid var(--info)', animationDelay: '0.1s' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <Smartphone size={18} style={{ color: 'var(--info)' }} />
                            <p style={{ margin: 0, fontWeight: 700, color: 'var(--text-primary)' }}>Mobile App Only</p>
                        </div>
                        <p style={{ margin: 0, fontSize: '0.875rem', lineHeight: 1.7, color: 'var(--text-secondary)' }}>
                            This website does not process any financial transactions. All fund transfers — loan disbursements, EMI payments, and lender withdrawals — are handled exclusively through the ArthSetu mobile application via a regulated Trustee Escrow structure.
                        </p>
                    </div>

                    <div className="card">
                        <h4 style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
                            <ArrowRight size={18} style={{ color: 'var(--primary)' }} /> Fund Flow — Step by Step
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {flowSteps.map((item) => (
                                <div key={item.step} style={{ display: 'flex', gap: '1rem', padding: '1rem', background: 'var(--surface)', borderRadius: '10px', border: '1px solid var(--border)' }}>
                                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0, fontSize: '0.85rem' }}>
                                        {item.step}
                                    </div>
                                    <div>
                                        <p style={{ fontWeight: 700, margin: '0 0 0.3rem', fontSize: '0.92rem', color: 'var(--text-primary)' }}>{item.title}</p>
                                        <p style={{ margin: 0, fontSize: '0.855rem', lineHeight: 1.65, color: 'var(--text-secondary)' }}>{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="card">
                        <h4 style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
                            <Database size={18} style={{ color: 'var(--secondary)' }} /> Blockchain Transparency
                        </h4>
                        <p style={{ margin: '0 0 0.75rem', fontSize: '0.875rem', lineHeight: 1.7, color: 'var(--text-secondary)' }}>
                            Every loan agreement, disbursement, and repayment event is anchored to the public blockchain. The transaction hash is available to both borrower and lender within the mobile app. This creates an immutable, tamper-proof audit trail that neither ArthSetu nor any user can alter.
                        </p>
                        <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>No cryptocurrency is involved at any stage. The blockchain is used solely for transparency and audit integrity.</p>
                    </div>

                    <div className="card" style={{ borderLeft: '4px solid var(--warning)' }}>
                        <h4 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
                            <Lock size={18} style={{ color: 'var(--warning)' }} /> Failure &amp; Exception Handling
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                            {failureHandling.map((item, i) => (
                                <div key={i} style={{ padding: '0.9rem 1rem', background: 'var(--surface)', borderRadius: '10px', border: '1px solid var(--border)' }}>
                                    <p style={{ fontWeight: 700, margin: '0 0 0.3rem', fontSize: '0.9rem', color: 'var(--text-primary)' }}>{item.title}</p>
                                    <p style={{ margin: 0, fontSize: '0.855rem', lineHeight: 1.65, color: 'var(--text-secondary)' }}>{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
