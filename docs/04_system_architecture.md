# 04. System Architecture

## High-Level Architecture Overview

The AI Lawyer platform follows a modern three-tier web application architecture with a clear separation of concerns between presentation, business logic, and data layers.

---

## Architecture Diagram (Text Representation)

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER LAYER                              │
│  (Web Browsers: Chrome, Firefox, Safari, Edge)                 │
└────────────────────────┬────────────────────────────────────────┘
                         │ HTTPS
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                           │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │         React Frontend (Vite Dev Server)                 │  │
│  │  • React Router (Navigation)                             │  │
│  │  • Custom UI Components (Radix UI)                       │  │
│  │  • Tailwind CSS (Styling)                                │  │
│  │  • State Management (React Hooks)                        │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────────────┘
                         │ REST API (JSON)
                         │ HTTP/HTTPS
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                   APPLICATION LAYER                             │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Flask Backend Server                        │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │  API Gateway & Routing                             │  │  │
│  │  │  • /api/health                                     │  │  │
│  │  │  • /api/ipc/assistant/*                            │  │  │
│  │  │  • /api/crime/*                                    │  │  │
│  │  │  • /api/women/*                                    │  │  │
│  │  │  • /api/case/predict                               │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │  Business Logic Layer                              │  │  │
│  │  │  • IPC Search Engine                               │  │  │
│  │  │  • Analytics Processor                             │  │  │
│  │  │  • Prediction Algorithm                            │  │  │
│  │  │  • Data Transformation                             │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │  Flask-CORS (Cross-Origin Handler)                 │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────────────┘
                         │ File I/O
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                      DATA LAYER                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Pandas Data Processing Engine                           │  │
│  │  • DataFrame operations                                  │  │
│  │  • Aggregations & Analytics                              │  │
│  │  • Data Cleaning & Transformation                        │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  File-Based Storage System                               │  │
│  │  ┌────────────────┐  ┌──────────────┐                   │  │
│  │  │   CSV Files    │  │  JSON Files  │                   │  │
│  │  │ • ipc_crime    │  │ • ipc_sections│                  │  │
│  │  │ • women_crime  │  │ • legal_faqs  │                  │  │
│  │  │ • case_outcome │  │ • helplines   │                  │  │
│  │  └────────────────┘  └──────────────┘                   │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘

                         FUTURE ENHANCEMENTS
┌─────────────────────────────────────────────────────────────────┐
│  AI/ML Layer (Planned)                                          │
│  • LLM Integration (OpenAI/Gemini)                              │
│  • Vector Database (FAISS/Pinecone)                             │
│  • RAG Pipeline                                                 │
│  • NLP Query Processing                                         │
└─────────────────────────────────────────────────────────────────┘
```

---

## Component Breakdown

### 1. Frontend Architecture (React + Vite)

#### Component Hierarchy
```
App.tsx (Root)
├── Router Configuration
│   ├── Public Routes
│   │   ├── LandingPage
│   │   ├── ContactPage
│   │   └── Legal Awareness
│   ├── Onboarding Flow
│   │   ├── PersonalDetails
│   │   ├── EducationDetails
│   │   └── PurposeAwareness
│   ├── Dashboard
│   │   └── Main Dashboard
│   ├── Analytics Module
│   │   ├── IPCCrimeDashboard
│   │   └── WomenCrimesAnalytics
│   └── AI Tools Module
│       ├── IPCAIAssistant
│       ├── SupremeCourtExplorer
│       └── CaseOutcomePredictor
├── Shared Components
│   ├── Header
│   ├── Footer
│   └── UI Component Library
│       ├── Button, Card, Dialog
│       ├── Form Components
│       ├── Data Visualization
│       └── Navigation Components
└── Utilities
    ├── API Client
    ├── Formatters
    └── Validators
```

#### State Management Strategy
- **Local State**: React useState for component-specific data
- **Context API**: Future implementation for global state
- **Server State**: Fetch-on-demand, no client-side caching (MVP)

#### Routing Strategy
- Single Page Application (SPA) using React Router
- Client-side routing for fast navigation
- Lazy loading for code splitting (future)

---

### 2. Backend Architecture (Flask)

#### API Layer Structure
```python
app.py (Main Application)
├── Initialization
│   ├── Flask App Instance
│   ├── CORS Configuration
│   └── Data Loading (Startup)
├── API Endpoints
│   ├── Health & Status
│   │   └── /api/health
│   ├── IPC Module
│   │   ├── /api/ipc/records
│   │   ├── /api/ipc/assistant/search
│   │   └── /api/ipc/assistant/explain
│   ├── Crime Analytics
│   │   ├── /api/crime/summary
│   │   └── /api/women/dashboard
│   ├── Legal Resources
│   │   ├── /api/legal-awareness
│   │   ├── /api/legal-faqs
│   │   └── /api/helplines
│   └── AI Tools
│       └── /api/case/predict
└── Business Logic
    ├── Search Algorithm
    ├── Analytics Engine
    ├── Prediction Model
    └── Data Aggregation
```

#### Request/Response Flow
```
Client Request
    ↓
Flask Route Handler
    ↓
Input Validation
    ↓
Business Logic Processing
    ↓
Data Layer Access (Pandas)
    ↓
Response Formatting (JSON)
    ↓
CORS Headers Applied
    ↓
Client Response
```

---

### 3. Data Architecture

#### Data Storage Strategy

**Current Approach: File-Based**
```
backend/data/
├── CSV Files (Structured Data)
│   ├── ipc_crime.csv (~50KB)
│   ├── women_crime.csv (~30KB)
│   └── case_outcome_dataset.csv
├── JSON Files (Semi-Structured)
│   ├── ipc_sections.json (~2MB, 500+ sections)
│   ├── legal_awareness.json
│   ├── legal_faqs.json
│   ├── helplines.json
│   └── supreme_court.json
└── PDF Files (Reference)
    └── THE-INDIAN-PENAL-CODE-1860.pdf
```

**Data Loading Pattern**
- **Startup Loading**: All CSV/JSON files loaded into memory at application start
- **In-Memory Processing**: Pandas DataFrames held in RAM for fast queries
- **No Database**: Eliminates DB overhead for MVP; sufficient for <1GB data

#### Data Schema

**IPC Sections (JSON)**
```json
{
  "section": "IPC 302",
  "title": "Punishment for Murder",
  "law_text": "Whoever commits murder shall be punished...",
  "category": "Offenses Affecting Life",
  "punishment": "Death or life imprisonment"
}
```

**Crime Statistics (CSV)**
```
YEAR | STATE/UT | TOTAL IPC CRIMES | MURDER | RAPE | KIDNAPPING | ...
2021 | Delhi    | 45000           | 500    | 1200 | 3000       | ...
```

**Women Crime Data (CSV)**
```
Year | State | Rape cases | Dowry Deaths | Domestic violence | ...
2021 | UP    | 3000       | 500          | 8000              | ...
```

---

### 4. Integration Points

#### Frontend ↔ Backend Communication

**API Call Pattern**
```javascript
// Frontend: src/services/api.js
const fetchIPCSections = async (query) => {
  const response = await fetch(
    `http://localhost:5000/api/ipc/assistant/search?q=${query}`
  );
  return await response.json();
};
```

**Backend: API Response**
```python
# Backend: app.py
@app.route("/api/ipc/assistant/search")
def ipc_assistant_search():
    query = request.args.get("q", "").lower()
    results = search_logic(query)
    return jsonify(results)
```

#### Error Handling Flow
```
Frontend Error Boundary
    ↓
Network Error Detection
    ↓
User-Friendly Error Message
    ↓
Optional: Retry Mechanism
```

---

### 5. Security Architecture

#### Current Security Measures

**1. CORS Configuration**
```python
from flask_cors import CORS
CORS(app)  # Allows all origins (dev mode)
```

**2. Input Sanitization**
- Query parameter validation
- JSON payload validation
- SQL injection prevention (N/A - no SQL database)

**3. Rate Limiting (Future)**
- API request throttling
- IP-based rate limits
- Token bucket algorithm

#### Security Considerations
- ❌ No authentication (public platform)
- ❌ No data encryption at rest (future)
- ✅ HTTPS for production deployment
- ✅ Input validation on all endpoints
- ✅ Legal disclaimers for liability protection

---

### 6. Scalability Architecture

#### Current Limitations
- Single-threaded Flask (dev server)
- In-memory data (limited to RAM)
- No horizontal scaling
- No caching layer

#### Future Scaling Strategy

**Phase 1: Vertical Scaling**
- Production WSGI server (Gunicorn)
- Multi-worker processes
- Increased server resources

**Phase 2: Horizontal Scaling**
```
Load Balancer (Nginx)
    ↓
┌─────────────┬─────────────┬─────────────┐
│  Flask      │  Flask      │  Flask      │
│  Instance 1 │  Instance 2 │  Instance 3 │
└─────────────┴─────────────┴─────────────┘
        ↓
    Redis Cache
        ↓
    PostgreSQL Database
```

**Phase 3: Microservices**
- API Gateway (Kong/AWS API Gateway)
- Service mesh (Kubernetes)
- Event-driven architecture (Message queues)

---

### 7. Performance Architecture

#### Current Performance Profile
- **Average API Response**: 50-100ms
- **Frontend Load Time**: 1-2 seconds
- **Concurrent Users**: ~50 (dev server limit)
- **Data Transfer**: JSON (gzip compression future)

#### Optimization Strategies

**Frontend**
- Code splitting (React.lazy)
- Image optimization
- Lazy loading components
- Minification & bundling (Vite)

**Backend**
- DataFrame query optimization
- Response caching (future)
- Database indexing (when migrated)
- CDN for static assets

---

### 8. Monitoring & Observability (Planned)

#### Metrics Collection
```
Application Metrics
├── API Response Times
├── Error Rates
├── Request Volume
└── User Engagement

Infrastructure Metrics
├── CPU Usage
├── Memory Usage
├── Disk I/O
└── Network Traffic

Business Metrics
├── Search Queries
├── Page Views
├── User Journeys
└── Conversion Rates
```

#### Logging Strategy
- **Application Logs**: Flask logging module
- **Access Logs**: Nginx logs (production)
- **Error Tracking**: Sentry (future)
- **Analytics**: Google Analytics / Mixpanel (future)

---

### 9. Deployment Architecture

#### Development Environment
```
Developer Machine
├── Frontend: npm run dev (Port 5173)
├── Backend: python app.py (Port 5000)
└── Data: Local file system
```

#### Production Environment (Planned)
```
Cloud Provider (AWS/GCP/Azure)
├── Frontend
│   ├── CDN (CloudFlare)
│   ├── Static Hosting (Vercel/Netlify)
│   └── SSL Certificate (Let's Encrypt)
├── Backend
│   ├── Container (Docker)
│   ├── Orchestration (Kubernetes)
│   ├── Load Balancer (ALB/ELB)
│   └── Auto-scaling Group
├── Database
│   ├── PostgreSQL (RDS)
│   └── Redis Cache (ElastiCache)
└── Storage
    ├── Object Storage (S3)
    └── Backups (Automated)
```

---

## Architecture Decisions & Rationale

| Decision | Rationale |
|----------|-----------|
| **Flask over Django** | Lightweight, API-focused, faster development |
| **React over Vue/Angular** | Rich ecosystem, strong community, component reusability |
| **File-based storage** | Simple for MVP, no DB overhead, sufficient for <1GB data |
| **Pandas for analytics** | Powerful data manipulation, Python-native, fast prototyping |
| **Vite over CRA** | Faster builds, modern tooling, better DX |
| **Tailwind CSS** | Utility-first, rapid UI development, small bundle size |

---

**Document Version**: 1.0  
**Last Updated**: December 2025  
**Maintained By**: Architecture Team
