'use client';
import { AlertCircle, Clock, Mail, MessageSquare } from 'lucide-react';

const steps = [
    { step: '1', title: 'In-App Support Ticket (Primary Channel)', desc: 'Raise your complaint through the Help & Support section within the ArthSetu mobile application. Provide as much detail as possible including your loan ID, transaction ID, and a description of the issue.' },
    { step: '2', title: 'Email to Grievance Officer', desc: 'If the in-app resolution is unsatisfactory, escalate by emailing the Grievance Officer at grievance@arthsetu.in with your complaint reference number.' },
    { step: '3', title: 'Formal Written Complaint', desc: 'For unresolved matters, send a written complaint to our registered office address, marked for the attention of the Grievance Officer.' },
];

const slas = [
    { label: 'Acknowledgement of complaint', sla: 'Within 2 business days' },
    { label: 'Resolution of complaint', sla: 'Within 30 days of receipt' },
    { label: 'Grievance Officer response (escalated)', sla: 'Within 15 business days' },
];

export default function GrievancePage() {
    return (
        <div style={{ minHeight: '100vh', background: 'var(--background)' }}>
            <div className="sub-navbar">
                <div className="container flex justify-between items-center">
                    <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-primary)' }}>
                        <AlertCircle size={24} style={{ color: 'var(--primary)' }} />
                        Grievance Redressal Policy
                    </h2>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>As mandated under RBI Guidelines</span>
                </div>
            </div>

            <div className="container" style={{ padding: '2rem 1rem', maxWidth: '900px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                    {/* How to raise */}
                    <div className="card">
                        <h4 style={{ marginBottom: '1.25rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <MessageSquare size={18} style={{ color: 'var(--primary)' }} /> How to Raise a Grievance
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {steps.map((item) => (
                                <div key={item.step} style={{ display: 'flex', gap: '1rem', padding: '1rem', background: 'var(--surface)', borderRadius: '10px', border: '1px solid var(--border)' }}>
                                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0, fontSize: '0.9rem' }}>
                                        {item.step}
                                    </div>
                                    <div>
                                        <p style={{ fontWeight: 700, margin: '0 0 0.3rem', fontSize: '0.95rem', color: 'var(--text-primary)' }}>{item.title}</p>
                                        <p style={{ margin: 0, fontSize: '0.875rem', lineHeight: 1.65, color: 'var(--text-secondary)' }}>{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* SLAs */}
                    <div className="card">
                        <h4 style={{ marginBottom: '1.25rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Clock size={18} style={{ color: 'var(--warning)' }} /> Response Commitments
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                            {slas.map((item, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.85rem 1rem', background: 'var(--surface)', borderRadius: '10px', border: '1px solid var(--border)' }}>
                                    <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{item.label}</span>
                                    <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--primary)', flexShrink: 0, marginLeft: '1rem' }}>{item.sla}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Grievance Officer */}
                    <div className="card" style={{ borderLeft: '4px solid var(--primary)' }}>
                        <h4 style={{ marginBottom: '1rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Mail size={18} style={{ color: 'var(--primary)' }} /> Grievance Officer
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {[
                                { label: 'Name', value: 'Grievance Officer, ArthSetu' },
                                { label: 'Email', value: 'grievance@arthsetu.in' },
                                { label: 'Hours', value: 'Monday – Friday, 10:00 AM – 6:00 PM IST' },
                            ].map((item, i) => (
                                <div key={i} style={{ display: 'flex', gap: '1rem' }}>
                                    <span style={{ width: '80px', flexShrink: 0, fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>{item.label}</span>
                                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{item.value}</span>
                                </div>
                            ))}
                        </div>
                        <p style={{ margin: '1rem 0 0', fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                            If your grievance is not resolved within 30 days, you may approach the RBI Ombudsman under the Integrated Ombudsman Scheme.
                        </p>
                    </div>

                </div>
            </div>
        </div>
    );
}
