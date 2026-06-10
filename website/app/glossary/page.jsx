'use client';
import { Book } from 'lucide-react';

const terms = [
    { term: 'APR (Annual Percentage Rate)', def: 'The total yearly cost of a loan expressed as a percentage. Includes interest rate plus any fees — giving a complete picture of borrowing cost.' },
    { term: 'EMI (Equated Monthly Instalment)', def: 'A fixed monthly payment made by the borrower to repay the loan. Each EMI includes a portion of the principal and the interest.' },
    { term: 'Escrow Account', def: 'A regulated, third-party account managed by a licensed Trustee that holds funds temporarily during loan disbursement and repayment. Neither ArthSetu nor any individual user holds these funds directly.' },
    { term: 'NACH (National Automated Clearing House)', def: 'A system by the NPCI that allows automatic, recurring bank debits. ArthSetu uses NACH mandates to auto-debit EMI payments from borrowers on schedule.' },
    { term: 'Smart Contract', def: 'A digitally encoded agreement whose terms are automatically enforced when predetermined conditions are met. ArthSetu uses smart contracts to execute loan agreements on a blockchain.' },
    { term: 'Blockchain', def: 'A distributed public ledger where data is stored in a chain of cryptographically linked blocks. Once recorded, entries cannot be altered — providing a tamper-proof audit trail.' },
    { term: 'Risk Band', def: 'A category (A, B, C, or D) assigned to a borrower based on their AI-calculated risk score. It indicates probability of default and determines the interest rate.' },
    { term: 'CIBIL Score', def: 'A credit score (300–900) issued by TransUnion CIBIL, reflecting an individual\'s historical credit behaviour with banks and NBFCs.' },
    { term: 'NPA (Non-Performing Asset)', def: 'A loan classified as NPA when the borrower has not made a scheduled repayment for a specified period. It signals elevated credit risk.' },
    { term: 'KYC (Know Your Customer)', def: 'A regulatory process to verify user identity using government-issued documents (Aadhaar, PAN). Mandatory for all ArthSetu users under RBI guidelines.' },
    { term: 'P2P Lending (Peer-to-Peer)', def: 'A model where individuals borrow directly from other individuals via a technology platform, without a traditional banking intermediary.' },
    { term: 'NBFC-P2P', def: 'A Non-Banking Financial Company registered with the RBI specifically to operate a peer-to-peer lending platform. ArthSetu operates within this regulatory framework.' },
    { term: 'Principal', def: 'The original loan amount borrowed, excluding any interest or fees. EMI payments gradually reduce the outstanding principal.' },
    { term: 'Tenure', def: 'The agreed-upon duration of the loan, typically in months. At the end of tenure, all principal and interest should be fully repaid.' },
    { term: 'Diversification', def: 'A strategy of spreading capital across multiple loans to reduce the impact of any single borrower defaulting on a lender\'s overall portfolio.' },
    { term: 'Liveness Check', def: 'A biometric identity verification step during KYC that uses the mobile camera to confirm the user is a real, live person — preventing impersonation fraud.' },
    { term: 'Credit Risk', def: 'The risk that a borrower will fail to repay a loan. In P2P lending, lenders bear credit risk directly for the loans they fund.' },
    { term: 'Trustee', def: 'A regulated third-party entity that holds and manages Escrow funds on behalf of lenders and borrowers in strict compliance with RBI guidelines.' },
];

export default function GlossaryPage() {
    return (
        <div style={{ minHeight: '100vh', background: 'var(--background)' }}>
            <div className="sub-navbar">
                <div className="container flex justify-between items-center">
                    <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-primary)' }}>
                        <Book size={24} style={{ color: 'var(--primary)' }} />
                        Glossary
                    </h2>
                </div>
            </div>

            <div className="container" style={{ padding: '2rem 1rem', maxWidth: '900px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                    <div className="card fade-in border transition-all hover:border-primary hover:shadow-md" style={{ animationDelay: '0.1s' }}>
                        <h3 style={{ margin: '0 0 0.4rem', fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)' }}>Key P2P Lending Terms</h3>
                        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>Plain-language definitions of terms used across the ArthSetu platform.</p>
                    </div>

                    <div className="card">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                            {terms.map((item, i) => (
                                <div key={i} style={{ padding: '1rem 0', borderBottom: i < terms.length - 1 ? '1px solid var(--border)' : 'none' }}>
                                    <p style={{ margin: '0 0 0.3rem', fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>{item.term}</p>
                                    <p style={{ margin: 0, fontSize: '0.875rem', lineHeight: 1.7, color: 'var(--text-secondary)' }}>{item.def}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
