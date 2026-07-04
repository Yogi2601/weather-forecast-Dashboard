# Settings Page - Manual Testing Checklist

## Files Modified Summary

**UPDATED (2 files):**
1. `frontend/src/hooks/useAppSettings.js` - Added 10 new settings + 3 new functions
2. `frontend/src/components/SettingsPanel.jsx` - Complete rewrite: 1 tab → 5 tabs with 12 settings

**UPDATED (1 file):**
3. `frontend/src/App.jsx` - Added notifications guards, lastRefreshTime tracking

---

## Quick Test (5 minutes)

### Test 1: Open Settings
- [ ] Click Settings button (gear icon) in navbar
- [ ] Settings panel opens from right side
- [ ] Shows "Settings" title
- [ ] Shows 5 tabs: General, Dashboard, Alerts, Data, About
- [ ] Click X button closes panel
- [ ] Press Escape key closes panel
- [ ] Click outside panel closes it

### Test 2: General Tab
- [ ] Temperature Unit: Change °C ↔ °F
- [ ] Wind Unit: Change km/h ↔ mph
- [ ] Pressure Unit: Change hPa ↔ inHg
- [ ] Precipitation Unit: Change mm ↔ inches
- [ ] Time Format: Change 12h ↔ 24h
- [ ] Theme: Shows Dark (selected), Light (disabled with lock)
- [ ] Animations: Toggle on/off (shows Enabled/Disabled)

### Test 3: Dashboard Tab
- [ ] Default City: Input text "London" → saved
- [ ] Auto Refresh Interval: Shows number input (5-120 range)
- [ ] Change interval to 15 → saved
- [ ] Try 3 (too low) → should round to 5
- [ ] Try 200 (too high) → should cap at 120

### Test 4: Alerts Tab
- [ ] Weather Alerts: Toggle on/off
- [ ] Rain Alerts: Toggle on/off
- [ ] Severe Weather Alerts: Toggle on/off
- [ ] App Notifications: Toggle on/off

### Test 5: Data Tab
- [ ] Clear Recent Searches: Shows button with trash icon
- [ ] Clear All Notifications: Shows button with trash icon
- [ ] Reset to Defaults: Shows button with RotateCcw icon (red on hover)

### Test 6: About Tab
- [ ] Shows "Weather Dashboard"
- [ ] Shows "Version 1.0.0"
- [ ] Shows "Open-Meteo"
- [ ] Shows "SQLite/MySQL"
- [ ] Shows Last Refresh time (should show "Never" initially)
- [ ] Shows Saved Locations count

### Test 7: Persistence
- [ ] Change temperature to Fahrenheit
- [ ] Close settings
- [ ] Refresh browser (F5)
- [ ] Open settings
- [ ] Verify still Fahrenheit ✓ (persisted)
- [ ] Change multiple settings
- [ ] Refresh again
- [ ] All settings preserved ✓

---

## Detailed Testing

### General Tab Tests

**Test 1: Temperature Unit**
- Open Settings → General tab
- Select "°F Fahrenheit"
- Verify button turns blue
- Close settings
- Verify dashboard still shows temps (no conversion yet, just setting)
- Refresh browser
- Open settings
- Verify "°F" still selected
- Select "°C" again

**Expected:** ✅ Setting persists

**Test 2: Wind Speed Unit**
- Open Settings → General tab
- Select "mph"
- Note which option is highlighted
- Close settings
- Refresh browser
- Open settings
- Verify "mph" still selected
- Change back to "km/h"

**Expected:** ✅ Wind unit persists

**Test 3: Pressure Unit**
- Open Settings → General tab
- Select "inHg"
- Close → Refresh → Open Settings
- Verify "inHg" selected
- Switch to "hPa"

**Expected:** ✅ Pressure unit persists

**Test 4: Precipitation Unit**
- Open Settings → General tab
- Select "inches"
- Close → Refresh → Open Settings
- Verify "inches" selected
- Switch to "mm"

