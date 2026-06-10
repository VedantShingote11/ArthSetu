'use client';

import { useEffect, useRef } from 'react';

/**
 * AltchaWidget — wraps the <altcha-widget> Web Component for React/Next.js.
 *
 * Props:
 *   onVerified(payload: string) — called when the user passes the challenge.
 *   onError()                  — called if the challenge fails.
 */
export default function AltchaWidget({ onVerified, onError }) {
    const ref = useRef(null);

    useEffect(() => {
        // Dynamically import the altcha web component (client-side only)
        import('altcha').catch(() => {
            // The package registers the <altcha-widget> custom element globally.
            // If import fails, the widget simply won't render — graceful degradation.
        });

        const el = ref.current;
        if (!el) return;

        const handleStateChange = (e) => {
            const { state, payload } = e.detail || {};
            if (state === 'verified' && payload) {
                onVerified?.(payload);
            } else if (state === 'error') {
                onError?.();
            }
        };

        el.addEventListener('statechange', handleStateChange);
        return () => el.removeEventListener('statechange', handleStateChange);
    }, [onVerified, onError]);

    return (
        <altcha-widget
            ref={ref}
            challengeurl="/api/altcha/challenge"
            style={{
                '--altcha-color-base': 'var(--surface)',
                '--altcha-color-border': 'var(--border)',
                '--altcha-color-text': 'var(--text-primary)',
                '--altcha-color-link': 'var(--primary)',
                '--altcha-color-footer-bg': 'var(--surface)',
                borderRadius: '8px',
                width: '100%',
            }}
        />
    );
}
