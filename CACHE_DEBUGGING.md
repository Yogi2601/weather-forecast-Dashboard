# Searched Cities Cache - Debugging Guide

**Issue:** Cache not showing cities after selection from thunderstorm filter

**Status:** Added detailed console logging to diagnose the issue

---

## What to Check

### Step 1: Open Browser Dev Tools
1. **Press:** `F12` or `Ctrl+Shift+I`
2. **Go to:** Console tab
3. **Look for messages starting with:**
   - 🔴 `handleSelectCity called with:`
   - 📦 `Cache data to add:`
   - 📍 `cacheRef.current:`
   - ✅ `Adding to cache` (if ref is working)
   - ❌ `cacheRef.current or addCityToCache not available` (if ref is broken)
   - 🔵 `addCityToCache called with:`
   - 🟢 `New city object:`
   - 🟡 `Updated cities array:`

### Step 2: Test the Flow

1. **Select Thunderstorm filter**
2. **Click "Find Cities"**
3. **Select a city** → Click "View Details"
4. **Check console** for the colored log messages

---

## What Each Log Message Means

| Message | Meaning | Expected |
|---------|---------|----------|
| 🔴 handleSelectCity called | City was clicked in modal | Should appear when you click a city |
| 📦 Cache data to add | Data being prepared for cache | Should show: `{name, country, temp, condition, humidity, wind, icon, latitude, longitude}` |
| 📍 cacheRef.current | Reference to cache component | Should NOT be `null` or `undefined` |
| ✅ Adding to cache | Cache method is available | Should see this if ref is working |
| ❌ cacheRef not available | Critical issue - ref is broken | FIX NEEDED: ref not properly connected |
| 🔵 addCityToCache called | Cache component received data | Should appear right after ✅ |
| 🟢 New city object | City formatted for storage | Check that all fields are present |
| 🟡 Updated cities array | Array ready for localStorage | Should show array with the new city first |

---

## Possible Issues & Fixes

### Issue 1: ❌ "cacheRef.current or addCityToCache not available"

**Cause:** Ref is not properly connected to cache component

**Fix:** Check that cache component is using `forwardRef`:
```jsx
const SearchedCitiesCacheComponent = forwardRef(({ onSelectCity }, ref) => {
  // ... component code ...
  useImperativeHandle(ref, () => ({
    addCityToCache,
    // ... other methods ...
  }))
})
```

**Solution:** ✅ Already implemented in SearchedCitiesCache.jsx

---

### Issue 2: Cache shows but timer not updating

**Cause:** setInterval not properly updating time

**Check:** Look for timer updates in console every 1 second

**Fix:** Ensure useEffect with interval is working:
```jsx
useEffect(() => {
  const interval = setInterval(() => {
    updateTimeLeft(cachedCities)
  }, 1000)
  return () => clearInterval(interval)
}, [cachedCities])
```

---

### Issue 3: City doesn't stay for 30 minutes

**Cause:** localStorage is being cleared somewhere

**Check:** 
1. Open DevTools → Application tab
2. Look for `searchedCitiesCache` key in localStorage
3. Verify timestamp is set correctly

**Fix:** Make sure `resetFilters()` doesn't clear cache
- ✅ Currently `resetFilters()` only resets location/weather state, not cache

---

### Issue 4: Cache disappears after page refresh

**Cause:** localStorage not being loaded on component mount

**Check:** Look for this effect in console:
```
useEffect(() => {
  const stored = localStorage.getItem('searchedCitiesCache')
  // ... load and filter valid entries ...
})
```

**Fix:** ✅ Already implemented in SearchedCitiesCache.jsx

---

## Complete Test Checklist

### Before Testing
- [ ] Dev server is running (`npm run dev` from frontend/)
- [ ] App loads at http://localhost:5174
- [ ] No errors in console

### Testing Steps
1. [ ] Open browser DevTools (F12)
2. [ ] Go to Console tab
3. [ ] Select "Thunderstorm" weather condition
4. [ ] Click "Find Cities"
5. [ ] Click "View Details" on first city
6. [ ] **Check console** for 🔴 🔵 logs
7. [ ] **Check page** for "Recently Searched (Cached)" section
8. [ ] **Count down timer** should show MM:SS format
9. [ ] **Click cached city** to load its weather
10. [ ] **Hover card** and click X to remove
11. [ ] **Refresh page** - city should still be in cache (if <30 min old)