**Expected:** ✅ Precipitation unit persists

**Test 5: Time Format**
- Open Settings → General tab
- Change time format (verify button style changes)
- Close settings
- Refresh browser
- Open settings
- Verify setting persisted

**Expected:** ✅ Time format persists

**Test 6: Theme**
- Verify "Dark" is selected (blue)
- Verify "Light" is disabled (lock icon)
- Try clicking "Light" (should not activate)
- Try clicking "Dark" (should activate)

**Expected:** ✅ Only Dark can be selected

**Test 7: Animations Toggle**
- Open Settings → General tab
- Toggle animations off (shows "Disabled")
- Close/Reopen settings
- Verify still "Disabled"
- Toggle back on (shows "Enabled")
- Refresh browser
- Verify setting persisted

**Expected:** ✅ Animation toggle persists

---

### Dashboard Tab Tests

**Test 1: Default City Input**
- Open Settings → Dashboard tab
- See text input with "San Francisco"
- Clear text, type "London"
- Press Enter or click elsewhere
- Close settings
- Refresh browser
- Open Settings → Dashboard
- Verify "London" is there

**Expected:** ✅ Default city persists

**Test 2: Auto Refresh Interval**
- Open Settings → Dashboard tab
- See number input with "30"
- Change to "10"
- Close → Refresh → Open Settings
- Verify "10" is saved
- Change to "5" (minimum)
- Verify it stays "5"
- Try to type "3" → should auto-correct to "5"
- Try to type "200" → should cap at "120"
- Change to "60"
- Close → Refresh → Open Settings
- Verify "60" persisted

**Expected:** ✅ Auto-refresh interval persists with range enforcement (5-120)

---

### Alerts Tab Tests

**Test 1: Weather Alerts Toggle**
- Open Settings → Alerts tab
- Weather Alerts shows "Enabled"
- Click toggle → "Disabled"
- Close settings
- Search a city
- Verify no notifications appear (since weatherAlertsEnabled is false)
- Open Settings → Toggle back to "Enabled"
- Search a different city
- Verify notifications appear again (if applicable)

**Expected:** ✅ Notifications respect weather alert setting

**Test 2: Rain Alerts Toggle**
- Open Settings → Alerts tab
- Rain Alerts shows "Enabled"
- Click toggle → "Disabled"
- Close settings
- Search a rainy city (e.g., Seattle)
- Verify no "Rain Expected Tomorrow" notification (since rainAlertsEnabled is false)
- Open Settings → Toggle "Enabled"
- Search a different rainy city
- Verify "Rain Expected Tomorrow" notification appears

**Expected:** ✅ Rain notifications respect rain alert setting

**Test 3: Severe Weather Alerts**
- Open Settings → Alerts tab
- Severe Weather Alerts shows toggle
- Toggle on/off
- Verify it persists after refresh
- (Future: will affect severe weather notifications)

**Expected:** ✅ Severe weather alert setting persists

**Test 4: App Notifications Toggle**
- Open Settings → Alerts tab
- App Notifications shows "Enabled"
- Click toggle → "Disabled"
- Close settings
- Search a city
- Verify NO notifications appear (Bell icon has no dot)
- Open Settings → Toggle "Enabled"
- Search a different city
- Verify notifications appear (Bell icon shows blue dot)

**Expected:** ✅ All notifications respect app notifications setting

---

### Data Tab Tests

**Test 1: Clear Recent Searches**
- Search 5 different cities ("Paris", "London", "Tokyo", "Dubai", "Sydney")
- Open Navbar search dropdown
- Verify all 5 appear in "Recent Searches"
- Open Settings → Data tab
- Click "Clear Recent Searches" button
- Open Navbar search dropdown
- Verify "Recent Searches" section is empty (or says "No recent searches")
- Verify favorites still there (not affected)

**Expected:** ✅ Clear Recent Searches clears only recent searches, not favorites

