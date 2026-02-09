/**
 * Test Script: Create Async Programming Contest & Run Tests
 * 
 * This script:
 * 1. Logs in as admin
 * 2. Creates a contest with async/Promise tasks
 * 3. Submits correct & incorrect code in JS/TS/Java/C++
 * 4. Reports results including error quality
 */

const BASE_URL = process.env.API_URL || 'http://localhost:5000';

async function api(method, path, body, token) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  
  const opts = { method, headers };
  if (body) opts.body = JSON.stringify(body);
  
  const resp = await fetch(`${BASE_URL}${path}`, opts);
  const text = await resp.text();
  try {
    return { status: resp.status, data: JSON.parse(text) };
  } catch {
    return { status: resp.status, data: text };
  }
}

// ═══════════════════════════════════════════════════
// TASK DEFINITIONS — Async-focused coding challenges
// ═══════════════════════════════════════════════════

const TASKS = [
  {
    title: 'Promise.all Polyfill',
    description: `Implement a function \`promiseAll\` that takes an array of values (which may or may not be Promises) and returns a Promise that resolves to an array of resolved values in the same order. If any promise rejects, the returned promise should reject with that reason.\n\nThis is similar to \`Promise.all()\`.\n\nInput: An array of integers (simulating resolved values)\nOutput: An array of the same integers (to verify ordering is preserved)`,
    difficulty: 'Medium',
    maxPoints: 100,
    functionName: 'promiseAll',
    allowedLanguages: ['javascript', 'typescript'],
    boilerplateCode: {
      javascript: `function promiseAll(values) {\n  // Implement Promise.all polyfill\n  // Return a promise that resolves with array of results\n}`,
      typescript: `function promiseAll(values: any[]): Promise<any[]> {\n  // Implement Promise.all polyfill\n  // Return a promise that resolves with array of results\n}`
    },
    testRunnerTemplate: {
      javascript: `{{USER_CODE}}

// Test runner for async function
const input = require('fs').readFileSync(0, 'utf-8').trim();
const values = JSON.parse(input);
// Wrap values as resolved promises
const promiseValues = values.map(v => Promise.resolve(v));
Promise.resolve(promiseAll(promiseValues)).then(result => {
  process.stdout.write("\\n---CODECOMBAT_RESULT---\\n");
  console.log(JSON.stringify(result));
}).catch(err => {
  process.stdout.write("\\n---CODECOMBAT_RESULT---\\n");
  console.log("Error: " + String(err));
});`,
      typescript: `{{USER_CODE}}

// Test runner for async function
declare const process: any;
declare function require(name: string): any;
const input = require('fs').readFileSync(0, 'utf-8').trim();
const values: any[] = JSON.parse(input);
const promiseValues = values.map((v: any) => Promise.resolve(v));
Promise.resolve(promiseAll(promiseValues)).then((result: any) => {
  process.stdout.write("\\n---CODECOMBAT_RESULT---\\n");
  console.log(JSON.stringify(result));
}).catch((err: any) => {
  process.stdout.write("\\n---CODECOMBAT_RESULT---\\n");
  console.log("Error: " + String(err));
});`
    },
    testCases: [
      { input: '[1,2,3]', expectedOutput: '[1,2,3]', isHidden: false },
      { input: '[10,20,30,40,50]', expectedOutput: '[10,20,30,40,50]', isHidden: false },
      { input: '[42]', expectedOutput: '[42]', isHidden: false },
      { input: '[]', expectedOutput: '[]', isHidden: true },
      { input: '[100,200,300,400,500,600,700,800,900,1000]', expectedOutput: '[100,200,300,400,500,600,700,800,900,1000]', isHidden: true },
    ],
    aiConfig: { hintsEnabled: true }
  },
  {
    title: 'Async Map',
    description: `Implement a function \`asyncMap\` that takes an array of numbers and an async mapper function, and returns a Promise that resolves to an array of mapped values. The mapper should be applied to all items concurrently (not sequentially).\n\nFor testing, the mapper doubles the number: asyncMapper(n) => n * 2\n\nInput: An array of integers\nOutput: An array where each element is doubled`,
    difficulty: 'Medium',
    maxPoints: 100,
    functionName: 'asyncMap',
    allowedLanguages: ['javascript', 'typescript'],
    boilerplateCode: {
      javascript: `function asyncMap(arr, mapper) {\n  // Apply mapper to all items concurrently\n  // Return promise resolving to array of results\n}`,
      typescript: `function asyncMap(arr: number[], mapper: (n: number) => Promise<number>): Promise<number[]> {\n  // Apply mapper to all items concurrently\n  // Return promise resolving to array of results\n}`
    },
    testRunnerTemplate: {
      javascript: `{{USER_CODE}}

const input = require('fs').readFileSync(0, 'utf-8').trim();
const values = JSON.parse(input);
const mapper = (n) => Promise.resolve(n * 2);
Promise.resolve(asyncMap(values, mapper)).then(result => {
  process.stdout.write("\\n---CODECOMBAT_RESULT---\\n");
  console.log(JSON.stringify(result));
}).catch(err => {
  process.stdout.write("\\n---CODECOMBAT_RESULT---\\n");
  console.log("Error: " + String(err));
});`,
      typescript: `{{USER_CODE}}

declare const process: any;
declare function require(name: string): any;
const input = require('fs').readFileSync(0, 'utf-8').trim();
const values: number[] = JSON.parse(input);
const mapper = (n: number): Promise<number> => Promise.resolve(n * 2);
Promise.resolve(asyncMap(values, mapper)).then((result: any) => {
  process.stdout.write("\\n---CODECOMBAT_RESULT---\\n");
  console.log(JSON.stringify(result));
}).catch((err: any) => {
  process.stdout.write("\\n---CODECOMBAT_RESULT---\\n");
  console.log("Error: " + String(err));
});`
    },
    testCases: [
      { input: '[1,2,3]', expectedOutput: '[2,4,6]', isHidden: false },
      { input: '[5,10,15]', expectedOutput: '[10,20,30]', isHidden: false },
      { input: '[0]', expectedOutput: '[0]', isHidden: false },
      { input: '[]', expectedOutput: '[]', isHidden: true },
      { input: '[100,200,300]', expectedOutput: '[200,400,600]', isHidden: true },
    ],
    aiConfig: { hintsEnabled: true }
  },
  {
    title: 'Thread-Safe Counter (Java)',
    description: `Implement a function \`concurrentSum\` that takes an array of integers and returns their sum.\n\nIn Java, this tests basic computation that would be the building block for concurrent operations.\n\nInput: A JSON array of integers\nOutput: The sum as an integer`,
    difficulty: 'Easy',
    maxPoints: 100,
    functionName: 'concurrentSum',
    allowedLanguages: ['java'],
    boilerplateCode: {
      java: `public static int concurrentSum(int[] nums) {\n    // Return the sum of all numbers\n    return 0;\n}`
    },
    testRunnerTemplate: {
      java: `import java.util.*;
import java.util.stream.*;

public class Main {
    {{USER_CODE}}

    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        String input = scanner.hasNextLine() ? scanner.nextLine().trim() : "[]";
        // Parse JSON array: [1,2,3]
        input = input.replaceAll("[\\\\[\\\\]]", "");
        int[] nums;
        if (input.isEmpty()) {
            nums = new int[0];
        } else {
            nums = Arrays.stream(input.split(","))
                .map(String::trim)
                .mapToInt(Integer::parseInt)
                .toArray();
        }
        int result = concurrentSum(nums);
        System.out.print("\\n---CODECOMBAT_RESULT---\\n");
        System.out.println(result);
    }
}`
    },
    testCases: [
      { input: '[1,2,3,4,5]', expectedOutput: '15', isHidden: false },
      { input: '[10,20,30]', expectedOutput: '60', isHidden: false },
      { input: '[0]', expectedOutput: '0', isHidden: false },
      { input: '[-1,1,-2,2]', expectedOutput: '0', isHidden: true },
      { input: '[100,200,300,400]', expectedOutput: '1000', isHidden: true },
    ],
    aiConfig: { hintsEnabled: true }
  },
  {
    title: 'Parallel Array Sum (C++)',
    description: `Implement a function \`parallelSum\` that takes a vector of integers and returns their sum.\n\nIn C++, this tests basic computation that could be parallelized with std::async/threads.\n\nInput: A JSON array of integers\nOutput: The sum as an integer`,
    difficulty: 'Easy',
    maxPoints: 100,
    functionName: 'parallelSum',
    allowedLanguages: ['cpp'],
    boilerplateCode: {
      cpp: `#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    int parallelSum(vector<int>& nums) {\n        // Return the sum of all numbers\n        return 0;\n    }\n};`
    },
    testRunnerTemplate: {
      cpp: `#include <iostream>
#include <vector>
#include <string>
#include <sstream>
using namespace std;

{{USER_CODE}}

int main() {
    string input;
    getline(cin, input);
    // Parse JSON array: [1,2,3]
    vector<int> nums;
    string clean = "";
    for (char c : input) {
        if (c != '[' && c != ']') clean += c;
    }
    if (!clean.empty()) {
        stringstream ss(clean);
        string token;
        while (getline(ss, token, ',')) {
            nums.push_back(stoi(token));
        }
    }
    Solution solution;
    int result = solution.parallelSum(nums);
    cout << "\\n---CODECOMBAT_RESULT---\\n";
    cout << result << endl;
    return 0;
}`
    },
    testCases: [
      { input: '[1,2,3,4,5]', expectedOutput: '15', isHidden: false },
      { input: '[10,20,30]', expectedOutput: '60', isHidden: false },
      { input: '[0]', expectedOutput: '0', isHidden: false },
      { input: '[-1,1,-2,2]', expectedOutput: '0', isHidden: true },
      { input: '[100,200,300,400]', expectedOutput: '1000', isHidden: true },
    ],
    aiConfig: { hintsEnabled: true }
  }
];

