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
}

const labelStyle = { display: 'block', marginBottom: '8px', color: '#a1a1aa', fontSize: '0.8rem', fontWeight: 500 };
const inputStyle = { width: '100%', padding: '10px 12px', background: '#09090b', border: '1px solid #27272a', borderRadius: '6px', color: '#fafafa', fontSize: '0.875rem', outline: 'none' };

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
            <div style={{ marginBottom: '14px' }}>
                <label style={labelStyle}>Task Title</label>
                <input name="title" value={taskInput.title} onChange={handleTaskInputChange} placeholder="e.g. Two Sum" style={inputStyle} />
            </div>

            <div style={{ marginBottom: '14px' }}>
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

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px', gap: '12px', marginBottom: '14px' }}>
                <select name="difficulty" value={taskInput.difficulty} onChange={handleTaskInputChange} style={{ ...inputStyle, cursor: 'pointer' }}>
                    <option value="Easy" style={{ background: '#09090b', color: '#fafafa' }}>Easy</option>
                    <option value="Medium" style={{ background: '#09090b', color: '#fafafa' }}>Medium</option>
                    <option value="Hard" style={{ background: '#09090b', color: '#fafafa' }}>Hard</option>
                </select>
                <input type="number" name="maxPoints" value={taskInput.maxPoints} onChange={handleTaskInputChange} placeholder="Points" min="1" style={inputStyle} />
            </div>

            <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>Allowed Languages</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {SUPPORTED_LANGUAGES.map(lang => (
                        <button key={lang.id} type="button" onClick={() => toggleLanguage(lang.id)} style={{ padding: '5px 10px', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 500, cursor: 'pointer', border: taskInput.allowedLanguages.includes(lang.id) ? '1px solid #fafafa' : '1px solid #27272a', background: taskInput.allowedLanguages.includes(lang.id) ? 'rgba(250,250,250,0.1)' : 'transparent', color: taskInput.allowedLanguages.includes(lang.id) ? '#fafafa' : '#71717a' }}>{lang.name}</button>
                    ))}
                </div>
            </div>

            <button type="button" onClick={onSave} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px 16px', background: '#fafafa', border: 'none', borderRadius: '6px', color: '#09090b', fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer' }}>
                {isEditing ? <><Edit2 size={14} /> Update Task</> : <><Plus size={14} /> Add Task</>}
            </button>

            <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#fafafa', marginTop: '24px', marginBottom: '12px', paddingTop: '24px', borderTop: '1px solid #27272a' }}>Code & Test Cases</h3>

            <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>Function Name</label>
                <input type="text" name="functionName" value={taskInput.functionName} onChange={handleTaskInputChange} placeholder="e.g. solve, calculateSum" style={inputStyle} />
                <p style={{ margin: '4px 0 0', fontSize: '0.7rem', color: '#71717a' }}>The name of the function users need to implement.</p>
            </div>

            <TestCaseManager testCases={taskInput.testCases} onChange={(newTestCases: any[]) => setTaskInput(prev => ({ ...prev, testCases: newTestCases }))} allowedLanguages={taskInput.allowedLanguages} boilerplateCode={taskInput.boilerplateCode} wrapperCode={taskInput.testRunnerTemplate} onBoilerplateChange={(lang: string, code: string) => setTaskInput(prev => ({ ...prev, boilerplateCode: { ...prev.boilerplateCode, [lang]: code } }))} onWrapperCodeChange={(lang: string, code: string) => setTaskInput(prev => ({ ...prev, testRunnerTemplate: { ...prev.testRunnerTemplate, [lang]: code } }))} functionName={taskInput.functionName} />

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
