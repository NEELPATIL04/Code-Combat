import React, { useState, useEffect } from 'react';
import { X, FlaskConical, Wand2, CheckCircle2 } from 'lucide-react';
import { aiAPI } from '../../../utils/api';
import toast from 'react-hot-toast';

interface GenerateWrapperModalProps {
    description: string;
    functionName: string;
    allowedLanguages: string[];
    onWrapperGenerated: (lang: string, code: string) => void;
    onClose: () => void;
}

const GenerateWrapperModal: React.FC<GenerateWrapperModalProps> = ({
    description,
    functionName,
    allowedLanguages,
    onWrapperGenerated,
    onClose
}) => {
    const [customInstructions, setCustomInstructions] = useState('');
    const [editedDescription, setEditedDescription] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [generated, setGenerated] = useState<Record<string, string>>({});
    const [selectedLangs, setSelectedLangs] = useState<string[]>(allowedLanguages);

    // Strip HTML tags for a readable plain-text description
    useEffect(() => {
        const stripped = description
            .replace(/<[^>]+>/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
        setEditedDescription(stripped);
    }, [description]);

    const toggleLang = (lang: string) => {
        setSelectedLangs(prev =>
            prev.includes(lang) ? prev.filter(l => l !== lang) : [...prev, lang]
        );
    };

    const handleGenerate = async () => {
        if (!editedDescription.trim()) {
            toast.error('Description is required');
            return;
        }
        if (!functionName) {
            toast.error('Function name is required');
            return;
        }
        if (selectedLangs.length === 0) {
            toast.error('Select at least one language');
            return;
        }

        setIsGenerating(true);
        try {
            const fullDesc = editedDescription + (customInstructions ? `\n\nAdditional instructions: ${customInstructions}` : '');

            console.log('🧪 Generating wrapper for:', selectedLangs, '| fn:', functionName);

            const result = await aiAPI.generateCode({
                description: fullDesc,
                functionName,
                languages: selectedLangs,
                inputFormat: customInstructions || undefined,
                outputFormat: undefined
            });

            console.log('📦 generateCode raw result:', result);

            // Filter out non-language keys (like 'success', 'message', etc.)
            const KNOWN_LANGS = ['javascript', 'typescript', 'python', 'python3', 'java', 'cpp', 'c', 'golang', 'rust', 'ruby', 'kotlin', 'swift', 'csharp'];
            const newGenerated: Record<string, string> = {};

            Object.entries(result).forEach(([lang, code]: [string, any]) => {
                // Only process actual language keys
                if (!KNOWN_LANGS.includes(lang.toLowerCase()) || typeof code !== 'object' || code === null) {
                    console.log(`⏭️ Skipping key: "${lang}" (not a language entry)`);
                    return;
                }
                const wrapperCode = code.driver || code.wrapper || code.testRunner || '';
                if (wrapperCode) {
                    newGenerated[lang] = wrapperCode;
                    onWrapperGenerated(lang, wrapperCode);
                    console.log(`✅ Applied wrapper for ${lang} (${wrapperCode.length} chars)`);
                } else {
                    console.warn(`⚠️ No driver/wrapper found for ${lang}:`, code);
                }
            });

            if (Object.keys(newGenerated).length === 0) {
                toast.error('AI returned no wrapper code. Try again or add more details.');
            } else {
                setGenerated(newGenerated);
                toast.success(`✅ Generated wrapper for: ${Object.keys(newGenerated).join(', ')}`);
            }
        } catch (error: any) {
            console.error('Wrapper generation error:', error);
            toast.error(error.message || 'Failed to generate wrapper code');
        } finally {
            setIsGenerating(false);
        }
    };

    const langColors: Record<string, string> = {
        javascript: '#F7DF1E',
        typescript: '#3178C6',
        python: '#3572A5',
        python3: '#3572A5',
        java: '#B07219',
        cpp: '#F34B7D',
        c: '#555555',
        golang: '#00ADD8',
        rust: '#DEA584',
        ruby: '#701516',
        kotlin: '#A97BFF',
        swift: '#FA7343',
        csharp: '#178600',
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(6px)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
        }}>
            <div style={{
                background: '#0f0f13',
                border: '1px solid rgba(16,185,129,0.3)',
                borderRadius: '16px',
                width: '100%',
                maxWidth: '620px',
                maxHeight: '90vh',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 25px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(16,185,129,0.1)'
            }}>
                {/* Header */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '20px 24px',
                    borderBottom: '1px solid rgba(255,255,255,0.07)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                            width: 36, height: 36,
                            background: 'rgba(16,185,129,0.15)',
                            border: '1px solid rgba(16,185,129,0.3)',
                            borderRadius: '8px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            <FlaskConical size={18} color="#34d399" />
                        </div>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '1rem', color: '#fff', fontWeight: 600 }}>
                                Generate Test Wrapper
                            </h3>
                            <p style={{ margin: 0, fontSize: '0.75rem', color: '#71717a' }}>
                                AI will generate the test runner wrapper code
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} style={{
                        background: 'transparent', border: 'none',
                        color: '#71717a', cursor: 'pointer', padding: '4px'
                    }}>
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

                    {/* Description field - editable */}
                    <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', color: '#a1a1aa', marginBottom: '8px', fontWeight: 500 }}>
                            Problem Description <span style={{ color: '#ef4444' }}>*</span>
                            <span style={{ color: '#71717a', fontWeight: 400, marginLeft: '6px' }}>(auto-filled, editable)</span>
                        </label>
                        <textarea
                            value={editedDescription}
                            onChange={e => setEditedDescription(e.target.value)}
                            rows={4}
                            style={{
                                width: '100%',
                                padding: '10px 12px',
                                background: '#18181b',
                                border: '1px solid #3f3f46',
                                borderRadius: '8px',
                                color: '#d4d4d4',
                                fontSize: '0.85rem',
                                resize: 'vertical',
                                outline: 'none',
                                fontFamily: 'inherit',
                                lineHeight: 1.6,
                                boxSizing: 'border-box'
                            }}
                        />
                    </div>

                    {/* Function name (read-only display) */}
                    <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', color: '#a1a1aa', marginBottom: '8px', fontWeight: 500 }}>
                            Function Name
                        </label>
                        <div style={{
                            padding: '10px 12px',
                            background: '#18181b',
                            border: '1px solid #3f3f46',
                            borderRadius: '8px',
                            color: '#a78bfa',
                            fontFamily: 'monospace',
                            fontSize: '0.9rem'
                        }}>
                            {functionName || <span style={{ color: '#71717a', fontStyle: 'italic' }}>No function name set</span>}
                        </div>
                    </div>

                    {/* Language selector */}
                    <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', color: '#a1a1aa', marginBottom: '10px', fontWeight: 500 }}>
                            Generate for Languages
                        </label>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                            {allowedLanguages.map(lang => (
                                <button
                                    key={lang}
                                    type="button"
                                    onClick={() => toggleLang(lang)}
                                    style={{
                                        padding: '6px 14px',
                                        borderRadius: '20px',
                                        fontSize: '0.8rem',
                                        fontWeight: 500,
                                        cursor: 'pointer',
                                        border: `1px solid ${selectedLangs.includes(lang) ? (langColors[lang] || '#a78bfa') : '#3f3f46'}`,
                                        background: selectedLangs.includes(lang)
                                            ? `${(langColors[lang] || '#a78bfa')}22`
                                            : 'transparent',
                                        color: selectedLangs.includes(lang)
                                            ? (langColors[lang] || '#a78bfa')
                                            : '#71717a',
                                        transition: 'all 0.2s',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px'
                                    }}
                                >
                                    {selectedLangs.includes(lang) && <CheckCircle2 size={12} />}
                                    {lang}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Optional custom instructions */}
                    <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', color: '#a1a1aa', marginBottom: '8px', fontWeight: 500 }}>
                            Custom Instructions <span style={{ color: '#71717a', fontWeight: 400 }}>(optional)</span>
                        </label>
                        <textarea
                            value={customInstructions}
                            onChange={e => setCustomInstructions(e.target.value)}
                            placeholder="e.g. 'The function returns a list, compare as sorted arrays' or 'Input is given as space-separated integers on one line'"
                            rows={3}
                            style={{
                                width: '100%',
                                padding: '10px 12px',
                                background: '#18181b',
                                border: '1px solid #3f3f46',
                                borderRadius: '8px',
                                color: '#d4d4d4',
                                fontSize: '0.85rem',
                                resize: 'vertical',
                                outline: 'none',
                                fontFamily: 'inherit',
                                lineHeight: 1.6,
                                boxSizing: 'border-box'
                            }}
                        />
                        <p style={{ margin: '6px 0 0', fontSize: '0.75rem', color: '#52525b' }}>
                            Tell the AI about input format, comparison logic, edge cases, etc.
                        </p>
                    </div>

                    {/* Already-generated languages badge */}
                    {Object.keys(generated).length > 0 && (
                        <div style={{
                            padding: '12px 16px',
                            background: 'rgba(16,185,129,0.08)',
                            border: '1px solid rgba(16,185,129,0.2)',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px'
                        }}>
                            <CheckCircle2 size={16} color="#34d399" />
                            <span style={{ fontSize: '0.85rem', color: '#34d399' }}>
                                Wrapper generated for: <strong>{Object.keys(generated).join(', ')}</strong> — applied to Test Runner tab
                            </span>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div style={{
                    padding: '16px 24px',
                    borderTop: '1px solid rgba(255,255,255,0.07)',
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: '12px'
                }}>
                    <button
                        onClick={onClose}
                        style={{
                            padding: '10px 20px',
                            background: 'transparent',
                            border: '1px solid #3f3f46',
                            borderRadius: '8px',
                            color: '#a1a1aa',
                            cursor: 'pointer',
                            fontSize: '0.875rem'
                        }}
                    >
                        {Object.keys(generated).length > 0 ? 'Done' : 'Cancel'}
                    </button>
                    <button
                        onClick={handleGenerate}
                        disabled={isGenerating || !editedDescription.trim() || selectedLangs.length === 0}
                        style={{
                            padding: '10px 24px',
                            background: isGenerating
                                ? 'rgba(16,185,129,0.3)'
                                : 'linear-gradient(135deg, #10b981, #059669)',
                            border: 'none',
                            borderRadius: '8px',
                            color: '#fff',
                            fontWeight: 600,
                            cursor: isGenerating ? 'not-allowed' : 'pointer',
                            fontSize: '0.875rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            opacity: isGenerating ? 0.7 : 1,
                            transition: 'all 0.2s'
                        }}
                    >
                        {isGenerating ? (
                            <>
                                <span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⚙️</span>
                                Generating...
                            </>
                        ) : (
                            <>
                                <Wand2 size={16} />
                                Generate Wrapper
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GenerateWrapperModal;
