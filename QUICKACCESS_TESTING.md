# System Quick Access - Manual Testing Steps

## Files Modified Summary

**NEW (1 file):**
- `frontend/src/hooks/useFavoriteCity.js` - Manages favorite city persistence

**MODIFIED (2 files):**
- `frontend/src/App.jsx` - Added historical data fetching, favorite city hook, updated QuickAccess props
- `frontend/src/components/QuickAccess.jsx` - Complete rewrite with live data

---

## Test 1: Saved Locations Card

**Steps:**
1. Open app (dashboard view)
2. Look at "Saved Locations" card (top-left of Quick Access)
3. Verify it shows "0" (no locations saved yet)
4. Search "Paris"
5. Click "Save" button on weather card (star icon)
6. Go back to Dashboard tab
7. Verify "Saved Locations" shows "1 location saved"
8. Search "London"
9. Click "Save" button
10. Go back to Dashboard
11. Verify "Saved Locations" shows "2 locations saved"
12. Click the "Saved Locations" card
13. Verify it opens the Saved Locations page with both cities

**Expected Result:** ✅ Card shows correct count, clicking opens Saved Locations page

---

## Test 2: Rain Tomorrow Card

**Steps:**
1. Search "London" (typically rainy)
2. Go to Dashboard tab
3. Look at "Rain Tomorrow" card
4. Verify it shows "Rain Expected" or "No Rain" based on tomorrow's forecast
5. Verify precipitation percentage shows (e.g., "45% probability")
6. If rain expected, verify icon has blue glow + animation
7. If no rain, verify icon is plain green
8. Search "Dubai" (typically sunny)
9. Verify card shows "No Rain" with green styling
10. Look at forecast section to confirm accuracy
11. Verify card message reflects the precipitation probability

**Expected Result:** ✅ Card shows correct forecast, styling updates correctly

---

## Test 3: Favourite City Card

**Steps:**
1. Search "Paris"
2. Go to Dashboard
3. Look at "Favourite City" card
4. Verify it shows "Paris" as the city name
5. Verify it shows current temperature
6. Verify it shows current humidity %
7. Verify it shows current wind km/h
8. Verify "Last viewed" label shows (not "Primary focus")
9. Search "Tokyo"
10. Verify "Favourite City" updates to "Tokyo"
11. Verify temp, humidity, wind update to Tokyo's current weather
12. Click the "Favourite City" card
13. Verify dashboard still shows Tokyo weather (already loaded)
14. Press F5 to refresh browser
15. Verify "Favourite City" still shows "Tokyo"
16. Go to Analytics page
17. Go back to Dashboard
18. Verify "Favourite City" still shows "Tokyo"
19. Search "New York"
20. Verify "Favourite City" updates to "New York"

**Expected Result:** ✅ Card shows correct city, persists after refresh, updates on search

---

## Test 4: Monthly Average Card

**Steps:**
1. Search "Paris"
2. Go to Dashboard
3. Look at "Monthly Average" card
4. Verify it shows a temperature (e.g., "18°")
5. Verify it says something like "June 2026 average temperature"
6. Go to Analytics page
7. Verify analytics show monthly breakdown
8. Go back to Dashboard
9. Verify monthly average still shows the same value
10. Search "Dubai"
11. Verify monthly average updates (should be higher)
12. Search "Tokyo"
13. Verify monthly average updates again
14. Click the "Monthly Average" card
15. Verify it switches to Analytics page
16. Verify the monthly average shown matches the monthly breakdown in analytics
17. Go back to Dashboard
18. Verify monthly average card still shows correct value

**Expected Result:** ✅ Card shows correct monthly average from historical data, clicking opens Analytics

---

## Test 5: All Cards Responsive

**Steps:**
1. Open app on desktop
2. Verify all 4 cards visible in one row (lg: grid-cols-4)
3. Hover over each card
4. Verify slight upward movement (hover:translate-y-[-2px])
5. Resize browser to tablet width (768px)
6. Verify cards show 2 per row (md: grid-cols-2)
7. All cards still readable and complete
8. Resize to mobile (375px)
9. Verify cards show 1 per row
10. Verify all text readable on small screen
11. Verify all buttons clickable on small screen

**Expected Result:** ✅ Cards responsive across all screen sizes

---

## Test 6: Card Click Functionality

