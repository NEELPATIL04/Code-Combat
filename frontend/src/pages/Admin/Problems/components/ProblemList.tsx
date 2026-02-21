import React, { useState } from 'react';
import { Pencil, Trash2, Code, Search } from 'lucide-react';


interface Problem {
    id: number;
    title: string;
    slug: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    tags?: string[];
    companies?: string[];
    isActive: boolean;
    isPremium: boolean;
    acceptanceRate: string;
}

interface ProblemListProps {
    problems: Problem[];
    loading: boolean;
    onCreate: () => void;
    onEdit: (problem: Problem) => void;
    onDelete: (id: number) => void;
}

const ProblemList: React.FC<ProblemListProps> = ({ problems, loading, onEdit, onDelete }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'Easy': return { bg: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', border: 'rgba(34, 197, 94, 0.2)' };
            case 'Medium': return { bg: 'rgba(234, 179, 8, 0.1)', color: '#eab308', border: 'rgba(234, 179, 8, 0.2)' };
            case 'Hard': return { bg: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'rgba(239, 68, 68, 0.2)' };
            default: return { bg: 'rgba(161, 161, 170, 0.1)', color: '#a1a1aa', border: 'rgba(161, 161, 170, 0.2)' };
        }
    };

    const filteredProblems = problems.filter(problem =>
        problem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        problem.slug.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#a1a1aa' }}>
                <div style={{
                    width: '40px',
                    height: '40px',
                    border: '3px solid #27272a',
                    borderTopColor: '#fafafa',
                    borderRadius: '50%',
                    margin: '0 auto 20px',
                    animation: 'spin 1s linear infinite'
                }}></div>
                <p>Loading problems...</p>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    return (
        <div style={{
            background: '#09090b',
            border: '1px solid #27272a',
            borderRadius: '12px',
            overflow: 'hidden'
        }}>
            {/* Search Bar */}
            <div style={{
                padding: '16px',
                borderBottom: '1px solid #27272a',
                display: 'flex',
                gap: '12px'
            }}>
                <div style={{ position: 'relative', flex: 1 }}>
                    <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#71717a' }} />
                    <input
                        type="text"
                        placeholder="Search problems..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            width: '100%',
                            background: '#18181b',
                            border: '1px solid #27272a',
                            borderRadius: '8px',
                            color: '#fafafa',
                            padding: '8px 12px 8px 36px',
                            fontSize: '0.875rem',
                            outline: 'none'
                        }}
                    />
                </div>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ background: '#0a0a0b', borderBottom: '1px solid #27272a' }}>
                        <th style={thStyle}>Title</th>
                        <th style={thStyle}>Difficulty</th>
                        <th style={{ ...thStyle, display: 'none' }}>Tags</th>
                        <th style={thStyle}>Acceptance</th>
                        <th style={thStyle}>Status</th>
                        <th style={{ ...thStyle, textAlign: 'right' }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredProblems.length === 0 ? (
                        <tr>
                            <td colSpan={6} style={{ padding: '60px', textAlign: 'center', color: '#71717a' }}>
                                {searchTerm ? 'No matching problems found' : 'No problems created yet'}
                            </td>
                        </tr>
                    ) : (
                        filteredProblems.map((problem, idx) => {
                            const diffStyle = getDifficultyColor(problem.difficulty);
                            return (
                                <tr
                                    key={problem.id}
                                    style={{
                                        borderBottom: idx === filteredProblems.length - 1 ? 'none' : '1px solid #27272a',
                                        transition: 'background 0.2s'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                >
                                    <td style={tdStyle}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <div style={{
                                                padding: '8px',
                                                borderRadius: '8px',
                                                background: '#18181b',
                                                color: '#fafafa'
                                            }}>
                                                <Code size={16} />
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 500, color: '#fafafa' }}>{problem.title}</div>
                                                <div style={{ fontSize: '0.75rem', color: '#71717a' }}>/{problem.slug}</div>
                                            </div>
                                            {problem.isPremium && (
                                                <span style={{
                                                    padding: '2px 6px',
                                                    background: 'rgba(234, 179, 8, 0.1)',
                                                    color: '#fbbf24',
                                                    fontSize: '0.625rem',
                                                    borderRadius: '4px',
                                                    fontWeight: 600,
                                                    marginLeft: '4px'
                                                }}>PRO</span>
                                            )}
                                        </div>
                                    </td>
                                    <td style={tdStyle}>
                                        <span style={{
                                            padding: '4px 10px',
                                            background: diffStyle.bg,
                                            color: diffStyle.color,
                                            border: `1px solid ${diffStyle.border}`,
                                            borderRadius: '9999px',
                                            fontSize: '0.75rem',
                                            fontWeight: 500
                                        }}>
                                            {problem.difficulty}
                                        </span>
                                    </td>
                                    <td style={{ ...tdStyle, display: 'none' }}>
                                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                                            {problem.tags?.slice(0, 2).map((tag, i) => (
                                                <span key={i} style={{
                                                    padding: '2px 8px',
                                                    background: '#18181b',
                                                    border: '1px solid #27272a',
                                                    borderRadius: '4px',
                                                    fontSize: '0.75rem',
                                                    color: '#a1a1aa'
                                                }}>
                                                    {tag}
                                                </span>
                                            ))}
                                            {problem.tags && problem.tags.length > 2 && (
                                                <span style={{ fontSize: '0.75rem', color: '#71717a' }}>+{problem.tags.length - 2}</span>
                                            )}
                                        </div>
                                    </td>
                                    <td style={tdStyle}>
                                        <span style={{ color: '#a1a1aa' }}>{problem.acceptanceRate}%</span>
                                    </td>
                                    <td style={tdStyle}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <div style={{
                                                width: '6px',
                                                height: '6px',
                                                borderRadius: '50%',
                                                background: problem.isActive ? '#22c55e' : '#71717a'
                                            }}></div>
                                            <span style={{ color: problem.isActive ? '#a1a1aa' : '#71717a' }}>
                                                {problem.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>
                                    </td>
                                    <td style={{ ...tdStyle, textAlign: 'right' }}>
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                            <button
                                                onClick={() => onEdit(problem)}
                                                style={actionBtnStyle}
                                                title="Edit Problem"
                                            >
                                                <Pencil size={16} />
                                            </button>
                                            <button
                                                onClick={() => onDelete(problem.id)}
                                                style={{ ...actionBtnStyle, color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.2)', background: 'rgba(239, 68, 68, 0.05)' }}
                                                title="Delete Problem"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })
                    )}
                </tbody>
            </table>
        </div>
    );
};

const thStyle: React.CSSProperties = {
    padding: '16px 24px',
    fontSize: '0.75rem',
    fontWeight: 600,
    color: '#71717a',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    textAlign: 'left'
};

const tdStyle: React.CSSProperties = {
    padding: '16px 24px',
    fontSize: '0.875rem'
};

const actionBtnStyle: React.CSSProperties = {
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#18181b',
    border: '1px solid #27272a',
    borderRadius: '6px',
    color: '#a1a1aa',
    cursor: 'pointer',
    transition: 'background 0.2s, color 0.2s, border-color 0.2s'
};

export default ProblemList;
