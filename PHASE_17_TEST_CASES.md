# Phase 17 Testing Guide: Complete Test Cases

## Test Environment Setup

### Prerequisites
- Backend running: `python main.py`
- Frontend running: `npm start`
- Gemini API key configured
- Chat UI accessible

### Test Tool
Use the browser DevTools Network tab to verify API calls:
1. Open Chrome DevTools (F12)
2. Go to Network tab
3. Filter to XHR requests
4. Look for `/api/ai/chat` calls

## Test Cases

### Test 1: Basic City Detection

**Scenario:** User asks about a city different from dashboard current city

**Steps:**
1. Set dashboard to San Francisco
2. Open chat
3. Send: "What's the weather in Mumbai?"

**Expected:**
- AI detects Mumbai
- Fetches weather for Mumbai
- Response mentions Mumbai, not SF
- Network tab shows 1 API call to `/api/ai/chat`

**Verification:**
```
Response should include:
✓ "Mumbai" mentioned (not "San Francisco")
✓ Mumbai-specific weather data (temperature, humidity)
✓ No dashboard context used
```

**Related Files to Check:**
- city_detection.py: detect_cities_in_text() called
- weather_context_resolver.py: resolve_context() called
- ai_service.py: line 399-403 executed

---

### Test 2: Follow-up Question (Conversation Memory)

**Scenario:** User asks about city, then follow-up question

**Steps:**
1. Set dashboard to London
2. Open chat
3. Send: "What's the weather in Tokyo?"
   - Wait for response
4. Send: "What about tomorrow?"

**Expected:**
- Q1 Response: About Tokyo current weather
- Q2 Response: About Tokyo tomorrow (not London)
- Second API call should use cache (faster)

**Verification:**
```
Q1 Response:
✓ Tokyo mentioned
✓ Current conditions

Q2 Response:
✓ Tokyo mentioned
✓ Tomorrow's forecast for Tokyo
✓ No mention of London
✓ Response faster (cached)
```

**Cache Verification:**
```python
from app.weather_context_resolver import WEATHER_CONTEXT_CACHE
print(WEATHER_CONTEXT_CACHE)
# Should contain: 'Tokyo': (context, timestamp)
```

---

### Test 3: Explicit City Change

**Scenario:** User switches to different city after follow-up

**Steps:**
1. Set dashboard to Berlin
2. Open chat
3. Send: "What's the weather in Paris?"
4. Send: "What about Monday?" (follow-up)
5. Send: "How's the weather in London?"

**Expected:**
- Q1: Paris weather
- Q2: Paris Monday forecast (follow-up continues)
- Q3: London weather (new city detected, context switches)

**Verification:**
```
Q1: "Paris" in response
Q2: "Paris" + "Monday" or future date
Q3: "London" in response (not Paris)
```

---

### Test 4: Comparison Questions

**Scenario:** User asks to compare two cities

**Steps:**
1. Set dashboard to any city
2. Send: "Compare Mumbai and Delhi weather"

**Expected:**
- Both cities detected
- Both contexts fetched
- Response compares both cities
- Shows data for Mumbai AND Delhi

**Verification:**
```
Response should include:
✓ "Mumbai" mentioned with data
✓ "Delhi" mentioned with data
✓ Comparison (e.g., "Mumbai is hotter than Delhi")
```

**Alternative Comparison Formats:**
- "Mumbai vs Delhi"
- "Mumbai and Delhi weather comparison"
- "Weather difference between Mumbai and Delhi"
- "How does Mumbai compare to Delhi?"

---

### Test 5: Same City as Dashboard

**Scenario:** User asks about city already loaded on dashboard

**Steps:**
1. Set dashboard to New York
2. Open chat
3. Send: "What's the weather in New York?"

**Expected:**
- AI answers about New York
- Uses dashboard's current context (no new fetch)
- Response is instant (no API call for weather)

