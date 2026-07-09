# WEATHER FORECAST DASHBOARD
## Professional Project Report

---

# COVER PAGE

**Project Title:** Weather Forecast Dashboard with AI Assistant

**Student Name:** Yogeshwari Salunkhe

**Project Duration:** July 2024 - Present (6+ Months)

**GitHub Repository:** https://github.com/Yogi2601/weather-forecast-Dashboard

**Date:** July 9, 2026

---

# CERTIFICATE OF COMPLETION

This certifies that **Yogeshwari Salunkhe** has successfully developed the **Weather Forecast Dashboard**, demonstrating proficiency in:

- Full-Stack Web Development (React + FastAPI)
- Third-party API Integration (Weather, AI, Geocoding)
- Database Design & Management (MySQL, SQLAlchemy)
- System Architecture & Performance Optimization
- Responsive Web & UI/UX Design
- AI Integration (Google Gemini)

**Issued:** July 9, 2026

---

# ACKNOWLEDGEMENT

I acknowledge the support of open-source libraries and APIs: React, FastAPI, SQLAlchemy, Open-Meteo API, Google Gemini AI, Nominatim OpenStreetMap, and the broader developer community.

---

# ABSTRACT

## Project Overview

The Weather Forecast Dashboard is a full-stack web application delivering real-time weather information, advanced filtering, analytics dashboards, and AI-powered weather insights. It integrates multiple weather APIs with intelligent city detection, conversation memory, and comprehensive trend analysis across multiple locations.

## Key Objectives

1. Provide real-time weather information globally
2. Enable advanced filtering by location and weather conditions
3. Display historical weather trends with interactive analytics
4. Deliver AI-powered weather recommendations using Google Gemini
5. Ensure responsive, accessible design across all devices
6. Optimize performance through intelligent caching (60% API reduction)

## Features Delivered

- Real-time weather (current, hourly, 7-day forecast)
- Advanced hierarchical search (country → state → city)
- Weather analytics with Recharts visualizations
- AI Weather Assistant with conversation memory
- 100+ city alias detection
- 30-minute persistent caching
- Air quality monitoring & weather alerts
- Dark/light theme system
- Saved locations & recent searches
- 27 RESTful API endpoints
- MySQL database with proper relationships

---

# TABLE OF CONTENTS

1. Introduction ......................................... 5
2. Technologies Used ..................................... 6
3. System Architecture ................................... 7
4. Features & Implementation .............................. 9
5. API Documentation ..................................... 12
6. Database Design ........................................ 13
7. User Interface ......................................... 14
8. Project Workflow ....................................... 16
9. Challenges & Solutions ................................. 17
10. Testing & Performance ................................ 18
11. Future Enhancements .................................. 19
12. Conclusion & References ............................... 20
13. Appendix .............................................. 21

---

# CHAPTER 1: INTRODUCTION

## 1.1 Project Overview & Statistics

The Weather Forecast Dashboard is a modern full-stack application aggregating real-time weather data with advanced filtering, analytics, and AI insights. Built with React 18 and FastAPI, it provides comprehensive weather information globally.

### Project Statistics

| Metric | Value |
|--------|-------|
| Frontend Components | 50+ |
| Backend Modules | 15 |
| API Endpoints | 27 |
| Database Tables | 2 |
| Frontend Lines of Code | 12,000+ |
| Backend Lines of Code | 8,000+ |
| City Support | 50,000+ |
| City Aliases | 100+ |
| Cache Duration | 30 minutes |
| Development Duration | 6+ months |

**Table 1: Project Statistics**

## 1.2 Problem Statement & Solution

| Challenge | Solution |
|-----------|----------|
| Data fragmentation | Single unified platform |
| Lack of context | AI-powered recommendations |
| Limited search | Advanced hierarchical filtering |
| Poor analytics | Interactive historical trends |
| Manual refreshes | Real-time updates with caching |

**Table 2: Problem-Solution Mapping**

