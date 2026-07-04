# Backend Setup Guide - Complete Solution

## The Problem

Your backend won't start because:
1. ❌ MySQL service is **STOPPED**
2. ❌ Backend dependencies may not be installed
3. ❌ Backend is not running (needs to be started on port 8000)

---

## Solution: Step-by-Step

### Step 1: Start MySQL Service

Open PowerShell **as Administrator** and run:

```powershell
Start-Service -Name "MySQL80"
Start-Sleep -Seconds 5
Get-Service -Name "MySQL80"
```

Expected output: `Status : Running`

**If MySQL won't start:**
1. Check if MySQL is installed: `Get-Service | findstr -i mysql`
2. If not installed, download from: https://dev.mysql.com/downloads/mysql/
3. During installation, ensure it's set to run as a service

---

### Step 2: Install Backend Dependencies

Open PowerShell and run:

```powershell
cd C:\Users\Owner\Documents\weather-dashboard\backend

# Create virtual environment
python -m venv .venv

# Activate virtual environment
.\.venv\Scripts\Activate.ps1

# Install dependencies
pip install fastapi uvicorn sqlalchemy pymysql python-dotenv requests

# Verify installation
pip list | findstr fastapi
```

---

### Step 3: Create Database

Run this command in PowerShell:

```powershell
# Connect to MySQL and create database
mysql -u root -e "CREATE DATABASE IF NOT EXISTS weather_dashboard; SHOW DATABASES;"
```

**If you get "mysql command not found":**
- Add MySQL to PATH, or
- Use full path: `"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql"`

---

### Step 4: Start the Backend Server

In PowerShell (with `.venv` activated):

```powershell
cd C:\Users\Owner\Documents\weather-dashboard\backend

uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Expected output:
```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Application startup complete
```

---

### Step 5: Test Backend Connection

Open another PowerShell and run:

```powershell
Invoke-WebRequest -Uri "http://127.0.0.1:8000/health" -UseBasicParsing | Select-Object -ExpandProperty Content
```

Expected response:
```json
{"status":"healthy","backend":"FastAPI","version":"1.0.0"}
```

---

## Final Checklist

✅ MySQL service is running  
✅ Backend venv activated  
✅ Dependencies installed  
✅ Database created  
✅ Backend running on http://127.0.0.1:8000  
✅ Frontend running on http://localhost:5173  

---

## Your Setup Should Now Be:

| Component | URL | Status |
|-----------|-----|--------|
| Frontend (Vite) | http://localhost:5173 | ✅ Running |
| Backend (FastAPI) | http://127.0.0.1:8000 | ✅ Running |
| Database (MySQL) | localhost:3306 | ✅ Running |
| Database Name | `weather_dashboard` | ✅ Created |

---

## Troubleshooting

### "MySQL service cannot start"
- Open Services (Win+R → services.msc)
- Find "MySQL80"
- Right-click → Properties → Startup type → Set to "Automatic"
- Right-click → Start

### "pip: command not found"
- Python not in PATH
- Use: `python -m pip install ...` instead

### "uvicorn: command not found"
- Virtual environment not activated
- Run: `.\.venv\Scripts\Activate.ps1`

### Frontend still can't reach backend
- Ensure both are running on the URLs above
- Check browser console (F12) for CORS errors
- Clear browser cache and reload

---

## What to Do Now

1. **Start MySQL** (Step 1)
2. **Install dependencies** (Step 2)
3. **Create database** (Step 3)
4. **Start backend** (Step 4)
5. **Test health endpoint** (Step 5)
6. Reload frontend in browser
7. ✅ Everything should work!

