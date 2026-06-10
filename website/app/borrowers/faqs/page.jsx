'use client';
import { HelpCircle } from 'lucide-react';
import { useState } from 'react';

const faqs = [
    { q: 'What is the maximum loan amount I can borrow?', a: 'You can borrow up to ₹10,00,000 (₹10 Lakhs) on ArthSetu. The minimum is ₹10,000. The exact amount approved depends on your AI risk score, income, and RBI exposure limits.' },
    { q: 'Do I need a CIBIL score to apply?', a: 'No. ArthSetu evaluates your bank statement and cash flow using its AI model. A CIBIL score is not mandatory. New-to-credit borrowers are welcome.' },
    { q: 'How long does the approval process take?', a: 'KYC review typically takes 1–2 business days after submission. Once KYC is approved and you submit a loan request, the AI assessment is near-instant. Funding time depends on lender activity in the marketplace.' },
    { q: 'What documents do I need?', a: 'Aadhaar (OTP-based — no upload required), PAN card, a bank account for NACH mandate, and 6 months of bank statements or income proof as requested during the application.' },
    { q: 'Will applying affect my credit score?', a: 'Soft inquiries for internal assessment may be made. Formal bureau queries, if any, are disclosed in the app. Successfully repaid loans on ArthSetu improve your platform risk band and may strengthen your overall credit profile.' },
    { q: 'Can I repay early?', a: 'Yes, subject to the prepayment terms specified in your loan agreement (shown in the app). Early repayment may reduce total interest paid.' },
    { q: 'What happens if I miss an EMI?', a: 'A 3-day grace period applies. After the grace period, penal interest accrues on the overdue amount. Persistent non-payment will result in default classification and lawful collection proceedings.' },
    { q: 'Are there any hidden charges?', a: 'No. All fees — processing fee, platform fee, and applicable GST — are disclosed before you accept the loan offer in the app. You will not be charged anything that was not disclosed upfront.' },
    { q: 'Can I borrow again after repaying?', a: 'Yes. Successful repayment improves your ArthSetu risk band, which may qualify you for a lower interest rate on your next loan.' },
    { q: 'Does ArthSetu share my financial data with third parties?', a: 'ArthSetu shares data only with its KYC partner, bureau provider, and Trustee — as required for loan processing. Your data is never sold. Refer to our Privacy Policy for full details.' },
    { q: 'What is the tenure range for loans?', a: 'Loan tenures range from 3 to 36 months. Your exact tenure is agreed upon during the loan application process in the mobile app.' },
    { q: 'Who actually lends me the money?', a: 'Your loan is funded by one or more verified individual lenders on the ArthSetu marketplace. Their identities are protected, but they are KYC-verified Indian individuals — not institutions or ArthSetu itself.' },
];

export default function BorrowerFaqsPage() {
    const [open, setOpen] = useState(null);
    return (
        <div style={{ minHeight: '100vh', background: 'var(--background)' }}>
            <div className="sub-navbar">
                <div className="container flex justify-between items-center">
                    <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-primary)' }}>
                        <HelpCircle size={24} style={{ color: 'var(--primary)' }} />
                        Borrower FAQs
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