**Verification:**
```
✓ Response mentions New York
✓ Uses current dashboard data
✓ Fast response (no context fetch)
```

**Network Verification:**
- Only 1 API call: `/api/ai/chat`
- No additional weather API calls

---

### Test 6: No City Mentioned

**Scenario:** User asks generic weather question without city

**Steps:**
1. Set dashboard to Sydney
2. Send: "What's the weather today?"

**Expected:**
- AI answers about Sydney (current dashboard city)
- No context switch needed
- Uses current dashboard WeatherContext

**Verification:**
```
Response should mention:
✓ "Sydney" or "today in Sydney"
✓ Current dashboard weather data
```

---

### Test 7: Unknown City

**Scenario:** User asks about city not in database

**Steps:**
1. Send: "Weather in FakeCity123?"

**Expected:**
- Friendly error message
- No crash or technical error
- Example: "I couldn't find weather information for that city."

**Verification:**
```
Response should be:
✓ User-friendly
✓ Not a technical error
✓ Suggests alternative (optional)
```

**Check Logs:**
```
Should show:
"Could not fetch weather for FakeCity123"
(no stack trace exposed to user)
```

---

### Test 8: Cached Result

**Scenario:** Ask about same city twice within cache duration

**Steps:**
1. Send: "Weather in Paris?"
   - Note the response time
   - Wait 10 seconds
2. Send: "Weather in Paris?" (again)
   - Note the response time

**Expected:**
- First request: Slower (fetches weather ~2-3 sec)
- Second request: Faster (uses cache ~0.5-1 sec)

**Verification:**
```python
# Check logs for cache hit:
"Using cached weather for Paris"  # 2nd request
"Fetching weather for Paris"      # 1st request
```

**Timing Comparison:**
```
First call:  ~2-3 seconds (fetch + Gemini)
Second call: ~0.5-1 second (cache + Gemini)
Difference: ~2 seconds faster
```

---

### Test 9: Cache Expiry

**Scenario:** Cache expires and needs refresh

**Steps:**
1. Send: "Weather in Barcelona?"
2. Wait 31+ minutes
3. Send: "Weather in Barcelona?" (again)

**Expected:**
- First call: Uses fetch
- After 31 min: New fetch (cache expired)
- Response times similar to Test 1 & 2

**Verification:**
```python
# Check timestamp:
import datetime
from app.weather_context_resolver import WEATHER_CONTEXT_CACHE

context, timestamp = WEATHER_CONTEXT_CACHE.get('Barcelona')
age = datetime.datetime.now() - timestamp
print(f"Cache age: {age.total_seconds()} seconds")
# Should show > 1800 seconds for expired cache
```

---

### Test 10: Conversation Memory Persistence

**Scenario:** Chat maintains memory across city switches

**Steps:**
1. Send: "Weather in Tokyo?"
2. Send: "Any storms expected?"
3. Send: "Weather in Singapore?"
4. Send: "Will it rain?"

**Expected:**
- Q2: References Tokyo
- Q4: References Singapore (not Tokyo)
- Chat history shows all cities

**Verification:**
```
Chat UI should show:
Q1: "What about Tokyo?"
A1: "Tokyo weather..."
Q2: "Any storms expected?" → continues Tokyo
A2: "In Tokyo, no storms..."
Q3: "Weather in Singapore?"
A3: "Singapore weather..."
Q4: "Will it rain?" → continues Singapore
A4: "In Singapore, rain expected..."
```

---

### Test 11: Multiple Cities in One Question

**Scenario:** User mentions multiple cities in single question

**Steps:**
1. Send: "Is Mumbai cooler than Delhi today?"

**Expected:**
- Detects: ['Mumbai', 'Delhi']
- Recognizes as comparison
- Provides comparison answer

**Verification:**
```
Response should:
✓ Compare Mumbai and Delhi
✓ Show data for both
✓ Answer the question
```

---

### Test 12: City Alias Detection

**Scenario:** User mentions city by alias

