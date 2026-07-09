# ⚡ Quick Test - 2 Minutes

## Go to App
```
http://localhost:5174
```

---

## Test 1: Smaller City Cards
1. Click **⛈️ Thunderstorm** filter
2. Click **Find Cities**
3. **LOOK:** You should see 6 small cards per row (not 3 big ones)
4. Each card shows: icon | temp | name | condition | humidity% | wind | Select button

✅ **Success:** Cards are much smaller and compact

---

## Test 2: Cache Showing
1. Click **Select** on any city card
2. Modal closes
3. **LOOK BELOW the weather condition filters** for "Recently Searched (Cached)"
4. You should see 1 city card with:
   - Weather icon (⛈️)
   - Temperature (25°C)
   - City name
   - Country
   - Condition (Thunderstorm)
   - Humidity (💧 80%)
   - Time remaining (29:45)

✅ **Success:** Cache section appears and shows the city

---

## Test 3: Cache Countdown
1. Watch the timer on the cached city card
2. Every 1 second it should count down: 29:44 → 29:43 → 29:42...
3. After 30 minutes (or 1800 seconds), the cached city auto-removes

✅ **Success:** Timer counts down properly

---

## Test 4: Cache Functionality
1. **Click the cached city card** → Weather loads instantly
2. **Hover the card** → X button appears
3. **Click the X** → City removed from cache
4. **Refresh page** (Ctrl+R) → City still in cache

✅ **Success:** Cache works as expected

---

## Test 5: Multiple Cities
1. Select Thunderstorm again → Find Cities
2. Click Select on **another city**
3. Cache now shows **2 cities** (new one first)
4. Both have countdown timers

✅ **Success:** Multiple cities persist in cache

---

## If Something Goes Wrong

### Cache not showing?
- [ ] Did you actually click "Select" on a city?
- [ ] Check below weather filters (not in modal)
- [ ] Hard refresh: Ctrl+Shift+R
- [ ] Open DevTools (F12) → Application → LocalStorage → searchedCitiesCache

### Cards still big?
- [ ] Hard refresh: Ctrl+Shift+R
- [ ] Clear browser cache

### Timer not counting?
- [ ] Check Console (F12) for errors
- [ ] Reload page

---

## What You Should See

### Modal with City Results
```
364 Cities Found (Maharashtra, India)

┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐
│⛈ │ │⛈ │ │⛈ │ │⛈ │ │⛈ │ │⛈ │
│29│ │28│ │27│ │26│ │25│ │24│
│Ac│ │Ad│ │Ak│ │Al│ │Am│ │An│
│Ov│ │Ov│ │Ov│ │Ov│ │Ov│ │Ov│
│72│ │75│ │78│ │80│ │82│ │85│
│SE│ │SE│ │SE│ │SE│ │SE│ │SE│
└──┘ └──┘ └──┘ └──┘ └──┘ └──┘
```

### Cached Cities Below Filters
```
⏱️ Recently Searched (Cached) - 2 cities

┌─────────────┐ ┌─────────────┐
│ ⛈️ 25°C     │ │ ⛈️ 26°C     │
│ PuneName    │ │ AkolaName   │
│ India       │ │ India       │
│ Thunderst.. │ │ Thunderst.. │
│ 💧 75%      │ │ 💧 80%      │
│ 28:45       │ │ 27:30       │
└─────────────┘ └─────────────┘
```

---

## Success Checklist
- [ ] City cards in modal are SMALL (6 per row)
- [ ] "Recently Searched (Cached)" section APPEARS below filters
- [ ] Cached city card shows all info (icon, temp, name, country, condition, humidity, timer)
- [ ] Timer COUNTS DOWN every 1 second
- [ ] Clicking cached city LOADS its weather
- [ ] Hovering card shows X button
- [ ] Clicking X REMOVES city from cache
- [ ] Refreshing page keeps cache (if <30 min old)

---

**All ✅ = Feature is working perfectly!** 🎉

Report any ❌ issues!
