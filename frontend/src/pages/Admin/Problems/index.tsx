import React, { useState, useEffect } from 'react';
import { Plus, X } from 'lucide-react';
import { problemAPI } from '../../../utils/api';
import ProblemList from './components/ProblemList';
import ProblemModal from './components/ProblemModal';

const Problems: React.FC = () => {
    const [problems, setProblems] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [filter, setFilter] = useState<string>('all');
    const [showModal, setShowModal] = useState<boolean>(false);
    const [editingProblem, setEditingProblem] = useState<any>(null);
    const [saving, setSaving] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    useEffect(() => {
        loadProblems();
    }, []);

    const loadProblems = async () => {
        setLoading(true);
        try {
            const data = await problemAPI.getAll();
            setProblems(data.problems);
            setError('');
        } catch (err) {
            console.error('Failed to load problems:', err);
            setError('Failed to load problems. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setEditingProblem(null);
        setShowModal(true);
    };

    const handleEdit = async (problem: any) => {
        // Fetch full details including test cases and code
        try {
            const data = await problemAPI.getById(problem.id);
            setEditingProblem(data.problem);
            setShowModal(true);
        } catch (err) {
            console.error('Failed to load problem details:', err);
            setError('Failed to load problem details.');
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Are you sure you want to delete this problem?')) {
            try {
                await problemAPI.delete(id);
                loadProblems();
            } catch (err) {
                console.error('Failed to delete problem:', err);
                setError('Failed to delete problem');
            }
        }
    };

    const handleSave = async (data: any) => {
        setSaving(true);
        try {
            if (editingProblem) {
                await problemAPI.update(editingProblem.id, data);
            } else {
                await problemAPI.create(data);
            }
            setShowModal(false);
            loadProblems();
        } catch (err: any) {
            console.error('Failed to save problem:', err);
            setError(err.message || 'Failed to save problem');
        } finally {
            setSaving(false);
        }
    };

    const filteredProblems = problems.filter(p => {
        if (filter === 'all') return true;
        if (filter === 'active') return p.isActive;
        if (filter === 'inactive') return !p.isActive;
        return true;
    });

    return (
        <div>
            <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
                <header style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '32px'
                }}>
                    <div>
                        <h1 style={{
                            fontSize: '1.875rem',
                            fontWeight: 600,
                            margin: 0,
                            marginBottom: '4px',
                            color: '#fafafa',
                            letterSpacing: '-0.025em'
                        }}>
                            Manage Problems
                        </h1>
                        <p style={{ margin: 0, fontSize: '0.875rem', color: '#a1a1aa' }}>
                            Create and edit coding challenges
                        </p>
                    </div>
                    <button
                        onClick={handleCreate}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '10px 20px',
                            background: '#fafafa',
                            border: 'none',
                            borderRadius: '6px',
                            color: '#09090b',
                            fontSize: '0.875rem',
                            fontWeight: 500,
                            cursor: 'pointer',
                            transition: 'opacity 0.2s ease'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.opacity = '0.9'}
                        onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
                    >
                        <Plus size={16} /> New Problem
                    </button>
                </header>

                {error && (
                    <div style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        color: '#ef4444',
                        padding: '12px 16px',
                        borderRadius: '8px',
                        marginBottom: '24px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: '0.875rem'
                    }}>
                        {error}
                        <button
                            onClick={() => setError('')}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                color: '#ef4444',
                                cursor: 'pointer',
                                padding: '4px'
                            }}
                        >
                            <X size={16} />
                        </button>
                    </div>
                )}

                <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
                    {['all', 'active', 'inactive'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            style={{
                                padding: '8px 16px',
                                background: filter === f ? '#27272a' : 'transparent',
                                border: filter === f ? 'none' : '1px solid #27272a',
                                borderRadius: '6px',
                                color: filter === f ? '#fafafa' : '#a1a1aa',
                                fontSize: '0.875rem',
                                fontWeight: 500,
                                cursor: 'pointer',
                                textTransform: 'capitalize',
                                transition: 'all 0.15s ease'
                            }}
                        >
                            {f}
                        </button>
                    ))}
                </div>

                <ProblemList
                    problems={filteredProblems}
                    loading={loading}
                    onCreate={handleCreate}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />
            </div>

            <ProblemModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                isEditing={!!editingProblem}
                initialData={editingProblem}
                onSave={handleSave}
                loading={saving}
            />
        </div>
    );
};

export default Problems;
