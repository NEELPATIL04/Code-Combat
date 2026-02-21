import React, { useState } from 'react';
import { Sparkles, Wand2 } from 'lucide-react';

interface AIGeneratorProps {
    onGenerate: (params: { description: string, count: number }) => Promise<void>;
    loading: boolean;
    prefillDescription?: string;
}

const AIGenerator: React.FC<AIGeneratorProps> = ({ onGenerate, loading, prefillDescription }) => {
    // Helper: decode HTML entities like &lt; &gt; &amp; etc.
    const decodeHTMLEntities = (html: string): string => {
        const textarea = document.createElement('textarea');
        textarea.innerHTML = html;
        return textarea.value;
    };

    const [description, setDescription] = useState(prefillDescription ? (() => {
        // Strip HTML tags and decode HTML entities for plain text
        return decodeHTMLEntities(prefillDescription.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim());
    })() : '');
    const [count, setCount] = useState(5);
    const [isExpanded, setIsExpanded] = useState(false);

    // Update when prefill changes
    React.useEffect(() => {
        if (prefillDescription && !description) {
            const stripped = decodeHTMLEntities(prefillDescription.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim());
            setDescription(stripped);
        }
    }, [prefillDescription]);

    const handleGenerate = () => {
        if (!description.trim()) return;
        onGenerate({ description, count });
    };

    if (!isExpanded) {
        return (
            <button
                type="button"
                onClick={() => setIsExpanded(true)}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '12px 20px',
                    background: 'linear-gradient(135deg, #8B5CF6, #7C3AED)',
                    border: 'none',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    width: '100%',
                    justifyContent: 'center',
                    marginBottom: '20px',
                    transition: 'all 0.2s',
                    boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)'
                }}
            >
                <Sparkles size={18} />
                Generate Test Cases with AI
            </button>
        );
    }

    return (
        <div style={{
            background: 'rgba(139, 92, 246, 0.1)',
            border: '1px solid rgba(139, 92, 246, 0.3)',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '20px',
            animation: 'fadeIn 0.3s ease-out'
        }}>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Sparkles size={20} color="#8B5CF6" />
                    <h3 style={{ margin: 0, fontSize: '1rem', color: '#fff' }}>AI Test Case Generator</h3>
                </div>
                <button
                    type="button"
                    onClick={() => setIsExpanded(false)}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'rgba(255, 255, 255, 0.5)',
                        cursor: 'pointer',
                        fontSize: '0.85rem'
                    }}
                >
                    Cancel
                </button>
            </div>

            <div style={{ marginBottom: '16px' }}>
                <label style={{
                    display: 'block',
                    fontSize: '0.85rem',
                    color: 'rgba(255, 255, 255, 0.7)',
                    marginBottom: '8px',
                    fontWeight: 500
                }}>
                    Problem Description
                </label>
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe the problem, input format, and constraints... (e.g. 'A function that takes an array of integers and returns the sum of all positive numbers')"
                    style={{
                        width: '100%',
                        minHeight: '100px',
                        padding: '12px',
                        background: 'rgba(0, 0, 0, 0.3)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '0.9rem',
                        fontFamily: 'Inter, sans-serif',
                        resize: 'vertical',
                        outline: 'none'
                    }}
                />
            </div>

            <div style={{ marginBottom: '20px' }}>
                <label style={{
                    display: 'block',
                    fontSize: '0.85rem',
                    color: 'rgba(255, 255, 255, 0.7)',
                    marginBottom: '8px',
                    fontWeight: 500
                }}>
                    Number of Test Cases
                </label>
                <input
                    type="range"
                    min="1"
                    max="10"
                    value={count}
                    onChange={(e) => setCount(parseInt(e.target.value))}
                    style={{
                        width: '100%',
                        marginBottom: '8px',
                        cursor: 'pointer'
                    }}
                />
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '0.8rem',
                    color: 'rgba(255, 255, 255, 0.5)'
                }}>
                    <span>1</span>
                    <span style={{ color: '#8B5CF6', fontWeight: 600 }}>{count} Test Cases</span>
                    <span>10</span>
                </div>
            </div>

            <button
                type="button"
                onClick={handleGenerate}
                disabled={loading || !description.trim()}
                style={{
                    width: '100%',
                    padding: '12px',
                    background: loading
                        ? 'rgba(139, 92, 246, 0.3)'
                        : 'linear-gradient(135deg, #8B5CF6, #7C3AED)',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '0.95rem',
                    fontWeight: 600,
                    cursor: loading || !description.trim() ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'all 0.2s',
                    opacity: loading || !description.trim() ? 0.7 : 1
                }}
            >
                {loading ? (
                    'Generating...'
                ) : (
                    <>
                        <Wand2 size={18} />
                        Generate Test Cases
                    </>
                )}
            </button>
        </div>
    );
};

export default AIGenerator;
