import StatusBadge from '@/components/StatusBadge';

export const metadata = {
    title: 'KYC | ArthSetu',
};

export default function KycPage() {
    return (
        <div style={{ minHeight: '100vh', background: 'var(--background)' }}>
            <div className="container" style={{ padding: '2rem 1rem' }}>
                <div
                    className="card mb-4"
                    style={{
                        padding: '1.75rem 1.75rem 1.5rem',
                    }}
                >
                    <h1 style={{ marginBottom: '0.5rem', fontSize: '1.6rem' }}>KYC Verification</h1>
                    <p style={{ margin: 0, fontSize: '0.95rem' }}>
                        Verify your identity using Aadhaar to unlock lending and borrowing features.
                    </p>
                </div>

                <div className="grid grid-2">
                    <div className="card" style={{ padding: '1.5rem 1.75rem' }}>
                        <h2 style={{ fontSize: '1.1rem', marginBottom: '0.75rem' }}>Aadhaar Details</h2>
                        <p style={{ fontSize: '0.85rem', marginBottom: '1rem' }}>
                            We perform instant e‑KYC using UIDAI. Your details are encrypted and never shared
                            with third parties.
                        </p>
                        <label
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '0.4rem',
                                fontSize: '0.85rem',
                            }}
                        >
                            <span>Aadhaar Number</span>
                            <input
                                type="text"
                                placeholder="0000 0000 0000"
                                maxLength={14}
                                className="form-input"
                                style={{ maxWidth: 320 }}
                            />
                        </label>
                        <button
                            type="button"
                            className="btn btn-primary"
                            style={{ marginTop: '1rem' }}
                        >
                            Verify with Instant OTP
                        </button>
                        <p
                            style={{
                                fontSize: '0.75rem',
                                marginTop: '0.6rem',
                                color: 'var(--text-muted)',
                            }}
                        >
                            Linked to your phone number for secure one‑time password verification.
                        </p>
                    </div>

                    <div className="card" style={{ padding: '1.5rem 1.75rem' }}>
                        <h2 style={{ fontSize: '1.1rem', marginBottom: '0.75rem' }}>Verification Status</h2>
                        <p style={{ fontSize: '0.85rem', marginBottom: '0.75rem' }}>
                            Once verified, your profile will show an Aadhaar‑verified badge across the app.
                        </p>
                        <StatusBadge status="pending" />
                        <ul
                            style={{
                                marginTop: '1rem',
                                paddingLeft: '1.1rem',
                                fontSize: '0.85rem',
                                color: 'var(--text-secondary)',
                                display: 'grid',
                                gap: '0.15rem',
                            }}
                        >
                            <li>Confirm your Aadhaar number with an OTP sent to your phone.</li>
                            <li>We fetch only the minimum details needed for KYC.</li>
                            <li>After approval, you can request loans or start lending.</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}

