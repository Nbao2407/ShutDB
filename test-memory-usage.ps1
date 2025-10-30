# Memory Usage Test Script for Service Database Dashboard
# This script launches the application and monitors RAM usage

Write-Host "=== Service Database Dashboard - Memory Usage Test ===" -ForegroundColor Cyan
Write-Host ""

# Launch the application
Write-Host "Launching application..." -ForegroundColor Yellow
$app = Start-Process -FilePath ".\build\bin\service-db-dashboard.exe" -PassThru

# Wait for application to initialize
Write-Host "Waiting 5 seconds for application to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Monitor memory usage
Write-Host ""
Write-Host "=== Memory Usage Monitoring ===" -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop monitoring and close the application" -ForegroundColor Yellow
Write-Host ""

$measurements = @()
$startTime = Get-Date

try {
    for ($i = 0; $i -lt 60; $i++) {
        # Get current process info
        $process = Get-Process -Id $app.Id -ErrorAction SilentlyContinue
        
        if ($null -eq $process) {
            Write-Host "Application has closed." -ForegroundColor Red
            break
        }
        
        # Get memory usage in MB
        $memoryMB = [math]::Round($process.WorkingSet64 / 1MB, 2)
        $measurements += $memoryMB
        
        # Calculate elapsed time
        $elapsed = ((Get-Date) - $startTime).TotalSeconds
        
        # Display current memory usage
        $color = if ($memoryMB -lt 50) { "Green" } else { "Red" }
        Write-Host ("[{0:00}s] Memory Usage: {1} MB" -f $elapsed, $memoryMB) -ForegroundColor $color
        
        # Wait 5 seconds (polling interval)
        Start-Sleep -Seconds 5
    }
}
finally {
    # Calculate statistics
    if ($measurements.Count -gt 0) {
        $avgMemory = [math]::Round(($measurements | Measure-Object -Average).Average, 2)
        $maxMemory = [math]::Round(($measurements | Measure-Object -Maximum).Maximum, 2)
        $minMemory = [math]::Round(($measurements | Measure-Object -Minimum).Minimum, 2)
        
        Write-Host ""
        Write-Host "=== Memory Usage Statistics ===" -ForegroundColor Cyan
        Write-Host "Minimum: $minMemory MB" -ForegroundColor Green
        Write-Host "Average: $avgMemory MB" -ForegroundColor $(if ($avgMemory -lt 50) { "Green" } else { "Red" })
        Write-Host "Maximum: $maxMemory MB" -ForegroundColor $(if ($maxMemory -lt 50) { "Green" } else { "Red" })
        Write-Host "Measurements: $($measurements.Count)" -ForegroundColor White
        Write-Host ""
        
        # Verify requirements
        Write-Host "=== Requirement Verification ===" -ForegroundColor Cyan
        if ($avgMemory -lt 50) {
            Write-Host "[PASS] Average memory usage ($avgMemory MB) is under 50MB" -ForegroundColor Green
        } else {
            Write-Host "[FAIL] Average memory usage ($avgMemory MB) exceeds 50MB" -ForegroundColor Red
        }
        
        if ($maxMemory -lt 50) {
            Write-Host "[PASS] Maximum memory usage ($maxMemory MB) is under 50MB" -ForegroundColor Green
        } else {
            Write-Host "[WARNING] Maximum memory usage ($maxMemory MB) exceeds 50MB" -ForegroundColor Yellow
        }
        
        # Check stability (standard deviation)
        $stdDev = [math]::Round([math]::Sqrt(($measurements | ForEach-Object { [math]::Pow($_ - $avgMemory, 2) } | Measure-Object -Average).Average), 2)
        Write-Host "Memory Stability (StdDev): $stdDev MB" -ForegroundColor White
        
        if ($stdDev -lt 5) {
            Write-Host "[PASS] Memory usage is stable during polling" -ForegroundColor Green
        } else {
            Write-Host "[WARNING] Memory usage shows variation (StdDev: $stdDev MB)" -ForegroundColor Yellow
        }
    }
    
    # Close the application
    Write-Host ""
    Write-Host "Closing application..." -ForegroundColor Yellow
    if (-not $app.HasExited) {
        $app.CloseMainWindow() | Out-Null
        Start-Sleep -Seconds 2
        if (-not $app.HasExited) {
            $app.Kill()
        }
    }
    Write-Host "Test complete." -ForegroundColor Green
}