// ═══════════════════════════════════════════
// TEST SOLUTIONS — Correct and Incorrect
// ═══════════════════════════════════════════

const SOLUTIONS = {
  // Task 1: Promise.all Polyfill
  'promiseAll': {
    javascript: {
      correct: `function promiseAll(values) {
  return new Promise((resolve, reject) => {
    if (values.length === 0) return resolve([]);
    const results = new Array(values.length);
    let completed = 0;
    values.forEach((val, i) => {
      Promise.resolve(val).then(result => {
        results[i] = result;
        completed++;
        if (completed === values.length) resolve(results);
      }).catch(reject);
    });
  });
}`,
      syntaxError: `function promiseAll(values) {
  return new Promise((resolve, reject) => {
    if (values.length === 0) return resolve([]);
    const results = new Array(values.length)
    let completed = 0
    values.forEach((val, i) => {
      Promise.resolve(val).then(result => {
        results[i] = result
        completed++
        if (completed === values.length) resolve(results
      }).catch(reject);
    });
  });
}`,
      runtimeError: `function promiseAll(values) {
  // This will cause a runtime error — calling undefined as function
  return values.map(v => v.nonExistentMethod()).reduce();
}`,
      wrongAnswer: `function promiseAll(values) {
  // Returns reversed order — wrong!
  return Promise.all(values).then(r => r.reverse());
}`,
    },
    typescript: {
      correct: `function promiseAll(values: any[]): Promise<any[]> {
  return new Promise((resolve, reject) => {
    if (values.length === 0) return resolve([]);
    const results: any[] = new Array(values.length);
    let completed = 0;
    values.forEach((val, i) => {
      Promise.resolve(val).then(result => {
        results[i] = result;
        completed++;
        if (completed === values.length) resolve(results);
      }).catch(reject);
    });
  });
}`,
      typeError: `function promiseAll(values: any[]): Promise<any[]> {
  // TypeScript type error — returning number instead of Promise
  const x: string = 42;
  return Promise.resolve([x]);
}`,
    }
  },
  // Task 2: Async Map
  'asyncMap': {
    javascript: {
      correct: `function asyncMap(arr, mapper) {
  return Promise.all(arr.map(item => mapper(item)));
}`,
      wrongAnswer: `function asyncMap(arr, mapper) {
  // Sequential instead of concurrent, but also wrong output
  return Promise.all(arr.map(item => Promise.resolve(item)));
}`,
    },
    typescript: {
      correct: `function asyncMap(arr: number[], mapper: (n: number) => Promise<number>): Promise<number[]> {
  return Promise.all(arr.map(item => mapper(item)));
}`,
    }
  },
  // Task 3: Java Sum
  'concurrentSum': {
    java: {
      correct: `public static int concurrentSum(int[] nums) {
    int sum = 0;
    for (int n : nums) sum += n;
    return sum;
}`,
      compilationError: `public static int concurrentSum(int[] nums) {
    int sum = 0
    for (int n : nums) sum += n
    return sum
}`,
      runtimeError: `public static int concurrentSum(int[] nums) {
    // Array index out of bounds
    return nums[nums.length + 1];
}`,
      wrongAnswer: `public static int concurrentSum(int[] nums) {
    // Off by one
    return nums.length > 0 ? nums[0] : 0;
}`,
    }
  },
  // Task 4: C++ Sum
  'parallelSum': {
    cpp: {
      correct: `#include <vector>
#include <numeric>
using namespace std;

class Solution {
public:
    int parallelSum(vector<int>& nums) {
        return accumulate(nums.begin(), nums.end(), 0);
    }
};`,
      compilationError: `#include <vector>
using namespace std;

class Solution {
public:
    int parallelSum(vector<int>& nums) {
        int sum = 0
        for (auto n : nums) sum += n
        return sum
    }
};`,
      runtimeError: `#include <vector>
using namespace std;

class Solution {
public:
    int parallelSum(vector<int>& nums) {
        // Segfault: accessing way out of bounds
        return nums.at(99999);
    }
};`,
      wrongAnswer: `#include <vector>
using namespace std;

class Solution {
public:
    int parallelSum(vector<int>& nums) {
        return 42; // Always returns 42
    }
};`,
    }
  }
};

