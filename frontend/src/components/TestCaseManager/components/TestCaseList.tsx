import React from 'react';
import { Lock, Unlock, Trash2 } from 'lucide-react';

interface TestCase {
    input: string;
    expectedOutput: string;
    isHidden: boolean;
}

interface TestCaseListProps {
    testCases: TestCase[];
    onChange: (testCases: TestCase[]) => void;
    readOnly?: boolean;
}

const TestCaseList: React.FC<TestCaseListProps> = ({ testCases = [], onChange, readOnly }) => {
    const addNewTestCase = () => {
        onChange([...testCases, { input: '', expectedOutput: '', isHidden: false }]);
    };

    const removeTestCase = (index: number) => {
        onChange(testCases.filter((_, i) => i !== index));
    };

    const updateTestCase = (index: number, field: 'input' | 'expectedOutput', value: string) => {
        onChange(
            testCases.map((tc, i) =>
                i === index ? { ...tc, [field]: value } : tc
            )
        );
    };

    const toggleVisibility = (index: number) => {
        onChange(
            testCases.map((tc, i) =>
                i === index ? { ...tc, isHidden: !tc.isHidden } : tc
            )
        );
    };

    return (
        <div>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '12px'
            }}>
                <label style={{
                    color: 'rgba(255, 255, 255, 0.85)',
                    fontSize: '0.9rem',
                    fontWeight: 600
                }}>
                    Test Cases ({testCases.length})
                </label>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {testCases.map((tc, index) => (
                    <div
                        key={index}
                        style={{
                            background: 'rgba(255, 255, 255, 0.04)',
                            border: '1.5px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '10px',
                            padding: '14px',
                            transition: 'all 0.2s',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                        }}
                    >
                        {/* Header */}
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '12px'
                        }}>
                            <span style={{
                                color: '#FDE68A',
                                fontSize: '0.85rem',
                                fontWeight: 600
                            }}>
                                Test Case #{index + 1}
                            </span>
                            {!readOnly && (
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button
                                        type="button"
                                        onClick={() => toggleVisibility(index)}
                                        title={tc.isHidden ? 'Click to make visible' : 'Click to hide'}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            padding: '6px 12px',
                                            background: tc.isHidden
                                                ? 'rgba(239, 68, 68, 0.15)'
                                                : 'rgba(34, 197, 94, 0.15)',
                                            border: `1px solid ${tc.isHidden ? 'rgba(239, 68, 68, 0.4)' : 'rgba(34, 197, 94, 0.4)'}`,
                                            borderRadius: '6px',
                                            color: tc.isHidden ? '#EF4444' : '#22C55E',
                                            fontSize: '0.75rem',
                                            fontWeight: 600,
                                            cursor: 'pointer',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        {tc.isHidden ? <Lock size={14} /> : <Unlock size={14} />}
                                        {tc.isHidden ? 'Hidden' : 'Visible'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => removeTestCase(index)}
                                        title="Delete test case"
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            width: '32px',
                                            height: '32px',
                                            padding: '0',
                                            background: 'rgba(239, 68, 68, 0.1)',
                                            border: '1px solid rgba(239, 68, 68, 0.3)',
                                            borderRadius: '6px',
                                            color: '#EF4444',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Input Field */}
                        <div style={{ marginBottom: '10px' }}>
                            <label style={{
                                display: 'block',
                                fontSize: '0.75rem',
                                color: 'rgba(255, 255, 255, 0.6)',
                                marginBottom: '6px',
                                fontWeight: 500
                            }}>
                                Test Input
                            </label>
                            <input
                                type="text"
                                value={tc.input}
                                onChange={(e) => updateTestCase(index, 'input', e.target.value)}
                                placeholder='e.g., nums = [2,7,11,15], target = 9'
                                readOnly={readOnly}
                                style={{
                                    width: '100%',
                                    padding: '10px 12px',
                                    background: 'rgba(0, 0, 0, 0.3)',
                                    border: '1px solid rgba(255, 255, 255, 0.15)',
                                    borderRadius: '8px',
                                    color: '#fff',
                                    fontSize: '0.9rem',
                                    fontFamily: 'JetBrains Mono, monospace',
                                    outline: 'none',
                                    transition: 'border-color 0.2s'
                                }}
                                onFocus={(e) => e.target.style.borderColor = 'rgba(253, 230, 138, 0.5)'}
                                onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.15)'}
                            />
                        </div>

                        {/* Expected Output Field */}
                        <div>
                            <label style={{
                                display: 'block',
                                fontSize: '0.75rem',
                                color: 'rgba(255, 255, 255, 0.6)',
                                marginBottom: '6px',
                                fontWeight: 500
                            }}>
                                Expected Output
                            </label>
                            <input
                                type="text"
                                value={tc.expectedOutput}
                                onChange={(e) => updateTestCase(index, 'expectedOutput', e.target.value)}
                                placeholder='e.g., [0,1]'
                                readOnly={readOnly}
                                style={{
                                    width: '100%',
                                    padding: '10px 12px',
                                    background: 'rgba(0, 0, 0, 0.3)',
                                    border: '1px solid rgba(255, 255, 255, 0.15)',
                                    borderRadius: '8px',
                                    color: '#fff',
                                    fontSize: '0.9rem',
                                    fontFamily: 'JetBrains Mono, monospace',
                                    outline: 'none',
                                    transition: 'border-color 0.2s'
                                }}
                                onFocus={(e) => e.target.style.borderColor = 'rgba(253, 230, 138, 0.5)'}
                                onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.15)'}
                            />
                        </div>
                    </div>
                ))}

            </div>

            {!readOnly && (
                <button
                    type="button"
                    onClick={addNewTestCase}
                    style={{
                        width: '100%',
                        padding: '14px',
                        marginTop: '12px',
                        background: 'rgba(253, 230, 138, 0.08)',
                        border: '1.5px dashed rgba(253, 230, 138, 0.4)',
                        borderRadius: '10px',
                        color: '#FDE68A',
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(253, 230, 138, 0.15)';
                        e.currentTarget.style.borderColor = 'rgba(253, 230, 138, 0.6)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(253, 230, 138, 0.08)';
                        e.currentTarget.style.borderColor = 'rgba(253, 230, 138, 0.4)';
                    }}
                >
                    + Add Test Case
                </button>
            )}

            {testCases.length === 0 && (
                <p style={{
                    textAlign: 'center',
                    color: 'rgba(255, 255, 255, 0.4)',
                    fontSize: '0.85rem',
                    marginTop: '12px',
                    fontStyle: 'italic'
                }}>
                    No test cases yet. Add one manually or generate with AI!
                </p>
            )}
        </div>
    );
};

export default TestCaseList;
