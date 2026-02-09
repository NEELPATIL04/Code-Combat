# Live Monitor Setup and Testing Guide

## What Was Fixed

The Monitor tab wasn't accessible in the Contest Details page. I've now:

1. ✅ Added Monitor component import to Contest Details page
2. ✅ Added "Live Monitor" tab to the tab navigation
3. ✅ Added proper state management for monitor tab
4. ✅ Added console logging for debugging
5. ✅ Fixed structural issues in Monitor.tsx

## How to Access Live Monitor

### Step 1: Navigate to Contest Details
1. Go to Admin Panel → Contests
2. Click on any active contest
3. You'll see four tabs at the top:
   - **Overview** (default)
   - **Settings**
   - **Activity Logs**
   - **Live Monitor** ← New tab

### Step 2: Click on Live Monitor Tab
Click the "Live Monitor" tab with the eye icon to see active participants.

### Step 3: Click on a Participant's Camera Feed
When participants are connected and streaming:
- You'll see their camera feeds in a grid layout
- Hover over any feed - it will scale up and show a "Click to expand" message
- **Click on the feed** - this will open the split-screen modal

### Step 4: View Split-Screen Modal
When a feed is clicked, a modal will open showing:
- **Left side (50%)**: Camera + Microphone feed
  - Live video from participant's camera
  - Mute/Unmute button for audio monitoring
  - Audio status indicator
- **Right side (50%)**: Screen share feed
  - Full screen capture display

### Step 5: Monitor Controls
In the modal header you'll find:
- Connection status indicator (green = connected)
- Mute/Unmute button
- Close button (X)

### Step 6: Close the Modal
You can close the detailed view by:
- Clicking the **X** button in the top right
- Clicking outside the modal (backdrop)
- Pressing the **ESC** key

## Activity Logging

All monitoring actions are automatically logged:
- `MONITOR_PARTICIPANT_OPENED` - When modal opens
- `MONITOR_PARTICIPANT_CLOSED` - When modal closes
- `MONITOR_AUDIO_MUTED` - When admin mutes audio
- `MONITOR_AUDIO_UNMUTED` - When admin unmutes audio

View these in the **Activity Logs** tab.

## Browser Console Debugging

Open DevTools (F12) and check the Console tab. You should see:
- `🖱️ Clicked on user: [user_id]` - When clicking a feed
- `✅ Participant selected: {...}` - When selection is processed
- `🔍 Monitor - Selected participant changed: {...}` - When modal state updates

## Common Issues & Solutions

### Issue: No participants appearing in Live Monitor
**Solution:** 
- Ensure participants have joined the contest and enabled camera/screen share
- Check that the backend is properly emitting `active-participants` and `participant-joined` events

### Issue: Click not opening modal
**Solution:**
- Check browser console for JavaScript errors (F12)
- Verify you see the "Click to expand" indicator on hover
- Try clicking in the center of the feed card

### Issue: Modal appears but no video feeds
**Solution:**
- Check that WebRTC connection is established (green indicator in modal header)
- Verify participants have camera/screen share enabled
- Check backend logs for signaling issues

## File Structure

Key files involved:
- `frontend/src/pages/Admin/Contests/Details/index.tsx` - Main contest details page
- `frontend/src/pages/Admin/Contests/Details/Monitor.tsx` - Monitor grid component
- `frontend/src/components/VideoFeed.tsx` - Individual participant feed
- `frontend/src/components/VideoFeedModal.tsx` - Split-screen detail view
- `backend/src/controllers/activityLogs.controller.ts` - Activity logging

## Testing Checklist

- [ ] Monitor tab appears in Contest Details
- [ ] Live participants show in grid
- [ ] Hovering scales up feed and shows "Click to expand"
- [ ] Clicking opens split-screen modal
- [ ] Left side shows camera feed
- [ ] Right side shows screen share
- [ ] Mute button works (if audio available)
- [ ] Close button closes modal
- [ ] ESC key closes modal
- [ ] Click outside modal closes it
- [ ] Activities logged in Activity Logs tab

