# 05. Process Flow

## Overview

This document details the user interaction flows, data processing workflows, and system process orchestration within the AI Lawyer platform.

---

## 1. User Onboarding Flow

```
START
  ↓
Landing Page
  ↓
[User clicks "Get Started"]
  ↓
Personal Details Form
  ├─ Name
  ├─ Email (optional)
  ├─ Phone (optional)
  └─ Location
  ↓
Education Details
  ├─ Education Level
  ├─ Institution
  └─ Field of Study
  ↓
Purpose Awareness
  ├─ Why using platform?
  │   • Legal Research
  │   • Personal Issue
  │   • Academic Study
  │   • Professional Use
  └─ Area of Interest
  ↓
Dashboard (Main Interface)
  ↓
END
```

### Process Details
1. **Entry Point**: Landing page with value proposition
2. **Data Collection**: Progressive form filling (3 steps)
3. **Local Storage**: Details saved in browser (no backend submission in MVP)
4. **Dashboard Access**: User gains full platform access

---

## 2. IPC Section Search Flow

```
User enters query in search box
  ↓
[Frontend] Validates input
  ↓
[Frontend] Sends API request
  ↓
GET /api/ipc/assistant/search?q={query}
  ↓
[Backend] Receives request
  ↓
[Backend] Converts query to lowercase
  ↓
[Backend] Searches in IPC sections array
  ├─ Check section number
  ├─ Check title
  └─ Check law_text content
  ↓
[Backend] Filters matching results (fuzzy match)
  ↓
[Backend] Limits to top 5 results
  ↓
[Backend] Returns JSON response
  ↓
[Frontend] Receives data
  ↓
[Frontend] Renders results list
  ↓
User clicks on result
  ↓
[Frontend] Displays detailed view
  ├─ Section number
  ├─ Title
  ├─ Full law text
  ├─ Category
  └─ Related sections (if any)
  ↓
END
```

### Search Algorithm Logic
```python
def search_ipc(query):
    query_lower = query.lower()
    results = []
    
    for section in ipc_sections:
        if (query_lower in section["section"].lower() or
            query_lower in section["title"].lower() or
            query_lower in section["law_text"].lower()):
            results.append(section)
    
    return results[:5]  # Top 5 matches
```

---

## 3. Crime Analytics Dashboard Flow

```
User navigates to Analytics → IPC Crime Dashboard
  ↓
[Frontend] Component mounts
  ↓
[Frontend] Calls API endpoint
  ↓
GET /api/crime/summary
  ↓
[Backend] Queries Pandas DataFrame
  ↓
[Backend] Groups data by YEAR
  ↓
[Backend] Aggregates TOTAL IPC CRIMES (sum)
  ↓
[Backend] Converts to JSON format
  ↓
[Backend] Returns response
  ↓
[Frontend] Receives data array
  ↓
[Frontend] Processes for charting library (Recharts)
  ↓
[Frontend] Renders visualizations
  ├─ Line chart (Year-over-year trends)
  ├─ Bar chart (State comparisons)
  └─ Summary statistics
  ↓
User interacts with charts
  ├─ Hover for details
  ├─ Click to filter
  └─ Export data (future)
  ↓
END
```

### Data Transformation Example
```python
# Backend processing
df_grouped = ipc_df.groupby("YEAR")["TOTAL IPC CRIMES"].sum().reset_index()
result = df_grouped.to_dict(orient="records")

# Output format:
[
    {"YEAR": 2018, "TOTAL IPC CRIMES": 2500000},
    {"YEAR": 2019, "TOTAL IPC CRIMES": 2450000},
    {"YEAR": 2020, "TOTAL IPC CRIMES": 2300000}
]
```

---

## 4. Women Crimes Analytics Flow

