# 06. Working Flow

## System Interaction & Execution Flow

This document provides a detailed walkthrough of how different parts of the system work together during typical user interactions.

---

## 1. Complete User Journey: IPC Section Lookup

### Step-by-Step Execution

#### Step 1: User Opens Application
```
Browser → http://localhost:5173/
  ↓
Vite serves index.html
  ↓
main.tsx executes
  ↓
React renders App.tsx
  ↓
React Router evaluates current path "/"
  ↓
LandingPage.tsx component loads
  ↓
UI displays hero section with search box
```

#### Step 2: User Types Query
```
User types: "murder"
  ↓
onChange event triggered
  ↓
React state updated: setQuery("murder")
  ↓
Component re-renders with new value
```

#### Step 3: User Clicks Search
```
onClick event on button
  ↓
handleSearch() function executes
  ↓
Frontend constructs API URL:
"http://localhost:5000/api/ipc/assistant/search?q=murder"
  ↓
fetch() API call initiated
```

#### Step 4: Network Request
```
Browser sends HTTP GET request
  Method: GET
  URL: http://localhost:5000/api/ipc/assistant/search?q=murder
  Headers:
    - Accept: application/json
    - Origin: http://localhost:5173
  ↓
Request travels over network
  ↓
Reaches Flask server on port 5000
```

#### Step 5: Backend Processing
```
Flask receives request
  ↓
Routes to: @app.route("/api/ipc/assistant/search")
  ↓
Function: ipc_assistant_search() executes
  ↓
Extracts query parameter: request.args.get("q")
query = "murder"
  ↓
Converts to lowercase: query = "murder".lower()
  ↓
Iterates through ipc_sections list:
  for section in ipc_sections:
      if "murder" in section["section"].lower() or
         "murder" in section["title"].lower() or
         "murder" in section["law_text"].lower():
          results.append(section)
  ↓
Finds matches:
  - IPC 302 (Punishment for Murder)
  - IPC 300 (Murder Definition)
  - IPC 304 (Culpable Homicide)
  ↓
Limits to top 5: results[:5]
  ↓
Converts to JSON: jsonify(results)
  ↓
Adds CORS headers
  ↓
Returns HTTP 200 response with JSON body
```

#### Step 6: Frontend Receives Response
```
fetch() promise resolves
  ↓
response.json() parses JSON body
  ↓
Data available in JavaScript:
[
  {
    "section": "IPC 302",
    "title": "Punishment for Murder",
    "law_text": "Whoever commits murder...",
    "category": "Offenses Affecting Life"
  },
  ...
]
  ↓
setState(data) updates React component
  ↓
Component re-renders with results
```

#### Step 7: UI Update
```
React reconciliation (Virtual DOM diff)
  ↓
Identifies changes: results list now populated
  ↓
Updates actual DOM
  ↓
Renders results as cards:
  - Section number (bold)
  - Title (heading)
  - Excerpt of law text
  - "View Details" button
  ↓
User sees results on screen
```

#### Step 8: User Clicks Result
```
onClick event on card
  ↓
Navigate to detail view
  ↓
Modal/Drawer opens with full information
  ↓
Displays:
  - Complete law text
  - Related sections
  - Punishment details
  - Example scenarios (future)
```

---

## 2. Crime Analytics Dashboard Workflow

### Data Flow Visualization
```
┌─────────────────┐
│  User Browser   │
│  (React App)    │
└────────┬────────┘
         │ 1. User navigates to /analytics/ipc-trends
         ▼
┌─────────────────┐
│ IPCCrimeDash-   │
│ board.tsx       │
│ Component       │
└────────┬────────┘
         │ 2. useEffect() hook runs on mount
         │ 3. Calls fetchCrimeData()
         ▼
┌─────────────────┐
│  API Client     │
│  fetch()        │
└────────┬────────┘
         │ 4. GET /api/crime/summary
         ▼
┌─────────────────────────────────────┐
│  Flask Backend                      │
│  @app.route("/api/crime/summary")   │
│  ↓                                  │
│  crime_summary() function           │
│  ↓                                  │
│  Access ipc_df DataFrame            │
│  (Already loaded in memory)         │
│  ↓                                  │
│  Pandas operations:                 │
│    df.groupby("YEAR")               │
│       ["TOTAL IPC CRIMES"]          │
│       .sum()                        │
│       .reset_index()                │
│  ↓                                  │
│  Convert to JSON:                   │
│    .to_dict(orient="records")       │
│  ↓                                  │
│  Return jsonify(result)             │
└────────┬────────────────────────────┘
         │ 5. JSON response returned
         ▼
┌─────────────────┐
│  React          │
│  Component      │
│  ↓              │
│  setState()     │
│  with data      │
└────────┬────────┘
         │ 6. Component re-renders
         ▼
┌─────────────────┐
│  Recharts       │
│  Library        │
│  ↓              │
│  Processes data │
│  ↓              │
│  Renders SVG    │
│  charts         │
└────────┬────────┘
         │ 7. Charts displayed
         ▼
┌─────────────────┐
│  User sees      │
│  visualizations │
└─────────────────┘
```

