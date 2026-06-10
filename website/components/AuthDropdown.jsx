'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function AuthDropdown({ label, type }) {
    const [isOpen, setIsOpen] = useState(false);
    const baseRoute = type === 'register' ? '/auth/register' : '/auth/login';

    return (
        <div
            className="auth-dropdown-container"
            style={{ position: 'relative' }}
            onMouseEnter={() => setIsOpen(true)}
            onMouseLeave={() => setIsOpen(false)}
        >
            <button className={`btn-auth-${type}`} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                {label} <span style={{ fontSize: '0.7em' }}>▼</span>
            </button>

            <div className={`dropdown-menu ${isOpen ? 'show' : ''}`} style={{
                minWidth: '160px',
                right: 0,
                left: 'auto',
                top: '100%',
                marginTop: '0.5rem'
            }}>
                <Link href={`${baseRoute}?role=borrower`} className="dropdown-item">
                    As Borrower
                </Link>
                <Link href={`${baseRoute}?role=lender`} className="dropdown-item">
                    As Lender
                </Link>
            </div>
        </div>
    );
}
