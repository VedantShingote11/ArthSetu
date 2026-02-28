'use client';

import { useState } from 'react';
import { Bot, Mic, Play, Video, ListOrdered, Sparkles } from 'lucide-react';

const PRIMARY = '#2563EB';
const SOFT_BG = '#0F172A';

export default function ArthSetuPage() {
    const [input, setInput] = useState('');
    const [messages] = useState([
        {
            id: 1,
            role: 'assistant',
            content:
                "Namaste, I'm ArthSetu, your financial guide. Ask me anything about loans, repayments, or investments.",
        },
    ]);
    const [showVideo, setShowVideo] = useState(false);
    const [showChecklist, setShowChecklist] = useState(false);

    const handleSend = () => {
        if (!input.trim()) return;
        // In a real app this would append a user message and call the AI backend
        setInput('');
    };

    const latestAssistant = messages.filter((m) => m.role === 'assistant').slice(-1)[0];

    return (
        <div
            style={{
                minHeight: '100vh',
                background: 'var(--background)',
            }}
        >
            <div className="container" style={{ padding: '2rem 1.5rem' }}>
                <h1 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: '0.75rem' }}>
                    ArthSetu Assistant (Demo)
                </h1>
                <p style={{ maxWidth: 560, color: '#64748b', fontSize: '0.9rem' }}>
                    This page previews the floating ArthSetu AI assistant interface with voice and
                    step‑by‑step help. In your app, you can mount this widget globally.
                </p>
            </div>

            {/* Floating assistant */}
            <div
                style={{
                    position: 'fixed',
                    right: 24,
                    bottom: 24,
                    zIndex: 40,
                }}
            >
                <div
                    style={{
                        width: 360,
                        maxWidth: '100vw',
                        borderRadius: 24,
                        background: SOFT_BG,
                        boxShadow:
                            '0 24px 60px rgba(15,23,42,0.85), 0 0 0 1px rgba(148,163,184,0.45)',
                        color: '#E5E7EB',
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden',
                    }}
                >
                    {/* Header with mascot */}
                    <div
                        style={{
                            padding: '0.8rem 0.9rem 0.75rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '0.75rem',
                            background:
                                'radial-gradient(circle at top left,rgba(56,189,248,0.2),rgba(15,23,42,1))',
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                            <div
                                style={{
                                    width: 34,
                                    height: 34,
                                    borderRadius: '999px',
                                    background:
                                        'radial-gradient(circle,#22C55E,#16A34A)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: '0 0 14px rgba(22,163,74,0.9)',
                                }}
                            >
                                <Bot size={18} color="#ECFDF5" />
                            </div>
                            <div>
                                <div
                                    style={{
                                        fontSize: '0.9rem',
                                        fontWeight: 700,
                                    }}
                                >
                                    ArthSetu
                                </div>
                                <div
                                    style={{
                                        fontSize: '0.78rem',
                                        color: '#CBD5F5',
                                    }}
                                >
                                    Your helpful money guide
                                </div>
                            </div>
                        </div>
                        <div
                            style={{
                                fontSize: '0.72rem',
                                color: '#A5B4FC',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.2rem',
                            }}
                        >
                            <Sparkles size={14} />
                            <span>Live</span>
                        </div>
                    </div>

                    {/* Chat area */}
                    <div
                        style={{
                            position: 'relative',
                            padding: '0.8rem 0.8rem 0.4rem',
                            background:
                                'radial-gradient(circle at top,rgba(15,23,42,1),rgba(15,23,42,0.96))',
                        }}
                    >
                        {/* Video pop‑up */}
                        {showVideo && (
                            <div
                                style={{
                                    position: 'absolute',
                                    top: 8,
                                    right: 8,
                                    width: 180,
                                    borderRadius: 14,
                                    overflow: 'hidden',
                                    background: '#020617',
                                    boxShadow:
                                        '0 16px 35px rgba(15,23,42,0.9), 0 0 0 1px rgba(148,163,184,0.5)',
                                    zIndex: 10,
                                }}
                            >
                                <div
                                    style={{
                                        padding: '0.45rem 0.6rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        gap: '0.4rem',
                                        background:
                                            'linear-gradient(135deg,#0F172A,#1F2937)',
                                        fontSize: '0.75rem',
                                    }}
                                >
                                    <span>Guide: How it works</span>
                                    <button
                                        type="button"
                                        onClick={() => setShowVideo(false)}
                                        style={{
                                            border: 'none',
                                            background: 'transparent',
                                            color: '#9CA3AF',
                                            cursor: 'pointer',
                                            fontSize: '0.75rem',
                                        }}
                                    >
                                        ✕
                                    </button>
                                </div>
                                <div
                                    style={{
                                        height: 110,
                                        background:
                                            'radial-gradient(circle at center,#1D4ED8,#0F172A)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: '#BFDBFE',
                                        fontSize: '0.78rem',
                                        textAlign: 'center',
                                        padding: '0.5rem',
                                    }}
                                >
                                    Video placeholder<br />
                                    (embed explainer here)
                                </div>
                            </div>
                        )}

                        <div
                            style={{
                                maxHeight: 220,
                                overflowY: 'auto',
                                paddingRight: '0.25rem',
                            }}
                        >
                            {messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    style={{
                                        marginBottom: '0.6rem',
                                        display: 'flex',
                                        justifyContent:
                                            msg.role === 'user' ? 'flex-end' : 'flex-start',
                                    }}
                                >
                                    <div
                                        style={{
                                            maxWidth: '85%',
                                            padding: '0.6rem 0.8rem',
                                            borderRadius: 16,
                                            background:
                                                msg.role === 'user'
                                                    ? PRIMARY
                                                    : 'rgba(15,23,42,0.95)',
                                            color:
                                                msg.role === 'user'
                                                    ? 'white'
                                                    : '#E5E7EB',
                                            fontSize: '0.85rem',
                                            lineHeight: 1.35,
                                            border:
                                                msg.role === 'assistant'
                                                    ? '1px solid rgba(148,163,184,0.7)'
                                                    : 'none',
                                        }}
                                    >
                                        {msg.content}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Assistant response actions */}
                        {latestAssistant && (
                            <div
                                style={{
                                    marginTop: '0.4rem',
                                    paddingTop: '0.35rem',
                                    borderTop: '1px solid rgba(31,41,55,0.9)',
                                    display: 'flex',
                                    gap: '0.4rem',
                                    flexWrap: 'wrap',
                                }}
                            >
                                <button
                                    type="button"
                                    style={{
                                        flex: 1,
                                        minWidth: 0,
                                        borderRadius: 999,
                                        border: '1px solid rgba(59,130,246,0.8)',
                                        background: 'rgba(15,23,42,0.9)',
                                        color: '#BFDBFE',
                                        fontSize: '0.78rem',
                                        padding: '0.35rem 0.6rem',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.3rem',
                                        cursor: 'pointer',
                                    }}
                                >
                                    <Play size={14} />
                                    <span>Play Audio</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowVideo((v) => !v)}
                                    style={{
                                        flex: 1,
                                        minWidth: 0,
                                        borderRadius: 999,
                                        border: '1px solid rgba(251,191,36,0.8)',
                                        background: 'rgba(15,23,42,0.9)',
                                        color: '#FEF3C7',
                                        fontSize: '0.78rem',
                                        padding: '0.35rem 0.6rem',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.3rem',
                                        cursor: 'pointer',
                                    }}
                                >
                                    <Video size={14} />
                                    <span>Watch Guide</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowChecklist((c) => !c)}
                                    style={{
                                        flexBasis: '100%',
                                        borderRadius: 999,
                                        border: '1px solid rgba(34,197,94,0.8)',
                                        background: 'rgba(15,23,42,0.9)',
                                        color: '#BBF7D0',
                                        fontSize: '0.78rem',
                                        padding: '0.35rem 0.6rem',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.3rem',
                                        cursor: 'pointer',
                                    }}
                                >
                                    <ListOrdered size={14} />
                                    <span>Step‑by‑Step</span>
                                </button>
                            </div>
                        )}

                        {/* Step‑by‑step checklist */}
                        {showChecklist && (
                            <div
                                style={{
                                    marginTop: '0.5rem',
                                    borderRadius: 14,
                                    border: '1px solid rgba(34,197,94,0.65)',
                                    background: 'rgba(6,78,59,0.95)',
                                    padding: '0.5rem 0.7rem',
                                    fontSize: '0.78rem',
                                    color: '#E5E7EB',
                                }}
                            >
                                <div
                                    style={{
                                        fontWeight: 600,
                                        marginBottom: '0.25rem',
                                    }}
                                >
                                    Step‑by‑step checklist
                                </div>
                                <ol
                                    style={{
                                        margin: 0,
                                        paddingLeft: '1.1rem',
                                        display: 'grid',
                                        gap: '0.1rem',
                                    }}
                                >
                                    <li>Confirm your goal (borrow, repay, or invest).</li>
                                    <li>Share key details like amount and duration.</li>
                                    <li>Review a clear summary of your options.</li>
                                    <li>Follow the recommended next step on screen.</li>
                                </ol>
                            </div>
                        )}
                    </div>

                    {/* Input area with microphone */}
                    <div
                        style={{
                            padding: '0.7rem 0.8rem 0.75rem',
                            borderTop: '1px solid rgba(15,23,42,1)',
                            background: '#020617',
                        }}
                    >
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.6rem',
                            }}
                        >
                            {/* Large microphone button */}
                            <button
                                type="button"
                                style={{
                                    width: 44,
                                    height: 44,
                                    borderRadius: '999px',
                                    border: 'none',
                                    background:
                                        'radial-gradient(circle,#22C55E,#15803D)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow:
                                        '0 0 16px rgba(34,197,94,0.9), 0 10px 25px rgba(15,23,42,0.9)',
                                    cursor: 'pointer',
                                }}
                                aria-label="Hold to speak with ArthSetu"
                            >
                                <Mic size={20} color="#ECFDF5" />
                            </button>

                            {/* Text input */}
                            <div style={{ flex: 1, display: 'flex', gap: '0.4rem' }}>
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                    placeholder="Ask ArthSetu about your money..."
                                    style={{
                                        flex: 1,
                                        borderRadius: 999,
                                        border: '1px solid rgba(55,65,81,0.9)',
                                        background: 'rgba(15,23,42,0.95)',
                                        padding: '0.55rem 0.85rem',
                                        fontSize: '0.83rem',
                                        color: '#E5E7EB',
                                        outline: 'none',
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={handleSend}
                                    disabled={!input.trim()}
                                    style={{
                                        borderRadius: 999,
                                        padding: '0.55rem 0.9rem',
                                        border: 'none',
                                        background: PRIMARY,
                                        color: 'white',
                                        fontSize: '0.8rem',
                                        fontWeight: 600,
                                        cursor: input.trim() ? 'pointer' : 'default',
                                        opacity: input.trim() ? 1 : 0.5,
                                    }}
                                >
                                    Send
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

