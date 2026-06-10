'use client';
import { Code, Globe, HandshakeIcon, Heart } from 'lucide-react';

const partnerships = [
    {
        icon: <Globe size={20} />,
        title: 'Affiliate Partners',
        desc: 'Earn a referral commission by directing eligible borrowers and lenders to the ArthSetu platform. Affiliate partnerships are subject to compliance review and the standard affiliate agreement.',
        cta: 'partners@arthsetu.in',
    },
    {
        icon: <Code size={20} />,
        title: 'Technology Partners',
        desc: 'We collaborate with providers of KYC technology, bureau data, bank statement analysis APIs, and blockchain infrastructure. If your technology strengthens our lending infrastructure, we want to hear from you.',
        cta: 'partners@arthsetu.in',
    },
    {
        icon: <HandshakeIcon size={20} />,
        title: 'Distribution Partners',
        desc: 'Fintech platforms, wallet services, and digital payment providers who wish to integrate ArthSetu's lending marketplace via API can apply for an API distribution partnership.',
        cta: 'partners@arthsetu.in',
    },
    {
        icon: <Heart size={20} />,
        title: 'Impact & NGO Partners',
        desc: 'Non-profit organizations working in financial literacy and inclusion can partner with ArthSetu to co-create educational content and drive responsible participation in the formal credit ecosystem.',
        cta: 'partners@arthsetu.in',
    },
];

export default function AffiliatesPage() {
    return (
        <div style={{ minHeight: '100vh', background: 'var(--background)' }}>
            <div className="sub-navbar">
                <div className="container flex justify-between items-center">
                    <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-primary)' }}>
                        <HandshakeIcon size={24} style={{ color: 'var(--primary)' }} />
                        Affiliates &amp; Partners
                    </h2>
                </div>
            </div>

            <div className="container" style={{ padding: '2rem 1rem', maxWidth: '900px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                    <div className="card fade-in border transition-all hover:border-primary hover:shadow-md" style={{ animationDelay: '0.1s' }}>
                        <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)' }}>Partner with ArthSetu</h3>
                        <p style={{ margin: 0, lineHeight: 1.7, color: 'var(--text-secondary)' }}>
                            We partner with aligned organizations to expand access to fair credit across India. Whether you're a technology provider, referral partner, or a mission-aligned NGO — there is a role for you in the ArthSetu ecosystem.
                        </p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        {partnerships.map((item, i) => (
                            <div key={i} className="card fade-in border transition-all hover:border-primary hover:shadow-md" style={{ animationDelay: `${0.1 + i * 0.1}s` }}>
                                <div style={{ color: 'var(--primary)', marginBottom: '0.75rem' }}>{item.icon}</div>
                                <h4 style={{ margin: '0 0 0.5rem', color: 'var(--text-primary)', fontSize: '1rem' }}>{item.title}</h4>
                                <p style={{ margin: '0 0 1rem', fontSize: '0.875rem', lineHeight: 1.7, color: 'var(--text-secondary)' }}>{item.desc}</p>
                                <p style={{ margin: 0, fontSize: '0.82rem', fontWeight: 700, color: 'var(--primary)' }}>{item.cta}</p>
                            </div>
                        ))}
                    </div>

                </div>
            </div>
        </div>
    );
}