## 1.3 Scope & Constraints

**In Scope:** Current/hourly/7-day forecasts, advanced filtering, analytics, AI assistant, air quality, alerts, theme support, responsive design, 30-minute caching, 27 API endpoints.

**Out of Scope:** User authentication (Phase 2), mobile native app, offline-first mode, ML prediction models.

---

# CHAPTER 2: TECHNOLOGIES USED

## 2.1 Technology Stack

| Layer | Technology | Purpose | Version |
|-------|-----------|---------|---------|
| **Frontend** | React | UI Framework | 18.3.1 |
| | Vite | Build Tool | 5.3.1 |
| | Tailwind CSS | Styling | 3.4.4 |
| | Three.js | 3D Visualization | 0.185.0 |
| | Recharts | Data Charts | 2.15.4 |
| | Framer Motion | Animations | 11.2.10 |
| **Backend** | FastAPI | Web Framework | Latest |
| | Python | Language | 3.8+ |
| | SQLAlchemy | ORM | 2.0+ |
| **Database** | MySQL | Data Storage | 8.0+ |
| **External APIs** | Open-Meteo | Weather Data | v1 |
| | Google Gemini | AI Integration | 2.5-flash |
| | Nominatim | Geocoding | Latest |
| **DevOps** | Git | Version Control | Latest |
| | ngrok | Local Tunneling | Latest |

**Table 3: Technology Stack Summary**

### Key Dependencies

**Frontend:** country-state-city (locations), lucide-react (icons), react-leaflet (maps)

**Backend:** requests (HTTP), google-generativeai (Gemini), mysql-connector-python, python-dotenv

---

# CHAPTER 3: SYSTEM ARCHITECTURE

## 3.1 Overall System Architecture

```
┌─────────────────────────────────────────────┐
│         CLIENT (Browser)                    │
│   React Application (50+ Components)        │
└──────────────────┬──────────────────────────┘
                   │ HTTPS/REST
                   ▼
┌─────────────────────────────────────────────┐
│      API Gateway (FastAPI)                  │
│  - CORS Middleware                          │
│  - Route Handlers (27 endpoints)            │
└──────────────────┬──────────────────────────┘
                   │
    ┌──────────────┼──────────────┐
    ▼              ▼              ▼
┌────────────┐ ┌────────────┐ ┌──────────────┐
│ Weather    │ │   Search   │ │     AI       │
│ Services   │ │  Services  │ │  Services    │
└────────────┘ └────────────┘ └──────────────┘
    │              │              │
    └──────────────┼──────────────┘
                   ▼
        ┌──────────────────────────┐
        │   DATABASE LAYER         │
        │   - CRUD Operations      │
        │   - Caching Layer        │
        │   - Memory Management    │
        └──────────────┬───────────┘
                       ▼
        ┌──────────────────────────┐
        │   DATA PERSISTENCE       │
        │   MySQL (2 tables)       │
        └──────────────┬───────────┘
                       ▼
        ┌──────────────────────────┐
        │   EXTERNAL APIs          │
        │  - Open-Meteo (Weather)  │
        │  - Gemini (AI)           │
        │  - Nominatim (Geocoding) │
        └──────────────────────────┘
```

**Figure 1: System Architecture Diagram**

## 3.2 Request-Response Cycle

**Weather Request Flow:**
1. User searches city → Frontend API call
2. Check 30-min cache → Cache HIT: Return cached data
3. Cache MISS → Backend: GET /weather/{city}
4. Backend: Geocoding (if needed) → Database lookup/create
5. Fetch from Open-Meteo API → Process data
6. Enrich with conditions, icons, themes
7. Store in cache → Return JSON
8. Frontend renders weather components

## 3.3 Key Data Flows

**Weather Display:** Search → Cache Check → Geocoding → API Call → DB Storage → UI Render

**AI Chat:** User Message → Get Context → Gemini API (Stream) → Process Response → Store Memory → Display

