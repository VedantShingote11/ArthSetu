'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

// ── Field definitions ──────────────────────────────────────────────────────────

const SECTIONS = [
    {
        title: 'Loan Details',
        fields: [
            { name: 'loan_amnt', label: 'Loan Amount ($)', type: 'number', min: 500, max: 40000, step: 100, placeholder: '15000', required: true },
            {
                name: 'term', label: 'Loan Term', type: 'select',
                options: [{ value: 36, label: '36 months' }, { value: 60, label: '60 months' }],
                required: true,
            },
            {
                name: 'purpose', label: 'Loan Purpose', type: 'select',
                options: ['car', 'credit_card', 'debt_consolidation', 'home_improvement', 'house',
                    'major_purchase', 'medical', 'moving', 'other', 'renewable_energy', 'small_business', 'vacation'
                ].map(v => ({ value: v, label: v.replace(/_/g, ' ') })),
                required: true,
            },
        ],
    },
    {
        title: 'Employment & Income',
        fields: [
            {
                name: 'emp_length', label: 'Employment Length', type: 'select',
                options: [
                    { value: '< 1 year', label: '< 1 year' },
                    ...[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => ({ value: `${n} year${n > 1 ? 's' : ''}`, label: `${n} year${n > 1 ? 's' : ''}` })),
                    { value: '10+ years', label: '10+ years' },
                    { value: 'n/a', label: 'N/A' },
                ],
                required: true,
            },
            { name: 'annual_inc', label: 'Annual Income ($)', type: 'number', min: 1, step: 1000, placeholder: '75000', required: true },
            {
                name: 'home_ownership', label: 'Home Ownership', type: 'select',
                options: ['MORTGAGE', 'OWN', 'RENT', 'OTHER', 'NONE', 'ANY'].map(v => ({ value: v, label: v })),
                required: true,
            },
            {
                name: 'verification_status', label: 'Income Verification', type: 'select',
                options: ['Not Verified', 'Source Verified', 'Verified'].map(v => ({ value: v, label: v })),
                required: true,
            },
            { name: 'dti', label: 'Debt-to-Income Ratio (%)', type: 'number', min: 0, max: 200, step: 0.01, placeholder: '18.5', required: true },
        ],
    },
    {
        title: 'Revolving Credit',
        fields: [
            { name: 'revol_bal', label: 'Revolving Balance ($)', type: 'number', min: 0, step: 100, placeholder: '8000', required: true },
            { name: 'revol_util', label: 'Revolving Utilisation (%)', type: 'number', min: 0, max: 150, step: 0.1, placeholder: '45.0', required: true },
            { name: 'total_rev_hi_lim', label: 'Total Revolving Limit ($)', type: 'number', min: 0, step: 1000, placeholder: '30000', required: true },
        ],
    },
    {
        title: 'Credit History',
        fields: [
            { name: 'earliest_cr_line', label: 'Earliest Credit Line', type: 'text', placeholder: 'Jan-2005', required: true },
            { name: 'delinq_2yrs', label: 'Delinquencies (last 2 yrs)', type: 'number', min: 0, max: 30, step: 1, placeholder: '0', required: true },
            { name: 'inq_last_6mths', label: 'Inquiries (last 6 months)', type: 'number', min: 0, max: 30, step: 1, placeholder: '1', required: true },
            { name: 'open_acc', label: 'Open Credit Lines', type: 'number', min: 0, max: 90, step: 1, placeholder: '10', required: true },
            { name: 'pub_rec', label: 'Public Records', type: 'number', min: 0, max: 20, step: 1, placeholder: '0', required: true },
            { name: 'total_acc', label: 'Total Credit Lines', type: 'number', min: 0, max: 200, step: 1, placeholder: '22', required: true },
            { name: 'tot_cur_bal', label: 'Total Current Balance ($)', type: 'number', min: 0, step: 1000, placeholder: '120000', required: true },
            { name: 'acc_open_past_24mths', label: 'Accounts Opened (past 24 mo)', type: 'number', min: 0, max: 60, step: 1, placeholder: '3', required: true },
            { name: 'num_accts_ever_120_pd', label: 'Accounts Ever 120+ Days Late', type: 'number', min: 0, max: 40, step: 1, placeholder: '0', required: true },
            { name: 'num_rev_accts', label: 'Revolving Accounts', type: 'number', min: 0, max: 120, step: 1, placeholder: '8', required: true },
            { name: 'num_tl_op_past_12m', label: 'Trade Lines (past 12 mo)', type: 'number', min: 0, max: 30, step: 1, placeholder: '2', required: true },
            { name: 'tot_hi_cred_lim', label: 'Total High Credit Limit ($)', type: 'number', min: 0, step: 1000, placeholder: '160000', required: true },
            { name: 'total_bal_ex_mort', label: 'Total Balance (excl. Mortgage $)', type: 'number', min: 0, step: 1000, placeholder: '20000', required: true },
        ],
    },
];

