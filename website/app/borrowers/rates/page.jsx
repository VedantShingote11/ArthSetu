'use client';
import { BarChart2, CheckCircle, DollarSign } from 'lucide-react';

const rateTable = [
    { band: 'Risk Band A', rate: '12% – 16% p.a.', profile: 'Strong credit profile, consistent income' },
    { band: 'Risk Band B', rate: '16% – 22% p.a.', profile: 'Moderate profile, self-employed or variable income' },
    { band: 'Risk Band C', rate: '22% – 28% p.a.', profile: 'Gig workers, seasonal income, limited history' },
];

const fees = [
    { name: 'Processing Fee', value: 'Up to 2% of loan amount (deducted from disbursement)' },
    { name: 'Platform Fee', value: 'Disclosed within the mobile app at application stage' },
    { name: 'Late Payment Penalty', value: 'Penal interest on overdue amount (per day) as per loan agreement' },
    { name: 'Prepayment Fee', value: 'As per loan agreement terms — check in-app before prepaying' },
    { name: 'GST', value: 'Applicable on all platform fees as per prevailing rates' },
];

export default function RatesPage() {
    return (
        <div style={{ minHeight: '100vh', background: 'var(--background)' }}>
            <div className="sub-navbar">
                <div className="container flex justify-between items-center">
                    <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-primary)' }}>
                        <DollarSign size={24} style={{ color: 'var(--primary)' }} />
                        Interest Rates &amp; Fees
                    </h2>
                </div>
            </div>
            <div className="container" style={{ padding: '2rem 1rem', maxWidth: '900px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                    <div className="card fade-in border transition-all hover:border-primary hover:shadow-md" style={{ animationDelay: '0.1s' }}>
                        <p style={{ margin: 0, lineHeight: 1.7, color: 'var(--text-secondary)' }}>
                            All interest rates on ArthSetu are determined by your AI risk band — automatically and without manual bias. There are no negotiable rates or preferential pricing. What the model assigns is what you receive.
                        </p>
                    </div>

                    <div className="card">
                        <h4 style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
                            <BarChart2 size={18} style={{ color: 'var(--primary)' }} /> Interest Rate by Risk Band
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                            {rateTable.map((item, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'var(--surface)', borderRadius: '10px', border: '1px solid var(--border)' }}>
                                    <div>
                                        <p style={{ fontWeight: 700, margin: '0 0 0.2rem', fontSize: '0.95rem', color: 'var(--text-primary)' }}>{item.band}</p>
                                        <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.profile}</p>
                                    </div>
                                    <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--primary)', flexShrink: 0, marginLeft: '1rem' }}>{item.rate}</span>
                                </div>
                            ))}
                        </div>
                        <p style={{ margin: '0.75rem 0 0', fontSize: '0.78rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>Rates are indicative and subject to change based on platform policy. Exact rate is shown in the mobile app at time of loan approval.</p>
                    </div>

                    <div className="card">
                        <h4 style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
                            <CheckCircle size={18} style={{ color: 'var(--secondary)' }} /> Other Fees &amp; Charges
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                            {fees.map((item, i) => (
                                <div key={i} style={{ display: 'flex', gap: '1rem', padding: '0.85rem 0', borderBottom: i < fees.length - 1 ? '1px solid var(--border)' : 'none' }}>
                                    <span style={{ width: '180px', flexShrink: 0, fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.4px', color: 'var(--text-muted)' }}>{item.name}</span>
                                    <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.875rem' }}>{item.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
