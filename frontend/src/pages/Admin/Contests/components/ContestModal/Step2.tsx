import React, { useState } from 'react';
import { Edit2, X } from 'lucide-react';
import { FormData, Task, SUPPORTED_LANGUAGES } from '../../types';
import TaskForm from './TaskForm';

interface Step2Props {
    formData: FormData;
    setFormData: React.Dispatch<React.SetStateAction<FormData>>;
}

const Step2: React.FC<Step2Props> = ({ formData, setFormData }) => {
    const [taskInput, setTaskInput] = useState<Task>({ title: '', description: '', descriptionType: 'text', difficulty: 'Medium', maxPoints: 100, allowedLanguages: ['javascript', 'typescript', 'python', 'java', 'cpp'], boilerplateCode: {}, testRunnerTemplate: {}, testCases: [], functionName: 'solution' });
    const [editingTaskIndex, setEditingTaskIndex] = useState<number | null>(null);

    const handleSaveTask = () => {
        if (taskInput.title.trim() && taskInput.description.trim()) {
            setFormData(prev => {
                const newTasks = [...prev.tasks];
                if (editingTaskIndex !== null) newTasks[editingTaskIndex] = { ...taskInput };
                else newTasks.push({ ...taskInput });
                return { ...prev, tasks: newTasks };
            });
            setTaskInput({ title: '', description: '', descriptionType: 'text', difficulty: 'Medium', maxPoints: 100, allowedLanguages: ['javascript', 'typescript', 'python', 'java', 'cpp'], boilerplateCode: {}, testRunnerTemplate: {}, testCases: [], functionName: 'solution' });
            setEditingTaskIndex(null);
        }
    };

    const handleEditTask = (index: number) => { setTaskInput({ ...formData.tasks[index] }); setEditingTaskIndex(index); };
    const handleRemoveTask = (index: number) => { setFormData(prev => ({ ...prev, tasks: prev.tasks.filter((_, i) => i !== index) })); };

    return (
        <>
            {formData.tasks.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
                    <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#fafafa', marginBottom: '8px' }}>Tasks ({formData.tasks.length})</h3>
                    {formData.tasks.map((task, index) => (
                        <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '14px', padding: '14px', background: 'rgba(255,255,255,0.02)', border: '1px solid #27272a', borderRadius: '8px' }}>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                    <strong style={{ color: '#fafafa', fontSize: '0.875rem' }}>{task.title}</strong>
                                    <span style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        width: '80px',
                                        fontSize: '0.65rem',
                                        padding: '2px 8px',
                                        borderRadius: '9999px',
                                        fontWeight: 500,
                                        background: task.difficulty === 'Easy' ? 'rgba(34,197,94,0.15)' : task.difficulty === 'Medium' ? 'rgba(234,179,8,0.15)' : 'rgba(239,68,68,0.15)',
                                        color: task.difficulty === 'Easy' ? '#22c55e' : task.difficulty === 'Medium' ? '#eab308' : '#ef4444'
                                    }}>{task.difficulty}</span>
                                </div>
                                <span style={{ display: 'block', fontSize: '0.7rem', color: '#71717a', fontWeight: 500, marginBottom: '6px' }}>{task.maxPoints} points</span>
                                <p style={{ margin: '0 0 8px', color: '#a1a1aa', fontSize: '0.8rem', lineHeight: 1.5 }}>{task.description.length > 100 ? task.description.substring(0, 100) + '...' : task.description}</p>
                                {task.allowedLanguages && task.allowedLanguages.length > 0 && (
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '6px' }}>
                                        {task.allowedLanguages.map(langId => (
                                            <span key={langId} style={{ padding: '2px 8px', background: '#18181b', border: '1px solid #27272a', borderRadius: '4px', fontSize: '0.6rem', color: '#71717a' }}>{SUPPORTED_LANGUAGES.find(l => l.id === langId)?.name || langId}</span>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div style={{ display: 'flex', gap: '6px' }}>
                                <button onClick={() => handleEditTask(index)} title="Edit Task" style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: '1px solid #27272a', borderRadius: '6px', color: '#a1a1aa', cursor: 'pointer' }}><Edit2 size={14} /></button>
                                <button onClick={() => handleRemoveTask(index)} title="Remove Task" style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: '1px solid #27272a', borderRadius: '6px', color: '#ef4444', cursor: 'pointer' }}><X size={14} /></button>
                            </div>
                        </div>
                    ))}
                    <div style={{ height: '1px', background: '#27272a', margin: '12px 0' }}></div>
                </div>
            )}
            <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#fafafa', marginBottom: '12px' }}>{editingTaskIndex !== null ? 'Edit Task' : 'Add New Task'}</h3>
            <div style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid #27272a' }}>
                <TaskForm taskInput={taskInput} setTaskInput={setTaskInput} onSave={handleSaveTask} isEditing={editingTaskIndex !== null} />
            </div>
        </>
    );
};

export default Step2;