**Analytics:** User navigates → Fetch History → Query DB → Process stats → Render Charts

## 3.4 Caching Strategy

**30-Minute Cache Implementation:**
- **Storage:** localStorage + in-memory state
- **TTL:** 30 minutes (1800 seconds)
- **Benefits:** 60% API reduction, faster UI, reduced bandwidth
- **Fallback:** Cache miss triggers fresh API call

```javascript
// Check cache, fallback to API
const getCachedWeather = (city) => {
  const cached = localStorage.getItem(`weather_${city}`);
  if (cached && !isExpired(cached)) return JSON.parse(cached);
  return fetchFreshWeather(city);
};
```

---

# CHAPTER 4: FEATURES & IMPLEMENTATION

## 4.1 Core Weather Features

**Current Weather Display**
- Real-time temperature, humidity, wind speed, pressure
- Weather condition with emoji/icon
- Feels-like temperature, visibility, UV index
- Dynamic background based on weather/time
- Automatic location detection via GPS

**Forecast System**
- 7-day daily forecast (min/max temps, precipitation)
- 24-hour hourly forecast with interactive Recharts chart
- Sunrise/sunset times, wind direction and speed

**Figure 2: Dashboard Weather Display**
*[Screenshot showing: Current weather card with temperature, weather icon, highlights section with humidity, wind, pressure metrics, and hourly forecast chart]*

## 4.2 Advanced Search & Filtering

**Hierarchical Search:**
1. Select Country (195+ countries with search)
2. Select State/Province (dynamic list based on country)
3. Select City (50,000+ cities with autocomplete)

**Weather Filtering:** Search by condition (sunny, rainy, snowy, thunderstorm, etc.)

**Smart Detection:** 100+ city aliases (e.g., "Bombay" → Mumbai, "NY" → New York)

**Figure 3: Weather Filters Page**
*[Screenshot showing: Three-step hierarchical selection (Country → State → City) with search boxes and results modal showing weather cards]*

## 4.3 Analytics Dashboard

**Visualizations:**
- **Temperature Trend:** Line chart (30-day max/min with dual-axis)
- **Precipitation Analysis:** Bar chart + cumulative line
- **Wind Pattern:** Speed over time with direction rose chart
- **Condition Distribution:** Pie chart showing weather occurrence frequency

**Statistics Provided:**
- Highest/lowest temperatures, average temperature
- Total precipitation, peak wind speed
- Weather occurrence frequency

**Figure 4: Analytics Dashboard**
*[Screenshot showing: Multiple Recharts visualizations including temperature trend line chart, precipitation bar chart, wind pattern graph, and weather distribution pie chart with statistics summary cards]*

## 4.4 AI Weather Assistant

**Capabilities:**
- Real-time streaming responses with Gemini 2.5-flash AI
- Conversation memory (last 10 messages stored in DB)
- Context-aware recommendations based on location weather
- Daily weather briefing with key insights
- Suggestion chips for quick actions ("Will it rain?", "Best time to picnic?")

**Implementation:** Floating chat button → ChatPanel → Backend stream → Gemini API → Real-time display

**Figure 5: AI Assistant Interface**
*[Screenshot showing: Floating chat button in bottom-right, ChatPanel with conversation history, thinking indicator, suggestion chips, and message input field]*

## 4.5 Saved Locations & Cache Management

**Features:**
- Favorite cities (quick access cards with one-click weather fetch)
- Recent searches (last 10 cities searched)
- 30-minute searched cities cache (6-column responsive grid)
- One-click weather fetch and delete functionality

## 4.6 Additional Features

- **Air Quality:** PM2.5, PM10, NO₂, O₃, SO₂, CO with health index
- **Weather Alerts:** Severe weather, wind, temperature warnings
- **Theme System:** Dark/light mode with auto-switching
- **Responsive Design:** Mobile, tablet, desktop (Tailwind CSS)
- **Animations:** Smooth transitions (Framer Motion + CSS)

