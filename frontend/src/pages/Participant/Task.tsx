import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Play, Send, XCircle, Clock, ChevronRight, Check, X, GripHorizontal, Minimize2, Lightbulb, Brain, Unlock, MessageSquare } from 'lucide-react';
import Editor from '@monaco-editor/react';
import { submissionAPI, aiAPI } from '../../utils/api';
// import { Lightbulb } from 'lucide-react'; // Will replace this in next step with actual icon import


interface Task {
    id: number;
    contestId: number;
    title: string;
    description: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    maxPoints: number;
    orderIndex: number;
    allowedLanguages: string[];
    aiConfig?: {
        hintsEnabled: boolean;
        hintThreshold: number;
        solutionThreshold: number;
    };
}

interface Contest {
    id: number;
    title: string;
    duration: number;
    status: string;
    fullScreenMode?: boolean;
}

interface TestCase {
    id: number;
    input: string;
    expectedOutput: string;
    actualOutput?: string;
    passed?: boolean;
    executionTime?: number;
}

interface SubmissionHistory {
    id: number;
    timestamp: Date;
    status: 'Accepted' | 'Wrong Answer' | 'Time Limit Exceeded' | 'Runtime Error';
    runtime: string;
    memory: string;
    language: string;
}

// Panel types for drag-drop
type PanelType = 'description' | 'editor' | 'testcases';

const LANGUAGE_BOILERPLATES: Record<string, string> = {
    javascript: '// Write your JavaScript solution here\nfunction solve(nums, target) {\n    // Your code here\n    return [];\n}\n',
    typescript: '// Write your TypeScript solution here\nfunction solve(nums: number[], target: number): number[] {\n    // Your code here\n    return [];\n}\n',
    python: '# Write your Python solution here\ndef solve(nums, target):\n    # Your code here\n    pass\n',
    java: '// Write your Java solution here\nclass Solution {\n    public int[] solve(int[] nums, int target) {\n        // Your code here\n        return new int[]{};\n    }\n}\n',
    cpp: '// Write your C++ solution here\n#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    vector<int> solve(vector<int>& nums, int target) {\n        // Your code here\n        return {};\n    }\n};\n',
};

const getFileExtension = (lang: string): string => {
    switch (lang) {
        case 'javascript': return 'js';
        case 'typescript': return 'ts';
        case 'python': return 'py';
        case 'java': return 'java';
        case 'cpp': return 'cpp';
        default: return 'txt';
    }
};

// Define props for MemoizedCodeEditor
interface MemoizedCodeEditorProps {
    taskId: number;
    language: string;
    code: string;
    onCodeChange: (value: string | undefined) => void;
    allowedLanguages: string[];
    onLanguageChange: (lang: string) => void;
    isRunning: boolean;
    onRun: () => void;
    onSubmit: () => void;
    onGetHint: () => void;
    isGeneratingHint: boolean;
    onGetSolution: () => void;
    isGeneratingSolution: boolean;
    onAnalyze: () => void;
    isAnalyzing: boolean;
    aiConfig?: {
        hintsEnabled: boolean;
        hintThreshold: number;
        solutionThreshold: number;
    };
}

// Memoized Code Editor component to prevent re-renders
const MemoizedCodeEditor = React.memo<MemoizedCodeEditorProps>(({
    taskId,
    language,
    code,
    onCodeChange,
    allowedLanguages,
    onLanguageChange,
    isRunning,
    onRun,
    onSubmit,
    onGetHint,
    isGeneratingHint,
    onGetSolution,
    isGeneratingSolution,
    onAnalyze,
    isAnalyzing,
    aiConfig,
}) => {
    const editorOptions = useMemo(() => ({
        minimap: { enabled: false },
        fontSize: 14,
        lineNumbers: 'on' as const,
        scrollBeyondLastLine: false,
        automaticLayout: true,
        tabSize: 2,
        wordWrap: 'on' as const,
        padding: { top: 12 },
        fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', Consolas, monospace",
        fontLigatures: true,
    }), []);

    return (
        <>
            {/* Editor Header */}
            <div style={{ padding: '8px 12px', borderBottom: '1px solid rgba(255, 255, 255, 0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255, 255, 255, 0.02)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <select
                        value={language}
                        onChange={(e) => onLanguageChange(e.target.value)}
                        style={{ padding: '5px 24px 5px 10px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 5, color: '#fff', fontSize: 12, cursor: 'pointer' }}
                    >
                        {(allowedLanguages.length ? allowedLanguages : ['javascript', 'typescript', 'python']).map((lang: string) => (
                            <option key={lang} value={lang} style={{ background: '#111113' }}>{lang.charAt(0).toUpperCase() + lang.slice(1)}</option>
                        ))}
                    </select>
                </div>
                <span style={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.4)', fontFamily: 'monospace' }}>
                    solution.{getFileExtension(language)}
                </span>
            </div>

            {/* Monaco Editor */}
            <div style={{ flex: 1, overflow: 'hidden' }}>
                <Editor
                    key={`${taskId}-${language}`}
                    height="100%"
                    language={language}
                    defaultValue={code}
                    onChange={onCodeChange}
                    onMount={(editor) => {
                        // Force layout after a delay to ensure font widths are calculated correctly
                        setTimeout(() => editor.layout(), 100);
                        setTimeout(() => editor.layout(), 500); // Secondary check for slow font loads
                    }}
                    theme="vs-dark"
                    options={editorOptions}
                />
            </div>

            {/* Action Buttons */}
            <div style={{ padding: '8px 12px', borderTop: '1px solid rgba(255, 255, 255, 0.06)', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                {aiConfig?.hintsEnabled && (
                    <button
                        onClick={onGetHint}
                        disabled={isGeneratingHint || isRunning}
                        style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 14px', background: 'rgba(234, 179, 8, 0.15)', border: '1px solid rgba(234, 179, 8, 0.3)', borderRadius: 6, color: '#fbbf24', fontSize: 13, cursor: (isGeneratingHint || isRunning) ? 'not-allowed' : 'pointer', opacity: (isGeneratingHint || isRunning) ? 0.6 : 1 }}
                    >
                        <Lightbulb size={14} />
                        {isGeneratingHint ? 'Thinking...' : 'Get Hint'}
                    </button>
                )}
                {aiConfig?.hintsEnabled && (
                    <button
                        onClick={onGetSolution}
                        disabled={isGeneratingSolution || isRunning}
                        style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 14px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 6, color: '#f87171', fontSize: 13, cursor: (isGeneratingSolution || isRunning) ? 'not-allowed' : 'pointer', opacity: (isGeneratingSolution || isRunning) ? 0.6 : 1 }}
                    >
                        <Unlock size={14} />
                        {isGeneratingSolution ? 'Unlocking...' : 'Get Solution'}
                    </button>
                )}
                {aiConfig?.hintsEnabled && (
                    <button
                        onClick={onAnalyze}
                        disabled={isAnalyzing || isRunning}
                        style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 14px', background: 'rgba(59, 130, 246, 0.15)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: 6, color: '#60a5fa', fontSize: 13, cursor: (isAnalyzing || isRunning) ? 'not-allowed' : 'pointer', opacity: (isAnalyzing || isRunning) ? 0.6 : 1 }}
                    >
                        <MessageSquare size={14} />
                        {isAnalyzing ? 'Analyzing...' : 'AI Feedback'}
                    </button>
                )}
                <button
                    onClick={onRun}
                    disabled={isRunning}
                    style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 14px', background: 'transparent', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: 6, color: 'rgba(255, 255, 255, 0.8)', fontSize: 13, cursor: isRunning ? 'not-allowed' : 'pointer', opacity: isRunning ? 0.6 : 1 }}
                >
                    <Play size={14} />
                    {isRunning ? 'Running...' : 'Run'}
                </button>
                <button
                    onClick={onSubmit}
                    disabled={isRunning}
                    style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 14px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: 6, color: '#34d399', fontSize: 13, fontWeight: 500, cursor: isRunning ? 'not-allowed' : 'pointer', opacity: isRunning ? 0.6 : 1 }}
                >
                    <Send size={14} />
                    Submit
                </button>
            </div>
        </>
    );
}, (prevProps, nextProps) => {
    // Custom comparison to prevent re-renders when code changes
    // The editor is uncontrolled, so it handles its own code state for typing.
    // We only want to re-render if fundamental props change.
    return (
        prevProps.taskId === nextProps.taskId &&
        prevProps.language === nextProps.language &&
        prevProps.isRunning === nextProps.isRunning &&
        prevProps.isGeneratingHint === nextProps.isGeneratingHint &&
        prevProps.isGeneratingHint === nextProps.isGeneratingHint &&
        prevProps.isGeneratingSolution === nextProps.isGeneratingSolution &&
        prevProps.isAnalyzing === nextProps.isAnalyzing &&
        JSON.stringify(prevProps.allowedLanguages) === JSON.stringify(nextProps.allowedLanguages) &&
        JSON.stringify(prevProps.aiConfig) === JSON.stringify(nextProps.aiConfig)
    );
});

