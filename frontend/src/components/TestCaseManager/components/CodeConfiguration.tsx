import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { Code, Wand2, MonitorPlay } from 'lucide-react';
import { aiAPI } from '../../../utils/api';
import toast from 'react-hot-toast';

interface CodeConfigurationProps {
    allowedLanguages: string[];
    onBoilerplateChange: (language: string, code: string) => void;
    onWrapperCodeChange: (language: string, code: string) => void;
    boilerplateCode: Record<string, string>;
    wrapperCode: Record<string, string>;
    description?: string;
    functionName?: string;
    readOnly?: boolean;
}

const CodeConfiguration: React.FC<CodeConfigurationProps> = ({
    allowedLanguages,
    onBoilerplateChange,
    onWrapperCodeChange,
    boilerplateCode,
    wrapperCode,
    description,
    functionName,
    readOnly
}) => {
    const [selectedLanguage, setSelectedLanguage] = useState<string>(
        allowedLanguages.length > 0 ? allowedLanguages[0] : 'javascript'
    );
    const [activeTab, setActiveTab] = useState<'boilerplate' | 'wrapper'>('boilerplate');
    const [isGenerating, setIsGenerating] = useState(false);
    const [showGenerateModal, setShowGenerateModal] = useState(false);
    const [inputFormat, setInputFormat] = useState('');
    const [outputFormat, setOutputFormat] = useState('');
    // Helper: decode HTML entities
    const decodeHTMLEntities = (html: string): string => {
        const textarea = document.createElement('textarea');
        textarea.innerHTML = html;
        return textarea.value;
    };

    const [usageDescription, setUsageDescription] = useState(() => {
        if (!description) return '';
        return decodeHTMLEntities(description.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim());
    });

    // Update usageDescription when prop changes
    React.useEffect(() => {
        if (description) {
            const decoded = decodeHTMLEntities(description.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim());
            setUsageDescription(decoded);
        }
    }, [description]);

    // Debug log
    React.useEffect(() => {
        console.log('🎨 CodeConfiguration rendered - readOnly:', readOnly, 'allowedLanguages:', allowedLanguages);
    }, [readOnly, allowedLanguages]);

    if (allowedLanguages.length === 0) return null;

    const handleGenerate = async () => {
        if (!usageDescription || !functionName) {
            toast.error('Task description and function name are required');
            return;
        }

        setIsGenerating(true);
        try {
            const result = await aiAPI.generateCode({
                description: usageDescription,
                functionName,
                languages: allowedLanguages,
                inputFormat,
                outputFormat
            });

            console.log('📦 AI generateCode result:', result);

            // Filter out non-language keys (e.g. 'success': true) before iterating
            const KNOWN_LANGS = ['javascript', 'typescript', 'python', 'python3', 'java', 'cpp', 'c', 'golang', 'rust', 'ruby', 'kotlin', 'swift', 'csharp'];

            // Update boilerplate and wrapper code for all languages
            Object.entries(result).forEach(([lang, code]: [string, any]) => {
                if (!KNOWN_LANGS.includes(lang.toLowerCase()) || typeof code !== 'object' || code === null) {
                    console.log(`⏭️ Skipping key: "${lang}"`);
                    return;
                }
                if (code.boilerplate) {
                    onBoilerplateChange(lang, code.boilerplate);
                    console.log(`✅ Applied boilerplate for ${lang}`);
                }
                if (code.driver) {
                    onWrapperCodeChange(lang, code.driver);
                    console.log(`✅ Applied wrapper/driver for ${lang}`);
                }
            });

            toast.success('Code generated successfully!');
            setShowGenerateModal(false);
        } catch (error: any) {
            console.error('Error generating code:', error);
            toast.error(error.message || 'Failed to generate code');
        } finally {
            setIsGenerating(false);
        }
    };

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
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px'
            }}>
                <div style={{
                    display: 'flex',
                    overflowX: 'auto',
                    scrollbarWidth: 'none',
                    flex: 1,
                    minWidth: 0
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
                {!readOnly && (
                    <button
                        type="button"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            console.log('🔮 AI Generate button clicked');
                            setShowGenerateModal(true);
                        }}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '8px 14px',
                            background: 'rgba(139, 92, 246, 0.2)',
                            border: '1px solid rgba(139, 92, 246, 0.4)',
                            borderRadius: '6px',
                            color: '#e2e8f0',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                            pointerEvents: 'auto',
                            flexShrink: 0
                        }}
                    >
                        <Wand2 size={14} color="#a78bfa" />
                        AI Generate
                    </button>
                )}
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
                    <MonitorPlay size={16} /> Test Runner Wrapper
                </button>
            </div>

            {/* Editor Area */}
            <div style={{
                background: '#1e1e1e',
                borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                minHeight: '200px'
            }}>
                <textarea
                    value={activeTab === 'boilerplate'
                        ? (boilerplateCode?.[selectedLanguage] || '')
                        : (wrapperCode?.[selectedLanguage] || '')
                    }
                    onChange={(e) => activeTab === 'boilerplate'
                        ? onBoilerplateChange(selectedLanguage, e.target.value)
                        : onWrapperCodeChange(selectedLanguage, e.target.value)
                    }
                    placeholder={activeTab === 'boilerplate'
                        ? `// Enter boilerplate code for ${selectedLanguage}...`
                        : `// Enter wrapper code for ${selectedLanguage}...`
                    }
                    style={{
                        width: '100%',
                        height: '300px',
                        background: 'transparent',
                        border: 'none',
                        color: '#d4d4d4',
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: '14px',
                        padding: '16px',
                        resize: 'vertical',
                        outline: 'none',
                        lineHeight: '1.5'
                    }}
                    readOnly={readOnly}
                />
            </div>

            <div style={{ padding: '8px 16px', background: 'rgba(0,0,0,0.2)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <p style={{ margin: 0, fontSize: '0.75rem', color: '#71717a' }}>
                    {activeTab === 'boilerplate'
                        ? "This code will be shown to the user as a starting point."
                        : "This code wraps the user's solution, feeds input, and captures output for testing."}
                </p>
            </div>

            {/* AI Generation Modal - rendered via Portal to escape overflow:hidden */}
            {showGenerateModal && ReactDOM.createPortal(
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.8)',
                    zIndex: 99999,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backdropFilter: 'blur(4px)'
                }}
                    onClick={(e) => { if (e.target === e.currentTarget) setShowGenerateModal(false); }}
                >
                    <div
                        style={{
                            background: '#111113',
                            border: '1px solid rgba(139, 92, 246, 0.3)',
                            borderRadius: '12px',
                            padding: '24px',
                            width: '90%',
                            maxWidth: '500px',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                            <div style={{
                                width: 40, height: 40, borderRadius: 8,
                                background: 'rgba(139, 92, 246, 0.2)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                border: '1px solid rgba(139, 92, 246, 0.3)'
                            }}>
                                <Wand2 size={24} color="#a78bfa" />
                            </div>
                            <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#fff' }}>Generate Task Code</h3>
                        </div>

                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', color: '#a1a1aa', fontSize: '0.85rem', marginBottom: '8px' }}>
                                Task Description <span style={{ color: '#ef4444' }}>*</span>
                            </label>
                            <textarea
                                value={usageDescription}
                                onChange={e => setUsageDescription(e.target.value)}
                                placeholder="Describe what the function should do..."
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    background: '#18181b',
                                    border: '1px solid #3f3f46',
                                    borderRadius: '6px',
                                    color: '#fff',
                                    outline: 'none',
                                    minHeight: '80px',
                                    resize: 'vertical',
                                    fontFamily: 'inherit',
                                    boxSizing: 'border-box'
                                }}
                            />
                        </div>

                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', color: '#a1a1aa', fontSize: '0.85rem', marginBottom: '8px' }}>Input Format (Optional)</label>
                            <input
                                type="text"
                                value={inputFormat}
                                onChange={e => setInputFormat(e.target.value)}
                                placeholder="e.g. First line: integer N. Second line: N integers."
                                style={{
                                    width: '100%', padding: '10px', background: '#18181b',
                                    border: '1px solid #3f3f46', borderRadius: '6px', color: '#fff', outline: 'none',
                                    boxSizing: 'border-box'
                                }}
                            />
                        </div>

                        <div style={{ marginBottom: '24px' }}>
                            <label style={{ display: 'block', color: '#a1a1aa', fontSize: '0.85rem', marginBottom: '8px' }}>Output Format (Optional)</label>
                            <input
                                type="text"
                                value={outputFormat}
                                onChange={e => setOutputFormat(e.target.value)}
                                placeholder="e.g. Print usage count on a single line."
                                style={{
                                    width: '100%', padding: '10px', background: '#18181b',
                                    border: '1px solid #3f3f46', borderRadius: '6px', color: '#fff', outline: 'none',
                                    boxSizing: 'border-box'
                                }}
                            />
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                            <button
                                type="button"
                                onClick={() => setShowGenerateModal(false)}
                                style={{
                                    padding: '10px 16px', background: 'transparent', color: '#a1a1aa',
                                    border: '1px solid #3f3f46', borderRadius: '6px', cursor: 'pointer'
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleGenerate}
                                disabled={isGenerating}
                                style={{
                                    padding: '10px 20px',
                                    background: isGenerating ? '#4c1d95' : '#7c3aed',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '6px',
                                    fontWeight: 600,
                                    cursor: isGenerating ? 'not-allowed' : 'pointer',
                                    display: 'flex', alignItems: 'center', gap: '8px'
                                }}
                            >
                                {isGenerating ? 'Generating...' : <><Wand2 size={16} /> Generate Code</>}
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default CodeConfiguration;