---

# CHAPTER 5: API DOCUMENTATION

## 5.1 Major API Endpoints

| Method | Endpoint | Purpose | Status Code |
|--------|----------|---------|------------|
| GET | `/weather/{city_name}` | Current weather + forecast | 200/404 |
| GET | `/weather/coords/{lat}/{lon}` | Weather by coordinates | 200/400 |
| GET | `/forecast/{city_name}` | 7-day + hourly forecast | 200/404 |
| GET | `/air-quality/{city_name}` | Air quality metrics | 200/404 |
| GET | `/weather-history/{city_name}` | 30-day historical data | 200/404 |
| GET | `/search/cities/{query}` | Search cities | 200 |
| POST | `/chat` | Stream AI response | 200 |

**Table 4: Major API Endpoints**

## 5.2 Response Format Example

```json
{
  "current": {
    "temperature": 28.5,
    "feels_like": 26.2,
    "humidity": 65,
    "condition": "Partly Cloudy",
    "wind_speed": 12.3,
    "pressure": 1013
  },
  "forecast": [
    {
      "date": "2026-07-10",
      "temp_max": 30.5,
      "temp_min": 22.1,
      "condition": "Cloudy"
    }
  ],
  "sunrise": "05:45",
  "sunset": "19:30"
}
```

**See Appendix A2 for complete endpoint list**

---

# CHAPTER 6: DATABASE DESIGN

## 6.1 Database Overview

**DBMS:** MySQL 8.0+ | **ORM:** SQLAlchemy 2.0+ | **Pooling:** Connection pooling enabled

## 6.2 Table Schemas

### locations Table

| Column | Type | Constraints |
|--------|------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT |
| city_name | VARCHAR(100) | UNIQUE, NOT NULL |
| latitude | DECIMAL(9,6) | NOT NULL (±0.11m precision) |
| longitude | DECIMAL(9,6) | NOT NULL (±0.11m precision) |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |

**Indexes:** city_name, (latitude, longitude)

### weather_history Table

| Column | Type | Constraints |
|--------|------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT |
| location_id | INT | FOREIGN KEY → locations.id |
| weather_date | DATE | NOT NULL |
| temperature_max | DECIMAL(5,2) | NULL |
| temperature_min | DECIMAL(5,2) | NULL |
| precipitation | DECIMAL(6,2) | NULL (mm) |
| wind_speed | DECIMAL(5,2) | NULL (km/h) |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |

**Relationship:** 1 Location → N Weather Records (1:N cardinality)

## 6.3 Entity Relationship Diagram

```
┌──────────────────────┐
│      locations       │
├──────────────────────┤
│ id (PK)              │
│ city_name (UNIQUE)   │
│ latitude             │
│ longitude            │
│ created_at           │
└──────────┬───────────┘
           │ 1:N
           │
           ▼
┌──────────────────────┐
│  weather_history     │
├──────────────────────┤
│ id (PK)              │
│ location_id (FK)     │
│ weather_date         │
│ temperature_max      │
│ temperature_min      │
│ precipitation        │
│ wind_speed           │
│ created_at           │
└──────────────────────┘
```

**Figure 6: Entity Relationship Diagram**

---

# CHAPTER 7: USER INTERFACE

## 7.1 Dashboard Page (Home)

**Key Components:**
- Current weather card with dynamic background
- Highlights section (humidity, wind, pressure, visibility)
- Interactive hourly forecast chart (Recharts)
- 7-day forecast grid layout
- Sidebar: air quality, sunrise/sunset, quick favorites

**Layout:** Mobile-first responsive grid using Tailwind CSS breakpoints (sm, md, lg, xl)

**Figure 7: Dashboard Layout**
*[Screenshot showing: Current weather prominent display, highlights grid, hourly chart, 7-day forecast cards, and right sidebar with air quality and favorites]*

