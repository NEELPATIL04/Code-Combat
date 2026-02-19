import React, { useState } from 'react';
import { Plus, Edit2, FileEdit, X, Brain, Sparkles } from 'lucide-react';
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

const labelStyle = { display: 'block', marginBottom: '8px', color: '#fafafa', fontSize: '1.05rem', fontWeight: 500 };
const inputStyle = { width: '100%', padding: '14px 16px', background: '#09090b', border: '1px solid #27272a', borderRadius: '6px', color: '#fafafa', fontSize: '1.05rem', outline: 'none' };

const TaskForm: React.FC<TaskFormProps> = ({ taskInput, setTaskInput, onSave, isEditing }) => {
    const [showHTMLModal, setShowHTMLModal] = useState(false);

    const handleTaskInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setTaskInput(prev => ({ ...prev, [name]: name === 'maxPoints' ? parseInt(value) : value }));
    };

    const toggleLanguage = (langId: string) => {
        setTaskInput(prev => {
            const current = [...prev.allowedLanguages];
            if (current.includes(langId)) return { ...prev, allowedLanguages: current.filter(id => id !== langId) };
            else return { ...prev, allowedLanguages: [...current, langId] };
        });
    };

    return (
        <div>
            <div style={{ marginBottom: '12px' }}>
                <label style={labelStyle}>Task Title</label>
                <input name="title" value={taskInput.title} onChange={handleTaskInputChange} placeholder="e.g. Two Sum" style={inputStyle} />
            </div>

            <div style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <label style={{ ...labelStyle, marginBottom: 0 }}>Description</label>
                    <div style={{ display: 'flex', background: '#18181b', borderRadius: '6px', padding: '2px' }}>
                        <button type="button" onClick={() => setTaskInput(prev => ({ ...prev, descriptionType: 'text' }))} style={{ padding: '5px 12px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 500, cursor: 'pointer', border: 'none', background: taskInput.descriptionType === 'text' ? '#27272a' : 'transparent', color: taskInput.descriptionType === 'text' ? '#fafafa' : '#71717a' }}>Text</button>
                        <button type="button" onClick={() => setTaskInput(prev => ({ ...prev, descriptionType: 'html' }))} style={{ padding: '5px 12px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 500, cursor: 'pointer', border: 'none', background: taskInput.descriptionType === 'html' ? '#27272a' : 'transparent', color: taskInput.descriptionType === 'html' ? '#3b82f6' : '#71717a' }}>HTML</button>
                    </div>
                </div>
                {taskInput.descriptionType === 'html' ? (
                    <div>
                        <button type="button" onClick={() => setShowHTMLModal(true)} style={{ width: '100%', padding: '16px', background: 'rgba(59,130,246,0.1)', border: '1px dashed rgba(59,130,246,0.3)', borderRadius: '6px', color: '#3b82f6', fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                            <FileEdit size={16} />{taskInput.description?.trim() ? 'Edit HTML Content' : 'Open HTML Editor'}
                        </button>
                        {taskInput.description?.trim() && <p style={{ margin: '6px 0 0', fontSize: '0.7rem', color: '#22c55e' }}>✓ HTML content saved</p>}
                    </div>
                ) : (
                    <textarea name="description" value={taskInput.description} onChange={handleTaskInputChange} placeholder="Task description..." rows={3} style={{ ...inputStyle, resize: 'vertical', minHeight: '70px' }} />
                )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px', gap: '12px', marginBottom: '12px' }}>
                <select name="difficulty" value={taskInput.difficulty} onChange={handleTaskInputChange} style={{ ...inputStyle, cursor: 'pointer' }}>
                    <option value="Easy" style={{ background: '#09090b', color: '#fafafa' }}>Easy</option>
                    <option value="Medium" style={{ background: '#09090b', color: '#fafafa' }}>Medium</option>
                    <option value="Hard" style={{ background: '#09090b', color: '#fafafa' }}>Hard</option>
                </select>
                <input type="number" name="maxPoints" value={taskInput.maxPoints} onChange={handleTaskInputChange} placeholder="Points" min="1" style={inputStyle} />
            </div>

            <div style={{ marginBottom: '12px' }}>
                <label style={labelStyle}>Allowed Languages</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                    {SUPPORTED_LANGUAGES.map(lang => (
                        <button key={lang.id} type="button" onClick={() => toggleLanguage(lang.id)} style={{ padding: '8px 16px', borderRadius: '9999px', fontSize: '0.9rem', fontWeight: 500, cursor: 'pointer', border: taskInput.allowedLanguages.includes(lang.id) ? '1px solid #fafafa' : '1px solid #27272a', background: taskInput.allowedLanguages.includes(lang.id) ? 'rgba(250,250,250,0.1)' : 'transparent', color: taskInput.allowedLanguages.includes(lang.id) ? '#fafafa' : '#71717a' }}>{lang.name}</button>
                    ))}
                </div>
            </div>

            {/* Note: AI Configuration is now controlled from Contest Settings tab only */}

            <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#fafafa', marginTop: '16px', marginBottom: '10px', paddingTop: '16px', borderTop: '1px solid #27272a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={16} color="#a855f7" /> AI Evaluation
            </h3>

            <div style={{ background: 'rgba(168, 85, 247, 0.05)', border: '1px solid rgba(168, 85, 247, 0.15)', borderRadius: '10px', padding: '14px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <label style={{ color: '#fafafa', fontSize: '0.9rem', fontWeight: 500 }}>Enable AI Evaluation</label>
                        <p style={{ margin: 0, fontSize: '0.7rem', color: '#a1a1aa' }}>AI will check if the solution uses expected concepts/patterns meaningfully</p>
                    </div>
                    <button
                        type="button"
                        onClick={() => setTaskInput(prev => ({ ...prev, aiEvalConfig: { ...prev.aiEvalConfig, enabled: !prev.aiEvalConfig.enabled } }))}
                        style={{
                            width: '44px', height: '24px', borderRadius: '12px', border: 'none', cursor: 'pointer',
                            background: taskInput.aiEvalConfig.enabled ? '#a855f7' : '#27272a',
                            position: 'relative', transition: 'background 0.2s'
                        }}
                    >
                        <div style={{
                            width: '18px', height: '18px', borderRadius: '50%', background: '#fff',
                            position: 'absolute', top: '3px',
                            left: taskInput.aiEvalConfig.enabled ? '23px' : '3px',
                            transition: 'left 0.2s'
                        }} />
                    </button>
                </div>

                {taskInput.aiEvalConfig.enabled && (
                    <>
                        <div style={{ marginBottom: '12px' }}>
                            <label style={{ display: 'block', marginBottom: '6px', color: '#d4d4d8', fontSize: '0.85rem', fontWeight: 500 }}>AI Evaluation Weight (%)</label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <input
                                    type="range" min="0" max="50" step="5"
                                    value={taskInput.aiEvalConfig.weight}
                                    onChange={(e) => setTaskInput(prev => ({ ...prev, aiEvalConfig: { ...prev.aiEvalConfig, weight: parseInt(e.target.value) } }))}
                                    style={{ flex: 1, accentColor: '#a855f7' }}
                                />
                                <span style={{ color: '#a855f7', fontWeight: 700, fontSize: '1rem', minWidth: '48px', textAlign: 'center' }}>{taskInput.aiEvalConfig.weight}%</span>
                            </div>
                            <p style={{ margin: '4px 0 0', fontSize: '0.7rem', color: '#71717a' }}>
                                Test cases = {100 - taskInput.aiEvalConfig.weight}% • AI Evaluation = {taskInput.aiEvalConfig.weight}% of total score
                            </p>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '6px', color: '#d4d4d8', fontSize: '0.85rem', fontWeight: 500 }}>Expected Concepts / Approach</label>
                            <textarea
                                value={taskInput.aiEvalConfig.expectedConcepts}
                                onChange={(e) => setTaskInput(prev => ({ ...prev, aiEvalConfig: { ...prev.aiEvalConfig, expectedConcepts: e.target.value } }))}
                                placeholder={'Describe what you expect in the solution. Be specific.\n\nExample: "The solution should use setTimeout meaningfully to implement a debounce function. Simply declaring setTimeout without using it in the logic should not count. The function must delay execution and clear previous timeouts on subsequent calls."'}
                                rows={4}
                                style={{ ...inputStyle, resize: 'vertical', minHeight: '90px', fontSize: '0.9rem' }}
                            />
                            <p style={{ margin: '4px 0 0', fontSize: '0.7rem', color: '#71717a' }}>
                                Be specific about what concepts/functions should be used and HOW they should be used meaningfully.
                            </p>
                        </div>
                    </>
                )}
            </div>

            <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#fafafa', marginTop: '16px', marginBottom: '10px', paddingTop: '16px', borderTop: '1px solid #27272a' }}>Code & Test Cases</h3>

            <div style={{ marginBottom: '12px' }}>
                <label style={labelStyle}>Function Name</label>
                <input type="text" name="functionName" value={taskInput.functionName} onChange={handleTaskInputChange} placeholder="e.g. solve, calculateSum" style={inputStyle} />
                <p style={{ margin: '4px 0 0', fontSize: '0.7rem', color: '#71717a' }}>The name of the function users need to implement.</p>
            </div>

            <TestCaseManager description={taskInput.description} testCases={taskInput.testCases} onChange={(newTestCases: any[]) => setTaskInput(prev => ({ ...prev, testCases: newTestCases }))} allowedLanguages={taskInput.allowedLanguages} boilerplateCode={taskInput.boilerplateCode} wrapperCode={taskInput.testRunnerTemplate} onBoilerplateChange={(lang: string, code: string) => setTaskInput(prev => ({ ...prev, boilerplateCode: { ...prev.boilerplateCode, [lang]: code } }))} onWrapperCodeChange={(lang: string, code: string) => setTaskInput(prev => ({ ...prev, testRunnerTemplate: { ...prev.testRunnerTemplate, [lang]: code } }))} functionName={taskInput.functionName} />

            <div style={{ marginTop: '16px' }}>
                <button type="button" onClick={onSave} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px 16px', background: '#fafafa', border: 'none', borderRadius: '6px', color: '#09090b', fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer' }}>
                    {isEditing ? <><Edit2 size={14} /> Update Task</> : <><Plus size={14} /> Add Task</>}
                </button>
            </div>

            {showHTMLModal && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
                    <div style={{ width: '90%', maxWidth: '900px', background: '#09090b', borderRadius: '12px', padding: '20px', border: '1px solid #27272a', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <h3 style={{ margin: 0, color: '#fafafa', fontSize: '1rem', fontWeight: 600 }}>Edit HTML Content</h3>
                            <button onClick={() => setShowHTMLModal(false)} style={{ background: 'transparent', border: '1px solid #27272a', color: '#a1a1aa', cursor: 'pointer', padding: '8px', borderRadius: '6px', display: 'flex' }}><X size={16} /></button>
                        </div>
                        <div style={{ flex: 1, overflowY: 'auto', marginBottom: '16px' }}>
                            <HTMLEditor value={taskInput.description} onChange={(val: string) => setTaskInput(prev => ({ ...prev, description: val }))} minHeight="400px" />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <button onClick={() => setShowHTMLModal(false)} style={{ padding: '10px 20px', background: '#fafafa', color: '#09090b', border: 'none', borderRadius: '6px', fontWeight: 500, cursor: 'pointer' }}>Done</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TaskForm;
