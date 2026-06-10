'use client';

import {
    AlertTriangle,
    Book,
    ChevronDown,
    ChevronRight,
    ExternalLink,
    HelpCircle,
    Mail,
    MessageSquare,
    Phone,
    Shield,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const FAQ_ITEMS = [
    {
        category: 'User & KYC Management',
        items: [
            {
                q: 'How do I approve a borrower KYC?',
                a: 'Navigate to Admin Dashboard → KYC Management. You will see a list of all pending KYC applications. Click "Review" on any application to view the submitted Aadhaar, PAN, and liveness check result. Click "Approve" or "Reject" accordingly. The borrower will be notified via the mobile app automatically.',
            },
            {
                q: 'Can I manually flag a user account?',
                a: 'Yes. Go to Admin Dashboard → User Management → find the user → click "View" → use the "Suspend Account" action. Suspended users will be blocked from accessing the mobile app until the flag is lifted.',
            },
            {
                q: 'What does "Verified" status mean for a borrower?',
                a: 'A "Verified" borrower has successfully completed KYC — their Aadhaar and PAN are validated, liveness check passed, and the admin has manually approved their application. Only verified borrowers can apply for loans.',
            },
        ]
    },
    {
        category: 'Loan Monitoring',
        items: [
            {
                q: 'How do I see all active loans?',
                a: 'From the Admin Dashboard, go to Loan Statistics or navigate to the Loans section. You can filter by status: Active, Funded, Repaid, or Defaulted.',
            },
            {
                q: 'What action do I take when a loan is flagged as Defaulted?',
                a: 'A defaulted loan means EMI payments have been missed beyond the grace period. Review the borrower profile, initiate a collections workflow note, and update the loan status in the system. Contact the borrower via the platform\'s authorized communication channel. Do not communicate loan recovery information to lenders directly.',
            },
            {
                q: 'Can I manually adjust a loan\'s status?',
                a: 'Yes, but with caution. Status changes are logged with a timestamp and your admin ID. Only update a loan status when there is a verified, documented reason. All changes are recorded in the blockchain audit trail.',
            },
        ]
    },
    {
        category: 'Blockchain & Audit',
        items: [
            {
                q: 'What is the Blockchain Explorer in the dashboard?',
                a: 'The Blockchain Explorer shows a live, read-only view of all transactions anchored to the public blockchain. This includes loan agreements, disbursement events, and EMI repayment records. You can verify any entry by cross-referencing the transaction hash with the public blockchain directly.',
            },
            {
                q: 'What happens if a blockchain write fails?',
                a: 'The system retries the write automatically. If it persistently fails, the admin will receive a notification (if enabled in Settings → Notifications). The event is logged internally and does not affect the actual financial transaction. Manual resolution may be required — contact the tech team via the escalation channel.',
            },
        ]
    },
    {
        category: 'Platform Configuration',
        items: [
            {
                q: 'How do I enable Maintenance Mode?',
                a: 'Go to Settings → Platform Configuration → toggle Maintenance Mode ON. This blocks all user-facing API requests and shows a maintenance notice on the mobile app. Use this during deployments or critical incident response. Always notify users in advance if possible.',
            },
            {
                q: 'Can I change the maximum loan amount?',
                a: 'The configurable range in Settings reflects the platform\'s internal limits. However, they cannot exceed the RBI-mandated aggregate caps displayed in the RBI Compliance Parameters panel. Any change takes effect immediately for new loan applications.',
            },
        ]
    },
];

export default function AdminHelpPage() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [openItems, setOpenItems] = useState({});

    // Admin-only guard
    useEffect(() => {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');
        if (!token || !userData) {
            router.push('/auth/login?role=admin');
            return;
        }
        const parsed = JSON.parse(userData);
        if (parsed.role !== 'admin') {
            router.push('/auth/login?role=admin');
            return;
        }
        setUser(parsed);
    }, [router]);

    const toggleItem = (key) => setOpenItems(prev => ({ ...prev, [key]: !prev[key] }));

    if (!user) return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="spinner"></div>
        </div>
    );

    return (
        <div style={{ minHeight: '100vh', background: 'var(--background)' }}>
            {/* Sub-navbar */}
            <div className="sub-navbar">
                <div className="container flex justify-between items-center">
                    <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-primary)' }}>
                        <HelpCircle size={24} style={{ color: 'var(--primary)' }} />
                        Help &amp; Support
                    </h2>
                </div>
            </div>

            <div className="container" style={{ padding: '2rem 1rem', maxWidth: '900px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                    {/* Welcome Banner */}
                    <div className="card fade-in flex flex-col items-center justify-center p-6 border transition-all hover:border-primary hover:shadow-md" style={{ padding: '1.75rem 2rem', animationDelay: '0.1s' }}>
                        <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>Admin Support Centre</h3>
                        <p style={{ margin: 0, fontSize: '1rem', lineHeight: 1.6, color: 'var(--text-secondary)' }}>
                            This panel is exclusively for ArthSetu platform administrators. Use the FAQs below for common tasks, or contact the tech and compliance team via the channels listed at the bottom.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div className="card">
                        <h4 style={{ marginBottom: '1rem' }}>Quick Navigation</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem' }}>
                            {[
                                { label: 'KYC Management', href: '/admin/kyc', icon: <Shield size={16} /> },
                                { label: 'User Management', href: '/admin/users', icon: <MessageSquare size={16} /> },
                                { label: 'Blockchain Explorer', href: '/admin/blockchain', icon: <Book size={16} /> },
                                { label: 'Admin Dashboard', href: '/admin/dashboard', icon: <HelpCircle size={16} /> },
                                { label: 'Settings', href: '/settings', icon: <AlertTriangle size={16} /> },
                                { label: 'RBI Disclosures', href: '/disclosures', icon: <ExternalLink size={16} />, external: true },
                            ].map((item, i) => (
                                <Link
                                    key={i}
                                    href={item.href}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '0.6rem',
                                        padding: '0.75rem 1rem', background: 'var(--surface)',
                                        borderRadius: '10px', border: '1px solid var(--border)',
                                        textDecoration: 'none', color: 'var(--text-primary)',
                                        fontWeight: 600, fontSize: '0.875rem',
                                        transition: 'border-color 0.15s, background 0.15s',
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                                    onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                                >
                                    <span style={{ color: 'var(--primary)' }}>{item.icon}</span>
                                    {item.label}
                                    {item.external && <ExternalLink size={12} style={{ marginLeft: 'auto', opacity: 0.5 }} />}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* FAQ Accordion */}
                    <div className="card">
                        <h4 style={{ marginBottom: '1.25rem' }}>Frequently Asked Questions (Admin)</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {FAQ_ITEMS.map((section) => (
                                <div key={section.category}>
                                    <p style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)', marginBottom: '0.5rem', paddingLeft: '0.25rem' }}>
                                        {section.category}
                                    </p>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                        {section.items.map((item, i) => {
                                            const key = `${section.category}-${i}`;
                                            const isOpen = !!openItems[key];
                                            return (
                                                <div key={key} style={{ border: '1px solid var(--border)', borderRadius: '10px', overflow: 'hidden' }}>
                                                    <button
                                                        onClick={() => toggleItem(key)}
                                                        style={{
                                                            width: '100%', textAlign: 'left', padding: '0.85rem 1rem',
                                                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                                            background: isOpen ? 'var(--surface)' : 'transparent',
                                                            border: 'none', cursor: 'pointer',
                                                            fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)',
                                                        }}
                                                    >
                                                        {item.q}
                                                        {isOpen ? <ChevronDown size={16} style={{ flexShrink: 0, color: 'var(--primary)' }} /> : <ChevronRight size={16} style={{ flexShrink: 0, opacity: 0.4 }} />}
                                                    </button>
                                                    {isOpen && (
                                                        <div style={{ padding: '0 1rem 1rem', borderTop: '1px solid var(--border)', background: 'var(--surface)' }}>
                                                            <p style={{ margin: '0.75rem 0 0', fontSize: '0.875rem', lineHeight: 1.7, color: 'var(--text-secondary)' }}>
                                                                {item.a}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Contact Channels */}
                    <div className="card">
                        <h4 style={{ marginBottom: '1.25rem' }}>Escalation &amp; Contact</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                            {[
                                { icon: <Mail size={20} />, title: 'Tech Team', value: 'tech@arthsetu.in', desc: 'API errors, blockchain failures, deployment issues' },
                                { icon: <Shield size={20} />, title: 'Compliance Team', value: 'compliance@arthsetu.in', desc: 'Regulatory queries, RBI reporting, policy guidance' },
                                { icon: <Phone size={20} />, title: 'Grievance Officer', value: 'grievance@arthsetu.in', desc: 'Formal user complaints requiring admin intervention' },
                            ].map((item, i) => (
                                <div key={i} style={{ padding: '1rem', background: 'var(--surface)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                                    <div style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>{item.icon}</div>
                                    <p style={{ fontWeight: 700, margin: '0 0 0.2rem', fontSize: '0.9rem' }}>{item.title}</p>
                                    <p style={{ margin: '0 0 0.5rem', fontSize: '0.82rem', color: 'var(--primary)', fontWeight: 600 }}>{item.value}</p>
                                    <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Platform Info */}
                    <div className="card" style={{ borderLeft: '4px solid var(--primary)' }}>
                        <h4 style={{ marginBottom: '0.5rem' }}>Platform Information</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginTop: '1rem' }}>
                            {[
                                { label: 'Platform', value: 'ArthSetu v1.0' },
                                { label: 'Regulatory Frame', value: 'NBFC-P2P (RBI)' },
                                { label: 'Transaction Layer', value: 'Mobile App Only' },
                                { label: 'Blockchain Network', value: 'Public Ledger (No Crypto)' },
                                { label: 'Admin Portal', value: 'Web – Info & Monitor' },
                                { label: 'Support Hours', value: 'Mon–Fri, 10AM–6PM IST' },
                            ].map((item, i) => (
                                <div key={i} style={{ padding: '0.65rem 0.85rem', background: 'var(--surface)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                                    <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>{item.label}</p>
                                    <p style={{ margin: '0.2rem 0 0', fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)' }}>{item.value}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
