# Quick Start Guide - Weather Dashboard

## 🎯 The Real Problem

Your **MySQL database service is STOPPED**. That's why the backend can't run.

---

## ⚡ Quick Fix (5 minutes)

### Option A: Use the Automated Script (Easiest)

1. **Right-click PowerShell** → "Run as Administrator"
2. **Copy-paste this:**

```powershell
cd C:\Users\Owner\Documents\weather-dashboard\backend
powershell -ExecutionPolicy Bypass -File start-backend.ps1
```

This will:
- ✅ Start MySQL service
- ✅ Create Python virtual environment
- ✅ Install all dependencies
- ✅ Create the database
- ✅ Start the backend on http://127.0.0.1:8000

---

### Option B: Manual Setup

**PowerShell as Administrator:**

```powershell
# 1. Start MySQL
Start-Service -Name "MySQL80"
Start-Sleep -Seconds 3
Get-Service -Name "MySQL80"

# 2. Go to backend folder
cd C:\Users\Owner\Documents\weather-dashboard\backend

# 3. Create & activate Python environment
python -m venv .venv
.\.venv\Scripts\Activate.ps1

# 4. Install dependencies
pip install fastapi uvicorn sqlalchemy pymysql python-dotenv requests

# 5. Create database (optional - backend will work without it for API calls)
# Skip if you don't have MySQL CLI set up

# 6. Start the backend
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

---

## ✅ Verify Everything Works

**In a new PowerShell window, test:**

```powershell
Invoke-WebRequest -Uri "http://127.0.0.1:8000/health" -UseBasicParsing | Select-Object -ExpandProperty Content
```

Expected: `{"status":"healthy","backend":"FastAPI","version":"1.0.0"}`

---

## 🎨 Your Frontend + Backend Setup

| Service | URL | Status |
|---------|-----|--------|
| **Frontend** | http://localhost:5173 | ✅ Already running |
| **Backend** | http://127.0.0.1:8000 | ⏳ Start with script above |
| **Database** | localhost:3306 | ⏳ Starts with script |

---

## 📋 Next Steps

1. **Run the startup script** (Option A - takes 1 minute)
2. **Reload your browser** (http://localhost:5173)
3. **Click Analytics tab** → See your new Analytics Dashboard! 🎉

---

## 🐛 If Something Goes Wrong

See `BACKEND_SETUP_GUIDE.md` for detailed troubleshooting.

**Most common issue:** "Run PowerShell as Administrator" (Right-click PowerShell)

---

## What You Have Ready

✅ **Frontend with Analytics Dashboard V1** (4 interactive charts)  
✅ **Backend API** (ready to run)  
⏳ **MySQL Database** (just needs to be started)

Start the backend and you're done!
