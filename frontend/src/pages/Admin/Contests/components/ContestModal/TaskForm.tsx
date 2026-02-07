import React, { useState } from 'react';
import { Plus, Edit2, FileEdit, X } from 'lucide-react';
import { Task, SUPPORTED_LANGUAGES } from '../../types';
import TestCaseManager from '../../../../../components/TestCaseManager';
import HTMLEditor from '../../../../../components/HTMLEditor';

interface TaskFormProps {
    taskInput: Task;
    setTaskInput: React.Dispatch<React.SetStateAction<Task>>;
    onSave: () => void;
    isEditing: boolean;
    readOnly?: boolean;
}

const TaskForm: React.FC<TaskFormProps> = ({ taskInput, setTaskInput, onSave, isEditing, readOnly }) => {
    const [showHTMLModal, setShowHTMLModal] = useState(false);

    const handleTaskInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setTaskInput(prev => ({ ...prev, [name]: name === 'maxPoints' ? parseInt(value) : value }));
    };

    const toggleLanguage = (langId: string) => {
        setTaskInput(prev => {
            const current = [...prev.allowedLanguages];
            if (current.includes(langId)) {
                return { ...prev, allowedLanguages: current.filter(id => id !== langId) };
            } else {
                return { ...prev, allowedLanguages: [...current, langId] };
            }
        });
    };

    return (
        <div>
            {/* Title */}
            <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.85rem', fontWeight: 500 }}>
                    Task Title
                </label>
                <input
                    name="title"
                    value={taskInput.title}
                    onChange={handleTaskInputChange}
                    placeholder="e.g. Two Sum"
                    style={{
                        width: '100%',
                        padding: '14px 16px',
                        background: 'rgba(255, 255, 255, 0.04)',
                        border: '1.5px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '10px',
                        color: '#ffffff',
                        fontSize: '0.95rem',
                        outline: 'none'
                    }}
                    disabled={readOnly}
                />
            </div>
            <div style={{ marginBottom: '16px' }}>
                {/* Description Type Toggle */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '10px'
                }}>
                    <label style={{
                        color: 'rgba(255, 255, 255, 0.7)',
                        fontSize: '0.85rem',
                        fontWeight: 500
                    }}>
                        Description
                    </label>
                    <div style={{
                        display: 'flex',
                        background: 'rgba(255, 255, 255, 0.05)',
                        borderRadius: '8px',
                        padding: '3px'
                    }}>
                        <button
                            type="button"
                            onClick={() => setTaskInput(prev => ({ ...prev, descriptionType: 'text' }))}
                            style={{
                                padding: '6px 14px',
                                borderRadius: '6px',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                border: 'none',
                                background: taskInput.descriptionType === 'text'
                                    ? 'rgba(253, 230, 138, 0.2)'
                                    : 'transparent',
                                color: taskInput.descriptionType === 'text'
                                    ? '#FDE68A'
                                    : 'rgba(255, 255, 255, 0.5)',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            Text
                        </button>
                        <button
                            type="button"
                            onClick={() => setTaskInput(prev => ({ ...prev, descriptionType: 'html' }))}
                            style={{
                                padding: '6px 14px',
                                borderRadius: '6px',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                border: 'none',
                                background: taskInput.descriptionType === 'html'
                                    ? 'rgba(59, 130, 246, 0.2)'
                                    : 'transparent',
                                color: taskInput.descriptionType === 'html'
                                    ? '#3b82f6'
                                    : 'rgba(255, 255, 255, 0.5)',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            HTML Editor
                        </button>
                    </div>
                </div>
                {taskInput.descriptionType === 'html' ? (
                    <div>
                        {!readOnly ? (
                            <button
                                type="button"
                                onClick={() => setShowHTMLModal(true)}
                                style={{
                                    width: '100%',
                                    padding: '20px',
                                    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(59, 130, 246, 0.05) 100%)',
                                    border: '1.5px dashed rgba(59, 130, 246, 0.4)',
                                    borderRadius: '10px',
                                    color: '#60a5fa',
                                    fontSize: '0.95rem',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '10px',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                <FileEdit size={18} />
                                {taskInput.description && taskInput.description.trim() !== ''
                                    ? 'Edit HTML Content'
                                    : 'Open HTML Editor'}
                            </button>
                        ) : (
                            <div style={{
                                width: '100%',
                                padding: '20px',
                                background: 'rgba(255, 255, 255, 0.04)',
                                border: '1.5px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: '10px',
                                color: '#e2e8f0',
                                fontSize: '0.95rem',
                                lineHeight: '1.6',
                                maxHeight: '300px',
                                overflowY: 'auto'
                            }}>
                                <div dangerouslySetInnerHTML={{ __html: taskInput.description || '<p>No description provided.</p>' }} />
                            </div>
                        )}
                        {taskInput.description && taskInput.description.trim() !== '' && (
                            <p style={{
                                margin: '8px 0 0',
                                fontSize: '0.75rem',
                                color: 'rgba(34, 197, 94, 0.8)'
                            }}>
                                ✓ HTML content saved
                            </p>
                        )}
                        <p style={{
                            margin: '8px 0 0',
                            fontSize: '0.7rem',
                            color: 'rgba(59, 130, 246, 0.7)'
                        }}>
                            💡 Full featured editor with support for headings, lists, images, code blocks, and more.
                        </p>
                    </div>
                ) : (
                    <textarea
                        name="description"
                        value={taskInput.description}
                        onChange={handleTaskInputChange}
                        placeholder="Task description..."
                        rows={3}
                        style={{
                            width: '100%',
                            padding: '14px 16px',
                            background: 'rgba(255, 255, 255, 0.04)',
                            border: '1.5px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '10px',
                            color: '#ffffff',
                            fontSize: '0.95rem',
                            outline: 'none',
                            resize: 'vertical',
                            minHeight: '70px',
                            lineHeight: '1.5'
                        }}
                        disabled={readOnly}
                    />
                )}

            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px', gap: '14px', marginBottom: '16px' }}>
                <select
                    name="difficulty"
                    value={taskInput.difficulty}
                    onChange={handleTaskInputChange}
                    style={{
                        width: '100%',
                        padding: '14px 16px',
                        background: '#1e2433',
                        border: '1.5px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '10px',
                        color: '#ffffff',
                        fontSize: '0.95rem',
                        outline: 'none',
                        cursor: 'pointer'
                    }}
                    disabled={readOnly}
                >
                    <option value="Easy" style={{ background: '#1e2433', color: '#ffffff' }}>Easy</option>
                    <option value="Medium" style={{ background: '#1e2433', color: '#ffffff' }}>Medium</option>
                    <option value="Hard" style={{ background: '#1e2433', color: '#ffffff' }}>Hard</option>
                </select>
                <input
                    type="number"
                    name="maxPoints"
                    value={taskInput.maxPoints}
                    onChange={handleTaskInputChange}
                    placeholder="Points"
                    min="1"
                    style={{
                        width: '100%',
                        padding: '14px 16px',
                        background: 'rgba(255, 255, 255, 0.04)',
                        border: '1.5px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '10px',
                        color: '#ffffff',
                        fontSize: '0.95rem',
                        outline: 'none'
                    }}
                />
            </div>

            {/* Allowed Languages */}
            <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.85rem', fontWeight: 500 }}>
                    Allowed Languages
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {SUPPORTED_LANGUAGES.map(lang => (
                        <button
                            key={lang.id}
                            type="button"
                            onClick={() => !readOnly && toggleLanguage(lang.id)}
                            style={{
                                padding: '6px 12px',
                                borderRadius: '100px',
                                fontSize: '0.8rem',
                                fontWeight: 500,
                                cursor: 'pointer',
                                border: taskInput.allowedLanguages.includes(lang.id)
                                    ? '1px solid rgba(253, 230, 138, 0.5)'
                                    : '1px solid rgba(255, 255, 255, 0.1)',
                                background: taskInput.allowedLanguages.includes(lang.id)
                                    ? 'rgba(253, 230, 138, 0.2)'
                                    : 'rgba(255, 255, 255, 0.05)',
                                color: taskInput.allowedLanguages.includes(lang.id)
                                    ? '#FDE68A'
                                    : 'rgba(255, 255, 255, 0.5)'
                            }}
                        >
                            {lang.name}
                        </button>
                    ))}
                </div>
            </div>

            {!readOnly && (
                <button
                    type="button"
                    onClick={onSave}
                    style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        padding: '10px 18px',
                        background: 'rgba(253, 230, 138, 0.1)',
                        border: '1.5px solid rgba(253, 230, 138, 0.35)',
                        borderRadius: '10px',
                        color: '#FDE68A',
                        fontSize: '0.88rem',
                        fontWeight: 600,
                        cursor: 'pointer'
                    }}
                >
                    {isEditing ? <><Edit2 size={16} /> Update Task</> : <><Plus size={16} /> Add Task</>}
                </button>
            )}

            {/* Test Case Manager with AI & Code Config */}
            <h3 style={{
                fontSize: '1.1rem',
                fontWeight: 600,
                color: '#ffffff',
                marginTop: '32px',
                marginBottom: '16px',
                paddingTop: '32px',
                borderTop: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
                Code & Test Cases
            </h3>

            <div style={{ marginBottom: '20px' }}>
                <label style={{
                    display: 'block',
                    fontSize: '0.85rem',
                    color: 'rgba(255, 255, 255, 0.7)',
                    marginBottom: '8px',
                    fontWeight: 500
                }}>
                    Function Name
                </label>
                <input
                    type="text"
                    name="functionName"
                    value={taskInput.functionName}
                    onChange={handleTaskInputChange}
                    placeholder="e.g. solve, calculateSum"
                    style={{
                        width: '100%',
                        padding: '12px',
                        background: 'rgba(255, 255, 255, 0.04)',
                        border: '1.5px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '0.95rem',
                        outline: 'none'
                    }}
                />
                <p style={{ margin: '6px 0 0', fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.4)' }}>
                    The name of the function users need to implement. Used for AI generation and testing.
                </p>
            </div>

            <TestCaseManager
                testCases={taskInput.testCases}
                onChange={(newTestCases: any[]) => setTaskInput(prev => ({ ...prev, testCases: newTestCases }))}
                allowedLanguages={taskInput.allowedLanguages}
                boilerplateCode={taskInput.boilerplateCode}
                wrapperCode={taskInput.testRunnerTemplate}
                onBoilerplateChange={(lang: string, code: string) => setTaskInput(prev => ({
                    ...prev,
                    boilerplateCode: { ...prev.boilerplateCode, [lang]: code }
                }))}
                onWrapperCodeChange={(lang: string, code: string) => setTaskInput(prev => ({
                    ...prev,
                    testRunnerTemplate: { ...prev.testRunnerTemplate, [lang]: code }
                }))}

                functionName={taskInput.functionName}
                readOnly={readOnly}
            />

            {/* HTML Editor Modal */}
            {showHTMLModal && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 2000,
                    background: 'rgba(0,0,0,0.8)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backdropFilter: 'blur(4px)'
                }}>
                    <div style={{
                        width: '90%',
                        maxWidth: '900px',
                        background: '#151921',
                        borderRadius: '16px',
                        padding: '24px',
                        border: '1px solid rgba(255,255,255,0.1)',
                        boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                        maxHeight: '90vh',
                        display: 'flex',
                        flexDirection: 'column'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3 style={{ margin: 0, color: '#fff', fontSize: '1.2rem' }}>Edit HTML Content</h3>
                            <button
                                onClick={() => setShowHTMLModal(false)}
                                style={{
                                    background: 'rgba(255,255,255,0.1)',
                                    border: 'none',
                                    color: '#fff',
                                    cursor: 'pointer',
                                    padding: '8px',
                                    borderRadius: '8px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                <X size={18} />
                            </button>
                        </div>
                        <div style={{ flex: 1, overflowY: 'auto', marginBottom: '20px' }}>
                            <HTMLEditor
                                value={taskInput.description}
                                onChange={(val: string) => setTaskInput(prev => ({ ...prev, description: val }))}
                                minHeight="400px"
                            />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                            <button
                                onClick={() => setShowHTMLModal(false)}
                                style={{
                                    padding: '10px 24px',
                                    background: '#FDE68A',
                                    color: '#000',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontWeight: 600,
                                    cursor: 'pointer'
                                }}
                            >
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TaskForm;
