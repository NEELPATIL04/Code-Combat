import React from 'react';
import { X, Brain, Unlock, MessageSquare } from 'lucide-react';
import Editor from '@monaco-editor/react';

interface AIModalProps {
    isOpen: boolean;
    type: 'hint' | 'solution' | 'evaluation';
    content: string;
    language?: string;
    onClose: () => void;
    onUseCode?: () => void;
}

const AIModal: React.FC<AIModalProps> = ({
    isOpen,
    type,
    content,
    language = 'python',
    onClose,
    onUseCode,
}) => {
    if (!isOpen) return null;

    const getConfig = () => {
        switch (type) {
            case 'hint':
                return {
                    title: 'AI Hint',
                    icon: Brain,
                    iconColor: '#fbbf24',
                    bgColor: 'rgba(234, 179, 8, 0.2)',
                    borderColor: 'rgba(234, 179, 8, 0.3)',
                    headerBg: 'rgba(253, 230, 138, 0.05)',
                    headerBorder: 'rgba(253, 230, 138, 0.1)',
                    contentBorder: 'rgba(253, 230, 138, 0.3)',
                };
            case 'solution':
                return {
                    title: 'Full Solution',
                    icon: Unlock,
                    iconColor: '#f87171',
                    bgColor: 'rgba(239, 68, 68, 0.2)',
                    borderColor: 'rgba(239, 68, 68, 0.3)',
                    headerBg: 'rgba(239, 68, 68, 0.05)',
                    headerBorder: 'rgba(239, 68, 68, 0.1)',
                    contentBorder: 'rgba(239, 68, 68, 0.3)',
                };
            case 'evaluation':
                return {
                    title: 'AI Analysis',
                    icon: MessageSquare,
                    iconColor: '#60a5fa',
                    bgColor: 'rgba(59, 130, 246, 0.2)',
                    borderColor: 'rgba(59, 130, 246, 0.3)',
                    headerBg: 'rgba(59, 130, 246, 0.05)',
                    headerBorder: 'rgba(59, 130, 246, 0.1)',
                    contentBorder: 'rgba(59, 130, 246, 0.3)',
                };
        }
    };

    const config = getConfig();
    const IconComponent = config.icon;

    return (
        <div
            onClick={(e) => {
                if (e.target === e.currentTarget) {
                    onClose();
                }
            }}
            style={{
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
                animation: 'fadeIn 0.2s ease-out',
            }}
        >
            <style>{`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: scale(0.95);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1);
                    }
                }
                @keyframes slideIn {
                    from {
                        transform: translateY(10px);
                        opacity: 0;
                    }
                    to {
                        transform: translateY(0);
                        opacity: 1;
                    }
                }
            `}</style>
            <div
                style={{
                    background: '#111113',
                    border: `1px solid ${config.contentBorder}`,
                    borderRadius: 12,
                    width: '100%',
                    maxWidth: type === 'solution' ? 800 : type === 'evaluation' ? 700 : 600,
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    maxHeight: '90vh',
                    animation: 'slideIn 0.3s ease-out',
                }}
            >
                {/* Header */}
                <div
                    style={{
                        padding: '16px 20px',
                        borderBottom: `1px solid ${config.headerBorder}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        background: config.headerBg,
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div
                            style={{
                                width: 32,
                                height: 32,
                                borderRadius: 6,
                                background: config.bgColor,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: `1px solid ${config.borderColor}`,
                            }}
                        >
                            <IconComponent size={18} color={config.iconColor} />
                        </div>
                        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#fff' }}>
                            {config.title}
                        </h3>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            color: 'rgba(255, 255, 255, 0.5)',
                            padding: 4,
                            display: 'flex',
                            borderRadius: 4,
                            transition: 'color 0.2s ease',
                        }}
                        onMouseEnter={(e) => {
                            (e.target as HTMLButtonElement).style.color = 'rgba(255, 255, 255, 0.8)';
                        }}
                        onMouseLeave={(e) => {
                            (e.target as HTMLButtonElement).style.color = 'rgba(255, 255, 255, 0.5)';
                        }}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div
                    style={{
                        flex: 1,
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                    }}
                >
                    {type === 'solution' ? (
                        <Editor
                            height="100%"
                            language={language}
                            value={content}
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
                    ) : (
                        <div
                            style={{
                                padding: 24,
                                overflowY: 'auto',
                                color: 'rgba(255, 255, 255, 0.8)',
                                lineHeight: 1.6,
                                fontSize: 15,
                            }}
                        >
                            <div dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, '<br/>') }} />
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div
                    style={{
                        padding: '16px 20px',
                        borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                        background: 'rgba(255, 255, 255, 0.02)',
                        display: 'flex',
                        justifyContent: 'flex-end',
                        gap: 12,
                    }}
                >
                    {type === 'solution' && onUseCode && (
                        <button
                            onClick={onUseCode}
                            style={{
                                padding: '8px 16px',
                                background: 'rgba(16, 185, 129, 0.15)',
                                border: '1px solid rgba(16, 185, 129, 0.3)',
                                color: '#34d399',
                                borderRadius: 6,
                                fontSize: 14,
                                fontWeight: 500,
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                            }}
                            onMouseEnter={(e) => {
                                const btn = e.target as HTMLButtonElement;
                                btn.style.background = 'rgba(16, 185, 129, 0.25)';
                            }}
                            onMouseLeave={(e) => {
                                const btn = e.target as HTMLButtonElement;
                                btn.style.background = 'rgba(16, 185, 129, 0.15)';
                            }}
                        >
                            Use this Solution
                        </button>
                    )}
                    <button
                        onClick={onClose}
                        style={{
                            padding: '8px 16px',
                            background: 'rgba(255, 255, 255, 0.1)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            color: '#fff',
                            borderRadius: 6,
                            fontSize: 14,
                            fontWeight: 500,
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={(e) => {
                            const btn = e.target as HTMLButtonElement;
                            btn.style.background = 'rgba(255, 255, 255, 0.15)';
                        }}
                        onMouseLeave={(e) => {
                            const btn = e.target as HTMLButtonElement;
                            btn.style.background = 'rgba(255, 255, 255, 0.1)';
                        }}
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AIModal;
