# Weather History Refresh - Windows Task Scheduler Setup
# Run this script in PowerShell as Administrator

param(
    [switch]$Remove = $false
)

$TaskName = "WeatherDashboard-DailyRefresh"
$BackendPath = "$PSScriptRoot"
$VenvPath = "$BackendPath\.venv\Scripts\activate.ps1"
$ScriptPath = "$BackendPath\refresh_weather.py"
$Time = "02:00"  # Run at 2 AM daily

Write-Host "========================================================================" -ForegroundColor Cyan
Write-Host "         Weather Dashboard - Task Scheduler Setup" -ForegroundColor Cyan
Write-Host "========================================================================" -ForegroundColor Cyan
Write-Host ""

# Check if running as administrator
$isAdmin = [bool]([System.Security.Principal.WindowsIdentity]::GetCurrent().Groups -match "S-1-5-32-544")
if (-not $isAdmin) {
    Write-Host "ERROR: This script must be run as Administrator" -ForegroundColor Red
    Write-Host "Right-click PowerShell and select 'Run as Administrator'" -ForegroundColor Yellow
    exit 1
}

if ($Remove) {
    Write-Host "Removing scheduled task '$TaskName'..." -ForegroundColor Yellow
    try {
        Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false -ErrorAction Stop
        Write-Host "[OK] Task removed successfully" -ForegroundColor Green
    } catch {
        Write-Host "[ERROR] Task not found or error removing: $_" -ForegroundColor Yellow
    }
    exit 0
}

# Verify files exist
if (-not (Test-Path $VenvPath)) {
    Write-Host "ERROR: Virtual environment not found at: $VenvPath" -ForegroundColor Red
    Write-Host "Please run the backend startup script first" -ForegroundColor Yellow
    exit 1
}

if (-not (Test-Path $ScriptPath)) {
    Write-Host "ERROR: Refresh script not found at: $ScriptPath" -ForegroundColor Red
    exit 1
}

Write-Host "Configuration:" -ForegroundColor Cyan
Write-Host "  Task Name:     $TaskName"
Write-Host "  Schedule:      Daily at $Time"
Write-Host "  Script:        $ScriptPath"
Write-Host "  Python Env:    $VenvPath"
Write-Host ""

# Check if task already exists
$existingTask = Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
if ($existingTask) {
    Write-Host "Task already exists. Removing old task..." -ForegroundColor Yellow
    Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false
}

# Create task action - PowerShell command to run the refresh script
$PSCommand = ". '$VenvPath'; python '$ScriptPath'"
$ArgumentString = "-NoProfile -ExecutionPolicy Bypass -Command $PSCommand"
$TaskAction = New-ScheduledTaskAction `
    -Execute "powershell.exe" `
    -Argument $ArgumentString

# Create task trigger - Daily at specified time
$TaskTrigger = New-ScheduledTaskTrigger `
    -Daily `
    -At $Time

# Create task settings
$TaskSettings = New-ScheduledTaskSettingsSet `
    -AllowStartIfOnBatteries `
    -Compatibility Win8 `
    -DontStopIfGoingOnBatteries `
    -StartWhenAvailable `
    -RunOnlyIfNetworkAvailable

# Create the scheduled task
try {
    Register-ScheduledTask `
        -TaskName $TaskName `
        -Action $TaskAction `
        -Trigger $TaskTrigger `
        -Settings $TaskSettings `
        -Description "Daily refresh of historical weather data for all saved locations" `
        -Force | Out-Null

    Write-Host "[OK] Scheduled task created successfully!" -ForegroundColor Green
    Write-Host ""
    $NextRun = (Get-Date).AddDays(1).AddHours(2).AddMinutes(0).AddSeconds(0)
    Write-Host "Next scheduled run: $NextRun" -ForegroundColor Green
    Write-Host ""
    Write-Host "To view the task:" -ForegroundColor Cyan
    Write-Host "  Get-ScheduledTask -TaskName '$TaskName' | Format-List"
    Write-Host ""
    Write-Host "To run the task manually:" -ForegroundColor Cyan
    Write-Host "  Start-ScheduledTask -TaskName '$TaskName'"
    Write-Host ""
    Write-Host "To remove the task:" -ForegroundColor Cyan
    Write-Host "  powershell -ExecutionPolicy Bypass -File setup_scheduler.ps1 -Remove"

} catch {
    Write-Host "[ERROR] Error creating task: $_" -ForegroundColor Red
    exit 1
}
