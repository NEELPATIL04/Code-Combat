import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import CodeConfiguration from './components/CodeConfiguration';
import AIGenerator from './components/AIGenerator';
import TestCaseList from './components/TestCaseList';

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

    const handleGenerateAI = async ({ description, count }: { description: string, count: number }) => {
        if (!functionName) {
            toast.error('Please enter a function name first');
            return;
        }

        try {
            setGenerating(true);
            const token = sessionStorage.getItem('token');
            // Assuming the language for AI generation is the first allowed language or 'javascript'
            const targetLanguage = allowedLanguages[0] || 'javascript';

            const response = await axios.post('/api/ai/generate-test-cases', {
                description,
                numberOfTestCases: count,
                functionName,
                language: targetLanguage,
                boilerplateCode: boilerplateCode[targetLanguage] || '',
                wrapperCode: wrapperCode[targetLanguage] || ''
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                const newTestCases = response.data.testCases.map((tc: any) => ({
                    input: tc.input,
                    expectedOutput: tc.expectedOutput,
                    isHidden: false
                }));

                onChange([...testCases, ...newTestCases]);
                toast.success(`Generated ${newTestCases.length} test cases!`);
            }
        } catch (error) {
            console.error('AI Generation failed:', error);
            toast.error('Failed to generate test cases');
        } finally {
            setGenerating(false);
        }
    };

    return (
        <div>
            {/* 1. Code Configuration Section */}
            <div style={{ marginBottom: '24px' }}>
                <h3 style={{
                    fontSize: '1rem',
                    color: '#fff',
                    marginBottom: '12px',
                    fontWeight: 600
                }}>
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
            </div>

            {/* 2. AI Generator Section */}
            {!readOnly && (
                <AIGenerator
                    onGenerate={handleGenerateAI}
                    loading={generating}
                />
            )}

            {/* 3. Test Cases List Section */}
            <TestCaseList
                testCases={testCases}
                onChange={onChange}
                readOnly={readOnly}
            />
        </div>
    );
};

export default TestCaseManager;
