# Monitoring Activity Logs

## Overview
When admins monitor participants through the Live Monitor section, all monitoring actions are now automatically logged to the Activity Logs system for audit and review purposes.

## Activity Types Logged

### 1. **MONITOR_PARTICIPANT_OPENED**
**When:** Admin clicks on a user's camera feed in the monitor grid
**Data Logged:**
- `targetUserId`: The user ID being monitored
- `targetSocketId`: The socket ID of the user
- `timestamp`: When the detailed view was opened

**Purpose:** Track when admins open detailed monitoring views

---

### 2. **MONITOR_PARTICIPANT_CLOSED**
**When:** Admin closes the detailed monitoring modal (by clicking X, backdrop, or pressing ESC)
**Data Logged:**
- `targetUserId`: The user ID that was being monitored
- `targetSocketId`: The socket ID of the user
- `timestamp`: When the detailed view was closed

**Purpose:** Track session duration and monitoring patterns

---

### 3. **MONITOR_AUDIO_MUTED**
**When:** Admin clicks the "Mute" button in the detailed monitoring modal
**Data Logged:**
- `targetUserId`: The user whose audio is being muted
- `targetSocketId`: The socket ID of the user
- `timestamp`: When the audio was muted

**Purpose:** Monitor admin interventions and controls

---

### 4. **MONITOR_AUDIO_UNMUTED**
**When:** Admin clicks the "Unmute" button to re-enable audio
**Data Logged:**
- `targetUserId`: The user whose audio is being unmuted
- `targetSocketId`: The socket ID of the user
- `timestamp`: When the audio was unmuted

**Purpose:** Track admin audio monitoring controls

---

## Activity Log Display

All these activities appear in the **Activity Logs** section of the contest with:
- **Activity Type**: The action performed
- **User**: The admin performing the monitoring (from JWT token)
- **Target User**: The participant being monitored
- **Timestamp**: Exact time of the action
- **Details**: Full activity data in JSON format

## Example Activity Log Entry

```json
{
  "id": 12345,
  "contestId": 1,
  "userId": 42,
  "activityType": "MONITOR_PARTICIPANT_OPENED",
  "activityData": {
    "targetUserId": "user-123",
    "targetSocketId": "socket-xyz",
    "timestamp": "2026-02-09T15:30:45.123Z"
  },
  "severity": "normal",
  "createdAt": "2026-02-09T15:30:45.123Z"
}
```

## Use Cases

1. **Audit Trail**: Review which admins monitored which participants and when
2. **Investigation**: Check if specific participants were monitored during suspicious activities
3. **Analytics**: Understand monitoring patterns and frequency
4. **Compliance**: Maintain records of admin oversight actions

## Implementation Details

- **Non-blocking**: Activity logging happens asynchronously and doesn't block UI interactions
- **Error Handling**: If logging fails, errors are logged to console but don't interrupt monitoring
- **Real-time**: Activities are logged immediately when actions occur
- **Complete**: All monitoring interactions are captured automatically

