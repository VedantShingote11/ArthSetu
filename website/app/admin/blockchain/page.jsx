'use client';

import { Activity, CheckCircle, DollarSign, FileText, Link as LinkIcon, XCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function BlockchainExplorer() {
    const router = useRouter();
    const [blocks, setBlocks] = useState([]);
    const [stats, setStats] = useState(null);
    const [validation, setValidation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedBlock, setSelectedBlock] = useState(null);

    useEffect(() => {
        const fetchBlockchain = async () => {
            const token = localStorage.getItem('token');

            try {
                const res = await fetch('/api/admin/blockchain', {
                    headers: { Authorization: `Bearer ${token}` },
                });

                const data = await res.json();
                if (data.success) {
                    setBlocks(data.blocks);
                    setStats(data.stats);
                    setValidation(data.validation);
                }
            } catch (error) {
                console.error('Error fetching blockchain:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchBlockchain();
    }, []);

    const getTransactionIcon = (type) => {
        switch (type) {
            case 'loan_created':
                return <FileText size={24} style={{ color: 'var(--info)' }} />;
            case 'loan_funded':
                return <DollarSign size={24} style={{ color: 'var(--secondary)' }} />;
            case 'repayment':
                return <Activity size={24} style={{ color: 'var(--success)' }} />;
            default:
                return <LinkIcon size={24} style={{ color: 'var(--accent)' }} />;
        }
    };

    const getTransactionLabel = (type) => {
        switch (type) {
            case 'loan_created':
                return 'Loan Created';
            case 'loan_funded':
                return 'Loan Funded';
            case 'repayment':
                return 'Repayment';
            default:
                return type;
        }
    };

    return (
        <div style={{ minHeight: '100vh', background: 'var(--background)' }}>
            <div style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', padding: '1rem 0' }}>
                <div className="container">
                    <Link href="/admin/dashboard" style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                        ← Back to Dashboard
                    </Link>
                    <h2 style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <LinkIcon size={24} /> Blockchain Explorer
                    </h2>
                </div>
            </div>

            <div className="container" style={{ padding: '2rem 1rem' }}>
                {/* Blockchain Stats */}
                <div className="grid grid-4 mb-4">
                    <div className="card">
                        <p className="text-muted" style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>Total Blocks</p>
                        <h2 style={{ margin: 0, color: 'var(--primary)' }}>{stats?.totalBlocks || 0}</h2>
                    </div>
                    <div className="card">
                        <p className="text-muted" style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>Loans Created</p>
                        <h2 style={{ margin: 0, color: 'var(--info)' }}>{stats?.loanCreatedBlocks || 0}</h2>
                    </div>
                    <div className="card">
                        <p className="text-muted" style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>Loans Funded</p>
                        <h2 style={{ margin: 0, color: 'var(--secondary)' }}>{stats?.loanFundedBlocks || 0}</h2>
                    </div>
                    <div className="card">
                        <p className="text-muted" style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>Repayments</p>
                        <h2 style={{ margin: 0, color: 'var(--success)' }}>{stats?.repaymentBlocks || 0}</h2>
                    </div>
                </div>

                {/* Chain Validation */}
                <div className="card mb-4" style={{
                    background: validation?.valid ? 'var(--success-bg)' : 'var(--error-bg)',
                    border: `1px solid ${validation?.valid ? 'var(--success)' : 'var(--error)'}`,
                }}>
                    <div className="flex items-center gap-2">
                        {validation?.valid ? <CheckCircle size={24} style={{ color: 'var(--success)' }} /> : <XCircle size={24} style={{ color: 'var(--error)' }} />}
                        <div>
                            <h4 style={{ marginBottom: '0.25rem', color: validation?.valid ? 'var(--success)' : 'var(--error)' }}>
                                {validation?.valid ? 'Blockchain is Valid' : 'Blockchain Validation Failed'}
                            </h4>
                            <p style={{ fontSize: '0.875rem', margin: 0 }}>
                                {validation?.valid
                                    ? `All ${validation.blockCount} blocks are properly linked and immutable`
                                    : validation?.error || 'Chain integrity compromised'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Blockchain Timeline */}
                {loading ? (
                    <div className="text-center" style={{ padding: '3rem' }}>
                        <div className="spinner" style={{ margin: '0 auto' }}></div>
                    </div>
                ) : blocks.length === 0 ? (
                    <div className="card text-center" style={{ padding: '3rem' }}>
                        <p className="text-muted">No blocks in the blockchain yet</p>
                    </div>
                ) : (
                    <div style={{ position: 'relative' }}>
                        {/* Timeline Line */}
                        <div style={{
                            position: 'absolute',
                            left: '2rem',
                            top: 0,
                            bottom: 0,
                            width: '2px',
                            background: 'var(--border)',
                        }} />

                        {/* Blocks */}
                        <div className="grid gap-3">
                            {blocks.map((block, index) => (
                                <div
                                    key={block._id}
                                    className="card"
                                    style={{
                                        marginLeft: '4rem',
                                        cursor: 'pointer',
                                        position: 'relative',
                                    }}
                                    onClick={() => setSelectedBlock(selectedBlock?._id === block._id ? null : block)}
                                >
                                    {/* Timeline Dot */}
                                    <div style={{
                                        position: 'absolute',
                                        left: '-3.5rem',
                                        top: '1.5rem',
                                        width: '1.5rem',
                                        height: '1.5rem',
                                        borderRadius: '50%',
                                        background: 'var(--primary)',
                                        border: '3px solid var(--surface)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '0.75rem',
                                        color: 'white',
                                        fontWeight: '600',
                                    }}>
                                        {block.blockIndex}
                                    </div>

                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-2">
                                            {getTransactionIcon(block.transactionType)}
                                            <div>
                                                <h4 style={{ marginBottom: '0.25rem' }}>
                                                    Block #{block.blockIndex} - {getTransactionLabel(block.transactionType)}
                                                </h4>
                                                <p className="text-muted" style={{ fontSize: '0.75rem' }}>
                                                    {new Date(block.timestamp).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="badge badge-info">
                                            ₹{block.amount.toLocaleString()}
                                        </div>
                                    </div>

                                    <div className="grid grid-2 gap-2 mb-2">
                                        <div>
                                            <p className="text-muted" style={{ fontSize: '0.75rem' }}>From</p>
                                            <p style={{ fontSize: '0.875rem', fontWeight: '500' }}>
                                                {block.fromUser?.name || 'System'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-muted" style={{ fontSize: '0.75rem' }}>To</p>
                                            <p style={{ fontSize: '0.875rem', fontWeight: '500' }}>
                                                {block.toUser?.name || 'System'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mb-2">
                                        <p className="text-muted" style={{ fontSize: '0.75rem' }}>Current Hash</p>
                                        <p style={{
                                            fontSize: '0.75rem',
                                            fontFamily: 'monospace',
                                            background: 'var(--surface-hover)',
                                            padding: '0.5rem',
                                            borderRadius: 'var(--radius-sm)',
                                            wordBreak: 'break-all',
                                        }}>
                                            {block.currentHash}
                                        </p>
                                    </div>

                                    {selectedBlock?._id === block._id && (
                                        <div style={{
                                            marginTop: '1rem',
                                            paddingTop: '1rem',
                                            borderTop: '1px solid var(--border)',
                                        }}>
                                            <h5 className="mb-2">Block Details</h5>

                                            <div className="mb-2">
                                                <p className="text-muted" style={{ fontSize: '0.75rem' }}>Previous Hash</p>
                                                <p style={{
                                                    fontSize: '0.75rem',
                                                    fontFamily: 'monospace',
                                                    background: 'var(--surface-hover)',
                                                    padding: '0.5rem',
                                                    borderRadius: 'var(--radius-sm)',
                                                    wordBreak: 'break-all',
                                                }}>
                                                    {block.previousHash}
                                                </p>
                                            </div>

                                            {block.data && Object.keys(block.data).length > 0 && (
                                                <div>
                                                    <p className="text-muted" style={{ fontSize: '0.75rem', marginBottom: '0.5rem' }}>
                                                        Transaction Data
                                                    </p>
                                                    <div style={{
                                                        background: 'var(--surface-hover)',
                                                        padding: '0.75rem',
                                                        borderRadius: 'var(--radius-sm)',
                                                        fontSize: '0.75rem',
                                                    }}>
                                                        {Object.entries(block.data).map(([key, value]) => (
                                                            <div key={key} className="flex justify-between mb-1">
                                                                <span className="text-muted">{key}:</span>
                                                                <span style={{ fontWeight: '500' }}>
                                                                    {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