```
User navigates to Analytics → Women Crimes
  ↓
[Frontend] Page load
  ↓
[Frontend] API call
  ↓
GET /api/women/dashboard
  ↓
[Backend] Loads women_df DataFrame
  ↓
[Backend] Selects crime columns:
  • Rape cases
  • Kidnap & Assault
  • Dowry Deaths
  • Domestic Violence
  • Women Trafficking
  • Assault on Modesty
  ↓
[Backend] Converts columns to numeric
  ↓
[Backend] Sums across columns to get TOTAL
  ↓
[Backend] Groups by State
  ↓
[Backend] Sorts by TOTAL (descending)
  ↓
[Backend] Selects Top 10 states
  ↓
[Backend] Returns JSON
  ↓
[Frontend] Renders dashboard
  ├─ Top 10 States Bar Chart
  ├─ Crime Category Breakdown (Pie Chart)
  ├─ Year-over-Year Trends
  └─ State-wise Heatmap (future)
  ↓
END
```

### Data Processing Logic
```python
crime_cols = ["Rape", "Kidnap", "Dowry Deaths", ...]
df[crime_cols] = df[crime_cols].apply(pd.to_numeric, errors='coerce').fillna(0)
df["TOTAL"] = df[crime_cols].sum(axis=1)

top_states = (
    df.groupby("State")["TOTAL"]
    .sum()
    .sort_values(ascending=False)
    .head(10)
)
```

---

## 5. Case Outcome Prediction Flow

```
User navigates to AI Tools → Case Predictor
  ↓
[Frontend] Displays form
  ├─ Evidence Strength (dropdown)
  │   • Strong
  │   • Moderate
  │   • Weak
  ├─ Past Criminal Record (dropdown)
  │   • Serious
  │   • Minor
  │   • None
  └─ Case Description (textarea)
  ↓
User fills form
  ↓
User clicks "Predict Outcome"
  ↓
[Frontend] Validates form data
  ↓
[Frontend] Sends POST request
  ↓
POST /api/case/predict
Body: {
  "evidence_strength": "Strong",
  "past_record": "None",
  "description": "..."
}
  ↓
[Backend] Receives data
  ↓
[Backend] Runs prediction algorithm
  ├─ Base score: 50
  ├─ Evidence factor:
  │   • Strong: +25
  │   • Moderate: +15
  │   • Weak: +5
  ├─ Past record factor:
  │   • Serious: +10
  │   • Minor: +5
  │   • None: 0
  └─ Caps at 95%
  ↓
[Backend] Calculates probability
  ↓
[Backend] Determines outcome:
  • >= 60% → "Conviction"
  • < 60% → "Acquittal"
  ↓
[Backend] Generates explanation
  ↓
[Backend] Returns JSON response
  ↓
[Frontend] Displays prediction
  ├─ Probability percentage
  ├─ Predicted outcome
  ├─ Key factors
  ├─ AI reasoning
  ├─ Recommended next steps
  └─ Legal disclaimer
  ↓
User reads results
  ↓
[Optional] User saves or shares
  ↓
END
```

### Prediction Algorithm
```python
def predict_case(evidence, past_record):
    score = 50  # Base probability
    
    # Evidence strength contribution
    if evidence == "Strong":
        score += 25
    elif evidence == "Moderate":
        score += 15
    else:  # Weak
        score += 5
    
    # Past record contribution
    if past_record == "Serious":
        score += 10
    elif past_record == "Minor":
        score += 5
    # None: +0
    
    score = min(score, 95)  # Cap at 95%
    
    outcome = "Conviction" if score >= 60 else "Acquittal"
    
    return {
        "probability": f"{score}%",
        "result": outcome,
        "confidence": "High" if score > 75 or score < 35 else "Moderate"
    }
```

---

## 6. Legal Content Retrieval Flow

```
User navigates to Legal Awareness / FAQs / Helplines
  ↓
[Frontend] Component load
  ↓
[Frontend] API request
  ↓
GET /api/legal-awareness
GET /api/legal-faqs
GET /api/helplines
  ↓
[Backend] Reads from JSON file
  ↓
[Backend] Returns full JSON content
  ↓
[Frontend] Receives data
  ↓
[Frontend] Renders content
  ├─ For Awareness: Card layout with categories
  ├─ For FAQs: Accordion UI (expandable)
  └─ For Helplines: List with call buttons
  ↓
User interacts
  ├─ Reads content
  ├─ Searches within (client-side)
  └─ Clicks helpline to call
  ↓
END
```

