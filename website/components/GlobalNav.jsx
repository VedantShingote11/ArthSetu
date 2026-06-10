'use client';

import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
    {
        href: '/',
        label: 'How it Works',
        subItems: [
            { href: '/how-it-works/overview', label: 'How ArthSetu Works' },
            { href: '/about-us/what-we-do', label: 'What ArthSetu Does (And Does Not) Do' },
            { href: '/how-it-works/process', label: 'The Process' },
            { href: '/how-it-works/funds-transfer', label: 'Transfer Of Funds And EMI Payments' },
            { href: '/how-it-works/agreement', label: 'Lender - Borrower Sample Agreement' },
            { href: '/how-it-works/experience', label: 'The ArthSetu Experience' },
        ]
    },
    {
        href: '/',
        label: 'Lenders',
        subItems: [
            { href: '/lenders/who-can-lend', label: 'Who Can Become A Lender?' },
            { href: '/lenders/who-am-i-lending-to', label: 'Who Am I Lending To?' },
            { href: '/lenders/process', label: 'The Process' },
            { href: '/lenders/code-of-conduct', label: 'Code Of Conduct For Lenders' },
            { href: '/lenders/faqs', label: 'Lender FAQs' },
        ]
    },
    {
        href: '/',
        label: 'Borrowers',
        subItems: [
            { href: '/borrowers/loan', label: 'Apply For A Loan' },
            { href: '/borrowers/why-ArthSetu', label: 'Why Borrow On ArthSetu' },
            { href: '/borrowers/criteria', label: 'Borrower Criteria' },
            { href: '/borrowers/who-lends', label: 'From Whom Am I Borrowing?' },
            { href: '/borrowers/process', label: 'The Process' },
            { href: '/borrowers/rates', label: 'Interest Rates And Fees' },
            { href: '/borrowers/faqs', label: 'Borrower FAQs' },
        ]
    },
    { href: '/about-us', label: 'About Us' },
];

function isActive(pathname, href) {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
}

import NavDropdown from './NavDropdown';
import ProfileDropdown from './ProfileDropdown';

import NotificationBell from './NotificationBell';
import ThemeToggle from './ThemeToggle';

export default function GlobalNav() {
    const pathname = usePathname() || '/';
    const { user, logout } = useAuth();

    return (
        <header className="navbar">
            <div className="container flex justify-between items-center">
                <Link href="/" className="flex items-center gap-2" style={{ fontWeight: 700 }}>
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

                <nav
                    className="flex items-center"
                    style={{
                        gap: '0.5rem',
                        height: '100%',
                    }}
                >
                    {links.map((link) => (
                        <NavDropdown
                            key={link.label}
                            item={link}
                            isActive={isActive(pathname, link.href)}
                        />
                    ))}

                    <div className="auth-buttons flex items-center gap-4 ml-4">
                        <ThemeToggle />
                        <NotificationBell />
                        {user ? (
                            <ProfileDropdown user={user} logout={logout} />
                        ) : (
                            <>
                                <Link href="/auth/login?role=admin" className="btn btn-outline" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>Login</Link>
                                <Link href="/auth/register?role=admin" className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>Register</Link>
                            </>
                        )}
                    </div>
                </nav>
            </div>
        </header>
    );
}