const INITIAL = {
    loan_amnt: '', term: 36, purpose: 'debt_consolidation',
    emp_length: '5 years', annual_inc: '', home_ownership: 'MORTGAGE',
    verification_status: 'Not Verified', dti: '',
    revol_bal: '', revol_util: '', total_rev_hi_lim: '',
    earliest_cr_line: '', delinq_2yrs: 0, inq_last_6mths: 0,
    open_acc: '', pub_rec: 0, total_acc: '', tot_cur_bal: '',
    acc_open_past_24mths: 0, num_accts_ever_120_pd: 0, num_rev_accts: '',
    num_tl_op_past_12m: 0, tot_hi_cred_lim: '', total_bal_ex_mort: '',
};

// Map ML grade → trust score out of 900 (A = best, C = worst)
const GRADE_TO_TRUST_SCORE = {
    A: 800, B: 600, C: 400,
};

function getGradeFromScore(score) {
    if (score >= 700) return 'A';
    if (score >= 500) return 'B';
    return 'C';
}

function validate(form) {
    const e = {};
    if (!form.loan_amnt || Number(form.loan_amnt) <= 0) e.loan_amnt = 'Must be > 0';
    if (Number(form.loan_amnt) > 1000000) e.loan_amnt = 'Max ₹1,000,000';
    if (!form.annual_inc || Number(form.annual_inc) <= 0) e.annual_inc = 'Must be > 0';
    if (form.dti === '' || Number(form.dti) < 0 || Number(form.dti) > 200) e.dti = 'Must be 0–200';
    if (!form.earliest_cr_line) e.earliest_cr_line = 'Required (e.g. Jan-2005)';
    ['revol_bal', 'revol_util', 'total_rev_hi_lim', 'open_acc', 'total_acc',
        'tot_cur_bal', 'num_rev_accts', 'tot_hi_cred_lim', 'total_bal_ex_mort'].forEach(f => {
            if (form[f] === '' || form[f] === null || form[f] === undefined) e[f] = 'Required';
            else if (Number(form[f]) < 0) e[f] = 'Must be ≥ 0';
        });
    return e;
}

