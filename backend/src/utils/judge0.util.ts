/**
 * Judge0 Language Mapping
 * Maps our language names to Judge0 language IDs
 */

export const JUDGE0_LANGUAGE_MAP: Record<string, number> = {
  'javascript': 63,  // Node.js 12.14.0
  'typescript': 74,  // TypeScript 3.7.4
  'python': 71,      // Python 3.8.1
  'java': 62,        // Java OpenJDK 13.0.1
  'cpp': 54,         // C++ GCC 9.2.0
  'c': 50,           // C GCC 9.2.0
  'csharp': 51,      // C# Mono 6.6.0.161
  'go': 60,          // Go 1.13.5
  'rust': 73,        // Rust 1.40.0
  'ruby': 72,        // Ruby 2.7.0
  'php': 68,         // PHP 7.4.1
  'swift': 83,       // Swift 5.2.3
  'kotlin': 78,      // Kotlin 1.3.70
  'sql': 82,         // SQL SQLite 3.27.2
};

/**
 * Get Judge0 language ID from language name
 */
export function getJudge0LanguageId(language: string): number {
  const langId = JUDGE0_LANGUAGE_MAP[language.toLowerCase()];
  if (!langId) {
    throw new Error(`Unsupported language: ${language}`);
  }
  return langId;
}

/**
 * Judge0 Submission Status Map
 */
export const JUDGE0_STATUS_MAP: Record<number, string> = {
  1: 'pending',                    // In Queue
  2: 'processing',                 // Processing
  3: 'accepted',                   // Accepted
  4: 'wrong_answer',               // Wrong Answer
  5: 'time_limit_exceeded',        // Time Limit Exceeded
  6: 'compilation_error',          // Compilation Error
  7: 'runtime_error',              // Runtime Error (SIGSEGV)
  8: 'runtime_error',              // Runtime Error (SIGXFSZ)
  9: 'runtime_error',              // Runtime Error (SIGFPE)
  10: 'runtime_error',             // Runtime Error (SIGABRT)
  11: 'runtime_error',             // Runtime Error (NZEC)
  12: 'runtime_error',             // Runtime Error (Other)
  13: 'internal_error',            // Internal Error
  14: 'internal_error',            // Exec Format Error
};

/**
 * Map Judge0 status ID to our submission status
 */
export function mapJudge0Status(statusId: number): string {
  return JUDGE0_STATUS_MAP[statusId] || 'internal_error';
}

/**
 * Judge0 API Response Types
 */
export interface Judge0Submission {
  source_code: string;
  language_id: number;
  stdin?: string;
  expected_output?: string;
  cpu_time_limit?: number;
  memory_limit?: number;
}

export interface Judge0SubmissionResult {
  token: string;
}

export interface Judge0Result {
  token: string;
  status: {
    id: number;
    description: string;
  };
  stdout: string | null;
  stderr: string | null;
  compile_output: string | null;
  time: string | null;
  memory: number | null;
}
