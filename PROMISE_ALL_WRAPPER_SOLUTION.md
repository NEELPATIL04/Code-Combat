# Promise.all Task - Correct Boilerplate & Wrapper Code

## Problem
The error `SyntaxError: Unexpected end of JSON input` occurs because:
1. Test input `[]` is empty and causes JSON.parse to fail
2. Test input `[{"then": () => 1}]` contains functions which cannot be JSON stringified/parsed
3. The default wrapper tries to use JSON.parse on the test input

## Solution

### 1. Boilerplate Code (What user sees in editor)

```javascript
function solution(promises) {
  // Write your Promise.all implementation here
  return new Promise((resolve, reject) => {
    // Your code here
  });
}
```

### 2. Test Runner Wrapper Code (Admin must add this)

```javascript
{{USER_CODE}}

// Test runner
async function runTests() {
  const testCases = [
    {
      input: [],
      expected: "[]"
    },
    {
      input: [
        Promise.resolve(1),
        Promise.resolve(2),
        Promise.resolve(3)
      ],
      expected: "[1,2,3]"
    },
    {
      input: [
        Promise.resolve("a"),
        Promise.resolve("b")
      ],
      expected: '["a","b"]'
    },
    {
      input: [
        new Promise(resolve => setTimeout(() => resolve(1), 10)),
        new Promise(resolve => setTimeout(() => resolve(2), 5))
      ],
      expected: "[1,2]"
    }
  ];

  for (let i = 0; i < testCases.length; i++) {
    try {
      const result = await solution(testCases[i].input);
      console.log(JSON.stringify(result));
    } catch (error) {
      console.log(JSON.stringify({ error: error.message }));
    }
  }
}

runTests();
```

## BETTER SOLUTION - Using Dynamic Test Input

If you want to use the test cases from the database (recommended):

### Wrapper Code:
```javascript
{{USER_CODE}}

// Parse test input dynamically
const testInput = {{TEST_INPUT}};

async function runTest() {
  try {
    let promises = [];

    // Handle different input formats
    if (testInput === "[]" || (Array.isArray(testInput) && testInput.length === 0)) {
      promises = [];
    } else if (typeof testInput === 'string') {
      // Parse string representation
      promises = eval(testInput);
    } else if (Array.isArray(testInput)) {
      promises = testInput;
    }

    const result = await solution(promises);
    console.log(JSON.stringify(result));
  } catch (error) {
    console.error(error.message);
  }
}

runTest();
```

## Test Cases Format in Database

### Test Case 1:
- **Input**: `[]`
- **Expected Output**: `[]`

### Test Case 2:
- **Input**: `[Promise.resolve(1), Promise.resolve(2)]`
- **Expected Output**: `[1,2]`

### Test Case 3:
- **Input**: `[Promise.resolve("hello"), Promise.resolve("world")]`
- **Expected Output**: `["hello","world"]`

## The Core Issue

The error occurs because:
1. The default template tries to do `const testInput = {{TEST_INPUT}}`
2. When `{{TEST_INPUT}}` is replaced with `[]`, it becomes `const testInput = []` ✅ (This works)
3. When `{{TEST_INPUT}}` is replaced with the raw string `[]`, it tries to parse it as JSON ❌ (This fails)
4. Promise objects with `.then()` methods cannot be JSON serialized

## Recommendation

For Promise-based tasks, **do NOT use JSON.parse** on test inputs. Instead:
1. Use `eval()` for promise literals (less safe but works for controlled input)
2. OR hardcode test cases in the wrapper
3. OR create promises dynamically in the wrapper based on simple data

### Example of Dynamic Promise Creation:

```javascript
{{USER_CODE}}

const testInput = {{TEST_INPUT}};

async function runTest() {
  // Convert test input to actual promises
  const promises = testInput.map(val => {
    if (typeof val === 'object' && val.value !== undefined) {
      // Input format: [{ value: 1, delay: 10 }, { value: 2, delay: 5 }]
      return new Promise(resolve =>
        setTimeout(() => resolve(val.value), val.delay || 0)
      );
    }
    // Simple value
    return Promise.resolve(val);
  });

  const result = await solution(promises);
  console.log(JSON.stringify(result));
}

runTest();
```

With this approach, test cases would be:
- Input: `[{"value": 1}, {"value": 2}]` → Expected: `[1,2]`
- Input: `[]` → Expected: `[]`