### Detailed Step Breakdown

**Step 1: Component Mount**
```javascript
useEffect(() => {
  const loadData = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/crime/summary');
      const data = await response.json();
      setCrimeData(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };
  
  loadData();
}, []); // Empty dependency array = run once on mount
```

**Step 2: Backend Processing**
```python
@app.route("/api/crime/summary")
def crime_summary():
    # ipc_df already loaded at startup
    # Columns: YEAR, STATE/UT, TOTAL IPC CRIMES, MURDER, RAPE, etc.
    
    result = (
        ipc_df.groupby("YEAR")["TOTAL IPC CRIMES"]
        .sum()
        .reset_index()
        .to_dict(orient="records")
    )
    
    # result = [
    #   {"YEAR": 2018, "TOTAL IPC CRIMES": 2500000},
    #   {"YEAR": 2019, "TOTAL IPC CRIMES": 2450000},
    #   ...
    # ]
    
    return jsonify(result)
```

**Step 3: Chart Rendering**
```javascript
<LineChart data={crimeData}>
  <XAxis dataKey="YEAR" />
  <YAxis />
  <Tooltip />
  <Line type="monotone" dataKey="TOTAL IPC CRIMES" stroke="#8884d8" />
</LineChart>
```

---

## 3. Case Prediction Workflow

### End-to-End Flow

```
┌────────────────────────────────────────────┐
│ Step 1: User Input                         │
│ ────────────────────────────────           │
│ User fills form:                           │
│  • Evidence: "Strong"                      │
│  • Past Record: "None"                     │
│  • Description: "Text..."                  │
└──────────────┬─────────────────────────────┘
               │
┌──────────────▼─────────────────────────────┐
│ Step 2: Frontend Validation                │
│ ────────────────────────────               │
│ Check required fields filled               │
│ Validate dropdown selections               │
│ If valid → proceed                         │
│ If invalid → show error                    │
└──────────────┬─────────────────────────────┘
               │
┌──────────────▼─────────────────────────────┐
│ Step 3: API Request Construction           │
│ ────────────────────────────────           │
│ const payload = {                          │
│   evidence_strength: "Strong",             │
│   past_record: "None",                     │
│   description: "..."                       │
│ };                                         │
│                                            │
│ fetch('/api/case/predict', {               │
│   method: 'POST',                          │
│   headers: {                               │
│     'Content-Type': 'application/json'     │
│   },                                       │
│   body: JSON.stringify(payload)            │
│ })                                         │
└──────────────┬─────────────────────────────┘
               │
┌──────────────▼─────────────────────────────┐
│ Step 4: Backend Algorithm Execution        │
│ ────────────────────────────────           │
│ Flask receives POST data                   │
│   ↓                                        │
│ data = request.json                        │
│   ↓                                        │
│ evidence = data.get("evidence_strength")   │
│ past = data.get("past_record")             │
│   ↓                                        │
│ ALGORITHM:                                 │
│   score = 50 (base)                        │
│   if evidence == "Strong": score += 25     │
│   if past == "None": score += 0            │
│   → score = 75                             │
│   ↓                                        │
│ result = "Conviction" (>= 60%)             │
│   ↓                                        │
│ Build response JSON:                       │
│ {                                          │
│   "probability": "75%",                    │
│   "result": "Conviction",                  │
│   "key_factors": [...],                    │
│   "next_steps": [...]                      │
│ }                                          │
└──────────────┬─────────────────────────────┘
               │
┌──────────────▼─────────────────────────────┐
│ Step 5: Frontend Display                   │
│ ────────────────────────────               │
│ Parse response                             │
│   ↓                                        │
│ Update UI with:                            │
│  • Probability gauge (75%)                 │
│  • Outcome badge ("Conviction")            │
│  • Factor list (bullet points)             │
│  • Reasoning paragraph                     │
│  • Action items (numbered list)            │
│   ↓                                        │
│ Add visual indicators:                     │
│  • Color coding (green/red)                │
│  • Icons (checkmark/warning)               │
│  • Confidence level indicator              │
└──────────────┬─────────────────────────────┘
               │
┌──────────────▼─────────────────────────────┐
│ Step 6: User Action                        │
│ ────────────────────────────               │
│ User can:                                  │
│  • Read full analysis                      │
│  • Download PDF (future)                   │
│  • Adjust inputs and re-predict            │
│  • Save to account (future)                │
└────────────────────────────────────────────┘
```

