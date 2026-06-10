'use client';
import { Clock, Mail, MapPin, MessageSquare, Shield, Smartphone } from 'lucide-react';

const channels = [
    { label: 'General Enquiries', value: 'support@arthsetu.in' },
    { label: 'Careers', value: 'careers@arthsetu.in' },
    { label: 'Partnership & Affiliates', value: 'partners@arthsetu.in' },
    { label: 'Grievance Officer', value: 'grievance@arthsetu.in' },
    { label: 'Registered Office', value: 'ArthSetu Pvt. Ltd., India' },
];

const slas = [
    { type: 'In-App Support Ticket', sla: '1–2 business days' },
    { type: 'Email Enquiries', sla: '2–3 business days' },
    { type: 'Formal Grievance (regulatory)', sla: 'Within 30 days (RBI mandate)' },
];

export default function ContactPage() {
    return (
        <div style={{ minHeight: '100vh', background: 'var(--background)' }}>
            <div className="sub-navbar">
                <div className="container flex justify-between items-center">
                    <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-primary)' }}>
                        <MessageSquare size={24} style={{ color: 'var(--primary)' }} />
                        Contact ArthSetu
                    </h2>
                </div>
            </div>

            <div className="container" style={{ padding: '2rem 1rem', maxWidth: '900px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                    {/* Primary channel */}
                    <div className="card fade-in border transition-all hover:border-primary hover:shadow-md" style={{ borderLeft: '4px solid var(--info)', animationDelay: '0.1s' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                            <div style={{ color: 'var(--info)', flexShrink: 0, marginTop: '0.1rem' }}><Smartphone size={24} /></div>
                            <div>
                                <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>Primary: In-App Support</h3>
                                <p style={{ margin: 0, lineHeight: 1.7, color: 'var(--text-secondary)' }}>
                                    The fastest way to reach our support team is through the <strong>Help &amp; Support</strong> section in the ArthSetu mobile application. Our team responds to in-app tickets within 1–2 business days.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Contact Details */}
                    <div className="card">
                        <h4 style={{ marginBottom: '1.25rem', color: 'var(--text-primary)' }}>Other Contact Channels</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                            {channels.map((item, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.9rem 0', borderBottom: i < channels.length - 1 ? '1px solid var(--border)' : 'none' }}>
                                    <span style={{ width: '200px', flexShrink: 0, fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)' }}>{item.label}</span>
                                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{item.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* SLAs */}
                    <div className="card">
                        <h4 style={{ marginBottom: '1.25rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Clock size={18} style={{ color: 'var(--warning)' }} /> Response Time Commitments
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                            {slas.map((item, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.85rem 1rem', background: 'var(--surface)', borderRadius: '10px', border: '1px solid var(--border)' }}>
                                    <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{item.type}</span>
                                    <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--primary)', flexShrink: 0, marginLeft: '1rem' }}>{item.sla}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Office */}
                    <div className="card" style={{ borderLeft: '4px solid var(--text-muted)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                            <MapPin size={18} style={{ color: 'var(--text-muted)' }} />
                            <h4 style={{ margin: 0, color: 'var(--text-primary)' }}>Registered Office</h4>
                        </div>
                        <p style={{ margin: 0, color: 'var(--text-secondary)', lineHeight: 1.6 }}>ArthSetu Pvt. Ltd., India</p>
                        <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>All formal correspondence must be directed to the Grievance Officer email above.</p>
                    </div>

                </div>
            </div>
        </div>
    );
}