**Steps:**
1. Search "Paris"
2. Go to Dashboard
3. Click "Saved Locations" card
4. Verify page switches to Saved Locations tab
5. Go back to Dashboard
6. Click "Rain Tomorrow" card
7. Verify nothing happens (forecast already visible on dashboard)
8. Click "Favourite City" card
9. Verify page stays on dashboard (city already loaded)
10. Search "London"
11. Click "Favourite City" card
12. Verify dashboard still shows London weather
13. Go to Analytics tab
14. Go back to Dashboard
15. Click "Monthly Average" card
16. Verify page switches to Analytics tab
17. Go back to Dashboard

**Expected Result:** ✅ All card clicks work correctly

---

## Test 7: Persistence Across Sessions

**Steps:**
1. Search "Paris"
2. Note the "Favourite City" card shows "Paris"
3. Press F5 to refresh browser
4. Wait for page to load
5. Verify "Favourite City" still shows "Paris"
6. Go to Dashboard (if not already there)
7. Search "Tokyo"
8. Note the "Favourite City" card shows "Tokyo"
9. Close browser tab completely
10. Reopen the app URL
11. Verify "Favourite City" shows "Tokyo"
12. Verify "Saved Locations" count is preserved

**Expected Result:** ✅ Favorite city persists across page refresh and browser close

---

## Test 8: Synchronization with Other Features

**Steps:**
1. Search "Paris"
2. Verify "Favourite City" card shows "Paris"
3. Go to Saved Locations
4. Verify "Currently Viewing" indicator on Paris card
5. Click London card
6. Go back to Dashboard
7. Verify "Favourite City" updated to "London"
8. Go to Saved Locations
9. Verify "Currently Viewing" indicator moved to London
10. Click "Save" on weather card to add current city to favorites
11. Go to Dashboard
12. Verify "Saved Locations" count increased
13. Unfavorite the city
14. Verify "Saved Locations" count decreased

**Expected Result:** ✅ Quick Access cards stay synchronized with other features

---

## Test 9: Data Accuracy

**Steps:**
1. Search "San Francisco"
2. Check weather card temperature
3. Compare with "Favourite City" temperature (should match)
4. Check weather card humidity
5. Compare with "Favourite City" humidity (should match)
6. Check weather card wind
7. Compare with "Favourite City" wind (should match)
8. Check forecast section for tomorrow's weather
9. Compare "Rain Tomorrow" card with forecast[1]
10. If tomorrow is rainy, verify card shows "Rain Expected"
11. If tomorrow is clear, verify card shows "No Rain"
12. Go to Analytics
13. Find current month's average temperature
14. Go back to Dashboard
15. Verify "Monthly Average" matches Analytics value

**Expected Result:** ✅ All card values match other UI sections

---

## Test 10: Loading States

**Steps:**
1. Open app
2. During initial load, verify cards show placeholder values (or loading states)
3. After weather loads, verify "Favourite City" shows data
4. After historical data loads, verify "Monthly Average" shows calculated value
5. Search a new city
6. Verify cards update smoothly without flickering

**Expected Result:** ✅ Cards update correctly as data loads

---

## Test 11: No Breaking Changes

**Steps:**
1. Search city → Weather loads ✅
2. Click Save → Favorites work ✅
3. Check Recent Searches → Shows searches ✅
4. Check Analytics → Shows historical data ✅
5. Click GPS → Location works ✅
6. Click Settings → Opens settings panel ✅
7. Click Notifications bell → Notifications work ✅
8. Check Quick Access sidebar (right panel) → Still visible ✅
9. Check Forecast section below Quick Access → Still visible ✅
10. All other dashboard sections work ✅

**Expected Result:** ✅ No existing functionality broken

---

## Test 12: Card Styling

**Steps:**
1. Look at all Quick Access cards
2. Verify all have glassmorphism design (semi-transparent background + blur)
3. Verify hover animation works (slight upward movement + border color change)
4. Verify icons are color-coded:
   - Saved Locations: rose/pink
   - Rain Tomorrow: sky blue
   - Favourite City: amber/gold
   - Monthly Average: emerald/green
5. Verify text hierarchy looks good on each card
6. Verify spacing is consistent between cards
7. Verify animations are smooth and not laggy

**Expected Result:** ✅ All cards match existing UI design language

---

## Quick Checklist (1-2 minutes)

- [ ] Saved Locations shows correct count
- [ ] Rain Tomorrow shows forecast + probability
- [ ] Favourite City shows city name + weather
- [ ] Monthly Average shows temperature
- [ ] Clicking Saved Locations opens that page
- [ ] Clicking Monthly Average opens Analytics
- [ ] All cards are clickable and styled correctly
- [ ] Cards update when city changes
- [ ] Favorite city persists after refresh
- [ ] No breaking changes to existing features

**Expected Result:** ✅ System Quick Access fully functional with live data

