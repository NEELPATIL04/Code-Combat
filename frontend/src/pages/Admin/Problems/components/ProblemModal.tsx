import React, { useState, useEffect } from 'react';
import { X, Brain } from 'lucide-react';
import HTMLEditor from '../../../../components/HTMLEditor';
import TestCaseManager from '../../../../components/TestCaseManager';

interface ProblemModalProps {
    isOpen: boolean;
    onClose: () => void;
    isEditing: boolean;
    initialData: any;
    onSave: (data: any) => Promise<void>;
    loading: boolean;
}

const SUPPORTED_LANGUAGES = [
    { id: 'javascript', name: 'JavaScript' },
    { id: 'python', name: 'Python' },
    { id: 'java', name: 'Java' },
    { id: 'cpp', name: 'C++' },
];

const ProblemModal: React.FC<ProblemModalProps> = ({
    isOpen,
    onClose,
    isEditing,
    initialData,
    onSave,
    loading
}) => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        description: '',
        difficulty: 'Medium',
        tags: [] as string[],
        companies: [] as string[],
        hints: [] as string[],
        starterCode: { javascript: '', python: '', java: '', cpp: '' } as Record<string, string>,
        testRunnerTemplate: { javascript: '', python: '', java: '', cpp: '' } as Record<string, string>,
        functionSignature: {
            name: '',
            params: [] as { name: string, type: string }[],
            returnType: 'void'
        },
        testCases: [] as { input: string, expectedOutput: string, isHidden: boolean }[],
        isPremium: false,
        allowedLanguages: ['javascript', 'python', 'java', 'cpp'] as string[],
        aiConfig: {
            hintsEnabled: true,
            hintThreshold: 2,
            solutionThreshold: 5
        }
    });

    useEffect(() => {
        if (isOpen) {
            if (isEditing && initialData) {
                setFormData({
                    title: initialData.title || '',
                    slug: initialData.slug || '',
                    description: initialData.description || '',
                    difficulty: initialData.difficulty || 'Medium',
                    tags: initialData.tags || [],
                    companies: initialData.companies || [],
                    hints: initialData.hints || [],
                    starterCode: initialData.starterCode || { javascript: '', python: '', java: '', cpp: '' },
                    testRunnerTemplate: initialData.testRunnerTemplate || { javascript: '', python: '', java: '', cpp: '' },
                    functionSignature: initialData.functionSignature || { name: '', params: [], returnType: 'void' },
                    testCases: initialData.testCases || [],
                    isPremium: initialData.isPremium || false,
                    allowedLanguages: initialData.allowedLanguages || ['javascript', 'python', 'java', 'cpp'],
                    aiConfig: initialData.aiConfig || { hintsEnabled: true, hintThreshold: 2, solutionThreshold: 5 }
                });
            } else {
                setFormData({
                    title: '',
                    slug: '',
                    description: '',
                    difficulty: 'Medium',
                    tags: [],
                    companies: [],
                    hints: [],
                    starterCode: { javascript: '', python: '', java: '', cpp: '' },
                    testRunnerTemplate: { javascript: '', python: '', java: '', cpp: '' },
                    functionSignature: { name: '', params: [], returnType: 'void' },
                    testCases: [],
                    isPremium: false,
                    allowedLanguages: ['javascript', 'python', 'java', 'cpp'],
                    aiConfig: { hintsEnabled: true, hintThreshold: 2, solutionThreshold: 5 }
                });
            }
            setStep(1);
        }
    }, [isOpen, isEditing, initialData]);

    if (!isOpen) return null;

    const handleSubmit = async () => {
        // Map testCases to expected format if needed, though TestCaseManager uses input/expectedOutput/isHidden which matches schema mostly?
        // Schema uses 'input', 'expectedOutput', 'isHidden'. TestCaseManager uses same.
        // My previous ProblemModal used 'output' instead of 'expectedOutput'. I need to make sure I use 'expectedOutput' now to match TestCaseManager.

        await onSave({
            ...formData,
            // Ensure test cases have expectedOutput key
            testCases: formData.testCases.map(tc => ({
                input: tc.input,
                expectedOutput: tc.expectedOutput, // TestCaseManager uses this
                isHidden: tc.isHidden
            }))
        });
    };

    const handleTagInput = (e: React.KeyboardEvent<HTMLInputElement>, field: 'tags' | 'companies' | 'hints') => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const value = e.currentTarget.value.trim();
            if (value && !formData[field].includes(value)) {
                setFormData(prev => ({
                    ...prev,
                    [field]: [...prev[field], value]
                }));
                e.currentTarget.value = '';
            }
        }
    };

    const removeTag = (field: 'tags' | 'companies' | 'hints', index: number) => {
        setFormData(prev => ({
            ...prev,
            [field]: prev[field].filter((_, i) => i !== index)
        }));
    };

    const toggleLanguage = (langId: string) => {
        setFormData(prev => {
            const current = [...prev.allowedLanguages];
            if (current.includes(langId)) return { ...prev, allowedLanguages: current.filter(id => id !== langId) };
            else return { ...prev, allowedLanguages: [...current, langId] };
        });
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 50
        }}>
            <div style={{
                background: '#09090b',
                width: '100%',
                maxWidth: '900px',
                height: '90vh',
                borderRadius: '16px',
                border: '1px solid #27272a',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
            }}>
                {/* Header */}
                <div style={{
                    padding: '20px 24px',
                    borderBottom: '1px solid #27272a',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#fafafa' }}>
                        {isEditing ? 'Edit Problem' : 'Create New Problem'}
                    </h2>
                    <button
                        onClick={onClose}
                        style={{ background: 'transparent', border: 'none', color: '#71717a', cursor: 'pointer' }}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Steps */}
                <div style={{ display: 'flex', borderBottom: '1px solid #27272a' }}>
                    {['Basic Info', 'Details & AI', 'Code & Test Cases'].map((label, idx) => (
                        <button
                            key={idx}
                            onClick={() => setStep(idx + 1)}
                            style={{
                                flex: 1,
                                padding: '12px',
                                background: step === idx + 1 ? '#18181b' : 'transparent',
                                border: 'none',
                                borderBottom: step === idx + 1 ? '2px solid #fafafa' : '2px solid transparent',
                                color: step === idx + 1 ? '#fafafa' : '#71717a',
                                fontWeight: 500,
                                cursor: 'pointer',
                                fontSize: '0.875rem'
                            }}
                        >
                            {label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
                    {step === 1 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            {/* Title & Slug */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div>
                                    <label style={labelStyle}>Problem Title</label>
                                    <input
                                        type="text"
                                        style={inputStyle}
                                        value={formData.title}
                                        onChange={e => setFormData({ ...formData, title: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                                        placeholder="e.g. Two Sum"
                                    />
                                </div>
                                <div>
                                    <label style={labelStyle}>Slug</label>
                                    <input
                                        type="text"
                                        style={inputStyle}
                                        value={formData.slug}
                                        onChange={e => setFormData({ ...formData, slug: e.target.value })}
                                        placeholder="e.g. two-sum"
                                    />
                                </div>
                            </div>

                            {/* Difficulty & Premium */}
                            <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-end' }}>
                                <div style={{ flex: 1 }}>
                                    <label style={labelStyle}>Difficulty</label>
                                    <select
                                        style={inputStyle}
                                        value={formData.difficulty}
                                        onChange={e => setFormData({ ...formData, difficulty: e.target.value })}
                                    >
                                        <option value="Easy">Easy</option>
                                        <option value="Medium">Medium</option>
                                        <option value="Hard">Hard</option>
                                    </select>
                                </div>
                                <div style={{ paddingBottom: '10px' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: '#a1a1aa' }}>
                                        <input
                                            type="checkbox"
                                            checked={formData.isPremium}
                                            onChange={e => setFormData({ ...formData, isPremium: e.target.checked })}
                                            style={{ width: '16px', height: '16px' }}
                                        />
                                        Premium Only
                                    </label>
                                </div>
                            </div>

                            {/* Tags */}
                            <div>
                                <label style={labelStyle}>Tags (Press Enter)</label>
                                <input
                                    type="text"
                                    style={inputStyle}
                                    onKeyDown={e => handleTagInput(e, 'tags')}
                                    placeholder="Add tags..."
                                />
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
                                    {formData.tags.map((tag, i) => (
                                        <span key={i} style={tagStyle}>
                                            {tag}
                                            <button onClick={() => removeTag('tags', i)} style={removeTagBtn}>×</button>
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Companies */}
                            <div>
                                <label style={labelStyle}>Companies (Press Enter)</label>
                                <input
                                    type="text"
                                    style={inputStyle}
                                    onKeyDown={e => handleTagInput(e, 'companies')}
                                    placeholder="Add companies..."
                                />
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
                                    {formData.companies.map((company, i) => (
                                        <span key={i} style={tagStyle}>
                                            {company}
                                            <button onClick={() => removeTag('companies', i)} style={removeTagBtn}>×</button>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: '100%' }}>
                            {/* Description */}
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                <label style={labelStyle}>Problem Description</label>
                                <div style={{ flex: 1, minHeight: '300px', border: '1px solid #27272a', borderRadius: '8px', overflow: 'hidden' }}>
                                    <HTMLEditor
                                        value={formData.description}
                                        onChange={(val) => setFormData(prev => ({ ...prev, description: val }))}
                                        minHeight="300px"
                                    />
                                </div>
                            </div>

                            {/* Hints */}
                            <div>
                                <label style={labelStyle}>Hints (Press Enter)</label>
                                <input
                                    type="text"
                                    style={inputStyle}
                                    onKeyDown={e => handleTagInput(e, 'hints')}
                                    placeholder="Add hints..."
                                />
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                                    {formData.hints.map((hint, i) => (
                                        <div key={i} style={{
                                            padding: '8px 12px',
                                            background: '#18181b',
                                            borderRadius: '6px',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            fontSize: '0.875rem',
                                            color: '#a1a1aa'
                                        }}>
                                            <span>{i + 1}. {hint}</span>
                                            <button onClick={() => removeTag('hints', i)} style={removeTagBtn}>×</button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* AI Configuration */}
                            <div style={{ padding: '16px', background: 'rgba(234, 179, 8, 0.05)', borderRadius: '8px', border: '1px solid rgba(234, 179, 8, 0.2)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                                    <Brain size={16} color="#fbbf24" />
                                    <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#fbbf24', margin: 0 }}>AI Assistance</h3>
                                </div>

                                <div style={{ marginBottom: '12px' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                        <input
                                            type="checkbox"
                                            checked={formData.aiConfig.hintsEnabled}
                                            onChange={(e) => setFormData(prev => ({
                                                ...prev,
                                                aiConfig: { ...prev.aiConfig, hintsEnabled: e.target.checked }
                                            }))}
                                            style={{ accentColor: '#fbbf24' }}
                                        />
                                        <span style={{ fontSize: '0.875rem', color: '#fafafa' }}>Enable Hints & AI Solutions</span>
                                    </label>
                                </div>

                                {formData.aiConfig.hintsEnabled && (
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', paddingLeft: '24px' }}>
                                        <div>
                                            <label style={labelStyle}>Hint Threshold</label>
                                            <input
                                                type="number"
                                                value={formData.aiConfig.hintThreshold}
                                                onChange={(e) => setFormData(prev => ({
                                                    ...prev,
                                                    aiConfig: { ...prev.aiConfig, hintThreshold: parseInt(e.target.value) || 0 }
                                                }))}
                                                min="0"
                                                style={inputStyle}
                                            />
                                            <p style={{ margin: '4px 0 0', fontSize: '0.7rem', color: '#71717a' }}>Attempts before hint unlock</p>
                                        </div>
                                        <div>
                                            <label style={labelStyle}>Solution Threshold</label>
                                            <input
                                                type="number"
                                                value={formData.aiConfig.solutionThreshold}
                                                onChange={(e) => setFormData(prev => ({
                                                    ...prev,
                                                    aiConfig: { ...prev.aiConfig, solutionThreshold: parseInt(e.target.value) || 0 }
                                                }))}
                                                min="0"
                                                style={inputStyle}
                                            />
                                            <p style={{ margin: '4px 0 0', fontSize: '0.7rem', color: '#71717a' }}>Attempts before solution unlock</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            {/* Function Name */}
                            <div>
                                <label style={labelStyle}>Function Name</label>
                                <input
                                    type="text"
                                    style={inputStyle}
                                    value={formData.functionSignature.name}
                                    onChange={e => setFormData({
                                        ...formData,
                                        functionSignature: { ...formData.functionSignature, name: e.target.value }
                                    })}
                                    placeholder="e.g. twoSum"
                                />
                                <p style={{ margin: '4px 0 0', fontSize: '0.7rem', color: '#71717a' }}>The name of the function users need to implement.</p>
                            </div>

                            {/* Allowed Languages */}
                            <div>
                                <label style={labelStyle}>Allowed Languages</label>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                                    {SUPPORTED_LANGUAGES.map(lang => (
                                        <button
                                            key={lang.id}
                                            type="button"
                                            onClick={() => toggleLanguage(lang.id)}
                                            style={{
                                                padding: '8px 16px',
                                                borderRadius: '9999px',
                                                fontSize: '0.9rem',
                                                fontWeight: 500,
                                                cursor: 'pointer',
                                                border: formData.allowedLanguages.includes(lang.id) ? '1px solid #fafafa' : '1px solid #27272a',
                                                background: formData.allowedLanguages.includes(lang.id) ? 'rgba(250,250,250,0.1)' : 'transparent',
                                                color: formData.allowedLanguages.includes(lang.id) ? '#fafafa' : '#71717a'
                                            }}
                                        >
                                            {lang.name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* TestCase Manager (Includes Code Config & Test Cases) */}
                            <TestCaseManager
                                description={formData.description}
                                testCases={formData.testCases as any[]}
                                onChange={(newTestCases: any[]) => setFormData(prev => ({ ...prev, testCases: newTestCases }))}
                                allowedLanguages={formData.allowedLanguages}
                                boilerplateCode={formData.starterCode}
                                wrapperCode={formData.testRunnerTemplate}
                                onBoilerplateChange={(lang, code) => setFormData(prev => ({ ...prev, starterCode: { ...prev.starterCode, [lang]: code } }))}
                                onWrapperCodeChange={(lang, code) => setFormData(prev => ({ ...prev, testRunnerTemplate: { ...prev.testRunnerTemplate, [lang]: code } }))}
                                functionName={formData.functionSignature.name}
                            />
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div style={{
                    padding: '20px 24px',
                    borderTop: '1px solid #27272a',
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: '12px'
                }}>
                    <button
                        onClick={onClose}
                        style={{
                            padding: '10px 20px',
                            background: 'transparent',
                            border: '1px solid #27272a',
                            borderRadius: '6px',
                            color: '#fafafa',
                            cursor: 'pointer',
                            fontSize: '0.875rem'
                        }}
                    >
                        Cancel
                    </button>
                    {step < 3 ? (
                        <button
                            onClick={() => setStep(step + 1)}
                            style={{
                                padding: '10px 20px',
                                background: '#fafafa',
                                border: 'none',
                                borderRadius: '6px',
                                color: '#09090b',
                                cursor: 'pointer',
                                fontSize: '0.875rem',
                                fontWeight: 500
                            }}
                        >
                            Next
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            style={{
                                padding: '10px 20px',
                                background: '#fafafa',
                                border: 'none',
                                borderRadius: '6px',
                                color: '#09090b',
                                cursor: loading ? 'wait' : 'pointer',
                                fontSize: '0.875rem',
                                fontWeight: 500,
                                opacity: loading ? 0.7 : 1
                            }}
                        >
                            {loading ? 'Saving...' : 'Save Problem'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '0.875rem',
    fontWeight: 500,
    color: '#a1a1aa',
    marginBottom: '6px'
};

const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 12px',
    background: '#18181b',
    border: '1px solid #27272a',
    borderRadius: '6px',
    color: '#fafafa',
    fontSize: '0.875rem',
    outline: 'none',
    transition: 'border-color 0.2s'
};

const tagStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '4px 8px',
    background: '#27272a',
    borderRadius: '4px',
    fontSize: '0.75rem',
    color: '#fafafa'
};

const removeTagBtn: React.CSSProperties = {
    background: 'transparent',
    border: 'none',
    color: '#a1a1aa',
    cursor: 'pointer',
    fontSize: '1rem',
    lineHeight: 1,
    padding: '0 2px'
};

export default ProblemModal;