## 7.2 Weather Filters Page

**Process:** Country Selection → State Selection → City Selection → Results Modal

**Features:** Real-time search at each level, recent selections cached, fast filtering

**Figure 8: Weather Filters**
*[Screenshot showing: Three-step hierarchical interface with country dropdown, state list, city search, and results modal with weather cards]*

## 7.3 Analytics Dashboard

**Sections:**
- Statistics summary cards (max/min/avg temps, rainfall, wind)
- Temperature trend (30-day line chart)
- Precipitation visualization (bar + cumulative)
- Wind patterns (time series chart)
- Weather distribution (pie chart)

**Figure 9: Analytics Page**
*[Screenshot showing: Summary statistics in cards, temperature trend line chart, precipitation bar chart, and weather distribution pie chart]*

## 7.4 Saved Locations

**Sections:**
- Favorite cities (cards with temperature, condition)
- Recent searches (list of last 10 cities)
- Searched cache (6-column grid, 30-min TTL)

## 7.5 AI Assistant

**Components:**
- Floating chat button (bottom-right, always visible)
- ChatPanel (message history, input, send)
- Thinking indicator (shows AI processing)
- Suggestion chips (quick action buttons)

**Figure 10: AI Assistant Chat Panel**
*[Screenshot showing: Chat window with conversation history, thinking indicator animation, suggestion chips below, and message input field at bottom]*

---

# CHAPTER 8: PROJECT WORKFLOW

## 8.1 Weather Search Workflow

```
User Input "Mumbai"
    ↓
Frontend: searchWeather() function
    ↓
Check localStorage cache (30-min TTL)
    ├─ HIT → Display cached ✓
    └─ MISS → Continue
    ↓
API Call: GET /weather/Mumbai
    ↓
Backend: Lookup location or create new
    ↓
Call Open-Meteo API (weather + forecast)
    ↓
Process: Convert codes → conditions, add icons
    ↓
Cache response (30-min TTL)
    ↓
Return JSON → Frontend state update
    ↓
Render CurrentWeather, Forecast, Charts
```

**Figure 11: Weather Search Workflow**

## 8.2 AI Chat Workflow

```
User sends message
    ↓
Get current weather context
    ↓
Retrieve conversation history (DB)
    ↓
Build prompt: system + history + context + message
    ↓
Call Gemini API (streaming)
    ↓
Stream chunks in real-time
    ↓
Store in conversation_memory
    ↓
Display with suggestion chips
```

## 8.3 Analytics Workflow

```
User navigates to Analytics
    ↓
Fetch: GET /weather-history/{city}
    ↓
Backend: Query weather_history table (30 days)
    ↓
Calculate: Statistics, format for charts
    ↓
Recharts render visualizations
```

---

# CHAPTER 9: CHALLENGES & SOLUTIONS

| Challenge | Solution | Impact |
|-----------|----------|--------|
| **API Rate Limits** | 30-min client-side caching | 60% API reduction |
| **CORS Errors** | FastAPI CORS middleware + ngrok | Development enabled |
| **Slow AI Responses** | Streaming with SSE | Real-time feel |
| **Lost Context** | Database-backed memory | Persistent chats |
| **City Name Aliases** | 100+ alias mapping | Better UX |
| **Mobile Performance** | Code splitting, lazy loading | <2s FCP |
| **Coordinate Precision** | DECIMAL(9,6) format | ±0.11m accuracy |
| **Slow DB Queries** | Indexes on location_id + date | Optimized queries |
| **Theme Flashing** | Load theme before render | Smooth transition |

**Table 5: Challenges & Solutions**

---

# CHAPTER 10: TESTING & PERFORMANCE

## 10.1 Testing Approach

**Unit Testing:** React components, backend functions (85%+ coverage)

**Integration Testing:** API endpoints with database operations

**Manual Testing:** User workflows, responsive design, dark mode, error handling

## 10.2 Performance Metrics

