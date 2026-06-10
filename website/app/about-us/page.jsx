'use client';
import { Bot, Database, Globe, Shield, Smartphone, Users } from 'lucide-react';

const borrowerTypes = [
    'Salaried Individuals',
    'MSMEs & Micro-Entrepreneurs',
    'Gig Workers',
    'Self-Employed Professionals',
    'New-to-Credit Borrowers',
    'Women Entrepreneurs',
];

const techPillars = [
    { icon: <Bot size={18} />, title: 'AI Risk Scoring', desc: 'ML model assessing income, cash flow, and behavioral signals to generate objective risk bands (A–D).' },
    { icon: <Database size={18} />, title: 'Blockchain Audit Trail', desc: 'Immutable, public-ledger-anchored record of all loan agreements and transactions. No cryptocurrency involved.' },
    { icon: <Shield size={18} />, title: 'Smart Contract Agreements', desc: 'Digitally signed loan agreements encoded as smart contracts. Terms cannot be altered post-signing.' },
    { icon: <Globe size={18} />, title: 'Trustee Escrow', desc: 'All funds flow through a Trustee-operated, RBI-compliant Escrow. ArthSetu never holds user funds.' },
    { icon: <Smartphone size={18} />, title: 'Mobile-Only Transactions', desc: 'All financial activity — applications, disbursements, EMIs — happens exclusively in the mobile app.' },
];

const loanParams = [
    { label: 'Loan Amount', value: '₹10,000 – ₹10,00,000', note: 'As per RBI P2P limits' },
    { label: 'Interest Rate', value: '12% – 36% p.a.', note: 'AI-based, risk-band determined' },
    { label: 'Tenure', value: '3 – 36 Months', note: 'Fixed at time of agreement' },
];

