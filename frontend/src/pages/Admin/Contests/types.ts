export interface Contest {
    id: number;
    title: string;
    description?: string;
    status: string;
    difficulty: string;
    duration: number;
    participantCount?: number;
    taskCount?: number;
    isStarted: boolean;
    createdAt?: string;
    fullScreenMode?: boolean;
}

export interface Task {
    title: string;
    description: string;
    descriptionType: 'text' | 'html';
    difficulty: string;
    maxPoints: number;
    allowedLanguages: string[];
    // New fields for AI and Code Execution
    boilerplateCode: Record<string, string>;
    testRunnerTemplate: Record<string, string>; // Previously wrapperCode
    testCases: { input: string; expectedOutput: string; isHidden: boolean }[];
    functionName: string;
}

export const SUPPORTED_LANGUAGES = [
    { id: 'javascript', name: 'JavaScript' },
    { id: 'typescript', name: 'TypeScript' },
    { id: 'python', name: 'Python' },
    { id: 'java', name: 'Java' },
    { id: 'cpp', name: 'C++' },
    { id: 'csharp', name: 'C#' },
    { id: 'go', name: 'Go' },
    { id: 'rust', name: 'Rust' },
    { id: 'ruby', name: 'Ruby' },
    { id: 'php', name: 'PHP' },
    { id: 'swift', name: 'Swift' },
    { id: 'kotlin', name: 'Kotlin' },
    { id: 'sql', name: 'SQL' },
    { id: 'html', name: 'HTML' },
    { id: 'css', name: 'CSS' },
    { id: 'react-js', name: 'React (JS)' },
    { id: 'react-ts', name: 'React (TS)' },
];

export interface User {
    id: number;
    username: string;
    email: string;
    firstName?: string;
    lastName?: string;
    role: string;
    status: string;
}

export interface FormData {
    title: string;
    description: string;
    difficulty: string;
    duration: number;
    startPassword: string;
    tasks: Task[];
    fullScreenMode: boolean;
    participants: number[];
}