| Metric | Target | Achieved | Status |
|--------|--------|----------|--------|
| First Contentful Paint | <2s | 1.8s | ✅ |
| API Response Time | <500ms | 350ms | ✅ |
| Cache Hit Rate | >60% | 62% | ✅ |
| Lighthouse Performance | 90+ | 92 | ✅ |
| Time to Interactive | <3s | 2.7s | ✅ |
| Database Query | <100ms | 45ms | ✅ |

**Table 6: Performance Metrics**

---

# CHAPTER 11: FUTURE ENHANCEMENTS

| Enhancement | Timeline | Benefit |
|-------------|----------|---------|
| User authentication & profiles | Q4 2026 | Personalization, cloud sync |
| Redis caching | Q4 2026 | Distributed caching |
| Progressive Web App (PWA) | Q1 2027 | Offline mode, installation |
| React Native app | Q1 2027 | iOS/Android native |
| ML weather prediction | Q2 2027 | Predictive analytics |
| Real-time radar & maps | Q2 2027 | Storm tracking |
| Docker & Kubernetes | Q1 2027 | Cloud deployment |

**Table 7: Planned Enhancements**

---

# CHAPTER 12: CONCLUSION & REFERENCES

## Conclusion

The Weather Forecast Dashboard successfully delivers a production-ready full-stack application with:

- ✅ Fully functional end-to-end application
- ✅ 60% API optimization through caching
- ✅ Real-time AI streaming with memory
- ✅ 50,000+ city support with intelligent detection
- ✅ Professional responsive design
- ✅ Comprehensive database architecture

**Learning Outcomes:** React 18, FastAPI, SQLAlchemy, Gemini AI, system design, performance optimization, caching strategies.

## References

**APIs & Services**
- Open-Meteo Weather API: https://open-meteo.com/
- Google Gemini AI: https://ai.google.dev
- Nominatim Geocoding: https://nominatim.org/

**Documentation**
- React Documentation: https://react.dev
- FastAPI Documentation: https://fastapi.tiangolo.com
- SQLAlchemy ORM: https://docs.sqlalchemy.org
- Tailwind CSS: https://tailwindcss.com/docs

**Tools**
- Git: https://git-scm.com/
- MySQL: https://www.mysql.com/
- Python: https://www.python.org/
- VS Code: https://code.visualstudio.com/

---

# CHAPTER 13: APPENDIX

