import React from 'react';
import { ChevronRight, Clock, CheckCircle, Circle } from 'lucide-react';

interface TaskInfo {
    id: number;
    orderIndex: number;
    title: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    maxPoints: number;
    estimatedTime?: number; // in minutes
}

interface TaskSidebarProps {
    tasks: TaskInfo[];
    currentTaskIndex: number;
    onTaskSelect: (index: number) => void;
    completedTasks?: number[];
}

const TaskSidebar: React.FC<TaskSidebarProps> = ({
    tasks,
    currentTaskIndex,
    onTaskSelect,
    completedTasks = [],
}) => {
    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'Easy': return { bg: 'rgba(16, 185, 129, 0.15)', text: '#34d399', border: '1px solid rgba(16, 185, 129, 0.3)' };
            case 'Medium': return { bg: 'rgba(251, 191, 36, 0.15)', text: '#fbbf24', border: '1px solid rgba(251, 191, 36, 0.3)' };
            case 'Hard': return { bg: 'rgba(239, 68, 68, 0.15)', text: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)' };
            default: return { bg: 'rgba(148, 163, 184, 0.15)', text: '#94a3b8', border: '1px solid rgba(148, 163, 184, 0.3)' };
        }
    };

    return (
        <div style={{
            height: '100%',
            background: '#0f0f10',
            borderRight: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
        }}>
            {/* Header */}
            <div style={{
                padding: '16px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                background: '#0f0f10',
            }}>
                <h3 style={{
                    margin: 0,
                    fontSize: 14,
                    fontWeight: 600,
                    color: 'rgba(255, 255, 255, 0.8)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                }}>
                    Tasks
                </h3>
                <p style={{
                    margin: '4px 0 0',
                    fontSize: 12,
                    color: 'rgba(255, 255, 255, 0.5)',
                }}>
                    {completedTasks.length} of {tasks.length} completed
                </p>
            </div>

            {/* Task List */}
            <div style={{
                flex: 1,
                overflow: 'auto',
                padding: '8px',
            }}>
                {tasks.map((task, index) => {
                    const isCurrentTask = index === currentTaskIndex;
                    const isCompleted = completedTasks.includes(task.id);
                    const difficultyColor = getDifficultyColor(task.difficulty);

                    return (
                        <div
                            key={task.id}
                            onClick={() => onTaskSelect(index)}
                            style={{
                                padding: '12px',
                                marginBottom: '8px',
                                background: isCurrentTask
                                    ? 'rgba(253, 230, 138, 0.12)'
                                    : '#f5f5f0',
                                border: isCurrentTask
                                    ? '1px solid rgba(253, 230, 138, 0.35)'
                                    : '1px solid rgba(245, 245, 240, 0.3)',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                position: 'relative',
                            }}
                            onMouseEnter={(e) => {
                                if (!isCurrentTask) {
                                    (e.currentTarget as HTMLDivElement).style.background = '#efefea';
                                    (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(245, 245, 240, 0.5)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!isCurrentTask) {
                                    (e.currentTarget as HTMLDivElement).style.background = '#f5f5f0';
                                    (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(245, 245, 240, 0.3)';
                                }
                            }}
                        >
                            {/* Task Number and Status */}
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                marginBottom: '8px',
                            }}>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: '20px',
                                    height: '20px',
                                    borderRadius: '50%',
                                    background: isCompleted
                                        ? 'rgba(16, 185, 129, 0.25)'
                                        : isCurrentTask ? 'rgba(107, 114, 128, 0.3)' : 'rgba(107, 114, 128, 0.15)',
                                    fontSize: '11px',
                                    fontWeight: 700,
                                    color: isCompleted ? '#34d399' : isCurrentTask ? 'rgba(255, 255, 255, 0.6)' : '#6b7280',
                                }}>
                                    {isCompleted ? (
                                        <CheckCircle size={14} />
                                    ) : (
                                        <Circle size={14} />
                                    )}
                                </div>

                                <span style={{
                                    fontSize: '12px',
                                    fontWeight: 600,
                                    color: isCurrentTask ? '#1a1a1a' : '#2a2a2a',
                                }}>
                                    Task {task.orderIndex}
                                </span>

                                {isCurrentTask && (
                                    <ChevronRight
                                        size={14}
                                        style={{
                                            marginLeft: 'auto',
                                            color: '#FDE68A',
                                        }}
                                    />
                                )}
                            </div>

                            {/* Task Title */}
                            <h4 style={{
                                margin: '0 0 8px',
                                fontSize: '13px',
                                fontWeight: 600,
                                color: isCurrentTask ? '#1a1a1a' : '#2a2a2a',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                            }}>
                                {task.title}
                            </h4>

                            {/* Task Metadata */}
                            <div style={{
                                display: 'flex',
                                gap: '8px',
                                alignItems: 'center',
                            }}>
                                {/* Difficulty Badge */}
                                <span style={{
                                    padding: '2px 6px',
                                    borderRadius: '3px',
                                    fontSize: '10px',
                                    fontWeight: 600,
                                    background: difficultyColor.bg,
                                    color: difficultyColor.text,
                                    border: difficultyColor.border,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.3px',
                                }}>
                                    {task.difficulty}
                                </span>

                                {/* Points Badge */}
                                <span style={{
                                    padding: '2px 6px',
                                    borderRadius: '3px',
                                    fontSize: '10px',
                                    fontWeight: 600,
                                    background: 'rgba(147, 51, 234, 0.15)',
                                    color: '#d8b4fe',
                                    border: '1px solid rgba(147, 51, 234, 0.3)',
                                }}>
                                    {task.maxPoints} pts
                                </span>
                            </div>

                            {/* Time Estimate */}
                            {task.estimatedTime && (
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    marginTop: '8px',
                                    fontSize: '11px',
                                    color: 'rgba(255, 255, 255, 0.4)',
                                }}>
                                    <Clock size={12} />
                                    <span>~{task.estimatedTime} min</span>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Footer Stats */}
            <div style={{
                padding: '12px 16px',
                borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                background: '#0f0f10',
                fontSize: '12px',
                color: 'rgba(255, 255, 255, 0.5)',
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Total Points: {tasks.reduce((sum, task) => sum + task.maxPoints, 0)}</span>
                    <span>Completed: {completedTasks.length}</span>
                </div>
            </div>
        </div>
    );
};

export default TaskSidebar;