---

## 4. Application State Management

### Current State Flow (Component-Level)

```
User Action
  ↓
Event Handler (onClick, onChange)
  ↓
setState() called
  ↓
React schedules re-render
  ↓
Component function re-executes
  ↓
New Virtual DOM created
  ↓
Diffing algorithm compares old vs new
  ↓
Minimal DOM updates applied
  ↓
UI reflects new state
```

### Example: Search State Management
```javascript
function IPCAssistant() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const handleSearch = async () => {
    setLoading(true); // UI shows spinner
    
    const response = await fetch(`/api/ipc/assistant/search?q=${query}`);
    const data = await response.json();
    
    setResults(data); // UI shows results
    setLoading(false); // Spinner hidden
  };
  
  return (
    <div>
      <input 
        value={query} 
        onChange={(e) => setQuery(e.target.value)} 
      />
      <button onClick={handleSearch}>Search</button>
      {loading && <Spinner />}
      {results.map(r => <ResultCard key={r.section} data={r} />)}
    </div>
  );
}
```

---

## 5. Error Handling Workflow

### Network Error Flow
```
User action triggers API call
  ↓
fetch() initiated
  ↓
Network failure (server down, no internet)
  ↓
fetch() promise rejects
  ↓
.catch() block executes
  ↓
setError("Unable to connect to server")
  ↓
Component renders error UI
  ↓
Shows:
  • Error icon
  • User-friendly message
  • Retry button
  • Technical details (dev mode)
```

### API Error (404, 500) Flow
```
API call made
  ↓
Backend returns error
  HTTP 404 Not Found
  Body: {"error": "Section not found"}
  ↓
Frontend checks response.ok
  if (!response.ok) → throw error
  ↓
Error caught in .catch()
  ↓
Parse error message from JSON
  ↓
Display to user:
  "IPC Section not found. Please try another search."
```

---

## 6. Performance Optimization Workflow

### Current Approach
```
Every request
  ↓
Fresh API call
  ↓
Backend processes
  ↓
Data returned
  ↓
Rendered immediately
```

### Optimized Future Approach
```
Request made
  ↓
Check client-side cache
  ├─ HIT → Return cached data immediately
  │         Background: Check if stale
  │         If stale → Refresh silently
  └─ MISS → Proceed with API call
            ↓
            Backend checks Redis cache
            ├─ HIT → Return from Redis (ms response)
            └─ MISS → Process with Pandas
                      Cache in Redis (5 min TTL)
                      Return result
            ↓
            Store in client cache
            ↓
            Render
```

---

## 7. Data Loading & Initialization

### Backend Startup Workflow
```python
# When app.py runs
if __name__ == "__main__":
    # 1. Imports already done
    # 2. Flask app initialized
    # 3. CORS configured
    
    # 4. Data loading (happens at module level)
    print("Loading IPC crime data...")
    ipc_df = pd.read_csv("data/ipc_crime.csv").fillna(0)
    print(f"Loaded {len(ipc_df)} rows")
    
    print("Loading women crime data...")
    women_df = pd.read_csv("data/women_crime.csv").fillna(0)
    
    print("Loading IPC sections...")
    with open("data/ipc_sections.json") as f:
        ipc_sections = json.load(f)
    print(f"Loaded {len(ipc_sections)} IPC sections")
    
    # 5. Data now in memory (RAM)
    # 6. Start server
    print("Starting Flask server on port 5000...")
    app.run(debug=True)
    print("Server ready!")
```

**Time to Ready**: ~2-3 seconds (includes data loading)

---

## 8. Real-Time Interaction Flow

### User Session Timeline
```
T=0s:    User opens http://localhost:5173/
T=0.5s:  Landing page rendered
T=5s:    User clicks "IPC Assistant"
T=5.1s:  Route change, component loads
T=5.2s:  Search interface displayed
T=10s:   User types "theft" and clicks search
T=10.1s: API request sent
T=10.15s: Backend processes query (50ms)
T=10.2s: Response received
T=10.25s: Results rendered
T=15s:   User clicks on "IPC 378"
T=15.05s: Detail view opens
T=20s:   User navigates to Analytics
T=20.5s: API call for crime data
T=20.7s: Charts rendered
```

**Total Interaction Time**: < 1 second per action

---

**Document Version**: 1.0  
**Last Updated**: December 2025  
**Maintained By**: Engineering Team
