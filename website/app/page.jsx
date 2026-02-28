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
                    padding: '0 1.5rem 4rem', // Reduced top padding
                    paddingTop: '1rem'
                }}
            >
                {/* Hero row (full-screen first fold) */}
                <section
                    style={{
                        minHeight: 'calc(100vh - 80px)', // Adjust for navbar height
                        display: 'flex',
                        alignItems: 'center',
                    }}
                >
                    <div
                        className="grid"
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'minmax(0, 1.3fr) minmax(0, 1.2fr)',
                            gap: '2.75rem',
                            alignItems: 'center',
                        }}
                    >
                        {/* Left column */}
                        <div>


                            <h1
                                style={{
                                    fontSize: 'clamp(2.4rem, 4vw, 3.2rem)',
                                    marginBottom: '1rem',
                                    fontWeight: 800,
                                    lineHeight: 1.1,
                                }}
                            >
                                RBI‑inspired P2P&nbsp;Lending
                                <br />
                                for Everyday Indians
                            </h1>

                            <p
                                style={{
                                    fontSize: '1rem',
                                    maxWidth: 520,
                                    marginBottom: '1.75rem',
                                    color: 'var(--text-secondary)',
                                }}
                            >
                                Lend to verified micro‑borrowers, diversify your portfolio, and build a steady
                                on‑chain income stream that isn&apos;t tied to market swings.
                            </p>

                            {/* Stats row */}
                            <div
                                style={{
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    gap: '1.25rem',
                                    marginBottom: '1.9rem',
                                    fontSize: '0.85rem',
                                }}
                            >
                                <div>
                                    <div
                                        style={{
                                            fontSize: '1.1rem',
                                            fontWeight: 700,
                                        }}
                                    >
                                        ₹18 Cr+
                                    </div>
                                    <div style={{ color: 'var(--text-muted)' }}>Disbursed via vaults</div>
                                </div>
                                <div>
                                    <div
                                        style={{
                                            fontSize: '1.1rem',
                                            fontWeight: 700,
                                        }}
                                    >
                                        3.5k+
                                    </div>
                                    <div style={{ color: 'var(--text-muted)' }}>Registered users</div>
                                </div>
                                <div>
                                    <div
                                        style={{
                                            fontSize: '1.1rem',
                                            fontWeight: 700,
                                        }}
                                    >
                                        18–22% p.a.
                                    </div>
                                    <div style={{ color: 'var(--text-muted)' }}>Target net yield</div>
                                </div>
                            </div>

                            {/* CTAs */}
                            <div
                                style={{
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    gap: '0.9rem',
                                    marginBottom: '1.25rem',
                                }}
                            >
                                <Link
                                    href="/auth/register?role=admin"
                                    className="btn btn-primary"
                                    style={{
                                        padding: '0.8rem 1.6rem',
                                        fontSize: '0.95rem',
                                    }}
                                >
                                    Register
                                </Link>
                            </div>


                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