export default function AboutUsPage() {
    return (
        <div style={{ minHeight: '100vh', background: 'var(--background)' }}>
            {/* Sub-navbar */}
            <div className="sub-navbar">
                <div className="container flex justify-between items-center">
                    <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-primary)' }}>
                        <Users size={24} style={{ color: 'var(--primary)' }} />
                        About ArthSetu
                    </h2>
                </div>
            </div>

            {/* ── ENGLISH ── */}
            <div className="container" style={{ padding: '2rem 1rem', maxWidth: '900px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                    {/* Mission statement */}
                    <div className="card fade-in border transition-all hover:border-primary hover:shadow-md" style={{ animationDelay: '0.1s' }}>
                        <p style={{ margin: '0 0 0.75rem', fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary)', lineHeight: 1.4 }}>
                            Building India's most transparent peer-to-peer lending infrastructure.
                        </p>
                        <p style={{ margin: '0 0 0.75rem', lineHeight: 1.75, color: 'var(--text-secondary)', fontSize: '1rem' }}>
                            ArthSetu is a technology intermediary — not a bank, not an NBFC — that connects verified borrowers directly with individual lenders across India. We do not lend money ourselves. We build the infrastructure that makes fair, transparent lending possible.
                        </p>
                        <p style={{ margin: 0, lineHeight: 1.75, color: 'var(--text-secondary)', fontSize: '1rem' }}>
                            We operate in alignment with the Reserve Bank of India's Master Directions for NBFC-P2P Lending Platforms. All transactions — loan applications, disbursements, and EMI repayments — are completed exclusively within the ArthSetu mobile application through a regulated Trustee-operated Escrow. This website is an informational hub and admin portal only.
                        </p>
                    </div>

                    {/* Mission + Vision */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className="card fade-in border transition-all hover:border-primary hover:shadow-md" style={{ borderLeft: '4px solid var(--primary)', animationDelay: '0.2s' }}>
                            <h4 style={{ margin: '0 0 0.6rem', color: 'var(--text-primary)', fontSize: '1rem' }}>Our Mission</h4>
                            <p style={{ margin: 0, lineHeight: 1.7, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                To democratize credit access in India by operating as a transparent, technology-first intermediary — enabling fair borrowing for creditworthy individuals and responsible investing for everyday lenders.
                            </p>
                        </div>
                        <div className="card fade-in border transition-all hover:border-primary hover:shadow-md" style={{ borderLeft: '4px solid var(--secondary)', animationDelay: '0.3s' }}>
                            <h4 style={{ margin: '0 0 0.6rem', color: 'var(--text-primary)', fontSize: '1rem' }}>Our Vision</h4>
                            <p style={{ margin: 0, lineHeight: 1.7, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                To become India's most trusted digital credit bridge — where AI ensures fairness, blockchain ensures transparency, and regulation ensures safety for every participant.
                            </p>
                        </div>
                    </div>

                    {/* Credit gap */}
                    <div className="card">
                        <h4 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>We Bridge the Credit Gap for:</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.6rem' }}>
                            {borrowerTypes.map((item, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 0.85rem', background: 'var(--surface)', borderRadius: '8px', border: '1px solid var(--border)', transition: 'border-color 0.15s' }}
                                    onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                                    onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                                >
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)', flexShrink: 0 }}></div>
                                    <span style={{ fontSize: '0.855rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{item}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Loan parameters */}
                    <div className="card">
                        <h4 style={{ marginBottom: '0.4rem', color: 'var(--text-primary)', textAlign: 'center' }}>Loan Parameters (Via Mobile App)</h4>
                        <p style={{ margin: '0 0 1.25rem', fontSize: '0.82rem', color: 'var(--text-muted)', textAlign: 'center' }}>All loans are facilitated through the mobile application. This website does not process applications.</p>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                            {loanParams.map((item, i) => (
                                <div key={i} style={{ padding: '1rem', background: 'var(--surface)', borderRadius: '10px', border: '1px solid var(--border)', textAlign: 'center' }}>
                                    <p style={{ margin: '0 0 0.25rem', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)' }}>{item.label}</p>
                                    <p style={{ margin: '0 0 0.2rem', fontWeight: 800, fontSize: '1.05rem', color: 'var(--primary)' }}>{item.value}</p>
                                    <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>{item.note}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Tech Infrastructure */}
                    <div className="card" style={{ borderLeft: '4px solid var(--primary)' }}>
                        <h4 style={{ marginBottom: '0.4rem', color: 'var(--text-primary)' }}>Technology Infrastructure</h4>
                        <p style={{ margin: '0 0 1.25rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>The platform is built on five technology pillars:</p>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                            {techPillars.map((item, i) => (
                                <div key={i} style={{ padding: '1rem', background: 'var(--surface)', borderRadius: '10px', border: '1px solid var(--border)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem', color: 'var(--primary)' }}>
                                        {item.icon}
                                        <p style={{ fontWeight: 700, margin: 0, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{item.title}</p>
                                    </div>
                                    <p style={{ margin: 0, fontSize: '0.82rem', lineHeight: 1.6, color: 'var(--text-muted)' }}>{item.desc}</p>
                                </div>
                            ))}
                        </div>
                        <div style={{ padding: '0.85rem 1rem', background: 'var(--surface)', borderRadius: '10px', border: '1px solid var(--border)', fontSize: '0.855rem', color: 'var(--text-secondary)', fontStyle: 'italic', lineHeight: 1.6 }}>
                            Our blockchain infrastructure is used strictly for transparency and regulatory audit integrity. No cryptocurrency or digital token is involved at any stage.
                        </div>
                    </div>

                    {/* Divider */}
                    <div style={{ borderTop: '2px solid var(--border)', margin: '0.5rem 0' }}></div>

                    {/* ── HINDI ── */}
                    <div className="card fade-in" style={{ borderLeft: '4px solid #f97316' }}>
                        <div style={{ marginBottom: '1rem' }}>
                            <span style={{ display: 'inline-block', padding: '0.2rem 0.75rem', borderRadius: '999px', background: '#fff7ed', color: '#c2410c', fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.5rem' }}>हिंदी संस्करण</span>
                            <h3 style={{ margin: '0 0 0.25rem', fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-primary)' }}>आर्थसेतु के बारे में</h3>
                            <p style={{ margin: 0, fontSize: '0.95rem', color: '#ea580c', fontWeight: 600 }}>आर्थसेतु – विश्वास का सेतु, अवसर का मार्ग, विकास का आधार।</p>
                        </div>
                        <p style={{ margin: '0 0 0.75rem', lineHeight: 1.75, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                            आर्थसेतु एक तकनीक-आधारित डिजिटल लेंडिंग मार्केटप्लेस है जो सत्यापित उधारकर्ताओं और जिम्मेदार निवेशकों को जोड़ने के लिए विकसित किया जा रहा है।
                        </p>
                        <p style={{ margin: '0 0 0.75rem', lineHeight: 1.75, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                            यह प्लेटफ़ॉर्म भारतीय रिज़र्व बैंक द्वारा जारी पी2पी लेंडिंग दिशानिर्देशों के अनुरूप एनबीएफसी-पी2पी मॉडल के तहत संचालित होने का प्रस्ताव रखता है।
                        </p>
                        <div style={{ padding: '0.75rem 1rem', background: '#fff7ed', borderRadius: '8px', border: '1px solid #fed7aa' }}>
                            <p style={{ margin: 0, fontWeight: 600, color: '#9a3412', fontSize: '0.875rem' }}>वर्तमान में यह प्रोटोटाइप चरण में है।</p>
                        </div>
                    </div>

                    {/* ── MARATHI ── */}
                    <div className="card fade-in" style={{ borderLeft: '4px solid #059669' }}>
                        <div style={{ marginBottom: '1rem' }}>
                            <span style={{ display: 'inline-block', padding: '0.2rem 0.75rem', borderRadius: '999px', background: '#ecfdf5', color: '#065f46', fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.5rem' }}>मराठी आवृत्ती</span>
                            <h3 style={{ margin: '0 0 0.25rem', fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-primary)' }}>आर्थसेतु बद्दल</h3>
                            <p style={{ margin: 0, fontSize: '0.95rem', color: '#059669', fontWeight: 600 }}>आर्थसेतु – विश्वासाचा पूल, संधींचा मार्ग, विकासाची दिशा.</p>
                        </div>
                        <p style={{ margin: '0 0 0.75rem', lineHeight: 1.75, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                            आर्थसेतु हे तंत्रज्ञान-आधारित डिजिटल कर्ज मार्केटप्लेस आहे जे सत्यापित कर्जदार आणि जबाबदार गुंतवणूकदार यांना जोडण्यासाठी विकसित केले जात आहे.
                        </p>
                        <p style={{ margin: '0 0 0.75rem', lineHeight: 1.75, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                            हे व्यासपीठ भारतीय रिझर्व्ह बँकेच्या P2P मार्गदर्शक तत्वांनुसार NBFC-P2P मॉडेल अंतर्गत कार्य करण्याचा मानस ठेवते.
                        </p>
                        <div style={{ padding: '0.75rem 1rem', background: '#ecfdf5', borderRadius: '8px', border: '1px solid #a7f3d0' }}>
                            <p style={{ margin: 0, fontWeight: 600, color: '#065f46', fontSize: '0.875rem' }}>सध्या हे प्रोटोटाइप टप्प्यात आहे.</p>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
