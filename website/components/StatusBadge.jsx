export default function StatusBadge({ status }) {
    const statusConfig = {
        // KYC Status
        not_started: { label: 'Not Started', className: 'badge-warning', icon: '📝' },
        documents_uploaded: { label: 'Documents Uploaded', className: 'badge-info', icon: '📎' },
        submitted: { label: 'Submitted', className: 'badge-warning', icon: '⏳' },
        pending: { label: 'Pending', className: 'badge-warning', icon: '⏳' },
        approved: { label: 'Approved', className: 'badge-success', icon: '✅' },
        rejected: { label: 'Rejected', className: 'badge-error', icon: '❌' },
        verified: { label: 'Verified', className: 'badge-success', icon: '✅' },

        // Loan Status
        requested: { label: 'Requested', className: 'badge-info', icon: '📋' },
        funded: { label: 'Funded', className: 'badge-success', icon: '💰' },
        active: { label: 'Active', className: 'badge-success', icon: '🔄' },
        repaid: { label: 'Repaid', className: 'badge-success', icon: '✅' },
        defaulted: { label: 'Defaulted', className: 'badge-error', icon: '⚠️' },

        // Repayment Status
        paid: { label: 'Paid', className: 'badge-success', icon: '✅' },
        overdue: { label: 'Overdue', className: 'badge-error', icon: '⏰' },
    };

    const config = statusConfig[status] || { label: status, className: 'badge-info', icon: '📌' };

    return (
        <span className={`badge ${config.className}`} style={{
            fontWeight: '600',
            padding: '0.5rem 0.75rem',
            fontSize: '0.8125rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.375rem'
        }}>
            <span>{config.icon}</span>
            {config.label}
        </span>
    );
}
