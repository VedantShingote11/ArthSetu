import Link from 'next/link';

export default function HomePage() {
    return (
        <div
            style={{
                minHeight: '100vh',
                background: 'var(--background)',
            }}
        >
            <div
                className="container"
                style={{
                    padding: '0 1.5rem 4rem',
                    paddingTop: '1rem'
                }}
            >
                {/* Hero row (full-screen first fold) */}
                <section
                    style={{
                        minHeight: 'calc(100vh - 80px)',
                        display: 'flex',
                        alignItems: 'center',
                    }}
                >
                    <div
                        className="grid"
                        style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '3rem',
                            alignItems: 'center',
                        }}
                    >
                        {/* Left column */}
                        <div style={{ maxWidth: '800px' }}>

                            <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                                <span style={{
                                    display: 'inline-block',
                                    padding: '0.25rem 0.75rem',
                                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                                    color: '#3b82f6',
                                    borderRadius: '9999px',
                                    fontSize: '0.875rem',
                                    fontWeight: '600',
                                    border: '1px solid rgba(59, 130, 246, 0.2)'
                                }}>
                                    RBI-Compliant P2P Platform
                                </span>
                                <span style={{
                                    display: 'inline-block',
                                    padding: '0.25rem 0.75rem',
                                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                                    color: '#10b981',
                                    borderRadius: '9999px',
                                    fontSize: '0.875rem',
                                    fontWeight: '600',
                                    border: '1px solid rgba(16, 185, 129, 0.2)'
                                }}>
                                    Mobile-First Experience
                                </span>
                            </div>

                            <h1
                                style={{
                                    fontSize: 'clamp(2.4rem, 4vw, 3.2rem)',
                                    marginBottom: '1rem',
                                    fontWeight: 800,
                                    lineHeight: 1.1,
                                    color: 'var(--text-primary)'
                                }}
                            >
                                Secure P2P Lending
                                <br />
                                for Everyday Indians
                            </h1>

                            <p
                                style={{
                                    fontSize: '1.1rem',
                                    maxWidth: 600,
                                    marginBottom: '1.25rem',
                                    color: 'var(--text-secondary)',
                                    lineHeight: 1.6
                                }}
                            >
                                ArthSetu is an intermediary technology platform connecting verified borrowers and lenders.
                                We empower users with AI-assessed credit access and blockchain-backed transparency.
                            </p>

                            <div style={{
                                backgroundColor: 'var(--surface)',
                                borderLeft: '4px solid var(--primary)',
                                padding: '1rem 1.25rem',
                                borderRadius: '0 0.5rem 0.5rem 0',
                                marginBottom: '2rem',
                                maxWidth: '600px',
                                border: '1px solid var(--border)',
                                borderLeft: '4px solid var(--primary)',
                            }}>
                                <p style={{ margin: 0, color: 'var(--text-primary)', fontWeight: '500' }}>
                                    <strong>Important:</strong> All lending and borrowing transactions occur exclusively through the ArthSetu mobile application. This website serves as an informational hub and secure admin dashboard.
                                </p>
                            </div>

                            {/* Stats row */}
                            <div
                                style={{
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    gap: '1.5rem',
                                    marginBottom: '2rem',
                                    fontSize: '0.85rem',
                                    paddingTop: '1rem',
                                    borderTop: '1px solid var(--border-color, #e2e8f0)'
                                }}
                            >
                                <div>
                                    <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>₹18 Cr+</div>
                                    <div style={{ color: 'var(--text-muted)' }}>Disbursed securely</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>3.5k+</div>
                                    <div style={{ color: 'var(--text-muted)' }}>Verified active users</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>18–22% p.a.</div>
                                    <div style={{ color: 'var(--text-muted)' }}>Target net yield</div>
                                </div>
                            </div>

                            {/* CTAs */}
                            <div
                                style={{
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    gap: '1rem',
                                    marginBottom: '1.5rem',
                                }}
                            >
                                <a
                                    href="#"
                                    className="btn btn-secondary"
                                    style={{
                                        padding: '0.8rem 1.6rem',
                                        fontSize: '1rem',
                                        fontWeight: '600',
                                        backgroundColor: '#e2e8f0',
                                        color: '#475569',
                                        textDecoration: 'none',
                                        borderRadius: '0.5rem',
                                        cursor: 'not-allowed',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '0.5rem'
                                    }}
                                >
                                    ↓ Download Mobile App
                                </a>
                                <Link
                                    href="/auth/register?role=admin"
                                    className="btn btn-primary"
                                    style={{
                                        padding: '0.8rem 1.6rem',
                                        fontSize: '1rem',
                                        fontWeight: '600',
                                        backgroundColor: '#3b82f6',
                                        color: 'white',
                                        textDecoration: 'none',
                                        borderRadius: '0.5rem',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '0.5rem'
                                    }}
                                >
                                    Admin Portal Login
                                </Link>
                            </div>

                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', maxWidth: '600px', lineHeight: 1.5 }}>
                                * Disclaimer: ArthSetu acts solely as a marketplace platform facilitating lending between registered users.
                                We do not guarantee returns to lenders, guarantee loan approval to borrowers, or assume credit risk
                                on behalf of users. Please assess risks carefully.
                            </p>

                        </div>

                        {/* Right column — card image */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginTop: '-10rem',
                        }}>
                            <img
                                src="/assets/img/card.webp"
                                alt="ArthSetu App Card"
                                style={{
                                    width: '100%',
                                    maxWidth: '552px',
                                    display: 'block',
                                }}
                            />
                        </div>
                    </div>
                </section>

                <style>{`
                    @media (max-width: 768px) {
                        .grid { grid-template-columns: 1fr !important; }
                    }
                `}</style>
            </div>
        </div>
    );
}
