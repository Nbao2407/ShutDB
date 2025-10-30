# Manual Testing Guide - Service Database Dashboard

## Prerequisites

Before starting the tests, ensure:
- [ ] Application is built (`wails build` completed successfully)
- [ ] You have PostgreSQL and/or MongoDB installed on your system
- [ ] You know the service names (check Windows Services: `services.msc`)
- [ ] You have both admin and non-admin test scenarios ready

## Test Environment Setup

1. **Identify your database services:**
   - Open Windows Services (`Win + R` → `services.msc`)
   - Note the exact service names for PostgreSQL (e.g., "postgresql-x64-14")
   - Note the exact service names for MongoDB (e.g., "MongoDB")

2. **Prepare test scenarios:**
   - Have at least one service in STOPPED state
   - Have at least one service in RUNNING state

---

## Test Case 1: Service Detection with PostgreSQL and MongoDB

**Requirements:** 1.1, 1.4, 1.5, 7.4, 7.5

### Steps:
1. Launch `service-db-dashboard.exe` as Administrator
2. Wait for the application to load

### Expected Results:
- [ ] Application window opens (800x600 default size)
- [ ] All PostgreSQL services are detected and displayed
- [ ] All MongoDB services are detected and displayed
- [ ] Each service shows: Name, Display Name, and Status
- [ ] Status is color-coded (green=running, red=stopped)
- [ ] Services appear within 2 seconds of launch

### Notes:
_Record any issues or observations here_

---

## Test Case 2: Start Operation on Stopped Service

**Requirements:** 2.1, 2.2, 2.3, 2.4, 2.5

### Steps:
1. Identify a service with "stopped" status (red indicator)
2. Click the "Start" button for that service
3. Observe the UI changes

### Expected Results:
- [ ] Start button becomes disabled immediately
- [ ] Loading indicator appears on the service row
- [ ] Status changes to "starting" (yellow indicator)
- [ ] Within 30 seconds, status changes to "running" (green indicator)
- [ ] Start button remains disabled when running
- [ ] Stop and Restart buttons become enabled
- [ ] No error messages appear
- [ ] Visual feedback appears within 200ms of clicking

### Error Case:
If the operation fails:
- [ ] Error message is displayed with failure reason
- [ ] Service status reflects actual state
- [ ] Buttons return to appropriate enabled/disabled state

### Notes:
_Record any issues or observations here_

---

## Test Case 3: Stop Operation on Running Service

**Requirements:** 3.1, 3.2, 3.3, 3.4, 3.5

### Steps:
1. Identify a service with "running" status (green indicator)
2. Click the "Stop" button for that service
3. Observe the UI changes

### Expected Results:
- [ ] Stop button becomes disabled immediately
- [ ] Loading indicator appears on the service row
- [ ] Status changes to "stopping" (yellow indicator)
- [ ] Within 30 seconds, status changes to "stopped" (red indicator)
- [ ] Stop button remains disabled when stopped
- [ ] Start button becomes enabled
- [ ] No error messages appear
- [ ] Visual feedback appears within 200ms of clicking

### Error Case:
If the operation fails:
- [ ] Error message is displayed with failure reason
- [ ] Service status reflects actual state
- [ ] Buttons return to appropriate enabled/disabled state

### Notes:
_Record any issues or observations here_

---

## Test Case 4: Restart Operation

**Requirements:** 4.1, 4.2, 4.3, 4.4, 4.5

### Steps:
1. Identify any service (running or stopped)
2. Click the "Restart" button for that service
3. Observe the UI changes

### Expected Results:
- [ ] All buttons (Start, Stop, Restart) become disabled immediately
- [ ] Loading indicator appears on the service row
- [ ] Status changes to "restarting" (yellow indicator)
- [ ] Within 60 seconds, status changes to "running" (green indicator)
- [ ] Buttons return to appropriate enabled/disabled state
- [ ] No error messages appear
- [ ] Visual feedback appears within 200ms of clicking

### Error Case:
If the operation fails:
- [ ] Error message is displayed with failure reason
- [ ] Service status reflects actual state
- [ ] Buttons return to appropriate enabled/disabled state

