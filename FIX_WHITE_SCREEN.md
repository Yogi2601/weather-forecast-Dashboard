# White Screen - Troubleshooting Guide

## Issue
Frontend showing white screen after Phase 17 implementation.

## Root Causes to Check

### 1. Backend Not Running
The most common cause is the backend server not running.

**Solution:**
```bash
cd backend
python main.py
```

Should see:
```
Uvicorn running on http://127.0.0.1:8000
```

**Verify:** Open http://127.0.0.1:8000 in browser → Should show JSON message

---

### 2. Frontend Dev Server Not Running
If the dev server isn't running, you'll get blank page.

**Solution:**
```bash
cd frontend
npm install
npm run dev
```

Should see:
```
VITE v5.3.1  ready in XXX ms

➜  Local:   http://localhost:5173/
```

**Verify:** Open http://localhost:5173 in browser

---

### 3. Browser Cache Issue
Sometimes the browser caches a broken version.

**Solution:**
1. Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
2. Or clear cache and reload
3. Or open in Incognito/Private window

---

### 4. Module Not Found
The import error we fixed might still cause issues if files aren't in the right place.

**Verify files exist:**
```
backend/app/city_detection.py ✓
backend/app/weather_context_resolver.py ✓
backend/app/ai_service.py ✓
backend/app/ai_routes.py ✓
```

---

### 5. Python Version Mismatch
Ensure you're using the right Python.

**Check:**
```bash
python --version
pip list | findstr fastapi
```

**Should show:**
- Python 3.8+
- fastapi installed
- sqlalchemy installed
- google-genai installed

---

## Debugging Steps

### Step 1: Check Backend
```bash
cd backend
python test_imports.py
```

**Expected output:**
```
✓ Testing basic imports...
  ✓ app.schemas
  ✓ app.services
  ✓ app.city_detection
  ✓ app.weather_context_resolver
  ✓ app.ai_prompts
  ✓ app.ai_service
  ✓ app.ai_routes
  ✓ app.main

✅ ALL IMPORTS SUCCESSFUL!
```

If this fails, there's a Python import issue to fix.

---

### Step 2: Check Backend API
```bash
curl http://127.0.0.1:8000/
```

**Expected output:**
```json
{"message":"Weather Dashboard Backend is Running 🚀"}
```

If this fails, backend isn't running.

---

### Step 3: Check Frontend Build
```bash
cd frontend
npm run build
```

**Expected output:**
```
✓ XXX modules transformed
dist/index.html
dist/assets/index-XXX.js
dist/assets/index-XXX.css
```

If this fails, there's a frontend build error.

---

### Step 4: Browser Console
Open DevTools (F12) → Console tab

**Look for errors like:**
- `Cannot find module 'xyz'`
- `fetch failed`
- `Cannot read property 'xyz' of undefined`

**Fix based on specific error**

---

## Quick Fix Checklist

Run these in order:

```bash
# 1. Stop everything (Ctrl+C in all terminals)

# 2. Install dependencies
cd backend
pip install -r requirements.txt

cd ../frontend
npm install

# 3. Start backend
cd ../backend
python main.py
# Should show: Uvicorn running on http://127.0.0.1:8000

# 4. In NEW terminal, start frontend
cd ../frontend
npm run dev
# Should show: http://localhost:5173

# 5. Open browser
# Navigate to http://localhost:5173

# 6. Check DevTools (F12)
# - No errors in Console tab
# - Network tab shows requests to /api endpoints
# - Should see weather data loading
```

---

## If Still White Screen

### Check Network Tab (DevTools)
1. Open DevTools (F12)
2. Go to Network tab
3. Reload page (F5)
4. Look for failed requests (red X)
5. Check Status column

**Common errors:**
- `404`: Backend endpoint not found
- `500`: Backend error
- `CORS error`: Proxy configuration issue
- `Failed to fetch`: Backend not running

### Check Console Tab
1. Open DevTools (F12)
2. Go to Console tab
3. Look for error messages
4. Click on error to see full trace

**Common errors:**
- `Cannot find module`: Missing import
- `Cannot read property 'xyz' of undefined`: Data structure issue
- `Fetch error`: API call failed

---

## Specific Fixes

### Fix 1: Backend Import Error
If you see:
```
ImportError: cannot import name 'fetchWeatherForCity'
```

**Already fixed!** This was the issue earlier. Just make sure you have the latest files.

### Fix 2: CORS Error
If you see:
```
Access to XMLHttpRequest blocked by CORS policy
```

**Solution:** Backend CORS is configured. Make sure:
1. Backend is running on http://127.0.0.1:8000
2. Frontend is on http://localhost:5173
3. Both servers are running

### Fix 3: API Endpoint Error
If you see:
```
Failed to load resource: the server responded with a status of 500
```

**Solution:** Check backend logs for error details, then fix the issue

---

## Manual Test Commands

### Test Backend Health
```bash
curl -X GET http://127.0.0.1:8000/health
```

Expected:
```json
{"status":"healthy"}
```

### Test Weather Endpoint
```bash
curl -X GET "http://127.0.0.1:8000/weather/London"
```

Expected: Weather JSON data

### Test AI Endpoint
```bash
curl -X POST http://127.0.0.1:8000/ai/chat \
  -H "Content-Type: application/json" \
  -d '{
    "user_question": "How is the weather?",
    "weather_context": {...}
  }'
```

Expected: AI response JSON

---

## If All Else Fails

### Complete Reset
```bash
# 1. Kill all Node/Python processes
taskkill /F /IM node.exe
taskkill /F /IM python.exe

# 2. Clear caches
cd frontend
rm -r node_modules
rm -r dist
npm cache clean --force

# 3. Reinstall
npm install

# 4. Clear browser cache
# In browser: Ctrl+Shift+Delete, clear all

# 5. Restart everything
cd ../backend
python main.py

# New terminal:
cd ../frontend
npm run dev

# New terminal:
curl http://127.0.0.1:8000/
```

---

## Still Need Help?

1. **Check logs** - Backend logs show errors
2. **Browser DevTools** - Console and Network tabs
3. **Check files exist** - All imports reference actual files
4. **Verify running** - Both backend (8000) and frontend (5173)
5. **Network connectivity** - Can you ping localhost?

---

## Success Signs

✅ Frontend loads (not white)
✅ Weather cards visible
✅ Chat button visible (bottom right)
✅ No red errors in DevTools Console
✅ Network tab shows successful requests

Then Phase 17 is ready for testing!