MemoizedCodeEditor.displayName = 'MemoizedCodeEditor';

// Memoized Panel Header
const PanelHeader = React.memo<{
    title: string;
    panelType: PanelType;
    onClose?: () => void;
    showClose?: boolean;
    onDragStart: (panel: PanelType) => (e: React.DragEvent) => void;
    onDragEnd: () => void;
}>(({ title, panelType, onClose, showClose, onDragStart, onDragEnd }) => (
    <div
        draggable
        onDragStart={onDragStart(panelType)}
        onDragEnd={onDragEnd}
        style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '6px 12px',
            background: 'rgba(255, 255, 255, 0.03)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            cursor: 'grab',
        }}
    >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <GripHorizontal size={14} style={{ color: 'rgba(255, 255, 255, 0.3)' }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255, 255, 255, 0.7)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {title}
            </span>
        </div>
        {showClose && onClose && (
            <button
                onClick={onClose}
                style={{
                    background: 'transparent',
                    border: 'none',
                    padding: 4,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <Minimize2 size={14} style={{ color: 'rgba(255, 255, 255, 0.4)' }} />
            </button>
        )}
    </div>
));
PanelHeader.displayName = 'PanelHeader';

// Memoized Description Content
const MemoizedDescription = React.memo<{ task: Task; testCases: TestCase[]; leftActiveTab: string; submissions: SubmissionHistory[]; onTabChange: (tab: 'description' | 'submissions') => void }>(({ task, testCases, leftActiveTab, submissions, onTabChange }) => {
    const getDifficultyStyles = (difficulty: string) => {
        switch (difficulty) {
            case 'Easy': return { background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.3)' };
            case 'Medium': return { background: 'rgba(251, 191, 36, 0.15)', color: '#fbbf24', border: '1px solid rgba(251, 191, 36, 0.3)' };
            case 'Hard': return { background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)' };
            default: return { background: 'rgba(148, 163, 184, 0.15)', color: '#94a3b8', border: '1px solid rgba(148, 163, 184, 0.3)' };
        }
    };

    return (
        <div style={{ flex: 1, overflow: 'auto', padding: 16 }}>
            <div style={{ display: 'flex', gap: 2, marginBottom: 16 }}>
                {(['description', 'submissions'] as const).map(tab => (
                    <button
                        key={tab}
                        onClick={() => onTabChange(tab)}
                        style={{
                            padding: '8px 14px',
                            background: leftActiveTab === tab ? 'rgba(253, 230, 138, 0.1)' : 'transparent',
                            border: leftActiveTab === tab ? '1px solid rgba(253, 230, 138, 0.25)' : '1px solid transparent',
                            borderRadius: 6,
                            color: leftActiveTab === tab ? '#FDE68A' : 'rgba(255, 255, 255, 0.5)',
                            fontSize: 13,
                            fontWeight: 500,
                            cursor: 'pointer',
                            textTransform: 'capitalize',
                        }}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {leftActiveTab === 'description' ? (
                <>
                    <div style={{ marginBottom: 16 }}>
                        <h1 style={{ margin: '0 0 10px', fontSize: 18, fontWeight: 600 }}>{task.title}</h1>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <span style={{ padding: '3px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600, ...getDifficultyStyles(task.difficulty) }}>
                                {task.difficulty}
                            </span>
                            <span style={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.5)' }}>{task.maxPoints} pts</span>
                        </div>
                    </div>
                    <div
                        className="task-description"
                        style={{ color: 'rgba(255, 255, 255, 0.75)', fontSize: 14, lineHeight: 1.7 }}
                        dangerouslySetInnerHTML={{ __html: task.description }}
                    >
                    </div>
                    <style>{`
                        .task-description h1 { font-size: 1.75rem; font-weight: 700; color: #fff; margin-top: 1.5rem; margin-bottom: 1rem; }
                        .task-description h2 { font-size: 1.35rem; font-weight: 600; color: #fff; margin-top: 1.5rem; margin-bottom: 0.75rem; }
                        .task-description h3 { font-size: 1.1rem; font-weight: 600; color: #fff; margin-top: 1rem; margin-bottom: 0.5rem; }
                        .task-description p { margin-bottom: 0.75rem; }
                        .task-description ul, .task-description ol { padding-left: 1.5rem; margin-bottom: 1rem; }
                        .task-description ul { list-style-type: disc; }
                        .task-description ol { list-style-type: decimal; }
                        .task-description li { margin-bottom: 0.25rem; }
                        .task-description blockquote {
                            border-left: 4px solid #fde047;
                            padding-left: 1rem;
                            margin: 1rem 0;
                            font-style: italic;
                            color: #ffeebb;
                            background: rgba(253, 224, 71, 0.1);
                            padding: 0.75rem 1rem;
                            border-radius: 0 4px 4px 0;
                        }
                        .task-description pre {
                            background: #0d0d0d;
                            padding: 1rem;
                            border-radius: 0.5rem;
                            color: #f8f8f2;
                            font-family: 'JetBrains Mono', monospace;
                            overflow-x: auto;
                            border: 1px solid rgba(255,255,255,0.1);
                            margin: 1rem 0;
                        }
                        .task-description code {
                            font-family: 'JetBrains Mono', monospace;
                            background: rgba(255,255,255,0.1);
                            padding: 0.2rem 0.4rem;
                            border-radius: 0.25rem;
                            font-size: 0.9em;
                            color: #f472b6;
                        }
                        .task-description pre code {
                            background: transparent;
                            padding: 0;
                            color: inherit;
                        }
                        .task-description img {
                            max-width: 100%;
                            height: auto;
                            border-radius: 0.5rem;
                            margin: 1rem 0;
                            display: block;
                        }
                        .task-description hr {
                            border: none;
                            border-top: 2px solid rgba(255,255,255,0.1);
                            margin: 2rem 0;
                        }
                        .task-description strong {
                            font-weight: 600;
                            color: #fff;
                        }
                        .task-description em {
                            font-style: italic;
                        }
                        .task-description a {
                            color: #60a5fa;
                            text-decoration: underline;
                        }
                    `}</style>
                    <div style={{ marginTop: 20 }}>
                        <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 10, color: 'rgba(255, 255, 255, 0.9)' }}>Examples</h3>
                        {testCases.slice(0, 2).map((tc, i) => (
                            <div key={tc.id} style={{ background: 'rgba(0, 0, 0, 0.2)', borderRadius: 6, padding: 12, marginBottom: 10, fontFamily: 'monospace', fontSize: 13 }}>
                                <div style={{ color: 'rgba(255, 255, 255, 0.5)', marginBottom: 4 }}>Example {i + 1}:</div>
                                <div style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Input: {tc.input}</div>
                                <div style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Output: {tc.expectedOutput}</div>
                            </div>
                        ))}
                    </div>
                </>
            ) : (
                <div>
                    <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Submission History</h3>
                    {submissions.length === 0 ? (
                        <p style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: 13 }}>No submissions yet</p>
                    ) : (
                        submissions.map(sub => (
                            <div key={sub.id} style={{ background: 'rgba(0, 0, 0, 0.2)', borderRadius: 6, padding: 12, marginBottom: 8 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                                    <span style={{ fontSize: 13, fontWeight: 600, color: sub.status === 'Accepted' ? '#34d399' : '#f87171' }}>{sub.status}</span>
                                    <span style={{ fontSize: 11, color: 'rgba(255, 255, 255, 0.4)' }}>{sub.timestamp.toLocaleTimeString()}</span>
                                </div>
                                <div style={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.5)' }}>{sub.language} • {sub.runtime} • {sub.memory}</div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
});

// Memoized Test Cases Content
const MemoizedTestCases = React.memo<{
    testCases: TestCase[];
    activeTab: number;
    onTabChange: (index: number) => void;
}>(({ testCases, activeTab, onTabChange }) => {
    return (
        <>
            <div style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid rgba(255, 255, 255, 0.06)', padding: '0 8px', background: 'rgba(255, 255, 255, 0.02)', gap: 2 }}>
                <span style={{ fontSize: 12, fontWeight: 500, color: 'rgba(255, 255, 255, 0.6)', padding: '8px 8px 8px 4px' }}>Testcase</span>
                {testCases.map((tc, i) => (
                    <button
                        key={tc.id}
                        onClick={() => onTabChange(i)}
                        style={{
                            padding: '6px 12px',
                            background: activeTab === i ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                            border: 'none',
                            borderRadius: 4,
                            color: activeTab === i ? '#fff' : 'rgba(255, 255, 255, 0.5)',
                            fontSize: 12,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                        }}
                    >
                        {tc.passed !== undefined && (
                            tc.passed ? <Check size={12} style={{ color: '#34d399' }} /> : <X size={12} style={{ color: '#f87171' }} />
                        )}
                        Case {i + 1}
                    </button>
                ))}
            </div>

            <div style={{ flex: 1, overflow: 'auto', padding: 12 }}>
                {testCases[activeTab] && (
                    <div style={{ fontFamily: 'monospace', fontSize: 13 }}>
                        <div style={{ marginBottom: 12 }}>
                            <div style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: 11, marginBottom: 4 }}>Input</div>
                            <div style={{ background: 'rgba(0, 0, 0, 0.3)', padding: 10, borderRadius: 4, color: 'rgba(255, 255, 255, 0.9)' }}>
                                {testCases[activeTab].input}
                            </div>
                        </div>
                        <div style={{ marginBottom: 12 }}>
                            <div style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: 11, marginBottom: 4 }}>Expected Output</div>
                            <div style={{ background: 'rgba(0, 0, 0, 0.3)', padding: 10, borderRadius: 4, color: 'rgba(255, 255, 255, 0.9)' }}>
                                {testCases[activeTab].expectedOutput}
                            </div>
                        </div>
                        {testCases[activeTab].actualOutput && (
                            <div>
                                <div style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: 11, marginBottom: 4 }}>Your Output</div>
                                <div style={{
                                    background: testCases[activeTab].passed ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                    border: `1px solid ${testCases[activeTab].passed ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                                    padding: 10,
                                    borderRadius: 4,
                                    color: testCases[activeTab].passed ? '#34d399' : '#f87171',
                                }}>
                                    {testCases[activeTab].actualOutput}
                                    {testCases[activeTab].executionTime && (
                                        <span style={{ marginLeft: 12, fontSize: 11, color: 'rgba(255, 255, 255, 0.4)' }}>
                                            {testCases[activeTab].executionTime}ms
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </>
    );
});

const TaskPage: React.FC = () => {
    const navigate = useNavigate();
    const { id: contestId } = useParams<{ id: string }>();

    // Data state
    const [task, setTask] = useState<Task | null>(null);
    const [contest, setContest] = useState<Contest | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');

    // Timer state
    const [time, setTime] = useState<number>(45 * 60);

    // Editor state
    const [language, setLanguage] = useState<string>('javascript');
    const [code, setCode] = useState<string>(LANGUAGE_BOILERPLATES['javascript']);
    const codeRef = useRef<string>(code);
    const debounceTimer = useRef<any>(null);

    // Debounced code state update to prevent UI lag during typing
    const updateCodeState = useCallback((newCode: string) => {
        if (debounceTimer.current) clearTimeout(debounceTimer.current);
        codeRef.current = newCode;

        debounceTimer.current = setTimeout(() => {
            setCode(newCode);
        }, 500); // 500ms delay to keep UI snappy
    }, []);

    // Cleanup timer on unmount
    useEffect(() => {
        return () => {
            if (debounceTimer.current) clearTimeout(debounceTimer.current);
        };
    }, []);

    // Panel layout state - which panel is in which position
    const [leftPanel, setLeftPanel] = useState<PanelType>('description');
    const [rightTopPanel, setRightTopPanel] = useState<PanelType>('editor');
    const [rightBottomPanel, setRightBottomPanel] = useState<PanelType>('testcases');

    // Panel resize state
    const [leftPanelWidth, setLeftPanelWidth] = useState<number>(40);
    const [editorHeight, setEditorHeight] = useState<number>(65);
    const [isResizingHorizontal, setIsResizingHorizontal] = useState<boolean>(false);
    const [isResizingVertical, setIsResizingVertical] = useState<boolean>(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const rightPanelRef = useRef<HTMLDivElement>(null);

    // Drag state
    const [draggedPanel, setDraggedPanel] = useState<PanelType | null>(null);
    const [dragOverPosition, setDragOverPosition] = useState<'left' | 'rightTop' | 'rightBottom' | null>(null);

    // Tab state
    const [leftActiveTab, setLeftActiveTab] = useState<'description' | 'submissions'>('description');
    const [testCaseActiveTab, setTestCaseActiveTab] = useState<number>(0);

    // Fullscreen / Lockdown state
    const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
    const [showLockout, setShowLockout] = useState<boolean>(false);
    const hasExited = useRef<boolean>(false);

    // Hint state
    const [hint, setHint] = useState<string | null>(null);
    const [isGeneratingHint, setIsGeneratingHint] = useState<boolean>(false);
    const [showHintModal, setShowHintModal] = useState<boolean>(false);

    // Solution state
    const [solution, setSolution] = useState<string | null>(null);
    const [isGeneratingSolution, setIsGeneratingSolution] = useState<boolean>(false);
    const [showSolutionModal, setShowSolutionModal] = useState<boolean>(false);

    // Evaluation state
    const [evaluation, setEvaluation] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
    const [showEvaluationModal, setShowEvaluationModal] = useState<boolean>(false);

    const handleGetHint = useCallback(async () => {
        if (!task) return;
        setIsGeneratingHint(true);
        try {
            // Pass empty string for errorLogs for now, or capture from state if available
            const result = await aiAPI.getHint(task.id, code, language, '');
            if (result.hint) {
                setHint(result.hint);
                setShowHintModal(true);
            }
        } catch (err: any) {
            console.error('Failed to get hint:', err);
            alert(err.message || 'Failed to get hint. Please try again.');
        } finally {
            setIsGeneratingHint(false);
        }
    }, [task, code, language]);

    const handleGetSolution = useCallback(async () => {
        if (!task) return;
        if (!window.confirm('Are you sure? Viewing the solution will forfeit points for this task.')) return;

        setIsGeneratingSolution(true);
        try {
            const result = await aiAPI.getSolution(task.id);
            if (result.solution) {
                setSolution(result.solution);
                setShowSolutionModal(true);
            }
        } catch (err: any) {
            console.error('Failed to get solution:', err);
            alert(err.message || 'Failed to get solution.');
        } finally {
            setIsGeneratingSolution(false);
        }
    }, [task]);

    const handleAnalyze = useCallback(async () => {
        if (!task) return;
        setIsAnalyzing(true);
        try {
            const result = await aiAPI.evaluate(task.id, code, language, testCases);
            if (result.feedback) {
                setEvaluation(result.feedback);
                setShowEvaluationModal(true);
            }
        } catch (err) {
            console.error('Failed to evaluate code:', err);
        } finally {
            setIsAnalyzing(false);
        }
    }, [task, code, language]);

    // Function to request fullscreen
    const requestFullscreen = useCallback(() => {
        const element = document.documentElement;
        if (element.requestFullscreen) {
            element.requestFullscreen()
                .then(() => {
                    setIsFullscreen(true);
                    setShowLockout(false);
                })
                .catch(err => {
                    console.error(`Error attempting to enable full-screen mode: ${err.message}`);
                    alert(`Could not enter full-screen mode: ${err.message}. Please check your browser permissions.`);
                });

            // Try to lock the keyboard (Experimental API, mainly Chrome)
            if ('keyboard' in navigator && (navigator as any).keyboard.lock) {
                (navigator as any).keyboard.lock(['Escape']).catch(() => {
                    console.log('Keyboard lock failed or not supported');
                });
            }
        } else {
            // Fallback for older browsers or if API is missing
            alert('Full-screen API is not supported in this browser.');
        }
    }, []);

    // Effect for keyboard shortcuts and navigation lockdown
    useEffect(() => {
        // Only enable fullscreen lockdown if contest requires it
        if (!contest?.fullScreenMode) {
            return;
        }

        const handleKeyDown = (e: KeyboardEvent) => {
            // Disable F5, Ctrl+R, Command+R (Reload) and Escape
            if (e.key === 'F5' || ((e.ctrlKey || e.metaKey) && e.key === 'r') || e.key === 'Escape') {
                e.preventDefault();
                return false;
            }

            // Disable F12, Ctrl+Shift+I, Command+Option+I (DevTools)
            if (e.key === 'F12' || ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'i') || (e.metaKey && e.altKey && e.key === 'i')) {
                e.preventDefault();
                return false;
            }

            // Disable Alt+ArrowKeys, Ctrl+W, Command+W (Navigation/Closing)
            if (e.altKey && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
                e.preventDefault();
                return false;
            }
        };

        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (hasExited.current) return;
            e.preventDefault();
            e.returnValue = ''; // Standard way to show "Are you sure?" prompt
        };

        const handleFullscreenChange = () => {
            const isFull = !!document.fullscreenElement;
            setIsFullscreen(isFull);
            if (!isFull) {
                setShowLockout(true);
            } else {
                setShowLockout(false);
            }
        };

        const handleContextMenu = (e: MouseEvent) => {
            e.preventDefault();
        };

        // Add listeners with capture: true for keydown to catch it before other handlers
        window.addEventListener('keydown', handleKeyDown, { capture: true });
        window.addEventListener('beforeunload', handleBeforeUnload);
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        document.addEventListener('contextmenu', handleContextMenu);

        // Attempt initial fullscreen entry
        // Note: Browsers usually require a user gesture, so this might fail until the first click
        requestFullscreen();

        return () => {
            window.removeEventListener('keydown', handleKeyDown, { capture: true });
            window.removeEventListener('beforeunload', handleBeforeUnload);
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            document.removeEventListener('contextmenu', handleContextMenu);

            // Unlock keyboard if API exists
            if ('keyboard' in navigator && (navigator as any).keyboard.unlock) {
                (navigator as any).keyboard.unlock();
            }
        };
    }, [requestFullscreen, contest]);

    // Test execution state
    const [showTestCases, setShowTestCases] = useState<boolean>(false);
    const [isRunning, setIsRunning] = useState<boolean>(false);
    const [testCases, setTestCases] = useState<TestCase[]>([
        { id: 1, input: 'nums = [2,7,11,15], target = 9', expectedOutput: '[0,1]' },
        { id: 2, input: 'nums = [3,2,4], target = 6', expectedOutput: '[1,2]' },
        { id: 3, input: 'nums = [3,3], target = 6', expectedOutput: '[0,1]' },
    ]);

    // Submission history
    const [submissions, setSubmissions] = useState<SubmissionHistory[]>([
        { id: 1, timestamp: new Date(Date.now() - 3600000), status: 'Wrong Answer', runtime: '52 ms', memory: '42.1 MB', language: 'JavaScript' },
        { id: 2, timestamp: new Date(Date.now() - 7200000), status: 'Time Limit Exceeded', runtime: 'N/A', memory: 'N/A', language: 'JavaScript' },
    ]);

    // Drag and Drop handlers
    const handleDragStart = useCallback((panel: PanelType) => (e: React.DragEvent) => {
        setDraggedPanel(panel);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', panel);
    }, []);

    const handleDragOver = useCallback((position: 'left' | 'rightTop' | 'rightBottom') => (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        setDragOverPosition(position);
    }, []);

    const handleDragLeave = useCallback(() => {
        setDragOverPosition(null);
    }, []);

    const handleDrop = useCallback((targetPosition: 'left' | 'rightTop' | 'rightBottom') => (e: React.DragEvent) => {
        e.preventDefault();
        setDragOverPosition(null);

        if (!draggedPanel) return;

        // Find which position the dragged panel is currently in
        let sourcePosition: 'left' | 'rightTop' | 'rightBottom';
        if (leftPanel === draggedPanel) sourcePosition = 'left';
        else if (rightTopPanel === draggedPanel) sourcePosition = 'rightTop';
        else sourcePosition = 'rightBottom';

        if (sourcePosition === targetPosition) {
            setDraggedPanel(null);
            return;
        }

        // Get the panel in the target position
        let targetPanel: PanelType;
        if (targetPosition === 'left') targetPanel = leftPanel;
        else if (targetPosition === 'rightTop') targetPanel = rightTopPanel;
        else targetPanel = rightBottomPanel;

        // Swap panels
        if (sourcePosition === 'left') setLeftPanel(targetPanel);
        else if (sourcePosition === 'rightTop') setRightTopPanel(targetPanel);
        else setRightBottomPanel(targetPanel);

        if (targetPosition === 'left') setLeftPanel(draggedPanel);
        else if (targetPosition === 'rightTop') setRightTopPanel(draggedPanel);
        else setRightBottomPanel(draggedPanel);

        // Show test cases if we're moving testcases panel
        if (draggedPanel === 'testcases' || targetPanel === 'testcases') {
            setShowTestCases(true);
        }

        setDraggedPanel(null);
    }, [draggedPanel, leftPanel, rightTopPanel, rightBottomPanel]);

    const handleDragEnd = useCallback(() => {
        setDraggedPanel(null);
        setDragOverPosition(null);
    }, []);

    // Fetch task data
    useEffect(() => {
        const fetchTaskData = async () => {
            try {
                const token = sessionStorage.getItem('token');
                if (!token) {
                    navigate('/login');
                    return;
                }

                const response = await fetch(`/api/contests/${contestId}/tasks`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) throw new Error('Failed to fetch tasks');

                const data = await response.json();
                if (data.tasks && data.tasks.length > 0) {
                    setTask(data.tasks[0]);
                    setContest(data.contest);
                    if (data.tasks[0].allowedLanguages?.length > 0) {
                        const initialLang = data.tasks[0].allowedLanguages[0];
                        setLanguage(initialLang);
                        setCode(LANGUAGE_BOILERPLATES[initialLang] || LANGUAGE_BOILERPLATES['javascript']);
                    }
                    if (data.contest?.duration) setTime(data.contest.duration * 60);
                } else {
                    setError('No tasks found');
                }
                setLoading(false);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load task');
                setLoading(false);
            }
        };

        if (contestId) fetchTaskData();
        else { setError('No contest ID'); setLoading(false); }
    }, [contestId, navigate]);

    // Timer countdown
    useEffect(() => {
        const interval = setInterval(() => setTime(prev => prev > 0 ? prev - 1 : 0), 1000);
        return () => clearInterval(interval);
    }, []);

    // Horizontal resize handlers
    const handleHorizontalMouseDown = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        setIsResizingHorizontal(true);
    }, []);

    const handleHorizontalMouseMove = useCallback((e: MouseEvent) => {
        if (!isResizingHorizontal || !containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const newWidth = ((e.clientX - rect.left) / rect.width) * 100;
        setLeftPanelWidth(Math.min(70, Math.max(25, newWidth)));
    }, [isResizingHorizontal]);

    const handleHorizontalMouseUp = useCallback(() => {
        setIsResizingHorizontal(false);
    }, []);

    // Vertical resize handlers
    const handleVerticalMouseDown = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        setIsResizingVertical(true);
    }, []);

    const handleVerticalMouseMove = useCallback((e: MouseEvent) => {
        if (!isResizingVertical || !rightPanelRef.current) return;
        const rect = rightPanelRef.current.getBoundingClientRect();
        const newHeight = ((e.clientY - rect.top) / rect.height) * 100;
        setEditorHeight(Math.min(85, Math.max(25, newHeight)));
    }, [isResizingVertical]);

    const handleVerticalMouseUp = useCallback(() => {
        setIsResizingVertical(false);
    }, []);

    // Mouse event listeners
    useEffect(() => {
        if (isResizingHorizontal) {
            document.addEventListener('mousemove', handleHorizontalMouseMove);
            document.addEventListener('mouseup', handleHorizontalMouseUp);
            document.body.style.cursor = 'col-resize';
            document.body.style.userSelect = 'none';
        }
        return () => {
            document.removeEventListener('mousemove', handleHorizontalMouseMove);
            document.removeEventListener('mouseup', handleHorizontalMouseUp);
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        };
    }, [isResizingHorizontal, handleHorizontalMouseMove, handleHorizontalMouseUp]);

    useEffect(() => {
        if (isResizingVertical) {
            document.addEventListener('mousemove', handleVerticalMouseMove);
            document.addEventListener('mouseup', handleVerticalMouseUp);
            document.body.style.cursor = 'row-resize';
            document.body.style.userSelect = 'none';
        }
        return () => {
            document.removeEventListener('mousemove', handleVerticalMouseMove);
            document.removeEventListener('mouseup', handleVerticalMouseUp);
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        };
    }, [isResizingVertical, handleVerticalMouseMove, handleVerticalMouseUp]);

    const formatTime = (seconds: number): string => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const handleLanguageChange = useCallback((newLang: string) => {
        setLanguage((prevLang: string) => {
            const currentBoilerplate = LANGUAGE_BOILERPLATES[prevLang];
            if (code !== currentBoilerplate && !window.confirm('Switching languages will reset your code. Continue?')) return prevLang;
            setCode(LANGUAGE_BOILERPLATES[newLang] || LANGUAGE_BOILERPLATES['javascript']);
            return newLang;
        });
    }, [code]);

    // Memoized editor change handler to prevent re-renders
    const handleCodeChange = useCallback((value: string | undefined) => {
        if (value !== undefined) {
            updateCodeState(value);
        }
    }, [updateCodeState]);

    const handleRun = useCallback(async () => {
        const currentCode = codeRef.current;
        console.log('Running code against test cases...');
        setIsRunning(true);
        setShowTestCases(true);

        try {
            if (!task) {
                throw new Error('Task not found');
            }

            // Run code against ALL test cases (not just first one)
            const result = await submissionAPI.run({
                taskId: task.id,
                code: currentCode,
                language: language,
            });

            console.log('✅ Run Result:', result);

            if (result.success && result.data) {
                const { results } = result.data;

                // Update test cases with actual results
                setTestCases((prevCases: TestCase[]) => prevCases.map((tc, index) => {
                    const testResult = results[index];
                    if (testResult) {
                        return {
                            ...tc,
                            actualOutput: testResult.actualOutput || 'No output',
                            passed: testResult.passed,
                            executionTime: testResult.executionTime,
                        };
                    }
                    return tc;
                }));
            }
        } catch (error: any) {
            console.error('❌ Run error:', error);
            setTestCases((prevCases: TestCase[]) => prevCases.map((tc, index) => ({
                ...tc,
                actualOutput: `Error: ${error.message}`,
                passed: false,
            })));
        }

        setIsRunning(false);
    }, [language, task]);

    const handleSubmit = useCallback(async () => {
        const currentCode = codeRef.current;
        console.log('Submitting code solution...');
        setIsRunning(true);
        setShowTestCases(true);

        try {
            if (!task || !contest) {
                throw new Error('Task or Contest not found');
            }

            // Submit code solution (runs against ALL test cases including hidden ones)
            const result = await submissionAPI.submit({
                taskId: task.id,
                contestId: contest.id,
                code: currentCode,
                language: language,
            });

            console.log('✅ Submit Result:', result);

            if (result.success && result.data) {
                const { passed, total, results, status, score } = result.data;

                // Determine overall status
                const submissionStatus = status || (passed === total ? 'Accepted' : 'Wrong Answer');

                // Add to submission history
                setSubmissions((prev: SubmissionHistory[]) => {
                    const avgTime = results.reduce((sum: number, r: any) => sum + (r.executionTime || 0), 0) / results.length;
                    const avgMemory = results.reduce((sum: number, r: any) => sum + (r.memory || 0), 0) / results.length / 1024;

                    const newSubmission: SubmissionHistory = {
                        id: prev.length + 1,
                        timestamp: new Date(),
                        status: submissionStatus as any,
                        runtime: `${avgTime.toFixed(0)} ms`,
                        memory: `${avgMemory.toFixed(1)} MB`,
                        language: language.charAt(0).toUpperCase() + language.slice(1),
                    };
                    return [newSubmission, ...prev];
                });

                // Update test cases with results (only visible ones)
                setTestCases((prevCases: TestCase[]) => prevCases.map((tc, index) => {
                    const result = results[index];
                    if (result) {
                        return {
                            ...tc,
                            actualOutput: result.actualOutput || 'No output',
                            passed: result.passed,
                            executionTime: result.executionTime,
                        };
                    }
                    return tc;
                }));
            }
        } catch (error: any) {
            console.error('❌ Submit error:', error);

            // Add failed submission to history
            setSubmissions((prev: SubmissionHistory[]) => {
                const newSubmission: SubmissionHistory = {
                    id: prev.length + 1,
                    timestamp: new Date(),
                    status: 'Runtime Error',
                    runtime: 'N/A',
                    memory: 'N/A',
                    language: language.charAt(0).toUpperCase() + language.slice(1),
                };
                return [newSubmission, ...prev];
            });

            setTestCases((prevCases: TestCase[]) => prevCases.map(tc => ({
                ...tc,
                actualOutput: `Error: ${error.message}`,
                passed: false,
            })));
        }

        setIsRunning(false);
    }, [language, task, contest]);

    const handleTestCaseTabChange = useCallback((index: number) => {
        setTestCaseActiveTab(index);
    }, []);

    const handleDescriptionTabChange = useCallback((tab: 'description' | 'submissions') => {
        setLeftActiveTab(tab);
    }, []);

    const handleCloseTestCases = useCallback(() => {
        setShowTestCases(false);
    }, []);


    // Render panel by type
    const renderPanel = (panelType: PanelType, position: 'left' | 'rightTop' | 'rightBottom') => {
        const isOver = dragOverPosition === position;
        const baseStyle: React.CSSProperties = {
            background: 'rgba(255, 255, 255, 0.02)',
            border: isOver ? '2px solid rgba(253, 230, 138, 0.5)' : '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 10,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            transition: 'border-color 0.15s ease',
        };

        const title = panelType === 'description' ? 'Problem' : panelType === 'editor' ? 'Code' : 'Testcase';
        const showClose = panelType === 'testcases' && position === 'rightBottom';

        return (
            <div
                style={{ ...baseStyle, height: '100%' }}
                onDragOver={handleDragOver(position)}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop(position)}
            >
                <PanelHeader
                    title={title}
                    panelType={panelType}
                    showClose={showClose}
                    onClose={showClose ? handleCloseTestCases : undefined}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                />

                {panelType === 'description' && task && (
                    <MemoizedDescription
                        task={task}
                        testCases={testCases}
                        leftActiveTab={leftActiveTab}
                        submissions={submissions}
                        onTabChange={handleDescriptionTabChange}
                    />
                )}

                {panelType === 'editor' && (
                    <MemoizedCodeEditor
                        taskId={task?.id || 0}
                        language={language}
                        code={code}
                        onCodeChange={handleCodeChange}
                        allowedLanguages={task?.allowedLanguages || []}
                        onLanguageChange={handleLanguageChange}
                        isRunning={isRunning}
                        onRun={handleRun}
                        onSubmit={handleSubmit}
                        onGetHint={handleGetHint}
                        isGeneratingHint={isGeneratingHint}
                        onGetSolution={handleGetSolution}
                        isGeneratingSolution={isGeneratingSolution}
                        onAnalyze={handleAnalyze}
                        isAnalyzing={isAnalyzing}
                        aiConfig={task?.aiConfig}
                    />
                )}

                {panelType === 'testcases' && (
                    <MemoizedTestCases
                        testCases={testCases}
                        activeTab={testCaseActiveTab}
                        onTabChange={handleTestCaseTabChange}
                    />
                )}
            </div>
        );
    };

    console.log('Contest:', contest?.title);

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', background: '#0a0a0b', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif" }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ width: 32, height: 32, border: '3px solid rgba(253, 230, 138, 0.2)', borderTopColor: '#FDE68A', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 14px' }} />
                    <p style={{ fontSize: '0.85rem', margin: 0, color: 'rgba(255, 255, 255, 0.5)' }}>Loading...</p>
                </div>
            </div>
        );
    }

    if (error || !task) {
        return (
            <div style={{ minHeight: '100vh', background: '#0a0a0b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif" }}>
                <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.25)', color: '#f87171', padding: '16px 24px', borderRadius: 12, fontSize: '0.9rem' }}>
                    {error || 'Task not found'}
                </div>
            </div>
        );
    }

    return (
        <div style={{ height: '100vh', width: '100vw', background: '#0a0a0b', color: '#fff', fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif", display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {/* Navbar */}
            <nav style={{ height: 52, minHeight: 52, background: '#111113', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <svg width="20" height="20" viewBox="0 0 28 28" fill="none">
                        <circle cx="14" cy="14" r="12" stroke="url(#lg)" strokeWidth="1.5" />
                        <circle cx="14" cy="14" r="5" fill="url(#lg)" />
                        <defs><linearGradient id="lg" x1="0" y1="0" x2="28" y2="28"><stop offset="0%" stopColor="#FDE68A" /><stop offset="100%" stopColor="#F59E0B" /></linearGradient></defs>
                    </svg>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#FDE68A' }}>Code Combat</span>
                    <ChevronRight size={12} style={{ color: 'rgba(255, 255, 255, 0.3)' }} />
                    <span style={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.6)' }}>{task.title}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', background: 'rgba(253, 230, 138, 0.1)', border: '1px solid rgba(253, 230, 138, 0.2)', borderRadius: 6 }}>
                        <Clock size={12} style={{ color: '#FDE68A' }} />
                        <span style={{ fontSize: 12, fontWeight: 600, color: '#FDE68A', fontFamily: 'monospace' }}>{formatTime(time)}</span>
                    </div>
                    <button
                        onClick={() => {
                            hasExited.current = true;
                            if (document.fullscreenElement) {
                                document.exitFullscreen().catch(() => { });
                            }
                            navigate('/player');
                        }}
                        style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: 6, color: '#f87171', fontSize: 12, fontWeight: 500, cursor: 'pointer' }}
                    >
                        <XCircle size={12} />
                        Exit
                    </button>
                </div>
            </nav>


            {/* Main Content */}
            <div ref={containerRef} style={{ flex: 1, display: 'flex', padding: 8, gap: 0, overflow: 'hidden' }}>
                {/* Left Panel */}
                <div style={{ width: `calc(${leftPanelWidth}% - 4px)`, height: '100%', flexShrink: 0 }}>
                    {renderPanel(leftPanel, 'left')}
                </div>

                {/* Horizontal Resize Handle */}
                <div
                    onMouseDown={handleHorizontalMouseDown}
                    style={{ width: 8, cursor: 'col-resize', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                >
                    <div style={{ width: 3, height: 30, borderRadius: 2, background: isResizingHorizontal ? 'rgba(253, 230, 138, 0.5)' : 'rgba(255, 255, 255, 0.1)', transition: 'background 0.15s' }} />
                </div>

                {/* Right Panel */}
                <div ref={rightPanelRef} style={{ width: `calc(${100 - leftPanelWidth}% - 4px)`, height: '100%', display: 'flex', flexDirection: 'column', gap: 0, flexShrink: 0 }}>
                    {/* Right Top */}
                    <div style={{ height: showTestCases ? `calc(${editorHeight}% - 4px)` : '100%', flexShrink: 0 }}>
                        {renderPanel(rightTopPanel, 'rightTop')}
                    </div>

                    {/* Vertical Resize Handle */}
                    {showTestCases && (
                        <div
                            onMouseDown={handleVerticalMouseDown}
                            style={{ height: 8, cursor: 'row-resize', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                        >
                            <div style={{ width: 30, height: 3, borderRadius: 2, background: isResizingVertical ? 'rgba(253, 230, 138, 0.5)' : 'rgba(255, 255, 255, 0.1)', transition: 'background 0.15s' }} />
                        </div>
                    )}

                    {/* Right Bottom (Test Cases) */}
                    {showTestCases && (
                        <div style={{ height: `calc(${100 - editorHeight}% - 4px)`, flexShrink: 0 }}>
                            {renderPanel(rightBottomPanel, 'rightBottom')}
                        </div>
                    )}
                </div>
            </div>

            {/* Lockout Overlay */}
            {contest?.fullScreenMode && showLockout && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    background: 'rgba(0, 0, 0, 0.9)',
                    backdropFilter: 'blur(8px)',
                    zIndex: 9999,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 20,
                    textAlign: 'center',
                    padding: 20
                }}>
                    <div style={{ padding: 40, background: '#111113', border: '1px solid rgba(253, 230, 138, 0.2)', borderRadius: 16, maxWidth: 400, boxShadow: '0 20px 50px rgba(0,0,0,0.5)', fontFamily: "'DM Sans', sans-serif" }}>
                        <XCircle size={64} style={{ color: '#f87171', marginBottom: 20 }} />
                        <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12, color: '#fff' }}>Test Locked</h2>
                        <p style={{ color: 'rgba(255, 255, 255, 0.6)', marginBottom: 30, lineHeight: 1.5 }}>
                            You have exited full-screen mode. For security reasons, the test has been locked.
                            Please re-enter full-screen to continue.
                        </p>
                        <button
                            onClick={requestFullscreen}
                            style={{
                                width: '100%',
                                padding: '12px 24px',
                                background: '#FDE68A',
                                color: '#000',
                                border: 'none',
                                borderRadius: 8,
                                fontWeight: 700,
                                cursor: 'pointer',
                                transition: 'transform 0.2s',
                            }}
                        >
                            Re-enter Full Screen
                        </button>
                    </div>
                </div>
            )}

            {/* Hint Modal */}
            {showHintModal && hint && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.7)',
                    backdropFilter: 'blur(4px)',
                    zIndex: 10000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 20,
                }}>
                    <div style={{
                        background: '#111113',
                        border: '1px solid rgba(253, 230, 138, 0.3)',
                        borderRadius: 12,
                        width: '100%',
                        maxWidth: 600,
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                        maxHeight: '80vh',
                    }}>
                        {/* Header */}
                        <div style={{
                            padding: '16px 20px',
                            borderBottom: '1px solid rgba(253, 230, 138, 0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            background: 'rgba(253, 230, 138, 0.05)',
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <div style={{
                                    width: 32,
                                    height: 32,
                                    borderRadius: 6,
                                    background: 'rgba(234, 179, 8, 0.2)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    border: '1px solid rgba(234, 179, 8, 0.3)',
                                }}>
                                    <Brain size={18} color="#fbbf24" />
                                </div>
                                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#fff' }}>AI Hint</h3>
                            </div>
                            <button
                                onClick={() => setShowHintModal(false)}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    cursor: 'pointer',
                                    color: 'rgba(255, 255, 255, 0.5)',
                                    padding: 4,
                                    display: 'flex',
                                    borderRadius: 4,
                                }}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Content */}
                        <div style={{ padding: 24, overflowY: 'auto', color: 'rgba(255, 255, 255, 0.8)', lineHeight: 1.6, fontSize: 15 }}>
                            <div dangerouslySetInnerHTML={{ __html: hint.replace(/\n/g, '<br/>') }} />
                        </div>

                        {/* Footer */}
                        <div style={{
                            padding: '16px 20px',
                            borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                            background: 'rgba(255, 255, 255, 0.02)',
                            display: 'flex',
                            justifyContent: 'flex-end',
                        }}>
                            <button
                                onClick={() => setShowHintModal(false)}
                                style={{
                                    padding: '8px 16px',
                                    background: 'rgba(255, 255, 255, 0.1)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    color: '#fff',
                                    borderRadius: 6,
                                    fontSize: 14,
                                    fontWeight: 500,
                                    cursor: 'pointer',
                                }}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Solution Modal */}
            {showSolutionModal && solution && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.8)',
                    backdropFilter: 'blur(4px)',
                    zIndex: 10000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 20,
                }}>
                    <div style={{
                        background: '#111113',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        borderRadius: 12,
                        width: '100%',
                        maxWidth: 800,
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                        height: '80vh',
                    }}>
                        {/* Header */}
                        <div style={{
                            padding: '16px 20px',
                            borderBottom: '1px solid rgba(239, 68, 68, 0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            background: 'rgba(239, 68, 68, 0.05)',
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <div style={{
                                    width: 32,
                                    height: 32,
                                    borderRadius: 6,
                                    background: 'rgba(239, 68, 68, 0.2)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    border: '1px solid rgba(239, 68, 68, 0.3)',
                                }}>
                                    <Unlock size={18} color="#f87171" />
                                </div>
                                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#fff' }}>Full Solution</h3>
                            </div>
                            <button
                                onClick={() => setShowSolutionModal(false)}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    cursor: 'pointer',
                                    color: 'rgba(255, 255, 255, 0.5)',
                                    padding: 4,
                                    display: 'flex',
                                    borderRadius: 4,
                                }}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Content */}
                        <div style={{ flex: 1, overflow: 'hidden', padding: 0 }}>
                            <Editor
                                height="100%"
                                language={language}
                                value={solution}
                                options={{
                                    readOnly: true,
                                    minimap: { enabled: false },
                                    fontSize: 14,
                                    lineNumbers: 'on',
                                    scrollBeyondLastLine: false,
                                    automaticLayout: true,
                                    theme: 'vs-dark',
                                    fontFamily: "'JetBrains Mono', monospace",
                                }}
                            />
                        </div>

                        {/* Footer */}
                        <div style={{
                            padding: '16px 20px',
                            borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                            background: 'rgba(255, 255, 255, 0.02)',
                            display: 'flex',
                            justifyContent: 'flex-end',
                            gap: 12,
                        }}>
                            <button
                                onClick={() => {
                                    setCode(solution); // Overwrite user code
                                    setShowSolutionModal(false);
                                }}
                                style={{
                                    padding: '8px 16px',
                                    background: 'rgba(16, 185, 129, 0.15)',
                                    border: '1px solid rgba(16, 185, 129, 0.3)',
                                    color: '#34d399',
                                    borderRadius: 6,
                                    fontSize: 14,
                                    fontWeight: 500,
                                    cursor: 'pointer',
                                }}
                            >
                                Use this Solution
                            </button>
                            <button
                                onClick={() => setShowSolutionModal(false)}
                                style={{
                                    padding: '8px 16px',
                                    background: 'rgba(255, 255, 255, 0.1)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    color: '#fff',
                                    borderRadius: 6,
                                    fontSize: 14,
                                    fontWeight: 500,
                                    cursor: 'pointer',
                                }}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Evaluation Modal */}
            {showEvaluationModal && evaluation && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.7)',
                    backdropFilter: 'blur(4px)',
                    zIndex: 10000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 20,
                }}>
                    <div style={{
                        background: '#111113',
                        border: '1px solid rgba(59, 130, 246, 0.3)',
                        borderRadius: 12,
                        width: '100%',
                        maxWidth: 700,
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                        maxHeight: '80vh',
                    }}>
                        {/* Header */}
                        <div style={{
                            padding: '16px 20px',
                            borderBottom: '1px solid rgba(59, 130, 246, 0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            background: 'rgba(59, 130, 246, 0.05)',
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <div style={{
                                    width: 32,
                                    height: 32,
                                    borderRadius: 6,
                                    background: 'rgba(59, 130, 246, 0.2)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    border: '1px solid rgba(59, 130, 246, 0.3)',
                                }}>
                                    <MessageSquare size={18} color="#60a5fa" />
                                </div>
                                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#fff' }}>AI Analysis</h3>
                            </div>
                            <button
                                onClick={() => setShowEvaluationModal(false)}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    cursor: 'pointer',
                                    color: 'rgba(255, 255, 255, 0.5)',
                                    padding: 4,
                                    display: 'flex',
                                    borderRadius: 4,
                                }}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Content */}
                        <div style={{ padding: 24, overflowY: 'auto', color: 'rgba(255, 255, 255, 0.8)', lineHeight: 1.6, fontSize: 15 }}>
                            <div dangerouslySetInnerHTML={{ __html: evaluation.replace(/\n/g, '<br/>') }} />
                        </div>

                        {/* Footer */}
                        <div style={{
                            padding: '16px 20px',
                            borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                            background: 'rgba(255, 255, 255, 0.02)',
                            display: 'flex',
                            justifyContent: 'flex-end',
                        }}>
                            <button
                                onClick={() => setShowEvaluationModal(false)}
                                style={{
                                    padding: '8px 16px',
                                    background: 'rgba(255, 255, 255, 0.1)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    color: '#fff',
                                    borderRadius: 6,
                                    fontSize: 14,
                                    fontWeight: 500,
                                    cursor: 'pointer',
                                }}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Initial Entry Modal */}
            {contest?.fullScreenMode && !isFullscreen && !showLockout && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    background: '#0a0a0b',
                    zIndex: 10000,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 20,
                    fontFamily: "'DM Sans', sans-serif"
                }}>
                    <div style={{ textAlign: 'center', maxWidth: 500, padding: 40 }}>
                        <div style={{
                            width: 80, height: 80, background: 'rgba(253, 230, 138, 0.1)',
                            borderRadius: '50%', display: 'flex', alignItems: 'center',
                            justifyContent: 'center', margin: '0 auto 24px'
                        }}>
                            <Play size={40} style={{ color: '#FDE68A', marginLeft: 4 }} />
                        </div>
                        <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 16, color: '#fff' }}>Ready to start?</h1>
                        <p style={{ color: 'rgba(255, 255, 255, 0.5)', marginBottom: 40, fontSize: 16, lineHeight: 1.6 }}>
                            This test will be conducted in full-screen mode. All browser shortcuts will be disabled.
                            Ensure you are ready before proceeding.
                        </p>
                        <button
                            onClick={requestFullscreen}
                            style={{
                                padding: '16px 48px',
                                background: 'linear-gradient(135deg, #FDE68A 0%, #F59E0B 100%)',
                                color: '#000',
                                border: 'none',
                                borderRadius: 12,
                                fontWeight: 800,
                                fontSize: 18,
                                cursor: 'pointer',
                                boxShadow: '0 10px 25px rgba(245, 158, 11, 0.3)',
                                transition: 'all 0.2s'
                            }}
                        >
                            Enter Full Screen & Start
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TaskPage;
