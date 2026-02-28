export default function ProgressBar({ current, total, label }) {
    const percentage = total > 0 ? (current / total) * 100 : 0;

    return (
        <div>
            {label && (
                <div className="flex justify-between mb-1">
                    <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{label}</span>
                    <span style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                        {Math.round(percentage)}%
                    </span>
                </div>
            )}
            <div className="progress">
                <div
                    className="progress-bar"
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                />
            </div>
            {current !== undefined && total !== undefined && (
                <div className="flex justify-between mt-1">
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        ₹{current.toLocaleString()} / ₹{total.toLocaleString()}
                    </span>
                </div>
            )}
        </div>
    );
}
