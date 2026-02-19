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
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <h3 style={{ fontSize: '1rem', color: '#fff', fontWeight: 600, margin: 0 }}>
                        Code Configuration
                    </h3>
                    {/* Generate Wrapper Button */}
                    {!readOnly && (
                        <div
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                console.log('🧪 Generate Wrapper DIV clicked!');
                                setShowWrapperModal(true);
                            }}
                            onMouseDown={(e) => {
                                console.log('🧪 Mouse down on wrapper button');
                            }}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    setShowWrapperModal(true);
                                }
                            }}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '8px 14px',
                                background: 'linear-gradient(135deg, rgba(16,185,129,0.2), rgba(5,150,105,0.2))',
                                border: '1px solid rgba(16,185,129,0.4)',
                                borderRadius: '8px',
                                color: '#34d399',
                                fontSize: '0.8rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                whiteSpace: 'nowrap',
                                userSelect: 'none',
                                position: 'relative',
                                zIndex: 100
                            }}
                        >
                            <span style={{ fontSize: '14px', pointerEvents: 'none' }}>🧪</span>
                            <span style={{ pointerEvents: 'none' }}>Generate Test Wrapper (AI)</span>
                        </div>
                    )}
                </div>
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