// ═══════════════════════════════════════════
// MAIN TEST RUNNER
// ═══════════════════════════════════════════

async function main() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('  CODE COMBAT — Async Task Test Suite');
  console.log('═══════════════════════════════════════════════════════\n');

  // Step 1: Login as admin
  console.log('🔐 Step 1: Logging in as test_runner (admin)...');
  const loginResp = await api('POST', '/api/auth/login', {
    username: 'test_runner',
    password: 'TestRunner123!'
  });
  
  if (loginResp.status !== 200) {
    console.log('❌ Login failed:', loginResp.data);
    process.exit(1);
  }
  
  var token = loginResp.data.token;
  var userId = loginResp.data.userId;
  console.log(`✅ Logged in as ${loginResp.data.username} (ID: ${userId}, Role: ${loginResp.data.role})`);

  // Step 2: Create Contest
  console.log('\n📝 Step 2: Creating Async Programming Contest...');
  const contestResp = await api('POST', '/api/contests', {
    title: 'Async Programming Test Suite',
    description: 'Tests Promise.all parallel execution, async patterns across JS/TS/Java/C++',
    difficulty: 'Medium',
    duration: 60,
    contestTasks: TASKS,
    participantIds: [userId]
  }, token);

  if (contestResp.status !== 201) {
    console.log('❌ Failed to create contest:', JSON.stringify(contestResp.data, null, 2));
    process.exit(1);
  }
  
  const contestId = contestResp.data.contest.id;
  console.log(`✅ Contest created (ID: ${contestId})`);

  // Step 3: Start the contest
  console.log('\n🚀 Step 3: Starting contest...');
  const startResp = await api('POST', `/api/contests/${contestId}/start`, {}, token);
  console.log(`   Start: ${startResp.status} — ${startResp.data.message || 'OK'}`);

  // Step 4: Fetch tasks to get IDs
  console.log('\n📋 Step 4: Fetching tasks...');
  const tasksResp = await api('GET', `/api/contests/${contestId}/tasks`, null, token);
  
  if (tasksResp.status !== 200) {
    console.log('❌ Failed to fetch tasks:', tasksResp.data);
    process.exit(1);
  }

  const fetchedTasks = tasksResp.data.tasks;
  console.log(`   Found ${fetchedTasks.length} tasks:`);
  fetchedTasks.forEach((t, i) => console.log(`   ${i+1}. ${t.title} (ID: ${t.id})`));

  // Step 5: Run all test submissions
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('  RUNNING TEST SUBMISSIONS');
  console.log('═══════════════════════════════════════════════════════\n');

  const report = [];

  for (const task of fetchedTasks) {
    const funcName = task.functionName;
    const taskSolutions = SOLUTIONS[funcName];
    if (!taskSolutions) {
      console.log(`⚠️  No test solutions defined for ${funcName}, skipping`);
      continue;
    }

    console.log(`\n▶ Task: ${task.title} (${funcName})`);
    console.log('─'.repeat(50));

    for (const [lang, langSolutions] of Object.entries(taskSolutions)) {
      for (const [solType, code] of Object.entries(langSolutions)) {
        const label = `${lang}/${solType}`;
        console.log(`\n  📤 Submitting: ${label}...`);
        
        const startTime = Date.now();
        
        // Use /run endpoint (doesn't save to DB) for testing
        const runResp = await api('POST', '/api/submissions/run', {
          taskId: task.id,
          code: code,
          language: lang,
        }, token);
        
        const elapsed = Date.now() - startTime;
        const result = runResp.data;
        
        const entry = {
          task: task.title,
          language: lang,
          solutionType: solType,
          elapsed: `${elapsed}ms`,
          httpStatus: runResp.status,
          passed: null,
          total: null,
          errors: [],
          errorQuality: 'N/A',
        };

        if (runResp.status === 200 && result.data) {
          entry.passed = result.data.passed;
          entry.total = result.data.total;
          
          const failedTests = (result.data.results || []).filter(r => !r.passed);
          
          console.log(`  ✅ ${result.data.passed}/${result.data.total} passed (${elapsed}ms)`);
          
          if (failedTests.length > 0) {
            for (const ft of failedTests) {
              const errInfo = {
                testCase: ft.testCase,
                error: ft.error || null,
                actualOutput: ft.actualOutput,
                expectedOutput: ft.expectedOutput,
                consoleOutput: ft.consoleOutput || null,
              };
              entry.errors.push(errInfo);
              
              // Evaluate error quality
              if (ft.error) {
                const err = ft.error;
                if (err.includes('SyntaxError') || err.includes('Compilation Error') || 
                    err.includes('error:') || err.includes('TypeError')) {
                  // Has specific error type — good
                  if (err.includes('line') || err.includes('Line') || err.match(/:\d+:\d+/)) {
                    entry.errorQuality = '🟢 EXCELLENT — has error type + line number';
                  } else {
                    entry.errorQuality = '🟡 GOOD — has error type but no line number';
                  }
                } else if (err.includes('runtime') || err.includes('Runtime')) {
                  entry.errorQuality = '🟡 GOOD — runtime error detected';
                } else {
                  entry.errorQuality = '🔴 POOR — generic error message';
                }
                
                console.log(`     Error: ${err.substring(0, 200)}`);
                console.log(`     Quality: ${entry.errorQuality}`);
              } else if (ft.actualOutput !== ft.expectedOutput) {
                entry.errorQuality = '🟡 OK — wrong answer (no error field)';
                console.log(`     Wrong: got "${ft.actualOutput}" expected "${ft.expectedOutput}"`);
              }
            }
          }
        } else {
          console.log(`  ❌ HTTP ${runResp.status}: ${JSON.stringify(result).substring(0, 300)}`);
          entry.errors.push({ httpError: result });
          entry.errorQuality = runResp.status >= 500 ? '🔴 SERVER ERROR' : '🟡 CLIENT ERROR';
        }
        
        report.push(entry);
      }
    }
  }

  // ═══════════════════════════════════════════
  // FINAL REPORT
  // ═══════════════════════════════════════════
  console.log('\n\n═══════════════════════════════════════════════════════');
  console.log('  FINAL REPORT');
  console.log('═══════════════════════════════════════════════════════\n');
  
  console.log('Language | Solution Type    | Passed | Time    | Error Quality');
  console.log('─'.repeat(70));
  
  for (const r of report) {
    const lang = r.language.padEnd(10);
    const type = r.solutionType.padEnd(17);
    const passed = r.passed !== null ? `${r.passed}/${r.total}`.padEnd(7) : 'ERR'.padEnd(7);
    const time = r.elapsed.padEnd(8);
    console.log(`${lang} | ${type} | ${passed} | ${time} | ${r.errorQuality}`);
  }
  
  // Error details
  console.log('\n\n═══════════════════════════════════════════════════════');
  console.log('  ERROR DETAIL ANALYSIS');
  console.log('═══════════════════════════════════════════════════════\n');
  
  const errorEntries = report.filter(r => r.errors.length > 0);
  for (const r of errorEntries) {
    console.log(`\n▶ ${r.task} — ${r.language}/${r.solutionType}`);
    for (const e of r.errors) {
      if (e.error) {
        console.log(`  Error message:\n    ${e.error.split('\n').join('\n    ')}`);
      }
      if (e.actualOutput) {
        console.log(`  Actual output: ${e.actualOutput}`);
      }
      if (e.consoleOutput) {
        console.log(`  Console output: ${e.consoleOutput}`);
      }
      if (e.httpError) {
        console.log(`  HTTP Error: ${JSON.stringify(e.httpError).substring(0, 500)}`);
      }
    }
  }
  
  // Performance summary
  console.log('\n\n═══════════════════════════════════════════════════════');
  console.log('  PERFORMANCE SUMMARY (Promise.all Parallel Execution)');
  console.log('═══════════════════════════════════════════════════════\n');
  
  const times = report.map(r => parseInt(r.elapsed));
  console.log(`  Total submissions: ${report.length}`);
  console.log(`  Avg response time: ${Math.round(times.reduce((a,b) => a+b, 0) / times.length)}ms`);
  console.log(`  Min response time: ${Math.min(...times)}ms`);
  console.log(`  Max response time: ${Math.max(...times)}ms`);
  console.log(`  Median: ${times.sort((a,b) => a-b)[Math.floor(times.length/2)]}ms`);
  
  // Overall error quality score
  const qualities = report.map(r => r.errorQuality);
  const excellent = qualities.filter(q => q.includes('EXCELLENT')).length;
  const good = qualities.filter(q => q.includes('GOOD') || q.includes('OK')).length;
  const poor = qualities.filter(q => q.includes('POOR') || q.includes('SERVER')).length;
  const na = qualities.filter(q => q === 'N/A').length;
  
  console.log(`\n  Error Quality Breakdown:`);
  console.log(`    🟢 EXCELLENT: ${excellent}`);
  console.log(`    🟡 GOOD/OK:   ${good}`);
  console.log(`    🔴 POOR:      ${poor}`);
  console.log(`    N/A (correct): ${na}`);

  console.log('\n═══════════════════════════════════════════════════════');
  console.log('  TEST COMPLETE');
  console.log('═══════════════════════════════════════════════════════\n');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