**Steps:**
1. Send: "Weather in Bombay?"
   - Bombay is alias for Mumbai
2. Send: "Weather in Bengaluru?"
   - Bengaluru is alias for Bangalore
3. Send: "Weather in NYC?"
   - NYC is alias for New York

**Expected:**
- All detected correctly
- Canonical names used (Mumbai, Bangalore, New York)
- No duplicates if both mentioned

**Verification:**
```python
from app.city_detection import detect_cities_in_text

text1 = "Bombay weather"
print(detect_cities_in_text(text1))
# Should output: ['Mumbai']

text2 = "Compare Bombay and Mumbai"
print(detect_cities_in_text(text2))
# Should output: ['Mumbai'] (deduped)
```

---

### Test 13: Case Sensitivity

**Scenario:** User asks with different casings

**Steps:**
1. Send: "Weather in MUMBAI?"
2. Send: "Weather in mumbai?"
3. Send: "Weather in Mumbai?"

**Expected:**
- All detected correctly
- All responses the same

**Verification:**
```
All three should:
✓ Detect "Mumbai"
✓ Return same weather data
```

---

### Test 14: Partial City Names

**Scenario:** User mentions partial city name

**Steps:**
1. Send: "San Fran" (incomplete - should match "San Francisco")
2. Send: "New Y" (incomplete - should match "New York")

**Expected:**
- Partial matches work (implementation dependent)
- Or handled gracefully with error

**Verification:**
```python
from app.city_detection import normalize_city_name

result1 = normalize_city_name("San Fran")
result2 = normalize_city_name("New Y")
# Check if they match expected cities
```

---

### Test 15: Mixed Keywords and Cities

**Scenario:** Question with complex wording

**Steps:**
1. Send: "I'm planning to visit Mumbai next week. How's the weather?"
2. Send: "Should I go to Delhi or Bangalore?"
3. Send: "Tell me about monsoon season in Goa"

**Expected:**
- Cities detected correctly despite complex phrasing
- Comparison in Q2
- Seasonal reference in Q3

**Verification:**
```python
from app.city_detection import detect_cities_in_text

q1 = "I'm planning to visit Mumbai next week"
print(detect_cities_in_text(q1))  # ['Mumbai']

q2 = "Should I go to Delhi or Bangalore?"
print(detect_cities_in_text(q2))  # ['Delhi', 'Bangalore']

q3 = "Tell me about monsoon in Goa"
print(detect_cities_in_text(q3))  # ['Goa']
```

---

## Performance Tests

### Test 16: Response Time Benchmark

**Scenario:** Measure end-to-end response time

**Steps:**
1. Set dashboard to any city
2. Send multiple city questions
3. Measure response times

**Expected Times:**
```
First question (cold):     ~2-3 seconds
Follow-up (from cache):    ~0.5-1 second
Different city (cold):     ~2-3 seconds
Different city (cached):   ~0.5-1 second
Comparison (new cities):   ~3-4 seconds
Same city (no fetch):      ~1-2 seconds
```

**Measurement:**
```
Browser DevTools → Network tab:
- Select `/api/ai/chat` request
- Check "Time" column
- Subtract from request start to response end
```

---

### Test 17: API Call Reduction

**Scenario:** Verify caching reduces API calls

**Steps:**
1. Count API calls for series of questions:
   - Q1: City A
   - Q2: Follow-up (City A)
   - Q3: Follow-up (City A)
   - Q4: City B
   - Q5: Follow-up (City B)

**Expected:**
```
Without caching: 5 API calls
With caching:    2 API calls (A and B only)
```

**Verification:**
```
Check logs:
"Fetching weather for City A"   ✓ (Q1)
"Using cached weather for City A" ✓ (Q2, Q3)
"Fetching weather for City B"   ✓ (Q4)
"Using cached weather for City B" ✓ (Q5)
```

---

## Edge Cases

### Test 18: Empty City Name

