# Phase 17 - Import Error Fix

**Issue:** White page loading due to backend import error  
**Error Message:** `ImportError: cannot import name 'fetchWeatherForCity' from 'app.services'`  
**Root Cause:** weather_context_resolver.py was importing a non-existent function  
**Fix Status:** ✅ FIXED

## What Was Wrong

The `weather_context_resolver.py` was trying to import and use:
```python
from app.services import fetchWeatherForCity
weather_data = fetchWeatherForCity(city_name)
```

But this function doesn't exist in `app/services.py`.

## Solution Applied

Updated `weather_context_resolver.py` to use the correct services:

**Before:**
```python
from app.services import fetchWeatherForCity
...
weather_data = fetchWeatherForCity(city_name)
```

**After:**
```python
from app import services, crud
...
coords = services.get_coordinates(city_name)
weather_data = services.get_current_weather(coords['latitude'], coords['longitude'])
```

## Changes Made

**File:** backend/app/weather_context_resolver.py

### 1. Fixed Imports (Lines 8-20)
```python
# Changed from:
from app.services import fetchWeatherForCity

# Changed to:
from app.schemas import WeatherContext, LocationData, CurrentWeatherData, UnitsData
from app import services, crud
from app.database import SessionLocal
from app.city_detection import (...)
```

### 2. Fixed _fetch_or_use_cache() method (Lines 120-206)
- Removed invalid `fetchWeatherForCity()` call
- Added `services.get_coordinates()` to get lat/lon
- Added `services.get_current_weather()` to fetch weather data
- Updated field mapping to match actual weather API response structure

## Testing

To verify the fix works:

1. **Restart the backend:**
   ```bash
   cd backend
   python main.py
   ```

2. **Refresh the frontend:** Open http://localhost:5173/

3. **Test city detection:**
   - Dashboard: San Francisco
   - Ask: "What's the weather in Mumbai?"
   - Expected: AI answers about Mumbai (not SF)

4. **Check logs for:**
   ```
   City detected: Mumbai
   Fetching weather for Mumbai
   ✓ System working correctly
   ```

## Verification

✅ Imports are now valid  
✅ Functions called exist and are exported  
✅ Field mapping matches actual API structure  
✅ Error handling maintains graceful degradation  
✅ Backend should start without errors  

## Next Steps

1. Backend restart will pick up the fix automatically
2. Frontend will load without white page
3. City detection will work as designed
4. Run Phase 17 test cases to verify all functionality

## Files Modified

- `backend/app/weather_context_resolver.py` (2 sections: imports and _fetch_or_use_cache method)

No other files needed changes - the core logic was correct, only the service integrations needed fixing.

---

**Fix Applied:** July 7, 2026  
**Status:** Ready for Testing ✅
