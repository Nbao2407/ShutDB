# Quick Test Checklist

Use this as a quick reference during manual testing.

## Pre-Test Setup
- [ ] Build completed: `service-db-dashboard.exe` exists
- [ ] Know your service names (check `services.msc`)
- [ ] Have admin and non-admin access ready

## Quick Test Run (15 minutes)

### 1. Basic Functionality (5 min)
- [ ] Launch app as Admin
- [ ] Services appear within 2 seconds
- [ ] Start a stopped service → becomes running
- [ ] Stop a running service → becomes stopped
- [ ] Restart any service → becomes running

### 2. Error Handling (3 min)
- [ ] Launch as regular user
- [ ] Try to start/stop → permission error shown
- [ ] Error message is clear and helpful

### 3. Performance (2 min)
- [ ] Check Task Manager: RAM < 50MB
- [ ] UI responds within 200ms to clicks
- [ ] No lag or freezing

### 4. Edge Cases (5 min)
- [ ] Manually change service in Windows Services
- [ ] Dashboard updates within 5 seconds
- [ ] Minimize/restore window works
- [ ] Window resizes properly

## Quick Pass/Fail Criteria

**PASS if:**
- All services detected correctly
- Start/Stop/Restart work
- RAM < 50MB
- Permission errors handled gracefully
- UI is responsive

**FAIL if:**
- Services not detected
- Operations don't work
- RAM > 50MB
- App crashes
- No permission error handling

## Common Issues to Watch For

1. **Services not appearing:** Check service name patterns in detector.go
2. **Permission errors:** Must run as Administrator for service control
3. **Slow updates:** Check polling interval (should be 5 seconds)
4. **High memory:** Check for memory leaks during polling
5. **UI freezing:** Operations should be async

## Quick Commands

**Check if app is running:**
```powershell
Get-Process service-db-dashboard -ErrorAction SilentlyContinue
```

**Check memory usage:**
```powershell
Get-Process service-db-dashboard | Select-Object Name, @{Name="Memory(MB)";Expression={[math]::Round($_.WS/1MB,2)}}
```

**List database services:**
```powershell
Get-Service | Where-Object {$_.Name -like "*postgres*" -or $_.Name -like "*mongo*"}
```

## Test Execution

**Run the app:**
```
.\service-db-dashboard.exe
```

**Run as Admin (from PowerShell):**
```powershell
Start-Process .\service-db-dashboard.exe -Verb RunAs
```

## Recording Results

Use `MANUAL_TEST_RESULTS.md` to record detailed findings.
