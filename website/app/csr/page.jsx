'use client';
import { BarChart2, Heart, Star, Users } from 'lucide-react';

const focusAreas = [
    { icon: <BarChart2 size={20} />, title: 'Financial Literacy', desc: 'We partner with schools, colleges, and NGOs to deliver financial literacy workshops in local languages — covering credit, savings, digital payments, and the risks and opportunities of P2P lending.' },
    { icon: <Star size={20} />, title: 'New-to-Credit Inclusion', desc: 'Our AI model is designed to find creditworthy individuals with no CIBIL history — first-time borrowers, rural workers, gig economy participants — and offer them a responsible path into formal credit.' },
    { icon: <Users size={20} />, title: "Women's Financial Empowerment", desc: 'We actively track the proportion of women borrowers and aim to expand access to credit for women-led micro-enterprises and self-employed women professionals.' },
    { icon: <Heart size={20} />, title: 'Transparent Reporting', desc: 'We publish an annual impact report documenting loans facilitated, demographic breakdown, average loan size, and platform-level default rates — in the spirit of radical transparency.' },
];

export default function CsrPage() {
    return (
        <div style={{ minHeight: '100vh', background: 'var(--background)' }}>
            <div className="sub-navbar">
                <div className="container flex justify-between items-center">
                    <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-primary)' }}>
                        <Heart size={24} style={{ color: 'var(--primary)' }} />
                        Corporate Social Responsibility
                    </h2>
                </div>
            </div>
            <div className="container" style={{ padding: '2rem 1rem', maxWidth: '900px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div className="card fade-in border transition-all hover:border-primary hover:shadow-md" style={{ animationDelay: '0.1s' }}>
                        <h3 style={{ margin: '0 0 0.75rem', fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)' }}>Our Social Mission</h3>
                        <p style={{ margin: 0, lineHeight: 1.7, color: 'var(--text-secondary)' }}>
                            Financial inclusion is not a feature — it is the reason ArthSetu exists. Every loan facilitated on the platform is a social act: a lender's surplus savings transformed into a borrower's opportunity to start a business, pay a medical bill, or fund an education.
                        </p>
                    </div>
                    <div className="card">
                        <h4 style={{ marginBottom: '1.25rem', color: 'var(--text-primary)' }}>CSR Focus Areas</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            {focusAreas.map((item, i) => (
                                <div key={i} style={{ padding: '1rem', background: 'var(--surface)', borderRadius: '10px', border: '1px solid var(--border)' }}>
                                    <div style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>{item.icon}</div>
                                    <p style={{ fontWeight: 700, margin: '0 0 0.3rem', fontSize: '0.95rem', color: 'var(--text-primary)' }}>{item.title}</p>
                                    <p style={{ margin: 0, fontSize: '0.82rem', lineHeight: 1.65, color: 'var(--text-muted)' }}>{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="card" style={{ borderLeft: '4px solid var(--success)' }}>
                        <p style={{ margin: 0, lineHeight: 1.7, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                            We measure our social success by the lives our platform touches — not just the loans it facilitates. Every verified borrower gaining access to formal credit is a milestone.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
