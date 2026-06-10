'use client';
import { FileSignature } from 'lucide-react';

const clauses = [
    { num: '1', title: 'Parties Involved', detail: 'This agreement is between the Borrower (an individual verified on the ArthSetu platform) and the Lender (an individual who has chosen to fund this loan). ArthSetu acts as the technology intermediary facilitating this agreement — it is not a party to the loan itself.' },
    { num: '2', title: 'Loan Amount', detail: 'The exact principal amount agreed upon. This is the amount disbursed to the borrower. The amount may be funded by a single lender or a group of lenders, each holding a proportional share of the loan.' },
    { num: '3', title: 'Interest Rate', detail: 'The interest rate is determined by the borrower\'s AI risk band. It is fixed at the time of agreement and does not change during the loan tenure. The rate reflects the credit risk assessed at the time of loan approval.' },
    { num: '4', title: 'Tenure', detail: 'The agreed repayment period in months (3–36 months). The loan must be fully repaid within this tenure. Early repayment is permitted; check the mobile app for any prepayment terms applicable to your loan.' },
    { num: '5', title: 'EMI Schedule', detail: 'The borrower is required to pay a fixed Equated Monthly Instalment (EMI) on a specified date each month. Each EMI includes both a principal repayment component and an interest component. The EMI is auto-debited via NACH mandate.' },
    { num: '6', title: 'Late Payment Clause', detail: 'A grace period of 3 days applies to each EMI. If payment is not received within the grace period, a penal interest is charged on the overdue amount for each day of delay — as specified in the loan agreement within the mobile app.' },
    { num: '7', title: 'Default Clause', detail: 'A borrower is considered in default if 3 or more consecutive EMIs are missed. Upon default, the outstanding principal and accrued interest become immediately due. Recovery proceedings will be initiated through lawful means.' },
    { num: '8', title: 'Dispute Resolution', detail: 'In case of a dispute between the borrower and lender, ArthSetu\'s Grievance Redressal process must be exhausted first. If unresolved, the dispute shall be referred to arbitration under the Arbitration and Conciliation Act, 1996. Jurisdiction: India.' },
    { num: '9', title: 'Platform Role', detail: 'ArthSetu does not guarantee loan repayment to lenders. It does not act as a co-borrower, surety, or guarantor. Its role is limited to facilitating the agreement, executing the smart contract, and operating the Escrow flow through the Trustee.' },
    { num: '10', title: 'Governing Law', detail: 'This agreement is governed by the laws of India, including the Indian Contract Act, 1872, and applicable RBI guidelines for NBFC-P2P lending platforms. All terms in this agreement are subject to RBI regulatory limits.' },
];

export default function AgreementPage() {
    return (
        <div style={{ minHeight: '100vh', background: 'var(--background)' }}>
            <div className="sub-navbar">
                <div className="container flex justify-between items-center">
                    <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-primary)' }}>
                        <FileSignature size={24} style={{ color: 'var(--primary)' }} />
                        Lender – Borrower Sample Agreement
                    </h2>
                </div>
            </div>
            <div className="container" style={{ padding: '2rem 1rem', maxWidth: '900px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                    <div className="card fade-in border transition-all hover:border-primary hover:shadow-md" style={{ animationDelay: '0.1s' }}>
                        <p style={{ margin: '0 0 0.5rem', lineHeight: 1.7, color: 'var(--text-secondary)' }}>
                            This page explains the key clauses of the loan agreement used on ArthSetu — in plain language. The actual agreement is digitally signed within the mobile application and its hash is permanently recorded on the blockchain.
                        </p>
                        <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>This is a summary only. The full agreement is generated and executed within the ArthSetu mobile application at the time of loan funding.</p>
                    </div>

                    <div className="card">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                            {clauses.map((clause, i) => (
                                <div key={i} style={{ display: 'flex', gap: '1rem', padding: '1.1rem 0', borderBottom: i < clauses.length - 1 ? '1px solid var(--border)' : 'none' }}>
                                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--surface)', border: '2px solid var(--primary)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0, fontSize: '0.8rem' }}>
                                        {clause.num}
                                    </div>
                                    <div>
                                        <p style={{ fontWeight: 700, margin: '0 0 0.35rem', fontSize: '0.95rem', color: 'var(--text-primary)' }}>{clause.title}</p>
                                        <p style={{ margin: 0, fontSize: '0.875rem', lineHeight: 1.7, color: 'var(--text-secondary)' }}>{clause.detail}</p>
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