---

## 7. Application Startup Process

### Backend Startup Sequence
```
1. Import libraries
   ├─ Flask, Flask-CORS
   ├─ Pandas
   └─ JSON, OS modules
   ↓
2. Initialize Flask app
   ↓
3. Configure CORS
   ↓
4. Load data files into memory
   ├─ ipc_crime.csv → DataFrame
   ├─ women_crime.csv → DataFrame
   ├─ ipc_sections.json → List[Dict]
   ├─ legal_awareness.json → Dict
   ├─ legal_faqs.json → List[Dict]
   └─ helplines.json → Dict
   ↓
5. Clean data
   ├─ Strip column names
   ├─ Fill NaN with 0
   └─ Type conversions
   ↓
6. Register API routes
   ↓
7. Start Flask server (port 5000)
   ↓
8. Ready to accept requests
```

### Frontend Startup Sequence
```
1. Vite development server starts
   ↓
2. Loads index.html
   ↓
3. Loads main.tsx entry point
   ↓
4. React application initializes
   ↓
5. App.tsx (root component) mounts
   ↓
6. React Router initializes
   ↓
7. Renders initial route (Landing Page)
   ↓
8. Global styles applied (Tailwind CSS)
   ↓
9. Components hydrated
   ↓
10. Ready for user interaction
```

---

## 8. Error Handling Flow

```
Error Occurs
  ↓
Error Type?
  ├─ Network Error
  │   ↓
  │   [Frontend] Detects failed fetch
  │   ↓
  │   Display: "Unable to connect to server"
  │   ↓
  │   Retry button shown
  │
  ├─ API Error (4xx/5xx)
  │   ↓
  │   [Backend] Returns error JSON
  │   {
  │     "error": "Message",
  │     "code": 404
  │   }
  │   ↓
  │   [Frontend] Shows user-friendly message
  │
  ├─ Data Processing Error
  │   ↓
  │   [Backend] Try-catch block
  │   ↓
  │   Log error details
  │   ↓
  │   Return generic error to client
  │
  └─ Frontend Runtime Error
      ↓
      React Error Boundary catches
      ↓
      Displays fallback UI
      ↓
      Logs to console (dev mode)
```

---

## 9. State Management Flow

### Current Approach (Component State)
```
User Action
  ↓
Component updates local state (useState)
  ↓
Re-render triggered
  ↓
UI updates
```

### Future Approach (Context API)
```
User Action
  ↓
Dispatch action to Context
  ↓
Global state updated
  ↓
All consuming components re-render
  ↓
UI synchronized across app
```

---

## 10. Data Refresh Flow

### Current (No Caching)
```
Every page load
  ↓
Fresh API call
  ↓
Data fetched from backend
  ↓
Rendered immediately
```

### Future (With Caching)
```
Page load
  ↓
Check cache
  ├─ Cache HIT → Use cached data
  │   ↓
  │   Check if stale
  │   ├─ Fresh → Display
  │   └─ Stale → Background refresh
  └─ Cache MISS → Fetch from API
      ↓
      Store in cache
      ↓
      Display
```

---

## Performance Optimization Flows

### Lazy Loading (Future)
```
User navigates to route
  ↓
Check if component loaded
  ├─ Yes → Render immediately
  └─ No → Show loading spinner
      ↓
      Fetch component code
      ↓
      Load & render
```

### API Response Optimization
```
Backend receives request
  ↓
Check if cached result exists
  ├─ Yes → Return cached (Redis)
  └─ No → Process request
      ↓
      Query DataFrame
      ↓
      Transform data
      ↓
      Cache result
      ↓
      Return response
```

---

**Document Version**: 1.0  
**Last Updated**: December 2025  
**Maintained By**: Engineering Team
