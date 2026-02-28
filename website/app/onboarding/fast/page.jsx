'use client';

import { useState } from 'react';
import {
    User2,
    Shield,
    PhoneCall,
    Mic,
    ArrowRight,
    ArrowLeft,
    CheckCircle2,
    Wallet,
} from 'lucide-react';

const PRIMARY = '#2563EB';
const SUCCESS = '#16A34A';

const steps = [
    { id: 1, label: 'Identity' },
    { id: 2, label: 'Digital Locker' },
    { id: 3, label: 'First Goal' },
];

export default function FastOnboardingModal() {
    const [step, setStep] = useState(1);
    const [aadhaar, setAadhaar] = useState('');

    const goNext = () => {
        setStep((prev) => Math.min(prev + 1, steps.length));
    };

    const goPrev = () => {
        setStep((prev) => Math.max(prev - 1, 1));
    };

    const stepTitle = steps.find((s) => s.id === step)?.label ?? '';

    return (
        <div
            style={{
                minHeight: '100vh',
                background: 'var(--background)', // Changed from hardcoded dark, assumed transparent/overlay handled by parent or this is full page
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '1.5rem',
                transition: 'background 0.3s ease',
            }}
        >
            {/* Modal */}
            <div
                style={{
                    width: '100%',
                    maxWidth: 720,
                    borderRadius: 24,
                    background: 'var(--surface)', // CSS variable
                    boxShadow: 'var(--shadow-lg)',
                    border: '1px solid var(--border)',
                    position: 'relative',
                    overflow: 'hidden',
                    color: 'var(--text-primary)', // CSS variable
                    transition: 'background 0.3s ease, color 0.3s ease',
                }}
            >
                {/* Soft background glow - optimized for both themes or removed if clashing */}
                <div
                    style={{
                        position: 'absolute',
                        inset: '-40%',
                        background:
                            'radial-gradient(circle at top left, var(--primary-light, rgba(56,189,248,0.25)), transparent 55%), radial-gradient(circle at bottom right, var(--success-light, rgba(34,197,94,0.2)), transparent 55%)',
                        opacity: 0.5,
                        pointerEvents: 'none',
                    }}
                />

                <div style={{ position: 'relative', zIndex: 1, padding: '1.6rem 1.8rem 1.8rem' }}>
                    {/* Header + stepper */}
                    <div style={{ marginBottom: '1.4rem' }}>
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                gap: '1rem',
                                marginBottom: '1rem',
                            }}
                        >
                            <div>
                                <p
                                    style={{
                                        margin: 0,
                                        fontSize: '0.75rem',
                                        letterSpacing: '0.16em',
                                        textTransform: 'uppercase',
                                        color: 'var(--text-muted)',
                                    }}
                                >
                                    Fast Onboarding
                                </p>
                                <h1
                                    style={{
                                        margin: '0.2rem 0 0',
                                        fontSize: '1.4rem',
                                        fontWeight: 700,
                                        color: 'var(--text-primary)',
                                    }}
                                >
                                    {stepTitle}
                                </h1>
                            </div>
                            <div
                                style={{
                                    fontSize: '0.8rem',
                                    color: 'var(--text-muted)',
                                    textAlign: 'right',
                                }}
                            >
                                Step {step} of {steps.length}
                            </div>
                        </div>

                        {/* Progress stepper */}
                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: `repeat(${steps.length}, minmax(0,1fr))`,
                                gap: '0.6rem',
                            }}
                        >
                            {steps.map((s, index) => {
                                const isCompleted = step > s.id;
                                const isActive = step === s.id;
                                // Use variables or semi-transparent colors that work on both
                                const baseBg = 'var(--surface-hover)';
                                const activeBg = 'rgba(37,99,235,0.1)';
                                const completedBg = 'rgba(22,163,74,0.1)';

                                return (
                                    <div
                                        key={s.id}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.55rem',
                                            padding: '0.4rem 0.55rem',
                                            borderRadius: 999,
                                            background: isCompleted
                                                ? completedBg
                                                : isActive
                                                    ? activeBg
                                                    : baseBg,
                                            border: isActive
                                                ? '1px solid var(--primary)'
                                                : '1px solid var(--border)',
                                            transition: 'all 0.3s ease',
                                        }}
                                    >
                                        <div
                                            style={{
                                                width: 22,
                                                height: 22,
                                                borderRadius: '999px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                background: isCompleted
                                                    ? SUCCESS
                                                    : isActive
                                                        ? PRIMARY
                                                        : 'var(--background)',
                                                boxShadow: isActive
                                                    ? '0 0 10px rgba(59,130,246,0.5)'
                                                    : 'none',
                                                fontSize: '0.75rem',
                                                fontWeight: 600,
                                                color: isCompleted || isActive ? 'white' : 'var(--text-secondary)',
                                            }}
                                        >
                                            {isCompleted ? (
                                                <CheckCircle2 size={16} color="white" />
                                            ) : (
                                                s.id
                                            )}
                                        </div>
                                        <span
                                            style={{
                                                fontSize: '0.8rem',
                                                color: isCompleted || isActive ? 'var(--text-primary)' : 'var(--text-muted)',
                                                fontWeight: isActive ? 600 : 400,
                                            }}
                                        >
                                            {s.label}
                                        </span>
                                        {index < steps.length - 1 && (
                                            <div
                                                style={{
                                                    flex: 1,
                                                    height: 2,
                                                    borderRadius: 999,
                                                    background: 'var(--border)',
                                                    marginLeft: '0.2rem',
                                                }}
                                            />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Step content */}
                    <div
                        style={{
                            borderRadius: 20,
                            background: 'var(--background)', // Inner content bg
                            border: '1px solid var(--border)',
                            padding: '1.3rem 1.3rem 1.4rem',
                            boxShadow: '0 18px 45px rgba(15,23,42,0.9)', // Kept original shadow for depth
                            minHeight: 210,
                            position: 'relative',
                        }}
                    >
                        {step === 1 && (
                            <div
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '1rem',
                                }}
                            >
                                <div
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.6rem',
                                        marginBottom: '0.4rem',
                                    }}
                                >
                                    <div
                                        style={{
                                            width: 32,
                                            height: 32,
                                            borderRadius: '999px',
                                            background: 'rgba(37,99,235,0.1)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        <User2 size={18} color="var(--primary)" />
                                    </div>
                                    <div>
                                        <p
                                            style={{
                                                margin: 0,
                                                fontSize: '0.9rem',
                                                fontWeight: 600,
                                                color: 'var(--text-primary)',
                                            }}
                                        >
                                            Verify your identity with Aadhaar
                                        </p>
                                        <p
                                            style={{
                                                margin: '0.1rem 0 0',
                                                fontSize: '0.8rem',
                                                color: 'var(--text-secondary)',
                                            }}
                                        >
                                            We use secure Aadhaar‑based e‑KYC. No photocopies needed.
                                        </p>
                                    </div>
                                </div>

                                <label
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '0.4rem',
                                        fontSize: '0.8rem',
                                    }}
                                >
                                    <span style={{ color: 'var(--text-secondary)' }}>Aadhaar Number</span>
                                    <div
                                        style={{
                                            display: 'flex',
                                            gap: '0.6rem',
                                        }}
                                    >
                                        <div
                                            style={{
                                                position: 'relative',
                                                flex: 1,
                                            }}
                                        >
                                            <input
                                                type="text"
                                                value={aadhaar}
                                                onChange={(e) => setAadhaar(e.target.value)}
                                                placeholder="0000 0000 0000"
                                                maxLength={14}
                                                style={{
                                                    width: '100%',
                                                    borderRadius: 999,
                                                    border: '1px solid var(--border)',
                                                    backgroundColor: 'var(--surface)',
                                                    padding:
                                                        '0.6rem 0.9rem 0.6rem 2.3rem',
                                                    color: 'var(--text-primary)',
                                                    fontSize: '0.9rem',
                                                    outline: 'none',
                                                }}
                                            />
                                            <Shield
                                                size={16}
                                                color="var(--success)"
                                                style={{
                                                    position: 'absolute',
                                                    left: 10,
                                                    top: '50%',
                                                    transform: 'translateY(-50%)',
                                                }}
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={goNext}
                                            style={{
                                                borderRadius: 999,
                                                padding: '0.6rem 1.1rem',
                                                border: 'none',
                                                background:
                                                    'linear-gradient(135deg,#22C55E,#16A34A)',
                                                color: 'white',
                                                fontSize: '0.85rem',
                                                fontWeight: 600,
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '0.35rem',
                                                cursor: 'pointer',
                                                boxShadow:
                                                    '0 4px 12px rgba(22,163,74,0.3)',
                                            }}
                                        >
                                            Instant OTP
                                            <ArrowRight size={16} />
                                        </button>
                                    </div>
                                    <span
                                        style={{
                                            fontSize: '0.75rem',
                                            color: 'var(--text-muted)',
                                        }}
                                    >
                                        Linked to your phone number via UIDAI. We never share it with
                                        lenders.
                                    </span>
                                </label>
                            </div>
                        )}

                        {step === 2 && (
                            <div
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: '1.4fr 1.2fr',
                                    gap: '1.1rem',
                                    alignItems: 'center',
                                }}
                            >
                                <div>
                                    <p
                                        style={{
                                            margin: '0 0 0.3rem',
                                            fontSize: '0.9rem',
                                            fontWeight: 600,
                                            color: 'var(--text-primary)',
                                        }}
                                    >
                                        Your digital locker is being prepared
                                    </p>
                                    <p
                                        style={{
                                            margin: 0,
                                            fontSize: '0.8rem',
                                            color: 'var(--text-secondary)',
                                        }}
                                    >
                                        We generate a secure wallet that holds your microfinance
                                        agreements and repayment history, and link it to your phone
                                        number.
                                    </p>
                                </div>
                                <div
                                    style={{
                                        position: 'relative',
                                        height: 150,
                                    }}
                                >
                                    {/* Animated wallet */}
                                    <div
                                        style={{
                                            position: 'absolute',
                                            top: 18,
                                            left: 10,
                                            right: 10,
                                            bottom: 20,
                                            borderRadius: 20,
                                            background:
                                                'linear-gradient(145deg,#1D4ED8,#22C55E)',
                                            boxShadow:
                                                '0 14px 30px rgba(0,0,0,0.2)',
                                            transform: 'translateY(4px)',
                                        }}
                                    />
                                    <div
                                        style={{
                                            position: 'absolute',
                                            top: 35,
                                            left: 20,
                                            right: 20,
                                            bottom: 30,
                                            borderRadius: 18,
                                            background: 'var(--surface)',
                                            border: '1px solid var(--border)',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '1rem',
                                        }}
                                    >
                                        <Wallet size={28} color="var(--indigo-400)" />
                                        <span
                                            style={{
                                                fontSize: '1rem',
                                                fontWeight: 600,
                                                color: 'var(--text-primary)',
                                            }}
                                        >
                                            Digital Locker
                                        </span>
                                        <span
                                            style={{
                                                fontSize: '0.75rem',
                                                color: 'var(--text-muted)',
                                            }}
                                        >
                                            Generating wallet address...
                                        </span>
                                    </div>

                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '1.1rem',
                                }}
                            >
                                <div>
                                    <p
                                        style={{
                                            margin: '0 0 0.3rem',
                                            fontSize: '0.9rem',
                                            fontWeight: 600,
                                            color: 'var(--text-primary)',
                                        }}
                                    >
                                        Choose your first goal
                                    </p>
                                    <p
                                        style={{
                                            margin: 0,
                                            fontSize: '0.8rem',
                                            color: 'var(--text-secondary)',
                                        }}
                                    >
                                        Tell us how you want to use ArthSetu so we can personalise
                                        your dashboard.
                                    </p>
                                </div>
                                <div
                                    style={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(2,minmax(0,1fr))',
                                        gap: '0.9rem',
                                    }}
                                >
                                    <button
                                        type="button"
                                        style={{
                                            borderRadius: 18,
                                            padding: '0.9rem 0.85rem',
                                            border: '1px solid var(--border)',
                                            background: 'var(--surface-hover)',
                                            color: 'var(--text-primary)',
                                            textAlign: 'left',
                                            cursor: 'pointer',
                                            boxShadow: 'var(--shadow-sm)',
                                        }}
                                    >
                                        <p
                                            style={{
                                                margin: 0,
                                                fontSize: '1rem',
                                                fontWeight: 700,
                                            }}
                                        >
                                            I want to Lend
                                        </p>
                                        <p
                                            style={{
                                                margin: '0.3rem 0 0',
                                                fontSize: '0.8rem',
                                                color: 'var(--text-secondary)',
                                            }}
                                        >
                                            Earn steady returns by supporting verified borrowers and
                                            social groups.
                                        </p>
                                    </button>
                                    <button
                                        type="button"
                                        style={{
                                            borderRadius: 18,
                                            padding: '0.9rem 0.85rem',
                                            border: '1px solid var(--border)',
                                            background: 'var(--surface-hover)',
                                            color: 'var(--text-primary)',
                                            textAlign: 'left',
                                            cursor: 'pointer',
                                            boxShadow: 'var(--shadow-sm)',
                                        }}
                                    >
                                        <p
                                            style={{
                                                margin: 0,
                                                fontSize: '1rem',
                                                fontWeight: 700,
                                            }}
                                        >
                                            I want to Borrow
                                        </p>
                                        <p
                                            style={{
                                                margin: '0.3rem 0 0',
                                                fontSize: '0.8rem',
                                                color: 'var(--text-secondary)',
                                            }}
                                        >
                                            Get fair‑priced loans with clear repayment plans and rewards
                                            for good behaviour.
                                        </p>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer nav */}
                    <div
                        style={{
                            marginTop: '1rem',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            gap: '0.75rem',
                        }}
                    >
                        <button
                            type="button"
                            onClick={goPrev}
                            disabled={step === 1}
                            style={{
                                borderRadius: 999,
                                padding: '0.5rem 0.9rem',
                                border: '1px solid var(--border)',
                                background: 'var(--surface)',
                                color: 'var(--text-primary)',
                                fontSize: '0.85rem',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.35rem',
                                cursor: step === 1 ? 'default' : 'pointer',
                                opacity: step === 1 ? 0.5 : 1,
                            }}
                        >
                            <ArrowLeft size={16} />
                            Back
                        </button>
                        <div style={{ flex: 1 }} />
                        <button
                            type="button"
                            onClick={goNext}
                            disabled={step === steps.length}
                            style={{
                                borderRadius: 999,
                                padding: '0.5rem 1.1rem',
                                border: 'none',
                                background:
                                    step === steps.length
                                        ? 'var(--surface-hover)'
                                        : 'linear-gradient(135deg,#2563EB,#22C55E)',
                                color: step === steps.length ? 'var(--text-muted)' : 'white',
                                fontSize: '0.85rem',
                                fontWeight: 600,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.4rem',
                                cursor: step === steps.length ? 'default' : 'pointer',
                                boxShadow:
                                    step === steps.length
                                        ? 'none'
                                        : '0 4px 12px rgba(59,130,246,0.3)',
                            }}
                        >
                            {step === steps.length ? 'Done' : 'Continue'}
                            {step !== steps.length && <ArrowRight size={16} />}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
