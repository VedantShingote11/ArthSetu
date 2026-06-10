'use client';
import { HelpCircle } from 'lucide-react';
import { useState } from 'react';

const faqs = [
    { q: 'Is my money safe with ArthSetu?', a: 'Your funds are held in a Trustee-operated, RBI-compliant Escrow account — not by ArthSetu. Even if ArthSetu ceases operations, your escrow funds remain protected and governed by the Trustee.' },
    { q: 'What returns can I expect?', a: 'Returns depend on the risk band of borrowers you choose to fund. Indicative rates range from 12% to 36% per annum. However, returns are not guaranteed. Borrower defaults will reduce your realized returns.' },
    { q: 'Can I lose my entire investment?', a: 'Yes. P2P lending carries credit risk. If borrowers default and no recovery is possible, you may lose part or all of the capital deployed in those loans. Diversification across multiple borrowers and risk bands reduces this risk.' },
    { q: 'How do I diversify as a lender?', a: 'The platform allows you to fund multiple loans with as little as ₹500 per loan. We recommend spreading your capital across at least 10–20 borrowers across different risk bands to reduce concentration risk.' },
    { q: 'Can I withdraw anytime?', a: 'You can withdraw funds that are in your wallet (not yet deployed into active loans). Funds in active loans are tied to the loan tenure. Early exit from active loans is not currently supported — plan your investment horizon accordingly.' },
    { q: 'What happens if a borrower misses an EMI?', a: 'A grace period of 3 days applies. Penal interest accrues on the overdue amount. If the borrower persistently defaults, the loan is flagged and collections proceedings are initiated through lawful channels.' },
    { q: 'Is the interest income taxable?', a: 'Yes. Interest income earned through P2P lending is taxable as "Income from Other Sources" under the Income Tax Act, 1961 in India. ArthSetu will provide a statement of interest earned annually. Consult your tax advisor for specific guidance.' },
    { q: 'Does ArthSetu guarantee the borrowers it lists?', a: 'No. ArthSetu verifies borrower identity and assesses creditworthiness using its AI model — but it does not guarantee that verified borrowers will repay. All lending decisions and their outcomes are borne by lenders.' },
    { q: 'What is the maximum I can invest?', a: 'The RBI mandates that no lender can have an aggregate outstanding balance exceeding ₹50,00,000 across all P2P platforms combined. No more than ₹50,000 can be lent to a single borrower.' },
    { q: 'How is my interest calculated?', a: 'Interest is calculated on reducing principal balance using the flat-rate or reducing-balance method as specified in your loan agreement. Your exact EMI schedule is visible in the loan agreement within the mobile app.' },
    { q: 'Can I see who I am lending to?', a: 'Borrower identities are anonymized on the platform for privacy reasons. However, you can see the borrower\'s risk band, loan purpose, income category, and AI risk score — sufficient information to make an informed lending decision.' },
    { q: 'Where can I raise a complaint?', a: 'Raise a complaint via the Help & Support section within the ArthSetu mobile app. If unresolved, escalate to our Grievance Officer at grievance@arthsetu.in.' },
];

export default function LenderFaqsPage() {
    const [open, setOpen] = useState(null);
    return (
        <div style={{ minHeight: '100vh', background: 'var(--background)' }}>
            <div className="sub-navbar">
                <div className="container flex justify-between items-center">
                    <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-primary)' }}>
                        <HelpCircle size={24} style={{ color: 'var(--primary)' }} />
                        Lender FAQs
                    </h2>
                </div>
            </div>
            <div className="container" style={{ padding: '2rem 1rem', maxWidth: '900px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div className="card fade-in border transition-all hover:border-primary hover:shadow-md" style={{ animationDelay: '0.1s' }}>
                        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>{faqs.length} questions answered. Click any question to expand.</p>
                    </div>
                    <div className="card">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                            {faqs.map((item, i) => (
                                <div key={i} style={{ border: '1px solid var(--border)', borderRadius: '10px', overflow: 'hidden' }}>
                                    <button onClick={() => setOpen(open === i ? null : i)} style={{ width: '100%', textAlign: 'left', padding: '0.9rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: open === i ? 'var(--surface)' : 'transparent', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                                        {item.q}
                                        <span style={{ color: 'var(--primary)', flexShrink: 0, marginLeft: '1rem', fontWeight: 700 }}>{open === i ? '−' : '+'}</span>
                                    </button>
                                    {open === i && (
                                        <div style={{ padding: '0 1rem 1rem', borderTop: '1px solid var(--border)', background: 'var(--surface)' }}>
                                            <p style={{ margin: '0.75rem 0 0', fontSize: '0.875rem', lineHeight: 1.7, color: 'var(--text-secondary)' }}>{item.a}</p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