export default function TrustScoreModal({ isOpen, onClose }) {
    const router = useRouter();
    const [form, setForm] = useState(INITIAL);
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [loading, setLoading] = useState(false);
    const [apiError, setApiError] = useState('');

    if (!isOpen) return null;

    const handleChange = (name, value) => {
        setForm(prev => ({ ...prev, [name]: value }));
        setTouched(prev => ({ ...prev, [name]: true }));
        if (errors[name]) setErrors(prev => { const e = { ...prev }; delete e[name]; return e; });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errs = validate(form);
        if (Object.keys(errs).length > 0) {
            setErrors(errs);
            setTouched(Object.fromEntries(Object.keys(errs).map(k => [k, true])));
            return;
        }

        setLoading(true);
        setApiError('');

        const payload = { ...form };
        ['loan_amnt', 'term', 'annual_inc', 'dti', 'revol_bal', 'revol_util',
            'total_rev_hi_lim', 'delinq_2yrs', 'inq_last_6mths', 'open_acc',
            'pub_rec', 'total_acc', 'tot_cur_bal', 'acc_open_past_24mths',
            'num_accts_ever_120_pd', 'num_rev_accts', 'num_tl_op_past_12m',
            'tot_hi_cred_lim', 'total_bal_ex_mort',
        ].forEach(k => { payload[k] = Number(payload[k]); });

        try {
            /*
            const res = await fetch('http://localhost:8000/predict', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            if (!res.ok) {
                // FastAPI 422 returns detail as an array of validation error objects
                let errMsg;
                if (Array.isArray(data.detail)) {
                    errMsg = data.detail.map(e => `${e.loc?.slice(-1)[0] ?? 'field'}: ${e.msg}`).join('; ');
                } else {
                    errMsg = typeof data.detail === 'string' ? data.detail : JSON.stringify(data.detail);
                }
                throw new Error(errMsg || `Server error ${res.status}`);
            }
            */

            // Temporary mock response until backend is rebuilt
            const mockGrades = ['A', 'B', 'C', 'D'];
            const data = {
                grade: mockGrades[Math.floor(Math.random() * mockGrades.length)],
                profile_score: 3.14,
                model_version: 'mock-1.0'
            };

            // The model returns:
            //   grade: "A" | "B" | "C" | "D" | "E" | "F" | "G"  (letter grade)
            //   profile_score: raw regression float like 2.34 (NOT a 300-900 score)
            // We map the letter grade → trust score on a 300-900 scale.
            // Grades beyond C (D/E/F/G) get progressively lower scores.
            const FULL_GRADE_TO_TRUST = {
                A: 800, B: 600, C: 400,
            };
            const trustScore = FULL_GRADE_TO_TRUST[data.grade] ?? 400;

            // Recompute Grade locally so the UI colors remain perfectly in sync with the Numeric Trust Score
            const finalGrade = getGradeFromScore(trustScore);

            localStorage.setItem('trustScoreResult', JSON.stringify({
                trustScore,
                grade: finalGrade,
                profile_score: data.profile_score,
                model_version: data.model_version,
                calculatedAt: new Date().toISOString(),
            }));

            // Sync with backend profile DB
            try {
                const token = localStorage.getItem('token');
                if (token) {
                    const syncRes = await fetch('/api/borrower/profile', {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${token}`
                        },
                        body: JSON.stringify({
                            riskScore: trustScore,
                            creditScoreInputs: payload,
                            creditScoreCalculatedAt: new Date().toISOString(),
                        })
                    });
                    if (!syncRes.ok) {
                        console.error("Profile sync failed:", await syncRes.text());
                    }
                }
            } catch (e) {
                console.error("Failed to sync score to profile:", e);
            }

            onClose();

            // If they are not on the credit-card page, redirect. Otherwise force reload to show new score
            if (window.location.pathname === '/borrower/credit-card') {
                window.location.reload();
            } else {
                router.push('/borrower/credit-card');
            }
        } catch (err) {
            setApiError(err.message || 'Failed to connect to prediction service');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* Backdrop */}
            <div
                onClick={onClose}
                style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
                    backdropFilter: 'blur(4px)', zIndex: 1000,
                }}
            />

            {/* Slide-over panel */}
            <div style={{
                position: 'fixed', top: 0, right: 0, bottom: 0,
                width: '100%', maxWidth: '560px',
                background: 'var(--surface)', zIndex: 1001,
                overflowY: 'auto', boxShadow: '-4px 0 32px rgba(0,0,0,0.25)',
                display: 'flex', flexDirection: 'column',
            }}>
                {/* Header */}
                <div style={{
                    position: 'sticky', top: 0, zIndex: 10,
                    background: 'var(--surface)', borderBottom: '1px solid var(--border)',
                    padding: '1rem 1.5rem',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                    <div>
                        <h3 style={{ margin: 0, fontSize: '1.125rem' }}>🔐 Profile Score Calculator</h3>
                        <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                            AI-powered creditworthiness assessment — score out of 900
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'none', border: '1px solid var(--border)',
                            borderRadius: '50%', width: '2rem', height: '2rem',
                            cursor: 'pointer', fontSize: '1rem', color: 'var(--text-muted)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                    >✕</button>
                </div>

                {/* Form */}
                <div style={{ padding: '1.5rem', flex: 1 }}>
                    <form onSubmit={handleSubmit} noValidate>
                        {apiError && (
                            <div className="badge badge-error" style={{ width: '100%', marginBottom: '1rem', padding: '0.75rem' }}>
                                ⚠ {apiError}
                            </div>
                        )}

                        {SECTIONS.map(section => (
                            <div key={section.title} style={{ marginBottom: '1.5rem' }}>
                                <h4 style={{ fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '0.75rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
                                    {section.title}
                                </h4>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                    {section.fields.map(def => (
                                        <div key={def.name} style={def.type === 'text' && def.name === 'earliest_cr_line' ? { gridColumn: 'span 2' } : {}}>
                                            <label className="form-label" style={{ fontSize: '0.75rem' }}>
                                                {def.label}
                                                {def.required && <span style={{ color: 'var(--error, #ef4444)', marginLeft: '2px' }}>*</span>}
                                            </label>
                                            {def.type === 'select' ? (
                                                <select
                                                    id={def.name}
                                                    className="form-select"
                                                    style={{ fontSize: '0.875rem' }}
                                                    value={form[def.name]}
                                                    onChange={e => handleChange(def.name, e.target.value)}
                                                >
                                                    {def.options.map(opt => (
                                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                    ))}
                                                </select>
                                            ) : (
                                                <input
                                                    id={def.name}
                                                    type={def.type}
                                                    className="form-input"
                                                    style={{ fontSize: '0.875rem', borderColor: touched[def.name] && errors[def.name] ? 'var(--error, #ef4444)' : '' }}
                                                    value={form[def.name]}
                                                    onChange={e => handleChange(def.name, e.target.value)}
                                                    placeholder={def.placeholder}
                                                    min={def.min}
                                                    max={def.max}
                                                    step={def.step}
                                                />
                                            )}
                                            {touched[def.name] && errors[def.name] && (
                                                <p style={{ color: 'var(--error, #ef4444)', fontSize: '0.7rem', marginTop: '0.2rem' }}>{errors[def.name]}</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}

                        {Object.keys(errors).length > 0 && (
                            <div className="badge badge-error" style={{ width: '100%', marginBottom: '1rem', padding: '0.5rem 0.75rem' }}>
                                ⚠ Fix {Object.keys(errors).length} error{Object.keys(errors).length > 1 ? 's' : ''} above
                            </div>
                        )}

                        <button
                            type="submit"
                            className="btn btn-primary"
                            style={{ width: '100%', padding: '0.75rem' }}
                            disabled={loading}
                        >
                            {loading ? 'Calculating…' : '🔐 Calculate Profile Score'}
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
}
