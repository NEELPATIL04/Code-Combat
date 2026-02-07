import React, { useState } from 'react';
import { Code, Terminal } from 'lucide-react';

interface CodeConfigurationProps {
    allowedLanguages: string[];
    onBoilerplateChange: (language: string, code: string) => void;
    onWrapperCodeChange: (language: string, code: string) => void;
    boilerplateCode: Record<string, string>;
    wrapperCode: Record<string, string>;
    readOnly?: boolean;
}

const CodeConfiguration: React.FC<CodeConfigurationProps> = ({
    allowedLanguages,
    onBoilerplateChange,
    onWrapperCodeChange,
    boilerplateCode,
    wrapperCode,
    readOnly
}) => {
    const [selectedLanguage, setSelectedLanguage] = useState<string>(
        allowedLanguages.length > 0 ? allowedLanguages[0] : 'javascript'
    );
    const [activeTab, setActiveTab] = useState<'boilerplate' | 'wrapper'>('boilerplate');

    if (allowedLanguages.length === 0) return null;

    return (
        <div style={{
            background: 'rgba(255, 255, 255, 0.04)',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            overflow: 'hidden',
            marginBottom: '20px'
        }}>
            {/* Language Tabs */}
            <div style={{
                display: 'flex',
                background: 'rgba(0, 0, 0, 0.2)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                padding: '0 8px',
                overflowX: 'auto',
                scrollbarWidth: 'none'
            }}>
                {allowedLanguages.map(lang => (
                    <button
                        key={lang}
                        onClick={() => setSelectedLanguage(lang)}
                        style={{
                            padding: '12px 16px',
                            background: 'transparent',
                            border: 'none',
                            borderBottom: selectedLanguage === lang
                                ? '2px solid #FDE68A'
                                : '2px solid transparent',
                            color: selectedLanguage === lang ? '#FDE68A' : 'rgba(255, 255, 255, 0.6)',
                            fontSize: '0.85rem',
                            fontWeight: 500,
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                            transition: 'all 0.2s',
                            textTransform: 'capitalize'
                        }}
                    >
                        {lang.replace('react-', 'React ')}
                    </button>
                ))}
            </div>

            {/* Config Type Tabs */}
            <div style={{
                display: 'flex',
                gap: '8px',
                padding: '16px 16px 0'
            }}>
                <button
                    onClick={() => setActiveTab('boilerplate')}
                    style={{
                        padding: '8px 16px',
                        borderRadius: '8px 8px 0 0',
                        background: activeTab === 'boilerplate'
                            ? 'rgba(255, 255, 255, 0.1)'
                            : 'transparent',
                        border: 'none',
                        color: activeTab === 'boilerplate' ? '#fff' : 'rgba(255, 255, 255, 0.5)',
                        fontSize: '0.85rem',
                        fontWeight: 500,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                    }}
                >
                    <Code size={16} /> Boilerplate Code
                </button>
                <button
                    onClick={() => setActiveTab('wrapper')}
                    style={{
                        padding: '8px 16px',
                        borderRadius: '8px 8px 0 0',
                        background: activeTab === 'wrapper'
                            ? 'rgba(255, 255, 255, 0.1)'
                            : 'transparent',
                        border: 'none',
                        color: activeTab === 'wrapper' ? '#fff' : 'rgba(255, 255, 255, 0.5)',
                        fontSize: '0.85rem',
                        fontWeight: 500,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                    }}
                >
                    <Terminal size={16} /> Test Runner (Wrapper)
                </button>
            </div>

            {/* Editor Area */}
            <div style={{
                padding: '16px',
                background: 'rgba(255, 255, 255, 0.1)'
            }}>
                <p style={{
                    margin: '0 0 12px 0',
                    fontSize: '0.8rem',
                    color: 'rgba(255, 255, 255, 0.5)',
                    lineHeight: '1.4'
                }}>
                    {activeTab === 'boilerplate'
                        ? "Start code for the user. Example: function add(a, b) { ... }"
                        : "Wraps user code for execution. Use {{functionName}} and {{params}} placeholders."}
                </p>

                <textarea
                    value={
                        activeTab === 'boilerplate'
                            ? ((boilerplateCode && boilerplateCode[selectedLanguage]) || '')
                            : ((wrapperCode && wrapperCode[selectedLanguage]) || '')
                    }
                    onChange={(e) => activeTab === 'boilerplate'
                        ? onBoilerplateChange(selectedLanguage, e.target.value)
                        : onWrapperCodeChange(selectedLanguage, e.target.value)
                    }
                    readOnly={readOnly}
                    placeholder={activeTab === 'boilerplate' ? '// Default code...' : '// Wrapper code...'}
                    spellCheck={false}
                    style={{
                        width: '100%',
                        minHeight: '200px',
                        padding: '16px',
                        background: '#0a0a0a',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '8px',
                        color: '#d4d4d4',
                        fontFamily: 'JetBrains Mono, monospace',
                        fontSize: '0.9rem',
                        lineHeight: '1.5',
                        resize: 'vertical',
                        outline: 'none'
                    }}
                />
            </div>
        </div>
    );
};

export default CodeConfiguration;
