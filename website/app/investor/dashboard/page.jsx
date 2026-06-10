'use client';

import { useState } from 'react';
import {
    LineChart as LineChartIcon,
    PieChart as PieChartIcon,
    Zap,
    RefreshCcw,
    CheckCircle2,
} from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const CALM_BLUE = '#2563EB';
const SAFETY_GREEN = '#16A34A';
const RISK_COLORS = {
    Low: '#10B981',
    Medium: '#FBBF24',
    High: '#F97316',
};

const diversificationData = [
    { name: 'Low', value: 55 },
    { name: 'Medium', value: 30 },
    { name: 'High', value: 15 },
];

const repaymentFeed = [
    {
        id: '#INV‑2048',
        borrower: 'Self‑help Group – Asha',
        amount: 4200,
        date: 'Today, 10:12 AM',
        status: 'On Time',
    },
    {
        id: '#INV‑2041',
        borrower: 'Street Vendor – Ravi',
        amount: 1800,
        date: 'Today, 09:47 AM',
        status: 'Early',
    },
    {
        id: '#INV‑2033',
        borrower: 'Farmer – Meera',
        amount: 2500,
        date: 'Yesterday, 05:18 PM',
        status: 'Auto‑Reinvested',
    },
    {
        id: '#INV‑2029',
        borrower: 'Women Co‑op – Nari Shakti',
        amount: 3600,
        date: 'Yesterday, 02:03 PM',
        status: 'On Time',
    },
];

function StatusTag({ status }) {
    const baseStyle = {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.35rem',
        padding: '0.15rem 0.6rem',
        borderRadius: 999,
        fontSize: '0.75rem',
        fontWeight: 600,
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
    };

    if (status === 'On Time') {
        return (
            <span
                style={{
                    ...baseStyle,
                    background: 'rgba(22, 163, 74, 0.08)',
                    color: SAFETY_GREEN,
                }}
            >
                <CheckCircle2 size={14} />
                {status}
            </span>
        );
    }

    if (status === 'Early') {
        return (
            <span
                style={{
                    ...baseStyle,
                    background: 'rgba(37, 99, 235, 0.08)',
                    color: CALM_BLUE,
                }}
            >
                <Zap size={14} />
                {status}
            </span>
        );
    }

    return (
        <span
            style={{
                ...baseStyle,
                background: 'rgba(56, 189, 248, 0.08)',
                color: '#0EA5E9',
            }}
        >
            <RefreshCcw size={14} />
            {status}
        </span>
    );
}

