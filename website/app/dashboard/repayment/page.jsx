import StatusBadge from '@/components/StatusBadge';

export const metadata = {
    title: 'Repayment Overview | ArthSetu',
};

const mockRepayments = [
    {
        id: '#PM-2048',
        borrower: 'Self-help Group – Asha',
        dueDate: '15 Feb 2026',
        amount: 4200,
        status: 'paid',
    },
    {
        id: '#PM-2042',
        borrower: 'Street Vendor – Ravi',
        dueDate: '15 Feb 2026',
        amount: 1800,
        status: 'pending',
    },
    {
        id: '#PM-2039',
        borrower: 'Farmer – Meera',
        dueDate: '10 Feb 2026',
        amount: 2500,
        status: 'overdue',
    },
];

export default function RepaymentDashboardPage() {
    return (
        <div style={{ minHeight: '100vh', background: 'var(--background)' }}>
            <div className="container" style={{ padding: '2rem 1rem' }}>
                <div
                    className="card mb-4"
                    style={{
                        padding: '1.5rem 1.75rem',
                    }}
                >
                    <h1 style={{ marginBottom: '0.25rem', fontSize: '1.6rem' }}>Repayment Hub</h1>
                    <p style={{ margin: 0, fontSize: '0.95rem' }}>
                        Track upcoming and past repayments across all active loans.
                    </p>
                </div>

                <div className="card">
                    <div
                        className="card-header"
                        style={{
                            padding: '1.25rem 1.5rem 0.75rem',
                        }}
                    >
                        <h2
                            className="card-title"
                            style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}
                        >
                            Repayment Schedule
                        </h2>
                    </div>

                    <div style={{ padding: '0 1.5rem 1.25rem', overflowX: 'auto' }}>
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Installment</th>
                                    <th>Borrower</th>
                                    <th>Due Date</th>
                                    <th>Amount</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {mockRepayments.map((row) => (
                                    <tr key={row.id}>
                                        <td style={{ fontWeight: 600 }}>{row.id}</td>
                                        <td>{row.borrower}</td>
                                        <td>{row.dueDate}</td>
                                        <td style={{ fontWeight: 600, color: 'var(--primary)' }}>
                                            ₹{row.amount.toLocaleString()}
                                        </td>
                                        <td>
                                            <StatusBadge status={row.status === 'pending' ? 'requested' : row.status} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

