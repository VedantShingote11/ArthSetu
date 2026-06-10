'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export default function NavDropdown({ item, isActive }) {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();

    const hasSubItems = item.subItems && item.subItems.length > 0;

    return (
        <div
            className="nav-item-container"
            onMouseEnter={() => setIsOpen(true)}
            onMouseLeave={() => setIsOpen(false)}
        >
            <Link
                href={item.href || '#'}
                className={`nav-link ${isActive ? 'active' : ''}`}
            >
                {item.label}
                {hasSubItems && <span className="dropdown-arrow">▼</span>}
            </Link>

            {hasSubItems && (
                <div className={`dropdown-menu ${isOpen ? 'show' : ''}`}>
                    {item.subItems.map((subItem, index) => (
                        <Link
                            key={index}
                            href={subItem.href || '#'}
                            className="dropdown-item"
                        >
                            {subItem.label}
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
