# 🚀 Quick Start Guide - Boilerplate & AI Test Generation

## ✅ What's Already Done (Backend 100% Complete)

### 1. **Database Schema** ✓
- Added `functionName`, `boilerplateCode`, `testRunnerTemplate` to tasks table
- Schema pushed to database successfully

### 2. **Code Wrapping System** ✓
- Automatically wraps user code with test runner
- Supports JavaScript, TypeScript, Python, Java, C++
- Location: `backend/src/utils/codeWrapper.util.ts`

### 3. **Groq AI Integration** ✓
- Service created: `backend/src/services/groq.service.ts`
- API Key configured: `(See .env)`
- Endpoints ready:
  - `POST /api/ai/generate-test-cases`
  - `POST /api/ai/validate-test-case`

### 4. **Judge0 Integration Updated** ✓
- Now wraps code before execution
- Automatically calls functions with test inputs
- Compares outputs

---

## 📦 New Frontend Component Created

**TestCaseManager Component**
- Location: `frontend/src/components/TestCaseManager/index.tsx`
- Features:
  - ✅ Add/remove test cases
  - ✅ Lock/unlock (hide/show) toggle
  - ✅ "Generate with AI" button
  - ✅ Beautiful UI matching your design

---

## 🔧 How to Integrate (Simple 3-Step Process)

### Step 1: Update Task Interface

In `frontend/src/pages/Admin/Contests/index.tsx`, find the `Task` interface and update it:

```typescript
interface Task {
    title: string;
    description: string;
    descriptionType: 'text' | 'html';
    difficulty: string;
    maxPoints: number;
    allowedLanguages: string[];
    // ADD THESE:
    functionName: string;
    boilerplateCode: string;
    wrapperCode: string;
    testCases: Array<{
        input: string;
        expectedOutput: string;
        isHidden: boolean;
    }>;
}
```

### Step 2: Import the Component

At the top of the file, add:

```typescript
import TestCaseManager from '../../../components/TestCaseManager';
```

### Step 3: Add Fields to Task Form

In the task creation form (Step 2), add these fields AFTER the "Allowed Languages" section:

```tsx
{/* Function Name */}
<div style={{ marginBottom: '16px' }}>
    <label style={{ display: 'block', marginBottom: '8px', color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.85rem', fontWeight: 500 }}>
        Function Name *
    </label>
    <input
        type="text"
        value={taskInput.functionName || ''}
        onChange={(e) => setTaskInput(prev => ({ ...prev, functionName: e.target.value }))}
        placeholder="e.g., twoSum, reverseString, isPalindrome"
        style={{
            width: '100%',
            padding: '12px',
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1.5px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '10px',
            color: '#ffffff',
            fontSize: '0.95rem',
            outline: 'none'
        }}
    />
</div>

{/* Boilerplate Code */}
<div style={{ marginBottom: '16px' }}>
    <label style={{ display: 'block', marginBottom: '8px', color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.85rem', fontWeight: 500 }}>
        Boilerplate Code (Optional - Leave empty to use default)
    </label>
    <textarea
        value={taskInput.boilerplateCode || ''}
        onChange={(e) => setTaskInput(prev => ({ ...prev, boilerplateCode: e.target.value }))}
        placeholder="function twoSum(nums, target) {\n    // Write your code here\n    return [];\n}"
        rows={6}
        style={{
            width: '100%',
            padding: '12px',
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1.5px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '10px',
            color: '#ffffff',
            fontSize: '0.9rem',
            fontFamily: 'JetBrains Mono, monospace',
            outline: 'none',
            resize: 'vertical'
        }}
    />
</div>

{/* Wrapper Code */}
<div style={{ marginBottom: '16px' }}>
    <label style={{ display: 'block', marginBottom: '8px', color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.85rem', fontWeight: 500 }}>
        Wrapper Code (Optional - Leave empty to use default)
    </label>
    <textarea
        value={taskInput.wrapperCode || ''}
        onChange={(e) => setTaskInput(prev => ({ ...prev, wrapperCode: e.target.value }))}
        placeholder="{{USER_CODE}}\n\nconst result = {{FUNCTION_NAME}}({{TEST_INPUT}});\nconsole.log(JSON.stringify(result));"
        rows={5}
        style={{
            width: '100%',
            padding: '12px',
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1.5px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '10px',
            color: '#ffffff',
            fontSize: '0.9rem',
            fontFamily: 'JetBrains Mono, monospace',
            outline: 'none',
            resize: 'vertical'
        }}
    />
    <p style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.5)', marginTop: '6px' }}>
        Available placeholders: {'{{'} USER_CODE {'}}'},  {'{{'} FUNCTION_NAME {'}}'},  {'{{'} FUNCTION_CALL {'}}'},  {'{{'} TEST_INPUT {'}}'}
    </p>
</div>

{/* Test Cases Manager */}
<TestCaseManager
    testCases={taskInput.testCases || []}
    onChange={(testCases) => setTaskInput(prev => ({ ...prev, testCases }))}
    onGenerateWithAI={async () => {
        if (!taskInput.functionName) {
            alert('Please enter a function name first!');
            return;
        }

        try {
            const response = await fetch('/api/ai/generate-test-cases', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    description: taskInput.description,
                    boilerplateCode: taskInput.boilerplateCode || '',
                    wrapperCode: taskInput.wrapperCode || '',
                    functionName: taskInput.functionName,
                    language: taskInput.allowedLanguages[0] || 'javascript',
                    numberOfTestCases: 5
                })
            });

            const data = await response.json();

            if (data.success && data.testCases) {
                setTaskInput(prev => ({
                    ...prev,
                    testCases: data.testCases.map((tc: any) => ({
                        input: tc.input,
                        expectedOutput: tc.expectedOutput,
                        isHidden: false
                    }))
                }));
                alert(`✅ Generated ${data.testCases.length} test cases!`);
            } else {
                alert('Failed: ' + data.message);
            }
        } catch (error) {
            console.error(error);
            alert('Error generating test cases');
        }
    }}
/>
```

