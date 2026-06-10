import { ShieldCheck, Lock, Link2, BadgeCheck } from 'lucide-react';

const CALM_BLUE = '#2563EB';
const SAFETY_GREEN = '#16A34A';

const RECENT_TX = [
    {
        id: '0x9f3a...b12c',
        label: 'Vault top-up',
        url: '#',
    },
    {
        id: '0xa7c1...3e90',
        label: 'Loan disbursement',
        url: '#',
    },
    {
        id: '0x4b2f...89aa',
        label: 'Repayment received',
        url: '#',
    },
];

export default function SecurityHubPage() {
    return (
        <div style={{ minHeight: '100vh', background: 'var(--background)' }}>
            <div className="container" style={{ padding: '2.5rem 1.5rem 3rem' }}>
                {/* Header */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        marginBottom: '1.75rem',
                    }}
                >
                    <div
                        style={{
                            width: 40,
                            height: 40,
                            borderRadius: '999px',
                            background: 'rgba(37, 99, 235, 0.08)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <ShieldCheck size={22} color={CALM_BLUE} />
                    </div>
                    <div>
                        <h1
                            style={{
                                margin: 0,
                                fontSize: '1.6rem',
                                fontWeight: 700,
                            }}
                        >
                            Security Hub
                        </h1>
                        <p
                            style={{
                                margin: '0.25rem 0 0',
                                color: '#64748b',
                                fontSize: '0.9rem',
                            }}
                        >
                            Transparent, on‑chain protection for your microfinance funds.
                        </p>
                    </div>
                </div>

                {/* Vault Status */}
                <div
                    className="card fade-in"
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '2rem',
                        padding: '1.9rem 1.75rem',
                        borderRadius: '1.25rem',
                        borderTop: `4px solid ${CALM_BLUE}`,
                        boxShadow: '0 16px 40px rgba(15, 23, 42, 0.08)',
                        marginBottom: '2rem',
                        position: 'relative',
                        overflow: 'hidden',
                    }}
                >
                    <div
                        style={{
                            position: 'absolute',
                            right: '-40%',
                            top: '-60%',
                            width: 320,
                            height: 320,
                            borderRadius: '50%',
                            background:
                                'radial-gradient(circle at center, rgba(37, 99, 235, 0.15) 0%, transparent 65%)',
                            opacity: 0.8,
                        }}
                    />
                    <div style={{ position: 'relative', zIndex: 1, maxWidth: '60%' }}>
                        <span
                            style={{
                                display: 'inline-block',
                                fontSize: '0.75rem',
                                letterSpacing: '0.08em',
                                textTransform: 'uppercase',
                                color: '#94a3b8',
                                marginBottom: '0.35rem',
                            }}
                        >
                            Vault Status
                        </span>
                        <h2
                            style={{
                                margin: 0,
                                fontSize: '2.1rem',
                                fontWeight: 800,
                            }}
                        >
                            ₹ 12,50,000 locked
                        </h2>
                        <p
                            style={{
                                margin: '0.5rem 0 0',
                                color: '#64748b',
                                fontSize: '0.95rem',
                            }}
                        >
                            Funds securely locked in our audited smart contract. Withdrawals can only follow
                            the rules written on‑chain.
                        </p>
                    </div>
                    <div style={{ position: 'relative', zIndex: 1, textAlign: 'right' }}>
                        <div
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.4rem',
                                padding: '0.45rem 0.95rem',
                                borderRadius: 999,
                                background: 'rgba(22, 163, 74, 0.08)',
                                color: SAFETY_GREEN,
                                fontWeight: 600,
                                marginBottom: '0.5rem',
                            }}
                        >
                            <ShieldCheck size={18} color={SAFETY_GREEN} />
                            <span>Protected</span>
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                            24/7 on‑chain monitoring
                        </div>
                    </div>
                </div>

                {/* Main Grid */}
                <div className="grid grid-2" style={{ gap: '1.5rem' }}>
                    {/* Blockchain Proof */}
                    <div className="card fade-in" style={{ padding: '1.4rem 1.5rem' }}>
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                marginBottom: '0.75rem',
                            }}
                        >
                            <div
                                style={{
                                    width: 28,
                                    height: 28,
                                    borderRadius: '999px',
                                    background: 'rgba(37, 99, 235, 0.08)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <Lock size={16} color={CALM_BLUE} />
                            </div>
                            <h3
                                style={{
                                    margin: 0,
                                    fontSize: '1rem',
                                    fontWeight: 600,
                                }}
                            >
                                Blockchain Proof
                            </h3>
                        </div>
                        <p
                            style={{
                                margin: '0 0 0.9rem',
                                color: '#64748b',
                                fontSize: '0.9rem',
                            }}
                        >
                            Every movement of your money is recorded on a public, tamper‑proof ledger.
                        </p>

                        <div
                            style={{
                                borderRadius: '0.9rem',
                                border: '1px solid #e2e8f0',
                                padding: '0.75rem 0.85rem',
                                background: '#f8fafc',
                            }}
                        >
                            {RECENT_TX.map((tx) => (
                                <div
                                    key={tx.id}
                                    style={{
                                        display: 'grid',
                                        gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 1.4fr) auto',
                                        alignItems: 'center',
                                        gap: '0.6rem',
                                        padding: '0.4rem 0.25rem',
                                        fontSize: '0.85rem',
                                    }}
                                >
                                    <span
                                        style={{
                                            fontFamily:
                                                'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                                            color: CALM_BLUE,
                                        }}
                                    >
                                        {tx.id}
                                    </span>
                                    <span style={{ color: '#475569' }}>{tx.label}</span>
                                    <a
                                        href={tx.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            justifyContent: 'flex-end',
                                            gap: '0.25rem',
                                            color: SAFETY_GREEN,
                                            textDecoration: 'none',
                                            fontWeight: 500,
                                            whiteSpace: 'nowrap',
                                        }}
                                    >
                                        <Link2 size={14} />
                                        <span>View on explorer</span>
                                    </a>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right column */}
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '1rem',
                        }}
                    >
                        {/* Verification Badge */}
                        <div
                            className="card fade-in"
                            style={{
                                padding: '1.5rem 1.5rem 1.4rem',
                                textAlign: 'center',
                                background:
                                    'radial-gradient(circle at top, rgba(37, 99, 235, 0.12), #ffffff)',
                            }}
                        >
                            <div
                                style={{
                                    width: 88,
                                    height: 88,
                                    borderRadius: '999px',
                                    border: `3px solid ${CALM_BLUE}`,
                                    margin: '0 auto 0.75rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    background: '#ffffff',
                                }}
                            >
                                <BadgeCheck size={40} color={SAFETY_GREEN} />
                            </div>
                            <h3
                                style={{
                                    margin: 0,
                                    fontSize: '1rem',
                                    fontWeight: 700,
                                }}
                            >
                                Aadhaar Verified Identity
                            </h3>
                            <p
                                style={{
                                    margin: '0.4rem auto 0',
                                    color: '#64748b',
                                    fontSize: '0.9rem',
                                    maxWidth: '22rem',
                                }}
                            >
                                All borrowers and lenders are verified using Aadhaar‑based KYC, helping to
                                prevent impersonation and fraud.
                            </p>
                        </div>

                        {/* Smart Contract Audit */}
                        <div
                            className="card fade-in"
                            style={{
                                padding: '1.4rem 1.5rem',
                            }}
                        >
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    marginBottom: '0.75rem',
                                }}
                            >
                                <div
                                    style={{
                                        width: 28,
                                        height: 28,
                                        borderRadius: '999px',
                                        background: 'rgba(37, 99, 235, 0.08)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <ShieldCheck size={16} color={CALM_BLUE} />
                                </div>
                                <h3
                                    style={{
                                        margin: 0,
                                        fontSize: '1rem',
                                        fontWeight: 600,
                                    }}
                                >
                                    Smart Contract Audit
                                </h3>
                            </div>
                            <ul
                                style={{
                                    margin: '0 0 0.85rem 1.1rem',
                                    padding: 0,
                                    color: '#475569',
                                    fontSize: '0.9rem',
                                    listStyle: 'disc',
                                }}
                            >
                                <li>
                                    The code that controls this vault is locked and cannot be edited by the
                                    bank.
                                </li>
                                <li>
                                    Independent auditors have reviewed the contract to check for backdoors
                                    or hidden controls.
                                </li>
                                <li>
                                    Any future change would require a new contract and a transparent
                                    on‑chain migration.
                                </li>
                            </ul>
                            <button
                                type="button"
                                className="btn btn-outline"
                                style={{
                                    fontSize: '0.85rem',
                                    padding: '0.45rem 0.9rem',
                                }}
                            >
                                View audit summary
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