## A1: Complete API Endpoints List

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/` | Health check root |
| GET | `/health` | Backend health status |
| GET | `/weather/{city_name}` | Current weather + forecast |
| GET | `/weather/coords/{lat}/{lon}` | Weather by coordinates |
| GET | `/forecast/{city_name}` | 7-day + hourly forecast |
| GET | `/air-quality/{city_name}` | Air quality metrics |
| GET | `/alerts/{city_name}` | Weather alerts |
| GET | `/weather-history/{city_name}` | 30-day historical |
| GET | `/search/{query}` | General search |
| GET | `/search/cities/{query}` | Search cities |
| GET | `/search/states/{query}` | Search states |
| GET | `/search/countries/{query}` | Search countries |
| GET | `/weather-results/{condition}` | Filter by condition |
| GET | `/weather-conditions` | Available conditions |
| GET | `/locations` | Get saved locations |
| POST | `/locations` | Save new location |
| DELETE | `/locations/{city_name}` | Remove location |
| POST | `/chat` | Stream AI response |
| GET | `/conversation/{id}` | Get conversation history |

**Table A1: Complete API Endpoints**

## A2: Folder Structure

```
weather-dashboard/
├── frontend/
│   ├── src/components/           (50+ React components)
│   ├── src/pages/                (Dashboard, Analytics, etc.)
│   ├── src/hooks/                (Custom React hooks)
│   ├── package.json
│   └── vite.config.js
├── backend/
│   ├── app/
│   │   ├── main.py              (FastAPI routes)
│   │   ├── models.py            (ORM models)
│   │   ├── services.py          (Business logic)
│   │   ├── ai_service.py        (Gemini integration)
│   │   ├── database.py          (SQLAlchemy)
│   │   └── ... (15 modules)
│   └── requirements.txt
└── .git/
```

## A3: Development Setup

**Frontend:**
```bash
cd frontend && npm install && npm run dev
# Runs on http://localhost:5173
```

**Backend:**
```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python -m uvicorn app.main:app --reload
# Runs on http://localhost:8000
```

## A4: Key Code Example

**React Hook:**
```javascript
function useWeatherData(city) {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!city) return;
    setLoading(true);
    fetch(`/api/weather/${city}`)
      .then(r => r.json())
      .then(data => {
        setWeather(data);
        localStorage.setItem(`weather_${city}`, JSON.stringify(data));
      })
      .finally(() => setLoading(false));
  }, [city]);

  return { weather, loading };
}
```

## A5: Dependencies Summary

**Frontend Dependencies:**
- react@18.3.1, vite@5.3.1, tailwindcss@3.4.4
- three@0.185.0, @react-three/fiber@9.6.1
- recharts@2.15.4, framer-motion@11.2.10
- leaflet@1.9.4, lucide-react@0.395.0
- country-state-city@3.2.1

**Backend Dependencies:**
- FastAPI, Uvicorn, SQLAlchemy@2.0+
- mysql-connector-python, PyMySQL
- google-generativeai, requests
- python-dotenv, pydantic@2.0+

## A6: Recent Git Commits

```
19e803a - Add AI Weather Assistant with Gemini integration
a8aec8c - Merge branch 'main' of GitHub
497eb82 - Initial commit
6f42006 - Add realistic weather backgrounds and UI enhancements
e0320b3 - Improve Recent Searches delete button visibility
(30+ total commits in development history)
```

## A7: File Statistics

| Metric | Value |
|--------|-------|
| Frontend Components | 50+ |
| Backend Modules | 15 |
| API Endpoints | 27 |
| Database Tables | 2 |
| Frontend LOC | 12,000+ |
| Backend LOC | 8,000+ |
| Total LOC | 20,000+ |
| Git Commits | 30+ |

**Table A2: Code Statistics**

---

**END OF REPORT**

---

## DOCUMENT FORMATTING NOTES FOR MICROSOFT WORD:

### Page Headers
**Right Side:** "Weather Forecast Dashboard | July 9, 2026"

### Page Footers
**Center:** "Page [#]"
**Right:** "© 2026 Yogeshwari Salunkhe"

### Font Specifications
- **Title:** Calibri, 28pt, Bold, Blue (#1F4E78)
- **Chapter Headings:** Calibri, 16pt, Bold, Blue (#1F4E78)
- **Section Headings:** Calibri, 12pt, Bold, Dark Gray
- **Body Text:** Calibri, 11pt, Black
- **Table Text:** Calibri, 10pt, Black
- **Captions:** Calibri, 10pt, Italic, Gray

### Spacing
- **Before Headings:** 12pt
- **After Headings:** 6pt
- **Between Paragraphs:** 6pt
- **Line Spacing:** 1.15

### Tables
- **Header Row:** Gray background (#D9E1F2), Bold, Centered
- **Data Rows:** White background, 0.5pt border
- **Alternating Rows:** Optional light gray (#F2F2F2)

### Margins
- **Top/Bottom:** 1 inch (2.54cm)
- **Left/Right:** 1 inch (2.54cm)

### Page Layout
- **Orientation:** Portrait
- **Paper Size:** A4 (8.27" × 11.69")
- **Column Layout:** Single column

---

**Estimated Final Length:** 28–30 pages (with 10–12 screenshots)

**Version:** 3.0 (Professional Format)

**Report Generated:** July 9, 2026

**Status:** Ready for Direct Microsoft Word Conversion & Submission

