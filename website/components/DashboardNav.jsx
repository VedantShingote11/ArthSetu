'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function DashboardNav({ title, user, logoutPath = '/' }) {
    const router = useRouter();

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push(logoutPath);
    };

    return (
        <nav className="navbar" style={{
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
            borderBottom: '1px solid var(--border)',
            position: 'sticky',
            top: 0,
            zIndex: 100
        }}>
            <div className="container flex justify-between items-center">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <Link href="/" className="flex items-center gap-2" style={{ fontWeight: 700, textDecoration: 'none' }}>
                        <img
                            src="/assets/img/Final_Logo.webp"
                            alt="ArthSetu Logo"
                            style={{ height: '32px', width: 'auto' }}
                        />
                        <img
                            src="/assets/img/Final_Header.webp"
                            alt="ArthSetu"
                            style={{ height: '28px', width: 'auto' }}
                        />
                    </Link>

                    <div style={{ width: '1px', height: '20px', background: 'var(--border)' }}></div>

                    <h2 style={{
                        margin: 0,
                        fontSize: '1.1rem',
                        fontWeight: '600',
                        color: 'var(--text-secondary)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}>
                        {title}
                    </h2>
                </div>

                <div className="flex items-center gap-4">
                    {user && (
                        <div style={{ textAlign: 'right', display: 'none', md: 'block' }} className="hidden md:block">
                            <p style={{ fontSize: '0.85rem', fontWeight: '600', margin: 0 }}>{user.name}</p>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0, textTransform: 'capitalize' }}>{user.role}</p>
                        </div>
                    )}

                    <button
                        onClick={handleLogout}
                        className="btn btn-outline btn-sm"
                        style={{ padding: '0.5rem 1rem' }}
                    >
                        Logout
                    </button>
                </div>
            </div>
        </nav>
    );
}