**Test 2: Clear All Notifications**
- Generate 5 notifications (search 5 cities)
- Open Notification Center (Bell icon)
- Verify 5 notifications visible
- Open Settings → Data tab
- Click "Clear All Notifications" button
- Open Notification Center
- Verify shows "All caught up!" (empty state)
- Verify Bell icon has no dot (no unread)

**Expected:** ✅ Clear All Notifications removes all notifications

**Test 3: Reset to Defaults**
- Change Temperature to Fahrenheit
- Change Wind to mph
- Change Pressure to inHg
- Change Precipitation to inches
- Change Time Format to 12h
- Change Default City to "London"
- Change Auto Refresh to 60 minutes
- Toggle some alerts off
- Open Settings → Data tab
- Click "Reset to Defaults" button
- Verify all settings revert:
  - Temperature → Celsius
  - Wind → km/h
  - Pressure → hPa
  - Precipitation → mm
  - Time Format → 24h
  - Default City → "San Francisco"
  - Auto Refresh → 30
  - Alerts → All enabled

**Expected:** ✅ Reset to Defaults restores all defaults

---

### About Tab Tests

**Test 1: Application Info**
- Open Settings → About tab
- Verify shows:
  - Application: Weather Dashboard
  - Version: 1.0.0
  - Weather API: Open-Meteo
  - Database: SQLite/MySQL
- All display correctly

**Expected:** ✅ About info shows correctly

**Test 2: Last Refresh Time**
- Open Settings → About tab
- Last Refresh should show "Never"
- Go to Dashboard
- Search for a city
- Open Settings → About tab
- Last Refresh should now show timestamp (e.g., "6/22/2026, 10:30:45 AM")
- Timestamp should be roughly current time

**Expected:** ✅ Last refresh time updates on weather fetch

**Test 3: Saved Locations Count**
- Open Settings → About tab
- Saved Locations shows "0 locations saved" (or current count)
- Go to Dashboard
- Click Save on a weather card
- Open Settings → About tab
- Saved Locations now shows "1 location saved"
- Add 2 more locations
- Verify count shows "3 locations saved"

**Expected:** ✅ Saved locations count updates in real-time

---

### Responsive Design Tests

**Test 1: Desktop (1024px+)**
- Open Settings
- 5 tabs visible in one row
- All settings readable
- No text wrapping issues
- Input fields full width

**Expected:** ✅ Settings display correctly on desktop

**Test 2: Tablet (768px)**
- Open DevTools (F12)
- Toggle device toolbar (Ctrl+Shift+M)
- Select iPad
- Open Settings
- Verify tabs scrollable if needed
- Verify all settings visible and clickable
- Verify input fields work on tablet

**Expected:** ✅ Settings usable on tablet

**Test 3: Mobile (375px)**
- Select iPhone 12
- Open Settings
- Verify panel fits on screen
- Verify tabs scroll horizontally
- Verify all buttons clickable
- Verify text readable
- Verify input fields work on mobile
- Type in text input (keyboard appears)

**Expected:** ✅ Settings fully functional on mobile

---

### Integration Tests

**Test 1: Settings Don't Break Dashboard**
- Apply multiple settings changes
- Close settings
- Verify weather still loads
- Verify current weather card displays
- Verify forecast displays
- Verify analytics accessible

**Expected:** ✅ Dashboard unaffected by settings

**Test 2: Settings Don't Break Saved Locations**
- Create several saved locations
- Open Settings, change settings
- Close settings
- Click Saved Locations tab
- Verify all locations still there
- Delete one location
- Verify notification respects alert settings

**Expected:** ✅ Saved Locations unaffected

**Test 3: Settings Don't Break Notifications**
- Open Notification Center (Bell)
- Add several notifications (search cities)
- Open Settings, toggle notification alerts
- Close settings
- Verify Bell icon reflects unread count correctly
- Verify new notifications respect alert settings

**Expected:** ✅ Notifications respect settings

**Test 4: Settings Don't Break Quick Access**
- View Quick Access cards
- Open Settings, change settings
- Close settings
- Verify all 4 Quick Access cards still show data
- Verify cards update on city change