---

## Expected Console Output

When you select a city from the Thunderstorm filter, you should see:

```
🔴 handleSelectCity called with: Object {name: "Pune", latitude: 18.52, longitude: 73.86, ...}
📦 Cache data to add: Object {name: "Pune", country: "India", temp: 25, condition: "Thunderstorm", humidity: 80, ...}
📍 cacheRef.current: SearchedCitiesCache {addCityToCache, removeCityFromCache, getCache, clearCache}
✅ Adding to cache
🔵 addCityToCache called with: Object {name: "Pune", country: "India", temp: 25, ...}
🟢 New city object: Object {id: "Pune-1720516800000", name: "Pune", country: "India", ...}
🟡 Updated cities array: Array [{id: "Pune-1720516800000", name: "Pune", ...}]
```

---

## If Cache is Not Showing

### Check 1: Is the cache getting data?
- [ ] Do you see 🔵, 🟢, 🟡 logs in console?
- [ ] If NO → ref is not working, check Issue 1
- [ ] If YES → data is being stored

### Check 2: Is the component rendering?
- [ ] Do you see "Recently Searched (Cached)" text below weather filters?
- [ ] If NO → component isn't mounted or cachedCities.length === 0
- [ ] If YES → component is rendering

### Check 3: Check localStorage directly
1. Open DevTools → Application → LocalStorage
2. Find `searchedCitiesCache` key
3. Check its content:
   ```json
   [
     {
       "id": "CityName-1720516800000",
       "name": "CityName",
       "country": "India",
       "temp": 25,
       "condition": "Thunderstorm",
       "humidity": 80,
       "icon": "⛈️",
       "timestamp": 1720516800000
     }
   ]
   ```

### Check 4: Verify time remaining
- [ ] Timer shows MM:SS format? (e.g., 29:45)
- [ ] Timer counts down every 1 second?
- [ ] After 30 minutes, city auto-removes?

---

## Fix: Remove Debug Logs

Once confirmed working, remove all console.log statements:

**In SearchedCitiesCache.jsx:**
- Remove lines with 🔵 🟢 🟡 logs

**In WeatherFilters.jsx:**
- Remove lines with 🔴 📦 📍 ✅ ❌ logs

---

## Next Steps

### If Cache is Working:
1. ✅ Confirm timer counts down
2. ✅ Confirm clicking city loads its weather
3. ✅ Confirm cache persists across page reloads
4. ✅ Remove debug logs
5. ✅ Test with multiple cities
6. ✅ Verify max 12 cities limit
7. ✅ Confirm auto-expiration after 30 min

### If Cache is Still Not Working:
1. Share the console output logs
2. Check if cacheRef is `null` (Issue 1)
3. Verify SearchedCitiesCache component is actually rendering
4. Check localStorage in DevTools for `searchedCitiesCache` key

---

## Files with Debugging

**SearchedCitiesCache.jsx (lines 63-85):**
- addCityToCache function has 3 console.logs
- Logs cache data being stored

**WeatherFilters.jsx (lines 596-635):**
- handleSelectCity function has 6 console.logs
- Logs when city is selected and ref status

---

## Quick Commands for Console

Test the cache directly from DevTools console:

```javascript
// Check if cache has data
JSON.parse(localStorage.getItem('searchedCitiesCache'))

// Clear cache manually
localStorage.removeItem('searchedCitiesCache')

// Check current time
Date.now()

// Check if city is expired
const cache = JSON.parse(localStorage.getItem('searchedCitiesCache'))
const now = Date.now()
const CACHE_DURATION_MS = 30 * 60 * 1000
cache.forEach(city => {
  const age = now - city.timestamp
  const remaining = CACHE_DURATION_MS - age
  console.log(`${city.name}: ${Math.floor(remaining / 1000)} seconds left`)
})
```

---

## Summary

**Debugging is now active!** 🔍

Next time you select a city:
1. Open DevTools Console (F12)
2. Look for colored logs (🔴 🔵 🟢)
3. Report what you see

This will help identify exactly where the issue is!