**Steps:**
1. Send: "Weather in ?"
2. Send: "Weather in  " (spaces only)

**Expected:**
- Handled gracefully
- Either no city detected or friendly error

---

### Test 19: City Name in Middle of Word

**Steps:**
1. Send: "I love Bangalore's vibe"
   - Should detect Bangalore
2. Send: "The sandy beach is great"
   - Should NOT detect "sand" as city

**Expected:**
- Word boundaries respected
- No false positives

**Verification:**
```python
from app.city_detection import detect_cities_in_text

# Should detect:
print(detect_cities_in_text("I love Bangalore"))  # ['Bangalore']

# Should NOT detect "and" as city:
print(detect_cities_in_text("sandy beach"))  # []
```

---

### Test 20: Very Long Question

**Steps:**
1. Send a very long question: "I was wondering what the weather is like in Mumbai today and if I should bring an umbrella when I go out for my daily walk, and also what the forecast is for tomorrow in Mumbai"

**Expected:**
- Still detects Mumbai correctly
- Handles long text gracefully
- Response about Mumbai

---

## Error Recovery Tests

### Test 21: API Failure Graceful Degradation

**Scenario:** Weather fetch fails, should degrade gracefully

**Steps:**
1. (Simulate API failure by stopping backend momentarily, or check logs)
2. Send: "Weather in Mumbai?"

**Expected:**
- User sees friendly message
- Falls back to current context if available
- No crash

---

### Test 22: Gemini API Failure

**Scenario:** Gemini API fails

**Expected:**
- User sees: "I'm sorry, something went wrong..."
- Not a technical error message
- Can retry

---

## Conversation Management Tests

### Test 23: Clear Conversation

**Steps:**
1. Send: "Weather in Mumbai?"
2. Send: "What about tomorrow?"
3. Clear conversation (button/endpoint)
4. Send: "What about tomorrow?"

**Expected:**
- Before clear: Q2 continues with Mumbai
- After clear: Q2 doesn't know context (new conversation)

---

### Test 24: New Conversation

**Steps:**
1. In Chat 1: Ask about Mumbai
2. Open new chat conversation
3. Send: "What about tomorrow?"

**Expected:**
- New chat doesn't know about Mumbai
- Treats as generic question about current dashboard city

---

## Summary Checklist

- [ ] Test 1: Basic city detection
- [ ] Test 2: Follow-up question
- [ ] Test 3: Explicit city change
- [ ] Test 4: Comparison
- [ ] Test 5: Same city as dashboard
- [ ] Test 6: No city mentioned
- [ ] Test 7: Unknown city
- [ ] Test 8: Cached result
- [ ] Test 9: Cache expiry
- [ ] Test 10: Conversation memory
- [ ] Test 11: Multiple cities
- [ ] Test 12: City alias
- [ ] Test 13: Case sensitivity
- [ ] Test 14: Partial names
- [ ] Test 15: Mixed keywords
- [ ] Test 16: Response time
- [ ] Test 17: API reduction
- [ ] Test 18: Empty input
- [ ] Test 19: Word boundaries
- [ ] Test 20: Long questions
- [ ] Test 21: API failure
- [ ] Test 22: Gemini failure
- [ ] Test 23: Clear conversation
- [ ] Test 24: New conversation

## Quick Test Script

Run in browser console:
```javascript
// Test 1: Basic question
await fetch('/api/ai/chat', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    user_question: "Weather in Mumbai?",
    weather_context: currentContext,
    response_mode: "detailed"
  })
}).then(r => r.json()).then(data => console.log(data.ai_response))

// Test 2: Follow-up
await fetch('/api/ai/chat', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    user_question: "What about tomorrow?",
    weather_context: currentContext,
    response_mode: "detailed",
    conversation_id: "test123"
  })
}).then(r => r.json()).then(data => console.log(data.ai_response))
```

---

**All tests should pass for Phase 17 completion!**
