import React, { useState } from 'react';
import { Edit2, X, ChevronLeft, Eye } from 'lucide-react';
import { FormData, Task, SUPPORTED_LANGUAGES } from '../../types';
import TaskForm from './TaskForm';

interface Step2Props {
    formData: FormData;
    setFormData: React.Dispatch<React.SetStateAction<FormData>>;
    readOnly?: boolean;
}

const Step2: React.FC<Step2Props> = ({ formData, setFormData, readOnly }) => {
    const [taskInput, setTaskInput] = useState<Task>({
        title: '',
        description: '',
        descriptionType: 'text',
        difficulty: 'Medium',
        maxPoints: 100,
        allowedLanguages: ['javascript', 'typescript', 'python', 'java', 'cpp'],
        boilerplateCode: {},
        testRunnerTemplate: {},
        testCases: [],
        functionName: 'solution',
    });
    const [editingTaskIndex, setEditingTaskIndex] = useState<number | null>(null);
    const [viewingTaskIndex, setViewingTaskIndex] = useState<number | null>(null);

    const handleSaveTask = () => {
        if (taskInput.title.trim() && taskInput.description.trim()) {
            setFormData(prev => {
                const newTasks = [...prev.tasks];
                if (editingTaskIndex !== null) {
                    newTasks[editingTaskIndex] = { ...taskInput };
                } else {
                    newTasks.push({ ...taskInput });
                }
                return { ...prev, tasks: newTasks };
            });

            setTaskInput({
                title: '',
                description: '',
                descriptionType: 'text',
                difficulty: 'Medium',
                maxPoints: 100,
                allowedLanguages: ['javascript', 'typescript', 'python', 'java', 'cpp'],
                boilerplateCode: {},
                testRunnerTemplate: {},
                testCases: [],
                functionName: 'solution',
            });
            setEditingTaskIndex(null);
        }
    };

    const handleEditTask = (index: number) => {
        const taskToEdit = formData.tasks[index];
        setTaskInput({ ...taskToEdit });
        setEditingTaskIndex(index);
    };

    const handleRemoveTask = (index: number) => {
        setFormData(prev => ({
            ...prev,
            tasks: prev.tasks.filter((_, i) => i !== index)
        }));
    };

    const handleViewTask = (index: number) => {
        const taskToView = formData.tasks[index];
        setTaskInput({ ...taskToView });
        setViewingTaskIndex(index);
    };

    if (viewingTaskIndex !== null) {
        return (
            <div>
                <button
                    onClick={() => setViewingTaskIndex(null)}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        background: 'transparent',
                        border: 'none',
                        color: 'rgba(255, 255, 255, 0.6)',
                        cursor: 'pointer',
                        marginBottom: '16px',
                        fontSize: '0.9rem'
                    }}
                >
                    <ChevronLeft size={16} /> Back to Task List
                </button>
                <div style={{ padding: '20px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                    <TaskForm
                        taskInput={taskInput}
                        setTaskInput={setTaskInput}
                        onSave={() => { }}
                        isEditing={false}
                        readOnly={true}
                    />
                </div>
            </div>
        );
    }

    return (
        <>
            {/* Task List */}
            {formData.tasks.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#ffffff', marginBottom: '8px' }}>
                        Tasks ({formData.tasks.length})
                    </h3>
                    {formData.tasks.map((task, index) => (
                        <div
                            key={index}
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'flex-start',
                                gap: '14px',
                                padding: '16px',
                                background: 'rgba(255, 255, 255, 0.04)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: '10px'
                            }}
                        >
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                    <strong style={{ color: '#FDE68A', fontSize: '0.98rem' }}>{task.title}</strong>
                                    <span style={{
                                        fontSize: '0.7rem',
                                        padding: '2px 8px',
                                        borderRadius: '100px',
                                        fontWeight: 500,
                                        background: task.difficulty === 'Easy' ? 'rgba(16, 185, 129, 0.2)'
                                            : task.difficulty === 'Medium' ? 'rgba(245, 158, 11, 0.2)'
                                                : 'rgba(239, 68, 68, 0.2)',
                                        color: task.difficulty === 'Easy' ? '#34d399'
                                            : task.difficulty === 'Medium' ? '#fbbf24'
                                                : '#f87171'
                                    }}>
                                        {task.difficulty}
                                    </span>
                                </div>
                                <span style={{ display: 'block', fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.4)', fontWeight: 500, marginBottom: '8px' }}>
                                    {task.maxPoints} points
                                </span>
                                <p style={{ margin: '0 0 12px', color: 'rgba(255, 255, 255, 0.55)', fontSize: '0.85rem', lineHeight: 1.5 }}>
                                    {task.description.length > 100 ? task.description.substring(0, 100) + '...' : task.description}
                                </p>

                                {task.allowedLanguages && task.allowedLanguages.length > 0 && (
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
                                        {task.allowedLanguages.map(langId => (
                                            <span
                                                key={langId}
                                                style={{
                                                    padding: '2px 8px',
                                                    background: 'rgba(255, 255, 255, 0.05)',
                                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                                    borderRadius: '4px',
                                                    fontSize: '0.65rem',
                                                    color: 'rgba(255, 255, 255, 0.6)'
                                                }}
                                            >
                                                {SUPPORTED_LANGUAGES.find(l => l.id === langId)?.name || langId}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div style={{ display: 'flex', gap: '8px' }}>
                                {readOnly && (
                                    <button
                                        onClick={() => handleViewTask(index)}
                                        title="View Details"
                                        style={{
                                            padding: '8px',
                                            background: 'rgba(59, 130, 246, 0.1)',
                                            border: '1px solid rgba(59, 130, 246, 0.25)',
                                            borderRadius: '8px',
                                            color: '#60a5fa',
                                            cursor: 'pointer',
                                            display: 'flex'
                                        }}
                                    >
                                        <Eye size={14} />
                                    </button>
                                )}

                                {!readOnly && (
                                    <>
                                        <button
                                            onClick={() => handleEditTask(index)}
                                            title="Edit Task"
                                            style={{
                                                padding: '8px',
                                                background: 'rgba(253, 230, 138, 0.1)',
                                                border: '1px solid rgba(253, 230, 138, 0.25)',
                                                borderRadius: '8px',
                                                color: '#FDE68A',
                                                cursor: 'pointer',
                                                display: 'flex'
                                            }}
                                        >
                                            <Edit2 size={14} />
                                        </button>
                                        <button
                                            onClick={() => handleRemoveTask(index)}
                                            title="Remove Task"
                                            style={{
                                                padding: '8px',
                                                background: 'rgba(239, 68, 68, 0.1)',
                                                border: '1px solid rgba(239, 68, 68, 0.25)',
                                                borderRadius: '8px',
                                                color: '#f87171',
                                                cursor: 'pointer',
                                                display: 'flex'
                                            }}
                                        >
                                            <X size={14} />
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                    <div style={{ height: '1px', background: 'rgba(255, 255, 255, 0.1)', margin: '16px 0' }}></div>
                </div>
            )}

            {readOnly && formData.tasks.length === 0 && (
                <div style={{
                    padding: '40px 20px',
                    textAlign: 'center',
                    background: 'rgba(255, 255, 255, 0.02)',
                    borderRadius: '12px',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    color: 'rgba(255, 255, 255, 0.5)'
                }}>
                    <p style={{ margin: 0 }}>No tasks available for this contest.</p>
                </div>
            )}

            {/* Task Form */}
            {!readOnly && (
                <>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#ffffff', marginBottom: '16px' }}>
                        {editingTaskIndex !== null ? 'Edit Task' : 'Add New Task'}
                    </h3>
                    <div style={{ padding: '20px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                        <TaskForm
                            taskInput={taskInput}
                            setTaskInput={setTaskInput}
                            onSave={handleSaveTask}
                            isEditing={editingTaskIndex !== null}
                            readOnly={readOnly}
                        />
                    </div>
                </>
            )}
        </>
    );
};

export default Step2;