### Notes:
_Record any issues or observations here_

---

## Test Case 5: Status Updates Within 2 Seconds

**Requirements:** 1.3, 5.2, 5.5

### Steps:
1. With the application running, open Windows Services (`services.msc`)
2. Manually change a service state from Windows Services
3. Observe the dashboard application

### Expected Results:
- [ ] Dashboard detects the status change within 5 seconds (polling interval)
- [ ] Status indicator updates to reflect new state
- [ ] Color coding updates correctly
- [ ] Button states update appropriately

### Additional Test:
1. Perform a Start/Stop operation from the dashboard
2. Time how long it takes for the status to update after operation completes

### Expected Results:
- [ ] Status updates within 2 seconds of operation completion
- [ ] No manual refresh needed

### Notes:
_Record any issues or observations here_

---

## Test Case 6: Error Handling Without Administrator Privileges

**Requirements:** 7.2, 7.3

### Steps:
1. Close the application if running
2. Launch `service-db-dashboard.exe` as a **regular user** (not Administrator)
3. Try to start or stop a service

### Expected Results:
- [ ] Application launches successfully
- [ ] Services are detected and displayed
- [ ] When attempting to start/stop a service, an error message appears
- [ ] Error message clearly indicates permission issue
- [ ] Error message suggests running as Administrator
- [ ] Application does not crash
- [ ] User can dismiss the error message
- [ ] Application remains functional after error

### Notes:
_Record any issues or observations here_

---

## Test Case 7: No Database Services Installed

**Requirements:** 1.1, 1.2, 6.4

### Steps:
1. If possible, temporarily stop and disable all PostgreSQL and MongoDB services
2. OR test on a machine without these services installed
3. Launch the application

### Expected Results:
- [ ] Application launches successfully
- [ ] Empty state message is displayed (e.g., "No database services detected")
- [ ] No error messages appear
- [ ] Application remains responsive
- [ ] UI is clean and not broken

### Notes:
_Record any issues or observations here_

---

## Performance Tests

### Memory Usage Test

**Requirements:** 5.1, 5.2, 5.5

### Steps:
1. Launch the application
2. Open Task Manager (Ctrl + Shift + Esc)
3. Find "service-db-dashboard.exe" in the Processes tab
4. Monitor RAM usage

### Expected Results:
- [ ] Idle RAM usage is under 50MB
- [ ] RAM usage remains stable during polling (5-second intervals)
- [ ] RAM usage doesn't increase significantly after multiple operations
- [ ] When window is minimized, RAM usage stays minimal

### Notes:
_Record actual RAM usage: _____ MB_

---

## UI/UX Tests

### Visual Feedback Test

**Requirements:** 6.5

### Steps:
1. Click various buttons in the application
2. Observe response time

### Expected Results:
- [ ] Visual feedback (button state change, loading indicator) appears within 200ms
- [ ] UI feels responsive
- [ ] No lag or freezing

### Window Behavior Test

**Requirements:** 5.3, 5.4, 6.1

### Steps:
1. Resize the application window
2. Minimize and restore the window
3. Check scrolling if many services are present

### Expected Results:
- [ ] Window can be resized (minimum 600x400)
- [ ] UI adapts to window size appropriately
- [ ] Service list is scrollable if needed
- [ ] Minimize/restore works correctly
- [ ] Polling continues when minimized

### Notes:
_Record any issues or observations here_

---

## Summary Checklist

After completing all tests, verify:
- [ ] All core functionality works as expected
- [ ] Error handling is appropriate and user-friendly
- [ ] Performance meets requirements (<50MB RAM)
- [ ] UI is responsive and intuitive
- [ ] No crashes or unexpected behavior observed

## Issues Found

List any bugs, issues, or unexpected behavior discovered during testing:

1. 
2. 
3. 

## Overall Assessment

**Pass / Fail / Partial Pass**

_Provide overall assessment and any recommendations_

---

## Test Execution Information

- **Tester Name:** _______________
- **Test Date:** _______________
- **Application Version:** 1.0.0
- **OS Version:** Windows _____
- **PostgreSQL Version (if installed):** _______________
- **MongoDB Version (if installed):** _______________
