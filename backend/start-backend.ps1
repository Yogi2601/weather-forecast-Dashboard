# Weather Dashboard Backend Startup Script
# Run this script in PowerShell to start the backend

Write-Host "🚀 Weather Dashboard Backend Startup Script`n" -ForegroundColor Cyan

# Step 1: Start MySQL
Write-Host "Step 1: Starting MySQL service..." -ForegroundColor Yellow
$mysqlService = Get-Service -Name "MySQL80" -ErrorAction SilentlyContinue
if ($mysqlService -and $mysqlService.Status -eq "Stopped") {
    try {
        Start-Service -Name "MySQL80" -ErrorAction Stop
        Start-Sleep -Seconds 3
        Write-Host "✓ MySQL service started" -ForegroundColor Green
    } catch {
        Write-Host "✗ Failed to start MySQL. Run PowerShell as Administrator." -ForegroundColor Red
        Write-Host "Or manually start MySQL from Services (Win+R -> services.msc)" -ForegroundColor Yellow
        exit 1
    }
} elseif ($mysqlService -and $mysqlService.Status -eq "Running") {
    Write-Host "✓ MySQL service already running" -ForegroundColor Green
} else {
    Write-Host "⚠ MySQL service not found. Check your MySQL installation." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Step 2: Setting up Python environment..." -ForegroundColor Yellow

# Step 2: Check/Create virtual environment
$venvPath = "$PSScriptRoot\.venv"
if (Test-Path "$venvPath\Scripts\Activate.ps1") {
    Write-Host "✓ Virtual environment exists" -ForegroundColor Green
} else {
    Write-Host "Creating virtual environment..." -ForegroundColor Cyan
    python -m venv $venvPath
}

# Step 3: Activate virtual environment
Write-Host "Activating virtual environment..." -ForegroundColor Cyan
& "$venvPath\Scripts\Activate.ps1"

# Step 4: Install dependencies
Write-Host "Installing dependencies (this may take a minute)..." -ForegroundColor Cyan
pip install -q fastapi uvicorn sqlalchemy pymysql python-dotenv requests
Write-Host "✓ Dependencies installed" -ForegroundColor Green

Write-Host ""
Write-Host "Step 3: Creating database..." -ForegroundColor Yellow
try {
    $mysqlPath = "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"
    if (Test-Path $mysqlPath) {
        & $mysqlPath -u root -e "CREATE DATABASE IF NOT EXISTS weather_dashboard;" 2>$null
        Write-Host "✓ Database ready (weather_dashboard)" -ForegroundColor Green
    } else {
        Write-Host "⚠ MySQL executable not found at default path" -ForegroundColor Yellow
        Write-Host "  Continuing anyway - database may need manual creation" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠ Could not verify database. Continuing anyway..." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Step 4: Starting FastAPI server..." -ForegroundColor Yellow
Write-Host "Backend will run on: http://127.0.0.1:8000" -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop the server`n" -ForegroundColor Gray

# Step 5: Start backend
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
