'use client';

import { useState, useEffect, useRef } from 'react';
import { Bell, X, Check } from 'lucide-react';

export default function NotificationBell() {
    const [notifications, setNotifications] = useState([
        { id: 1, message: "Welcome to ArthSetu!", time: "Just now", read: false },
        { id: 2, message: "Complete your profile to start.", time: "1 hour ago", read: false },
        { id: 3, message: "New loan offers available.", time: "2 hours ago", read: false }
    ]);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const unreadCount = notifications.filter(n => !n.read).length;

    const handleBellClick = () => {
        setIsOpen(!isOpen);
    };

    const markAsRead = (id) => {
        setNotifications(notifications.map(n =>
            n.id === id ? { ...n, read: true } : n
        ));
    };

    const markAllAsRead = () => {
        setNotifications(notifications.map(n => ({ ...n, read: true })));
    };

    const clearNotification = (id) => {
        setNotifications(notifications.filter(n => n.id !== id));
    };

    return (
        <div ref={dropdownRef} className="relative">
            <button
                onClick={handleBellClick}
                className="icon-btn"
                aria-label="Notifications"
                style={{ position: 'relative' }}
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span
                        style={{
                            position: 'absolute',
                            top: '4px',
                            right: '4px',
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            backgroundColor: 'var(--error)',
                            border: '1px solid var(--surface)'
                        }}
                    />
                )}
            </button>

            {isOpen && (
                <div
                    style={{
                        position: 'absolute',
                        right: 0,
                        top: '100%',
                        marginTop: '0.5rem',
                        width: '20rem',
                        backgroundColor: 'var(--surface)',
                        borderRadius: '0.5rem',
                        boxShadow: 'var(--shadow-lg)',
                        border: '1px solid var(--border)',
                        overflow: 'hidden',
                        zIndex: 50,
                        animation: 'bounceIn 0.3s cubic-bezier(0.68, -0.55, 0.27, 1.55)'
                    }}
                >
                    <div style={{
                        padding: '0.75rem',
                        borderBottom: '1px solid var(--border)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <h3 style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)', margin: 0 }}>Notifications</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer' }}
                            >
                                Mark all read
                            </button>
                        )}
                    </div>

                    <div style={{ maxHeight: '20rem', overflowY: 'auto' }}>
                        {notifications.length === 0 ? (
                            <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                                No notifications
                            </div>
                        ) : (
                            notifications.map(notification => (
                                <div
                                    key={notification.id}
                                    style={{
                                        padding: '0.75rem',
                                        borderBottom: '1px solid var(--surface-hover)',
                                        display: 'flex',
                                        gap: '0.75rem',
                                        opacity: notification.read ? 0.6 : 1,
                                        backgroundColor: 'var(--surface)',
                                        transition: 'background-color 0.2s'
                                    }}
                                    className="hover-bg-surface-hover"
                                >
                                    <div style={{ marginTop: '0.25rem', flexShrink: 0 }}>
                                        <div style={{ width: '0.5rem', height: '0.5rem', borderRadius: '50%', backgroundColor: notification.read ? 'var(--text-muted)' : 'var(--primary)' }}></div>
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <p style={{ fontSize: '0.875rem', color: 'var(--text-primary)', margin: 0 }}>{notification.message}</p>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem', margin: 0 }}>{notification.time}</p>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                        {!notification.read && (
                                            <button
                                                onClick={() => markAsRead(notification.id)}
                                                style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem' }}
                                                title="Mark as read"
                                            >
                                                <Check size={14} />
                                            </button>
                                        )}
                                        <button
                                            onClick={() => clearNotification(notification.id)}
                                            style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem' }}
                                            title="Dismiss"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            <style jsx>{`
                @keyframes bounceIn {
                    0% { transform: scale(0.9); opacity: 0; }
                    100% { transform: scale(1); opacity: 1; }
                }
            `}</style>
        </div>
    );
}