**Expected:** ✅ Quick Access unaffected

---

### UI/UX Tests

**Test 1: Tab Switching**
- Open Settings
- Click each tab (General → Dashboard → Alerts → Data → About)
- Verify content changes
- Verify active tab highlighted in blue
- Verify inactive tabs gray

**Expected:** ✅ Tab navigation smooth and clear

**Test 2: Animations**
- Toggle animations in General tab
- Watch toggle switch (spring animation)
- Change tabs
- Watch tab underline animate
- Open/close panel
- Watch fade and slide animations

**Expected:** ✅ Smooth animations with Framer Motion

**Test 3: Hover Effects**
- Hover over SegmentedControl buttons
- Verify hover color change
- Hover over Data tab buttons
- Verify button color change on hover
- Hover over each tab
- Verify visual feedback

**Expected:** ✅ Clear hover feedback on all interactive elements

**Test 4: Click Outside/Escape**
- Open Settings
- Click outside the panel (on backdrop)
- Verify panel closes smoothly
- Open Settings
- Press Escape key
- Verify panel closes
- Open Settings
- Click X button
- Verify panel closes

**Expected:** ✅ All close methods work

**Test 5: Color Coding**
- Verify each setting row has different icon color
- Verify active toggle is blue
- Verify disabled button is gray with lock
- Verify reset button turns red on hover
- Verify all colors match dashboard design

**Expected:** ✅ Consistent color scheme

---

### Edge Cases

**Test 1: Empty Default City**
- Clear Default City field
- Leave it empty
- Close settings
- Refresh browser
- Open settings
- Verify field shows empty
- (App should handle empty gracefully)

**Expected:** ✅ Empty city doesn't crash app

**Test 2: Invalid Auto Refresh Values**
- Try typing "abc" in Auto Refresh
- Verify it doesn't accept non-numbers
- Try "-10"
- Verify it converts to valid range
- Try decimal "15.5"
- Verify it handles decimal correctly

**Expected:** ✅ Input validation works

**Test 3: Rapid Setting Changes**
- Rapidly toggle animations on/off 10 times
- Rapidly change temperature unit 10 times
- Verify no lag or crashes
- Refresh browser
- Verify last setting was saved

**Expected:** ✅ No performance issues with rapid changes

**Test 4: Multiple Settings at Once**
- Change 5-6 settings simultaneously
- Close/reopen settings
- Verify all changes persisted together

**Expected:** ✅ Multiple settings persist correctly together

---

## Final Verification Checklist

- [ ] All 12 settings display correctly
- [ ] All 12 settings save to localStorage
- [ ] All 12 settings persist after browser refresh
- [ ] All 5 tabs display correct content
- [ ] Tab switching works smoothly
- [ ] All buttons respond to clicks
- [ ] All toggle switches animate
- [ ] All text inputs accept typed text
- [ ] Number inputs enforce valid range
- [ ] Clear buttons remove data correctly
- [ ] Reset button restores all defaults
- [ ] No crashes or errors
- [ ] No performance issues
- [ ] Settings don't break dashboard
- [ ] Settings don't break analytics
- [ ] Settings don't break notifications
- [ ] Settings don't break saved locations
- [ ] Settings don't break quick access
- [ ] Responsive on mobile, tablet, desktop
- [ ] All icons visible and colored correctly
- [ ] Panel opens/closes smoothly
- [ ] Click outside closes panel
- [ ] Escape key closes panel
- [ ] X button closes panel
- [ ] Settings are immediately applied
- [ ] No page reload required

---

## Production Sign-Off

When all tests pass:

✅ Settings page is complete and production-ready
✅ No breaking changes to existing features
✅ All 12 settings implemented and functional
✅ All 5 tabs implemented and functional
✅ Full localStorage persistence
✅ No backend dependencies
✅ Responsive design
✅ Accessibility features
✅ Error handling
✅ Ready for deployment

