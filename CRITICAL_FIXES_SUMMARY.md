# Critical Fixes Summary - Contest Settings & Activity Logs

## Issues Fixed

### 1. **AI Hints Not Appearing** ✅ FIXED
**Problem**: AI hints weren't showing up even after 2 submissions due to conflicting configuration sources.

**Root Cause**:
- AI hints were using `task.aiConfig` (from tasks table)
- Should be using `contestSettings` (from contest_settings table)
- Two different configuration sources were conflicting

**Solution**:
- ✅ Updated [ai.controller.ts](backend/src/controllers/ai.controller.ts) to use `contestSettings` instead of `task.aiConfig`
- ✅ Updated frontend [Task.tsx:1683-1687](frontend/src/pages/Participant/Task.tsx#L1683-L1687) to pass contest settings to editor
- ✅ Now respects:
  - `aiHintsEnabled` - Enable/disable AI hints
  - `maxHintsAllowed` - Maximum hints per task (default: 3)
  - `hintUnlockAfterSubmissions` - Required submissions before hints unlock (default: 0)

**How It Works Now**:
1. User submits code
2. Backend checks `contest_settings.hintUnlockAfterSubmissions`
3. If user has enough submissions, hint button becomes enabled
4. Backend also checks `maxHintsAllowed` limit
5. Hints are tracked in `user_task_progress` table

---

### 2. **Duplicate Settings Removed** ✅ FIXED
**Problem**: Settings existed in TWO places causing conflicts:
- `contests.fullScreenMode` vs `contest_settings.fullScreenModeEnabled`
- `tasks.aiConfig` vs `contest_settings` AI fields

**Solution**:
- ✅ **Consolidated to use ONLY `contest_settings` table**
- ✅ Updated [contest.controller.ts:814-828](backend/src/controllers/contest.controller.ts#L814-L828) to prioritize `contest_settings`
- ✅ Updated AI controller to use only `contest_settings`

**Settings Now Controlled from Contest Settings ONLY**:
| Setting | Source (ONLY) |
|---------|---------------|
| Full Screen Mode | `contest_settings.fullScreenModeEnabled` |
| AI Hints Enabled | `contest_settings.aiHintsEnabled` |
| Max Hints Allowed | `contest_settings.maxHintsAllowed` |
| Hint Unlock Threshold | `contest_settings.hintUnlockAfterSubmissions` |
| Activity Logs | `contest_settings.enableActivityLogs` |

**Legacy Fields** (kept for backwards compatibility but IGNORED):
- `contests.fullScreenMode` - Falls back to this only if no contest_settings exist
- `tasks.aiConfig` - No longer used

---

### 3. **Activity Logs Not Recording** ✅ FIXED
**Problem**: Activity logs weren't being created for:
- ❌ Task submissions
- ❌ Fullscreen exits
- ❌ Tab switching

**Root Cause**:
- Frontend was checking `enableActivityLogs` before sending
- If disabled, logs weren't even attempted

**Solution**:
- ✅ **Frontend always sends logs** - [Task.tsx:929-940](frontend/src/pages/Participant/Task.tsx#L929-L940)
- ✅ **Backend decides** whether to save based on `contest_settings.enableActivityLogs`
- ✅ **Added submission logging** - [Task.tsx:1506-1514](frontend/src/pages/Participant/Task.tsx#L1506-L1514)
- ✅ **Added console logging** to debug activity tracking

**Activity Types Now Logged**:
```javascript
// Fullscreen events
logUserActivity('exit_fullscreen', { timestamp })
logUserActivity('enter_fullscreen', { timestamp })

// Tab switching
logUserActivity('tab_switch', { timestamp })
logUserActivity('tab_focus', { timestamp })

// Task submissions
logUserActivity('task_submitted', {
  taskId,
  taskTitle,
  language,
  timestamp
})
```

**How to Enable**:
1. Go to Admin Panel → Contests → [Contest] → Settings
2. Enable "Activity Logs"
3. Save settings
4. All user activities will now be logged

---

## Testing Instructions

### Test 1: AI Hints
1. ✅ Create/Edit contest
2. ✅ Go to Contest Settings
3. ✅ Set `Hint Unlock After Submissions` to `2`
4. ✅ Set `Max Hints Allowed` to `3`
5. ✅ Enable `AI Hints`
6. ✅ Save settings
7. ✅ User starts contest
8. ✅ Submit code 2 times
9. ✅ **"Get Hint" button should appear** after 2nd submission
10. ✅ Click "Get Hint" - should work
11. ✅ Use hint 3 times total
12. ✅ 4th hint request should show: "You have reached the maximum of 3 hints"

**Console Output (Frontend)**:
```
✅ Tasks fetched from backend: 3
📋 First task boilerplate code: {...}
🎯 Loading boilerplate for javascript: 250 chars
```

**Expected Behavior**:
- Hint button appears ONLY after required submissions
- Hints limited to maxHintsAllowed
- Clear error messages when limits reached

---

### Test 2: Activity Logs
1. ✅ Go to Contest Settings
2. ✅ Enable "Activity Logs"
3. ✅ Save settings
4. ✅ User starts contest
5. ✅ Submit a task
6. ✅ Switch tabs (Alt+Tab or click another window)
7. ✅ Exit fullscreen (ESC key)
8. ✅ Go to Admin → Contest → Activity Logs
9. ✅ **Should see all activities logged**

**Console Output (Frontend)**:
```
📊 Logging activity: task_submitted { taskId: 123, taskTitle: "...", ... }
✅ Activity logged successfully

📊 Logging activity: tab_switch { timestamp: "..." }
✅ Activity logged successfully

📊 Logging activity: exit_fullscreen { timestamp: "..." }
✅ Activity logged successfully
```

**If Logs Don't Appear**:
- Check browser console for errors
- Verify `enableActivityLogs` is `true` in contest_settings table
- Check backend logs for any errors

---

### Test 3: Fullscreen Mode
1. ✅ Go to Contest Settings (NOT Edit Contest!)
2. ✅ Enable "Full Screen Mode"
3. ✅ Save settings
4. ✅ User starts contest
5. ✅ **Browser should enter fullscreen automatically**
6. ✅ Try to exit fullscreen (ESC)
7. ✅ **Should show lockout screen** (if enabled)

**Note**:
- Fullscreen is controlled from **Contest Settings ONLY**
- "Edit Contest" fullscreen field is ignored
- This prevents conflicts

---

## Database Changes

### Updated Tables:

#### `contest_settings` (Source of Truth)
```sql
-- These fields control everything:
ai_hints_enabled BOOLEAN DEFAULT true
max_hints_allowed INTEGER DEFAULT 3
hint_unlock_after_submissions INTEGER DEFAULT 0
full_screen_mode_enabled BOOLEAN DEFAULT true
enable_activity_logs BOOLEAN DEFAULT false
```

#### `user_task_progress` (Tracks Hint Usage)
```sql
hints_unlocked INTEGER DEFAULT 0  -- Increments each time hint is used
solution_unlocked BOOLEAN DEFAULT false
```

#### `activity_logs` (Stores User Activities)
```sql
activity_type VARCHAR(50)  -- 'task_submitted', 'tab_switch', 'exit_fullscreen', etc.
activity_data JSONB  -- Additional data
severity VARCHAR(20)  -- 'normal', 'warning', 'alert'
timestamp TIMESTAMP
```

---

## Code Changes Summary

### Backend Files Modified:
1. ✅ [ai.controller.ts](backend/src/controllers/ai.controller.ts)
   - Changed to use `contest_settings` instead of `task.aiConfig`
   - Added hint limit checking
   - Added submission threshold checking

2. ✅ [contest.controller.ts](backend/src/controllers/contest.controller.ts)
   - Added `contestSettings` import
   - Updated `getContestTasks` to return fullscreen from settings
   - Prioritizes `contest_settings` over legacy fields

### Frontend Files Modified:
1. ✅ [Task.tsx](frontend/src/pages/Participant/Task.tsx)
   - Lines 929-940: Updated activity logging to always send
   - Lines 1506-1514: Added submission activity logging
   - Lines 1683-1687: Changed to use contest settings for AI config
   - Added comprehensive console logging for debugging

---

## Configuration Priority (How It Works)

### AI Hints Configuration:
```
contest_settings.aiHintsEnabled (PRIMARY)
  └─ If enabled:
      ├─ contest_settings.maxHintsAllowed → Limit per task
      ├─ contest_settings.hintUnlockAfterSubmissions → Required submissions
      └─ user_task_progress.hintsUnlocked → Track usage

IGNORED: task.aiConfig (legacy field)
```

### Fullscreen Configuration:
```
contest_settings.fullScreenModeEnabled (PRIMARY)
  └─ Fallback: contests.fullScreenMode (only if no settings exist)

IGNORED: contests.fullScreenMode when settings exist
```

### Activity Logs:
```
Frontend: ALWAYS sends activity
  ↓
Backend: contest_settings.enableActivityLogs
  ├─ If true → Save to activity_logs table
  └─ If false → Return success but don't save
```

---

## Common Issues & Solutions

### Issue: "Hints still not appearing after 2 submissions"
**Solution**:
1. Check browser console - look for error messages
2. Verify contest has `contest_settings` record:
   ```sql
   SELECT * FROM contest_settings WHERE contest_id = YOUR_CONTEST_ID;
   ```
3. Check `hint_unlock_after_submissions` value
4. Verify user's submission count:
   ```sql
   SELECT COUNT(*) FROM submissions
   WHERE task_id = YOUR_TASK_ID AND user_id = YOUR_USER_ID;
   ```

### Issue: "Activity logs not showing in admin panel"
**Solution**:
1. Ensure `enable_activity_logs = true` in contest_settings
2. Check browser console for "Activity logged successfully"
3. Query database directly:
   ```sql
   SELECT * FROM activity_logs
   WHERE contest_id = YOUR_CONTEST_ID
   ORDER BY timestamp DESC;
   ```
4. Check backend logs for any errors

### Issue: "Fullscreen not working"
**Solution**:
1. Use **Contest Settings** (not Edit Contest)
2. Enable "Full Screen Mode Enabled"
3. Clear browser cache
4. Try in incognito mode
5. Check browser permissions for fullscreen API

---

## Migration Notes

### For Existing Contests:
1. **Old contests without contest_settings**:
   - Will fall back to `contests.fullScreenMode`
   - AI hints will be enabled by default
   - Activity logs disabled by default

2. **To update old contests**:
   - Go to Admin → Contests → [Contest] → Settings
   - Configure all settings
   - Save
   - Settings will be created and take priority

### For Database:
- No migration needed
- `contest_settings` table already exists
- Old fields kept for backwards compatibility
- New logic prioritizes `contest_settings`

---

## Summary

✅ **AI Hints**: Now work correctly from Contest Settings
✅ **Duplicate Settings**: Removed - only Contest Settings used
✅ **Activity Logs**: Fixed - all events now logged properly
✅ **Fullscreen Mode**: Consolidated to Contest Settings only
✅ **Debugging**: Added extensive console logging

**All settings are now controlled from Contest Settings ONLY!**

No more conflicts between Edit Contest and Contest Settings. Everything works from a single source of truth.
