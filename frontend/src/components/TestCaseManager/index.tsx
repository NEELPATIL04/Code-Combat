import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { aiAPI } from '../../utils/api';
import CodeConfiguration from './components/CodeConfiguration';
import AIGenerator from './components/AIGenerator';
import TestCaseList from './components/TestCaseList';
import GenerateWrapperModal from './components/GenerateWrapperModal';

interface TestCase {
    input: string;
    expectedOutput: string;
    isHidden: boolean;
}

interface TestCaseManagerProps {
    testCases: TestCase[];
    onChange: (testCases: TestCase[]) => void;

    // Code Configuration Props
    allowedLanguages: string[];
    boilerplateCode: Record<string, string>;
    wrapperCode: Record<string, string>;
    onBoilerplateChange: (language: string, code: string) => void;
    onWrapperCodeChange: (language: string, code: string) => void;

    // AI Props
    functionName: string;
    description: string;
    readOnly?: boolean;
}

const TestCaseManager: React.FC<TestCaseManagerProps> = ({
    testCases,
    onChange,
    allowedLanguages,
    boilerplateCode,
    wrapperCode,
    onBoilerplateChange,
    onWrapperCodeChange,
    functionName,
    description,
    readOnly
}) => {
    const [generating, setGenerating] = useState(false);
    const [showWrapperModal, setShowWrapperModal] = useState(false);

    useEffect(() => {
        console.log('🧪 showWrapperModal state changed:', showWrapperModal);
    }, [showWrapperModal]);

    // Helper: decode HTML entities
    const decodeHTMLEntities = (html: string): string => {
        const textarea = document.createElement('textarea');
        textarea.innerHTML = html;
        return textarea.value;
    };

    const handleGenerateAI = async ({ description: desc, count }: { description: string, count: number }) => {
        console.log('🧪 handleGenerateAI called with:', { desc: desc?.substring(0, 80), count, functionName });

        if (!functionName) {
            toast.error('Please enter a function name first (Step 3 → Function Name field)');
            console.warn('⚠️ functionName is empty, aborting test case generation');
            return;
        }

        if (allowedLanguages.length === 0) {
            toast.error('Please select at least one language first');
            return;
        }

        try {
            setGenerating(true);
            const targetLanguage = allowedLanguages[0] || 'javascript';

            // Use the AI Generator's description (already stripped by AIGenerator),
            // falling back to the raw description prop (strip HTML from it)
            const rawDesc = desc || description || '';
            const cleanDesc = decodeHTMLEntities(
                rawDesc.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
            );

            // Get the boilerplate and wrapper code for the target language
            const bp = boilerplateCode[targetLanguage] || '';
            const wp = wrapperCode[targetLanguage] || '';

            console.log('🧪 Calling aiAPI.generateTestCases with:', {
                descriptionLength: cleanDesc.length,
                descriptionPreview: cleanDesc.substring(0, 100),
                numberOfTestCases: count,
                functionName,
                language: targetLanguage,
                boilerplateLength: bp.length,
                wrapperLength: wp.length,
                boilerplatePreview: bp.substring(0, 80),
                wrapperPreview: wp.substring(0, 80),
            });

            if (!bp && !wp) {
                console.warn('⚠️ No boilerplate or wrapper code found for language:', targetLanguage);
                toast('ℹ️ Generating without boilerplate/wrapper code — results may be less accurate', {
                    icon: '⚠️',
                    duration: 3000,
                });
            }

            const response = await aiAPI.generateTestCases({
                description: cleanDesc,
                numberOfTestCases: count,
                functionName,
                language: targetLanguage,
                boilerplateCode: bp,
                wrapperCode: wp
            });

            console.log('📦 generateTestCases response:', response);

            if (response.success && response.testCases && response.testCases.length > 0) {
                const newTestCases = response.testCases.map((tc: any) => ({
                    input: tc.input,
                    expectedOutput: tc.expectedOutput,
                    isHidden: false
                }));
                onChange([...testCases, ...newTestCases]);
                toast.success(`Generated ${newTestCases.length} test cases for ${targetLanguage}!`);
                console.log('✅ Added', newTestCases.length, 'test cases');
            } else if (response.testCases && response.testCases.length === 0) {
                toast.error('AI returned zero test cases. Try a more detailed description.');
                console.warn('⚠️ AI returned empty testCases array');
            } else {
                toast.error(response.message || 'Failed to generate test cases — try again');
                console.warn('⚠️ Unexpected response:', response);
            }
        } catch (error: any) {
            console.error('❌ AI Generation failed:', error);
            toast.error(error.message || 'Failed to generate test cases');
        } finally {
            setGenerating(false);
        }
    };

    const handleWrapperGenerated = (lang: string, code: string) => {
        onWrapperCodeChange(lang, code);
    };

    return (
        <div>
            {/* 1. Code Configuration Section */}
            <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '1rem', color: '#fff', fontWeight: 600, margin: 0, marginBottom: '12px' }}>
                    Code Configuration
                </h3>
                <CodeConfiguration
                    allowedLanguages={allowedLanguages}
                    boilerplateCode={boilerplateCode}
                    wrapperCode={wrapperCode}
                    onBoilerplateChange={onBoilerplateChange}
                    onWrapperCodeChange={onWrapperCodeChange}
                    description={description}
                    functionName={functionName}
                    readOnly={readOnly}
                />
                {/* Generate Wrapper Button */}
                {!readOnly && (
                    <button
                        type="button"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            console.log('🧪🧪🧪 WRAPPER BUTTON CLICKED! 🧪🧪🧪');
                            setShowWrapperModal(true);
                        }}
                        style={{
                            marginTop: '16px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '12px 20px',
                            background: 'linear-gradient(135deg, #10b981, #059669)',
                            border: 'none',
                            borderRadius: '8px',
                            color: '#fff',
                            fontSize: '0.9rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            boxShadow: '0 4px 12px rgba(16,185,129,0.3)',
                            transition: 'all 0.2s',
                            position: 'relative',
                            zIndex: 10
                        }}
                    >
                        <span style={{ fontSize: '18px' }}>🧪</span>
                        <span>Generate Test Wrapper with AI</span>
                    </button>
                )}
            </div>

            {/* 2. AI Generator Section */}
            {!readOnly && (
                <AIGenerator
                    onGenerate={handleGenerateAI}
                    loading={generating}
                    prefillDescription={description}
                />
            )}

            {/* 3. Test Cases List Section */}
            <TestCaseList
                testCases={testCases}
                onChange={onChange}
                readOnly={readOnly}
            />

            {/* 4. Generate Wrapper Modal */}
            {showWrapperModal && (
                <GenerateWrapperModal
                    description={description}
                    functionName={functionName}
                    allowedLanguages={allowedLanguages}
                    onWrapperGenerated={handleWrapperGenerated}
                    onClose={() => {
                        console.log('🧪 Closing wrapper modal');
                        setShowWrapperModal(false);
                    }}
                />
            )}
        </div>
    );
};

export default TestCaseManager;