export default function InvestorDashboard() {
    const [autoPilotEnabled, setAutoPilotEnabled] = useState(true);

    const handleToggleAutoPilot = () => {
        setAutoPilotEnabled((prev) => !prev);
        // In a real app this would call an API to update smart‑contract strategy
    };

    return (
        <div style={{ minHeight: '100vh', background: 'var(--background)' }}>
            <div className="container" style={{ padding: '2.5rem 1.5rem 3rem' }}>
                {/* Header */}
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '1.75rem',
                        gap: '1rem',
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div
                            style={{
                                width: 40,
                                height: 40,
                                borderRadius: '999px',
                                background: 'rgba(37, 99, 235, 0.08)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <LineChartIcon size={22} color={CALM_BLUE} />
                        </div>
                        <div>
                            <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 700 }}>
                                Investor Dashboard
                            </h1>
                            <p
                                style={{
                                    margin: '0.25rem 0 0',
                                    color: '#64748b',
                                    fontSize: '0.9rem',
                                }}
                            >
                                Track your P2P portfolio, repayments, and auto‑reinvestment in one place.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Hero metrics */}
                <div
                    className="card fade-in"
                    style={{
                        display: 'grid',
                        gridTemplateColumns: '2fr 1.5fr',
                        gap: '2rem',
                        padding: '1.9rem 1.75rem',
                        borderRadius: '1.25rem',
                        boxShadow: '0 16px 40px rgba(15, 23, 42, 0.08)',
                        borderTop: `4px solid ${CALM_BLUE}`,
                        marginBottom: '2rem',
                    }}
                >
                    <div>
                        <p
                            style={{
                                fontSize: '0.8rem',
                                textTransform: 'uppercase',
                                letterSpacing: '0.08em',
                                color: '#94a3b8',
                                marginBottom: '0.5rem',
                            }}
                        >
                            Total Value Locked
                        </p>
                        <h2
                            style={{
                                margin: 0,
                                fontSize: '2.4rem',
                                fontWeight: 800,
                            }}
                        >
                            ₹ 32,80,000
                        </h2>
                        <p
                            style={{
                                margin: '0.5rem 0 0',
                                color: '#64748b',
                                fontSize: '0.95rem',
                            }}
                        >
                            Capital currently deployed into micro‑loans across verified borrowers.
                        </p>
                    </div>
                    <div style={{ borderLeft: '1px solid #e2e8f0', paddingLeft: '1.75rem' }}>
                        <p
                            style={{
                                fontSize: '0.8rem',
                                textTransform: 'uppercase',
                                letterSpacing: '0.08em',
                                color: '#94a3b8',
                                marginBottom: '0.5rem',
                            }}
                        >
                            Net Annual Yield
                        </p>
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'baseline',
                                gap: '0.35rem',
                            }}
                        >
                            <span
                                style={{
                                    fontSize: '2.4rem',
                                    fontWeight: 800,
                                    color: SAFETY_GREEN,
                                }}
                            >
                                13.2%
                            </span>
                            <span
                                style={{
                                    fontSize: '0.9rem',
                                    color: '#16a34a',
                                    fontWeight: 600,
                                }}
                            >
                                +0.4% vs last month
                            </span>
                        </div>
                        <p
                            style={{
                                margin: '0.4rem 0 0',
                                color: '#64748b',
                                fontSize: '0.9rem',
                            }}
                        >
                            After fees, write‑offs, and auto‑reinvestment using your current strategy.
                        </p>
                    </div>
                </div>

                {/* Main layout */}
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'minmax(0, 3.2fr) minmax(260px, 1.5fr)',
                        gap: '1.5rem',
                    }}
                >
                    {/* Left column: chart + feed */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        {/* Diversification Donut Chart */}
                        <div className="card fade-in" style={{ padding: '1.4rem 1.5rem' }}>
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    marginBottom: '0.75rem',
                                }}
                            >
                                <div
                                    style={{
                                        width: 28,
                                        height: 28,
                                        borderRadius: '999px',
                                        background: 'rgba(37, 99, 235, 0.08)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <PieChartIcon size={16} color={CALM_BLUE} />
                                </div>
                                <h3
                                    style={{
                                        margin: 0,
                                        fontSize: '1rem',
                                        fontWeight: 600,
                                    }}
                                >
                                    Diversification by Risk Bucket
                                </h3>
                            </div>
                            <p
                                style={{
                                    margin: '0 0 0.9rem',
                                    color: '#64748b',
                                    fontSize: '0.9rem',
                                }}
                            >
                                Your funds are spread across low, medium, and high‑risk loans to balance
                                stability and yield.
                            </p>

                            <div style={{ width: '100%', height: 260 }}>
                                <ResponsiveContainer>
                                    <PieChart>
                                        <Pie
                                            data={diversificationData}
                                            innerRadius={60}
                                            outerRadius={90}
                                            paddingAngle={3}
                                            dataKey="value"
                                            nameKey="name"
                                        >
                                            {diversificationData.map((entry) => (
                                                <Cell
                                                    key={entry.name}
                                                    fill={RISK_COLORS[entry.name]}
                                                />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            formatter={(value, name) => [`${value}%`, `${name} risk`]}
                                        />
                                        <Legend
                                            verticalAlign="middle"
                                            align="right"
                                            layout="vertical"
                                            iconType="circle"
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Repayment Feed */}
                        <div className="card fade-in" style={{ padding: '1.4rem 1.5rem' }}>
                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginBottom: '0.75rem',
                                }}
                            >
                                <div
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                    }}
                                >
                                    <div
                                        style={{
                                            width: 28,
                                            height: 28,
                                            borderRadius: '999px',
                                            background: 'rgba(22, 163, 74, 0.08)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        <RefreshCcw size={16} color={SAFETY_GREEN} />
                                    </div>
                                    <h3
                                        style={{
                                            margin: 0,
                                            fontSize: '1rem',
                                            fontWeight: 600,
                                        }}
                                    >
                                        Live Repayment Feed
                                    </h3>
                                </div>
                                <span
                                    style={{
                                        fontSize: '0.8rem',
                                        color: '#94a3b8',
                                    }}
                                >
                                    Last updated: just now
                                </span>
                            </div>
                            <p
                                style={{
                                    margin: '0 0 0.75rem',
                                    color: '#64748b',
                                    fontSize: '0.9rem',
                                }}
                            >
                                Incoming installments flow into your vault and can be auto‑reinvested into
                                new loans.
                            </p>

                            <div
                                style={{
                                    borderRadius: '0.9rem',
                                    border: '1px solid #e2e8f0',
                                    overflow: 'hidden',
                                }}
                            >
                                <table
                                    style={{
                                        width: '100%',
                                        borderCollapse: 'collapse',
                                        fontSize: '0.85rem',
                                    }}
                                >
                                    <thead
                                        style={{
                                            background: '#f8fafc',
                                            textAlign: 'left',
                                        }}
                                    >
                                        <tr>
                                            <th style={{ padding: '0.6rem 0.85rem', color: '#64748b' }}>
                                                Investment
                                            </th>
                                            <th style={{ padding: '0.6rem 0.85rem', color: '#64748b' }}>
                                                Borrower
                                            </th>
                                            <th style={{ padding: '0.6rem 0.85rem', color: '#64748b' }}>
                                                Amount
                                            </th>
                                            <th style={{ padding: '0.6rem 0.85rem', color: '#64748b' }}>
                                                Time
                                            </th>
                                            <th style={{ padding: '0.6rem 0.85rem', color: '#64748b' }}>
                                                Status
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {repaymentFeed.map((row, idx) => (
                                            <tr
                                                key={row.id}
                                                style={{
                                                    borderTop: '1px solid #e2e8f0',
                                                    background:
                                                        idx % 2 === 0 ? '#ffffff' : '#f9fafb',
                                                }}
                                            >
                                                <td
                                                    style={{
                                                        padding: '0.55rem 0.85rem',
                                                        fontWeight: 600,
                                                        color: '#0f172a',
                                                    }}
                                                >
                                                    {row.id}
                                                </td>
                                                <td
                                                    style={{
                                                        padding: '0.55rem 0.85rem',
                                                        color: '#475569',
                                                    }}
                                                >
                                                    {row.borrower}
                                                </td>
                                                <td
                                                    style={{
                                                        padding: '0.55rem 0.85rem',
                                                        color: '#0f172a',
                                                        fontWeight: 600,
                                                    }}
                                                >
                                                    ₹{row.amount.toLocaleString()}
                                                </td>
                                                <td
                                                    style={{
                                                        padding: '0.55rem 0.85rem',
                                                        color: '#64748b',
                                                    }}
                                                >
                                                    {row.date}
                                                </td>
                                                <td
                                                    style={{
                                                        padding: '0.55rem 0.85rem',
                                                    }}
                                                >
                                                    <StatusTag status={row.status} />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Right column: Auto‑Pilot sidebar */}
                    <aside className="card fade-in" style={{ padding: '1.4rem 1.5rem' }}>
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '0.9rem',
                            }}
                        >
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                }}
                            >
                                <div
                                    style={{
                                        width: 28,
                                        height: 28,
                                        borderRadius: '999px',
                                        background: 'rgba(16, 185, 129, 0.12)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <Zap size={16} color={SAFETY_GREEN} />
                                </div>
                                <h3
                                    style={{
                                        margin: 0,
                                        fontSize: '1rem',
                                        fontWeight: 600,
                                    }}
                                >
                                    Auto‑Pilot
                                </h3>
                            </div>
                            {/* Toggle switch */}
                            <button
                                type="button"
                                onClick={handleToggleAutoPilot}
                                aria-pressed={autoPilotEnabled}
                                style={{
                                    position: 'relative',
                                    width: 54,
                                    height: 30,
                                    borderRadius: 999,
                                    border: 'none',
                                    padding: 0,
                                    background: autoPilotEnabled
                                        ? SAFETY_GREEN
                                        : '#e2e8f0',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    transition: 'background 0.18s ease',
                                }}
                            >
                                <span
                                    style={{
                                        position: 'absolute',
                                        left: autoPilotEnabled ? 28 : 4,
                                        width: 22,
                                        height: 22,
                                        borderRadius: '50%',
                                        background: '#ffffff',
                                        boxShadow: '0 2px 6px rgba(15, 23, 42, 0.25)',
                                        transition: 'left 0.18s ease',
                                    }}
                                />
                            </button>
                        </div>
                        <p
                            style={{
                                margin: '0 0 0.75rem',
                                color: '#64748b',
                                fontSize: '0.9rem',
                            }}
                        >
                            Automatically reinvest repayments into new loans that match your chosen risk
                            buckets using smart contracts.
                        </p>

                        <ul
                            style={{
                                margin: '0 0 0.9rem 1.1rem',
                                padding: 0,
                                color: '#475569',
                                fontSize: '0.9rem',
                                listStyle: 'disc',
                            }}
                        >
                            <li>Distributes capital across Low, Medium, and High risk buckets.</li>
                            <li>Targets stable yield while limiting over‑exposure to any single borrower.</li>
                            <li>All rules are executed on‑chain, without manual intervention.</li>
                        </ul>

                        <div
                            style={{
                                padding: '0.75rem 0.9rem',
                                borderRadius: '0.85rem',
                                background: 'rgba(37, 99, 235, 0.04)',
                                border: '1px dashed rgba(37, 99, 235, 0.25)',
                                fontSize: '0.8rem',
                                color: '#475569',
                            }}
                        >
                            <strong
                                style={{
                                    display: 'block',
                                    marginBottom: '0.15rem',
                                    fontSize: '0.8rem',
                                }}
                            >
                                {autoPilotEnabled ? 'Auto‑Pilot is ON' : 'Auto‑Pilot is OFF'}
                            </strong>
                            {autoPilotEnabled
                                ? 'New repayments will be routed into your smart‑contract strategy automatically.'
                                : 'Repayments will accumulate in your vault until you choose where to invest.'}
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
}

