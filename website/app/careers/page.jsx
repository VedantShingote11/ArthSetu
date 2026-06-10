'use client';
import { Briefcase, Heart, Mail, Shield, Users, Zap } from 'lucide-react';

const openRoles = [
    { role: 'Backend Engineer (Node.js / Python)', dept: 'Engineering', type: 'Full-Time' },
    { role: 'ML / AI Engineer — Risk Scoring', dept: 'Data Science', type: 'Full-Time' },
    { role: 'Mobile App Developer (React Native)', dept: 'Engineering', type: 'Full-Time' },
    { role: 'Product Manager — Lending Platform', dept: 'Product', type: 'Full-Time' },
    { role: 'Compliance & Regulatory Affairs Manager', dept: 'Legal', type: 'Full-Time' },
    { role: 'Growth & Marketing Associate', dept: 'Marketing', type: 'Full-Time' },
];

const values = [
    { icon: <Heart size={20} />, title: 'Mission-Driven', desc: 'Every feature we build is evaluated against one question: does this make financial access more fair for everyday Indians?' },
    { icon: <Shield size={20} />, title: 'Transparency First', desc: 'We operate with radical transparency — internally and externally. Trust is built through clarity, not marketing.' },
    { icon: <Zap size={20} />, title: 'Technology-Led', desc: 'Engineers, data scientists, and product thinkers are central to everything we do. We build the infrastructure of fair credit.' },
    { icon: <Users size={20} />, title: 'Regulatory Rigour', desc: 'We take compliance seriously — not as a constraint, but as the foundation of a sustainable, trustworthy business.' },
];

export default function CareersPage() {
    return (
        <div style={{ minHeight: '100vh', background: 'var(--background)' }}>
            <div className="sub-navbar">
                <div className="container flex justify-between items-center">
                    <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-primary)' }}>
                        <Briefcase size={24} style={{ color: 'var(--primary)' }} />
                        Careers at ArthSetu
                    </h2>
                </div>
            </div>

            <div className="container" style={{ padding: '2rem 1rem', maxWidth: '900px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                    {/* Intro */}
                    <div className="card fade-in border transition-all hover:border-primary hover:shadow-md" style={{ animationDelay: '0.1s' }}>
                        <h3 style={{ margin: '0 0 0.75rem', fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)' }}>Build India's Credit Bridge</h3>
                        <p style={{ margin: 0, fontSize: '1rem', lineHeight: 1.7, color: 'var(--text-secondary)' }}>
                            We are building India's most transparent peer-to-peer lending platform. We are looking for people who believe technology can make finance more fair and accessible for everyone — not just the formally employed.
                        </p>
                    </div>

                    {/* Culture */}
                    <div className="card" style={{ borderLeft: '4px solid var(--primary)' }}>
                        <h4 style={{ marginBottom: '1.25rem', color: 'var(--text-primary)' }}>Our Culture</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            {values.map((item, i) => (
                                <div key={i} style={{ padding: '1rem', background: 'var(--surface)', borderRadius: '10px', border: '1px solid var(--border)' }}>
                                    <div style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>{item.icon}</div>
                                    <p style={{ fontWeight: 700, margin: '0 0 0.3rem', fontSize: '0.95rem', color: 'var(--text-primary)' }}>{item.title}</p>
                                    <p style={{ margin: 0, fontSize: '0.82rem', lineHeight: 1.6, color: 'var(--text-muted)' }}>{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Open Positions */}
                    <div className="card">
                        <h4 style={{ marginBottom: '1.25rem', color: 'var(--text-primary)' }}>Open Positions</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                            {openRoles.map((item, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.9rem 1rem', background: 'var(--surface)', borderRadius: '10px', border: '1px solid var(--border)' }}>
                                    <div>
                                        <p style={{ fontWeight: 600, margin: '0 0 0.2rem', fontSize: '0.95rem', color: 'var(--text-primary)' }}>{item.role}</p>
                                        <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)' }}>{item.dept} · {item.type}</p>
                                    </div>
                                    <span style={{ padding: '0.3rem 0.75rem', borderRadius: '999px', background: 'var(--primary-light, #e0e7ff)', color: 'var(--primary)', fontSize: '0.78rem', fontWeight: 700, flexShrink: 0, marginLeft: '1rem' }}>
                                        Apply via App
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* How to Apply */}
                    <div className="card" style={{ textAlign: 'center', borderLeft: '4px solid var(--success)' }}>
                        <div style={{ color: 'var(--success)', marginBottom: '0.5rem' }}><Mail size={28} /></div>
                        <h4 style={{ margin: '0 0 0.5rem', color: 'var(--text-primary)' }}>How to Apply</h4>
                        <p style={{ margin: '0 0 0.75rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                            Send your resume and a brief note about why you want to work on financial inclusion at ArthSetu.
                        </p>
                        <p style={{ margin: 0, fontWeight: 700, fontSize: '1.1rem', color: 'var(--primary)' }}>careers@arthsetu.in</p>
                    </div>

                </div>
            </div>
        </div>
    );
}
