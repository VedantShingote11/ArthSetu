import { createChallenge } from 'altcha';
import { NextResponse } from 'next/server';

// A secret HMAC key — in production, move this to an environment variable
const HMAC_KEY = process.env.ALTCHA_HMAC_KEY || 'arthasetu-altcha-secret-key-2025';

export async function GET() {
    try {
        const challenge = await createChallenge({
            hmacKey: HMAC_KEY,
            maxNumber: 50000, // Proof-of-work complexity (higher = harder)
        });
        return NextResponse.json(challenge);
    } catch (err) {
        console.error('Altcha challenge error:', err);
        return NextResponse.json({ error: 'Failed to create challenge' }, { status: 500 });
    }
}
