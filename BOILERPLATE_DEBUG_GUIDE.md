# Boilerplate Code Loading - Debug Guide

## Problem
When admin edits boilerplate code or wrapper code in the backend, changes don't reflect on the user side - old "Two Sum" boilerplate still appears.

## Root Causes & Solutions

### 1. **Browser Cache / LocalStorage**
**Problem**: Old boilerplate code is cached in browser's localStorage
**Solution**: Clear localStorage or use hard refresh

#### How to Fix:
```javascript
// Open browser console (F12) and run:
localStorage.clear();
// Then reload the page
```

OR use **Hard Refresh**:
- **Windows/Linux**: `Ctrl + Shift + R` or `Ctrl + F5`
- **Mac**: `Cmd + Shift + R`

### 2. **Database Not Updated**
**Problem**: Backend database still contains old boilerplate code
**Solution**: Verify and update contest/task in admin panel

#### Steps to Verify:
1. Go to Admin Panel → Contests
2. Edit the contest
3. Check each task's boilerplate code
4. Make sure the correct boilerplate is saved
5. Click "Update Contest"

### 3. **Code Flow & Debugging**

The boilerplate code flows through these steps:

```
Database (contest_tasks table)
    ↓
Backend API (/api/contests/:id/tasks)
    ↓
Frontend Task.tsx (useEffect fetch)
    ↓
State (task.boilerplateCode)
    ↓
Monaco Editor (displayed to user)
```

## Enhanced Debugging (Added in Latest Update)

The code now includes comprehensive console logging. Open browser DevTools (F12) → Console tab to see:

### On Page Load:
```
✅ Tasks fetched from backend: 3
📋 First task boilerplate code: { javascript: "...", python: "...", ... }
🔧 First task wrapper/testRunner: { javascript: "...", python: "...", ... }
```

### On Task Initialization:
```
🔄 Initializing code for task: 123
📦 Available boilerplate languages: ["javascript", "python", "java"]
💾 Saved code exists: false
🎯 Loading boilerplate for javascript: 250 chars
📄 Boilerplate preview: function solution() {\n  // Your code here\n}
```

### On Language Switch:
```
🔄 Switching language to python
🎯 Loading boilerplate: 180 chars
📄 Boilerplate preview: def solution():\n    # Your code here\n    pass
```

### On Task Switch:
```
🔀 Switching to task: 124 "Array Problems"
📦 Boilerplate available: ["javascript", "python"]
🎯 Loading boilerplate for javascript: 300 chars
📄 Boilerplate preview: function arraySum(arr) {\n  // Your code here\n}
```

## How to Test the Fix

### Step 1: Clear Cache
```javascript
// In browser console (F12):
localStorage.clear();
sessionStorage.clear();
location.reload();
```

### Step 2: Check Console Logs
1. Open DevTools (F12) → Console
2. Start a contest
3. Look for the logs mentioned above
4. Verify that `📋 First task boilerplate code:` shows YOUR updated code, not "Two Sum"

### Step 3: Check Network Request
1. Open DevTools (F12) → Network tab
2. Refresh the page
3. Find the request to `/api/contests/{id}/tasks`
4. Click on it → Response tab
5. Check the `boilerplateCode` field in the JSON response
6. It should contain YOUR code, not hardcoded "Two Sum"

## If Problem Persists

### Check 1: Database Content
```sql
-- Run this query in your database:
SELECT id, title, boilerplate_code, test_runner_template
FROM tasks
WHERE contest_id = YOUR_CONTEST_ID;
```

The `boilerplate_code` column should show your custom code as JSON.

### Check 2: Verify Backend Returns Correct Data
Test the API endpoint directly:

```bash
# Replace {contest_id} and {your_token} with actual values
curl -H "Authorization: Bearer {your_token}" \
     http://localhost:5000/api/contests/{contest_id}/tasks
```

Check the response - `boilerplateCode` should have your code.

### Check 3: Frontend Is Using Backend Data
Look at the console logs. If you see:
```
📋 First task boilerplate code: null
```
OR
```
📋 First task boilerplate code: undefined
```

Then the backend is not returning boilerplate code. Check your task creation/update code in admin panel.

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| **Old code appears even after admin update** | Clear localStorage + hard refresh |
| **Boilerplate is null/undefined** | Re-save the task in admin panel with boilerplate code |
| **Changes work for new contests but not existing ones** | Update existing contests in admin panel |
| **Different languages show same code** | Ensure boilerplate_code JSON has all languages: `{"javascript": "...", "python": "..."}` |
| **Code resets to old version** | Disable browser cache or use incognito mode for testing |

## What Changed in the Fix

### Before (WRONG):
```javascript
// Hard preference for cached code
if (savedCode) {
    setCode(savedCode); // ❌ Always uses old cache
}
```

### After (CORRECT):
```javascript
// Prefer fresh backend boilerplate
const boiler = task.boilerplateCode?.[language] || '';

if (savedCode && savedCode !== boiler) {
    // Only use cache if user modified it
    setCode(savedCode);
} else {
    // Use fresh boilerplate from backend ✅
    setCode(boiler);
    localStorage.setItem('...', boiler); // Update cache
}
```

## Testing Checklist

- [ ] Clear browser cache and localStorage
- [ ] Hard refresh the page (Ctrl+Shift+R)
- [ ] Check console logs show correct boilerplate
- [ ] Verify Network response contains correct data
- [ ] Test language switching loads correct boilerplate
- [ ] Test task switching loads correct boilerplate
- [ ] Verify wrapper/test runner code is also loaded correctly

## Need More Help?

If the issue persists after following this guide:

1. **Check the console logs** - They will tell you exactly where the problem is
2. **Check the Network tab** - Verify backend is sending correct data
3. **Check the Database** - Verify data is saved correctly
4. **Try Incognito Mode** - Rules out browser extensions/cache issues

The enhanced logging will pinpoint exactly where the boilerplate code is lost or replaced with old data.
