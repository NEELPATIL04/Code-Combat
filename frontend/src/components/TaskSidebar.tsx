import React, { useState } from 'react';
import { ChevronRight, ChevronLeft, CheckCircle } from 'lucide-react';

interface TaskSidebarProps {
    tasks: {
        id: number;
        orderIndex: number;
        title: string;
        difficulty: string;
        maxPoints: number;
    }[];
    currentTaskIndex: number;
    onTaskSelect: (index: number) => void;
    completedTasks: number[];
}

const TaskSidebar: React.FC<TaskSidebarProps> = ({ tasks, currentTaskIndex, onTaskSelect, completedTasks }) => {
    const [isCollapsed, setIsCollapsed] = useState(true);

    return (
        <div style={{
            width: isCollapsed ? 60 : 260,
            background: '#131318',
            borderRight: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            transition: 'width 0.3s ease',
            position: 'relative',
            flexShrink: 0
        }}>
            {/* Toggle Button */}
            <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                style={{
                    position: 'absolute',
                    right: -12,
                    top: 20,
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    background: '#1f1f23',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    zIndex: 10,
                    outline: 'none'
                }}
            >
                {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            </button>

            {/* Header */}
            {!isCollapsed && (
                <div style={{
                    padding: '16px 20px',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                    fontSize: 12,
                    fontWeight: 600,
                    color: 'rgba(255, 255, 255, 0.5)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden'
                }}>
                    Problem List
                </div>
            )}

            {/* List */}
            <div style={{
                flex: 1,
                overflowY: 'auto',
                overflowX: 'hidden',
                padding: isCollapsed ? '12px 0' : 12,
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                alignItems: isCollapsed ? 'center' : 'stretch'
            }}>
                {tasks.map((t, idx) => {
                    const isCompleted = completedTasks.includes(t.id);
                    const isActive = idx === currentTaskIndex;

                    return (
                        <div
                            key={t.id}
                            onClick={() => onTaskSelect(idx)}
                            title={isCollapsed ? t.title : undefined}
                            style={{
                                padding: isCollapsed ? '12px 0' : '12px',
                                borderRadius: 8,
                                cursor: 'pointer',
                                background: isActive ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                                border: isActive ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid transparent',
                                transition: 'all 0.2s ease',
                                display: 'flex',
                                flexDirection: isCollapsed ? 'column' : 'column',
                                alignItems: isCollapsed ? 'center' : 'flex-start',
                                justifyContent: 'center',
                                gap: 6,
                                width: isCollapsed ? 40 : 'auto',
                                position: 'relative',
                                minHeight: isCollapsed ? 40 : 'auto'
                            }}
                        >
                            {/* Collapsed View: Just Number */}
                            {isCollapsed ? (
                                <div style={{
                                    fontSize: 14,
                                    fontWeight: isActive ? 700 : 500,
                                    color: isActive ? '#fff' : 'rgba(255, 255, 255, 0.5)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: 2
                                }}>
                                    {idx + 1}
                                    {isCompleted && <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#34d399' }} />}
                                </div>
                            ) : (
                                // Expanded View: Full Details
                                <>
                                    <div style={{
                                        fontSize: 13,
                                        fontWeight: isActive ? 600 : 500,
                                        color: isActive ? '#fff' : 'rgba(255, 255, 255, 0.7)',
                                        lineHeight: '1.4',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 8,
                                        width: '100%'
                                    }}>
                                        {isCompleted ? <CheckCircle size={14} color="#34d399" /> : <div style={{ width: 14, height: 14, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.2)' }} />}
                                        <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{idx + 1}. {t.title}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', paddingLeft: 22 }}>
                                        <span style={{
                                            fontSize: 10,
                                            padding: '2px 8px',
                                            borderRadius: 10,
                                            fontWeight: 600,
                                            background: t.difficulty === 'Easy' ? 'rgba(52, 211, 153, 0.15)' : t.difficulty === 'Medium' ? 'rgba(251, 191, 36, 0.15)' : 'rgba(248, 113, 113, 0.15)',
                                            color: t.difficulty === 'Easy' ? '#34d399' : t.difficulty === 'Medium' ? '#fbbf24' : '#f87171'
                                        }}>
                                            {t.difficulty}
                                        </span>
                                        <span style={{ fontSize: 11, color: 'rgba(255, 255, 255, 0.4)', fontFamily: 'monospace' }}>{t.maxPoints} pts</span>
                                    </div>
                                </>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default TaskSidebar;
