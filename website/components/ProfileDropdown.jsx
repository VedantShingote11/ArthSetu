'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { User, Settings, HelpCircle, LogOut, LayoutDashboard, ChevronDown } from 'lucide-react';

export default function ProfileDropdown({ user, logout }) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const toggleDropdown = () => setIsOpen(!isOpen);

    const getDashboardLink = () => {
        if (!user) return '/dashboard';
        return `/${user.role}/dashboard`;
    };

    const getProfileLink = () => {
        if (!user) return '/profile';
        // Admin doesn't have a specific profile page yet, defaulting to dashboard or settings
        if (user.role === 'admin') return '/admin/dashboard';
        if (user.role === 'lender') return '/lender/portfolio'; // Lender profile/portfolio
        return `/${user.role}/profile`;
    };

    return (
        <div style={{ position: 'relative' }} ref={dropdownRef}>
            <button
                onClick={toggleDropdown}
                className="btn"
                style={{
                    padding: '0.25rem 0.75rem',
                    borderRadius: '999px',
                    background: isOpen ? 'var(--surface-hover)' : 'transparent',
                    border: '1px solid transparent',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface-hover)'}
                onMouseLeave={(e) => !isOpen && (e.currentTarget.style.background = 'transparent')}
            >
                <div
                    style={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        background: 'var(--gradient-primary)',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1rem',
                        fontWeight: 600,
                    }}
                >
                    {user.name ? user.name.charAt(0).toUpperCase() : <User size={16} />}
                </div>
                <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column' }} className="hidden-mobile">
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, lineHeight: 1, color: 'var(--text-primary)' }}>{user.name || 'User'}</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', lineHeight: 1, textTransform: 'capitalize' }}>{user.role}</span>
                </div>
                <ChevronDown size={14} style={{ color: 'var(--text-muted)', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
            </button>

            {/* Dropdown Menu */}
            <div
                className={`dropdown-menu ${isOpen ? 'show' : ''}`}
                style={{
                    minWidth: '220px',
                    right: 0,
                    left: 'auto',
                    marginTop: '0.5rem',
                    padding: '0.5rem 0',
                }}
            >
                <Link
                    href={getDashboardLink()}
                    className="dropdown-item"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}
                    onClick={() => setIsOpen(false)}
                >
                    <LayoutDashboard size={16} style={{ color: 'var(--info)' }} />
                    Dashboard
                </Link>
                <Link
                    href={getProfileLink()}
                    className="dropdown-item"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}
                    onClick={() => setIsOpen(false)}
                >
                    <User size={16} style={{ color: 'var(--success)' }} />
                    Profile
                </Link>
                <Link
                    href="/settings"
                    className="dropdown-item"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}
                    onClick={() => setIsOpen(false)}
                >
                    <Settings size={16} style={{ color: 'var(--text-secondary)' }} />
                    Settings
                </Link>
                <Link
                    href="/help"
                    className="dropdown-item"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}
                    onClick={() => setIsOpen(false)}
                >
                    <HelpCircle size={16} style={{ color: 'var(--text-secondary)' }} />
                    Help & Support
                </Link>

                <div style={{ borderTop: '1px solid var(--border)', margin: '0.5rem 0' }}></div>

                <button
                    onClick={() => {
                        logout();
                        setIsOpen(false);
                    }}
                    className="dropdown-item"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        width: '100%',
                        textAlign: 'left',
                        color: 'var(--error)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer'
                    }}
                >
                    <LogOut size={16} />
                    Logout
                </button>
            </div>
        </div>
    );
}
