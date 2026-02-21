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

    const handleGenerateAI = async ({ description: desc, count }: { description: string, count: number }) => {
        if (!functionName) {
            toast.error('Please enter a function name first');
            return;
        }

        try {
            setGenerating(true);
            const targetLanguage = allowedLanguages[0] || 'javascript';

            const response = await aiAPI.generateTestCases({
                description: desc || description || '',
                numberOfTestCases: count,
                functionName,
                language: targetLanguage,
                boilerplateCode: boilerplateCode[targetLanguage] || '',
                wrapperCode: wrapperCode[targetLanguage] || ''
            });

            if (response.success) {
                const newTestCases = response.testCases.map((tc: any) => ({
                    input: tc.input,
                    expectedOutput: tc.expectedOutput,
                    isHidden: false
                }));
                onChange([...testCases, ...newTestCases]);
                toast.success(`Generated ${newTestCases.length} test cases!`);
            }
        } catch (error: any) {
            console.error('AI Generation failed:', error);
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
                {/* Generate Wrapper Button - Moved below for better accessibility */}
                {!readOnly && (
                    <div
                        onClick={() => {
                            console.log('🧪🧪🧪 WRAPPER BUTTON CLICKED! 🧪🧪🧪');
                            setShowWrapperModal(true);
                        }}
                        onMouseEnter={() => console.log('🧪 Mouse entered wrapper button')}
                        onMouseLeave={() => console.log('🧪 Mouse left wrapper button')}
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
                            userSelect: 'none'
                        }}
                        onMouseDown={(e) => {
                            e.currentTarget.style.transform = 'scale(0.98)';
                        }}
                        onMouseUp={(e) => {
                            e.currentTarget.style.transform = 'scale(1)';
                        }}
                    >
                        <span style={{ fontSize: '18px' }}>🧪</span>
                        <span>Generate Test Wrapper with AI</span>
                    </div>
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