### Step 4: Initialize the Fields

In the `taskInput` state initialization, add:

```typescript
const [taskInput, setTaskInput] = useState<Task>({
    // ... existing fields
    functionName: '',
    boilerplateCode: '',
    wrapperCode: '',
    testCases: [],
});
```

Also update the `closeModal` and other reset functions to reset these fields!

---

## 🧪 How to Test

### 1. Start Backend
```bash
cd backend
npm run dev
```

### 2. Start Frontend
```bash
cd frontend
npm run dev
```

### 3. Create a Task
1. Go to Admin → Contests
2. Create/Edit a contest
3. Add a task
4. Fill in:
   - **Function Name**: `twoSum`
   - **Description**: "Given an array of integers nums and an integer target, return indices of the two numbers that add up to target."
   - Leave boilerplate/wrapper empty (uses defaults)
5. Click **"Generate with AI"** ✨
6. Watch test cases appear automatically!
7. Toggle some to "Hidden"
8. Save task

### 4. Test Execution
1. As a user, start the contest
2. Write solution
3. Click "Run"
4. See results for visible test cases
5. See "Hidden test failed" for hidden ones

---

## 🎯 Example Task

**Function Name**: `twoSum`

**Description**:
```
Given an array of integers nums and an integer target,
return indices of the two numbers such that they add up to target.
```

**Test Cases** (auto-generated by AI):
1. Input: `nums = [2,7,11,15], target = 9` → Output: `[0,1]` (Visible)
2. Input: `nums = [3,2,4], target = 6` → Output: `[1,2]` (Visible)
3. Input: `nums = [3,3], target = 6` → Output: `[0,1]` (Hidden)
4. Input: `nums = [], target = 0` → Output: `[]` (Hidden)
5. Input: `nums = [1,2,3,4,5], target = 9` → Output: `[3,4]` (Hidden)

---

## 📚 API Reference

### Generate Test Cases
```bash
POST /api/ai/generate-test-cases
Authorization: Bearer <token>
Content-Type: application/json

{
  "description": "Problem description",
  "functionName": "twoSum",
  "boilerplateCode": "function twoSum(nums, target) {...}",
  "wrapperCode": "{{USER_CODE}}\nconsole.log(...)",
  "language": "javascript",
  "numberOfTestCases": 5
}

Response:
{
  "success": true,
  "testCases": [
    {
      "input": "nums = [2,7,11,15], target = 9",
      "expectedOutput": "[0,1]",
      "explanation": "nums[0] + nums[1] = 2 + 7 = 9"
    }
  ]
}
```

---

## 🎨 UI Preview

The TestCaseManager component looks like:

```
┌─────────────────────────────────────────────────┐
│ Test Cases (3)              [✨ Generate with AI]│
├─────────────────────────────────────────────────┤
│ ┌──────────────────────────────────────────┐   │
│ │ Test Case #1         [👁️ Visible] [🗑️]    │   │
│ │ Test Input:                               │   │
│ │ [nums = [2,7,11,15], target = 9        ] │   │
│ │ Expected Output:                          │   │
│ │ [[0,1]                                   ]│   │
│ └──────────────────────────────────────────┘   │
│                                                 │
│ ┌──────────────────────────────────────────┐   │
│ │ Test Case #2         [🔒 Hidden] [🗑️]      │   │
│ │ ...                                       │   │
│ └──────────────────────────────────────────┘   │
│                                                 │
│ [➕ Add Test Case                             ] │
└─────────────────────────────────────────────────┘
```

---

## ✨ Features

- ✅ **AI Generation** - Click button to generate 5 test cases
- ✅ **Lock/Unlock** - Hide test cases from users
- ✅ **Add/Remove** - Manually add or delete test cases
- ✅ **Auto Wrapping** - Backend wraps code automatically
- ✅ **Multi-Language** - Works with JS, Python, Java, C++, TypeScript

---

## 🐛 Troubleshooting

**Issue**: "Failed to generate test cases"
- Check Groq API key in `backend/.env`
- Check console for errors
- Verify backend is running

**Issue**: "Code execution fails"
- Verify function name matches boilerplate
- Check test input format
- Look at Judge0 logs

**Issue**: "Test cases not saving"
- Make sure to update the save logic to include new fields
- Check network tab for errors

---

## 🎉 You're Done!

Backend is **100% complete**. Just add the 3 fields to your admin UI and you're ready to:
1. Generate test cases with AI
2. Lock/unlock test cases
3. Run code with automatic wrapping

**Need help?** Check `IMPLEMENTATION_GUIDE.md` for detailed instructions!
