
# AI Lawyer – Legal Analytics & Assistance Platform

> **Democratizing legal knowledge and empowering citizens with data-driven legal intelligence**

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Python](https://img.shields.io/badge/python-3.11+-blue.svg)](https://python.org)
[![React](https://img.shields.io/badge/react-18.3.1-blue.svg)](https://reactjs.org)
[![Flask](https://img.shields.io/badge/flask-3.1.2-green.svg)](https://flask.palletsprojects.com/)

---

## 📑 Table of Contents

- [Overview](#overview)
- [Problem Statement](#problem-statement)
- [Key Features](#key-features)
- [System Architecture](#system-architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Usage Examples](#usage-examples)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)
- [Acknowledgments](#acknowledgments)

---

## 🎯 Overview

The **AI Lawyer Platform** is a comprehensive legal analytics and assistance system designed specifically for the Indian legal landscape. It bridges the gap between complex legal information and public accessibility by providing:

- ✅ **Intelligent IPC Section Search**: Find and understand Indian Penal Code sections instantly
- 📊 **Crime Analytics Dashboard**: Visualize crime trends with interactive charts
- 👩 **Women Safety Analytics**: Dedicated insights on crimes against women
- 🔮 **Case Outcome Predictor**: Evidence-based predictions for legal scenarios
- 📚 **Legal Awareness Hub**: Educational content on rights and legal processes
- 🆘 **Emergency Helplines**: Quick access to legal and safety resources

---

## 🚨 Problem Statement

Despite India's comprehensive legal system, critical barriers exist:

1. **Legal Complexity**: IPC sections written in archaic, incomprehensible language
2. **Information Inaccessibility**: No centralized platform for legal knowledge
3. **Data Fragmentation**: Crime statistics scattered and unanalyzed
4. **Women's Safety Gaps**: Limited awareness of protections and resources
5. **Lack of Guidance**: No tools to assess legal case strength

**Target Impact**: Empower 10 million+ citizens with accessible legal knowledge in the first year.

---

## ✨ Key Features

### 1. 🔍 IPC AI Assistant
- **Smart Search**: Natural language queries across 500+ IPC sections
- **Detailed Explanations**: Simplified legal text with examples
- **Contextual Suggestions**: Related sections and case references

### 2. 📈 Crime Analytics Dashboard
- **Trend Visualization**: Year-over-year crime patterns
- **State Comparisons**: Interactive state-wise analysis
- **Category Breakdown**: Crime type distributions with charts

### 3. 👩‍⚖️ Women Crimes Analytics
- **Specialized Dashboard**: Focus on crimes against women
- **Top 10 States**: Highest crime volume visualization
- **Category Tracking**: Rape, dowry deaths, domestic violence, trafficking

### 4. ⚖️ Case Outcome Predictor
- **Evidence Assessment**: Analyze case strength
- **Probability Calculation**: Data-driven outcome predictions
- **Strategic Insights**: Key factors and recommended actions

### 5. 📚 Legal Awareness & Resources
- **Rights Education**: Know your fundamental rights
- **FAQ Repository**: Common legal questions answered
- **Helpline Directory**: Emergency contacts and support services

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────┐
│         React Frontend (Vite)                       │
│  Port: 5173 | SPA with React Router                │
└────────────────┬────────────────────────────────────┘
                 │ REST API (JSON)
                 ▼
┌─────────────────────────────────────────────────────┐
│         Flask Backend (Python)                      │
│  Port: 5000 | RESTful API with CORS                │
│  • IPC Search Engine                                │
│  • Analytics Processor (Pandas)                     │
│  • Prediction Algorithm                             │
└────────────────┬────────────────────────────────────┘
                 │ File I/O
                 ▼
┌─────────────────────────────────────────────────────┐
│         Data Layer (CSV/JSON)                       │
│  • IPC Sections (JSON)                              │
│  • Crime Statistics (CSV)                           │
│  • Legal Content (JSON)                             │
└─────────────────────────────────────────────────────┘
```

**Architecture Details**: See [docs/04_system_architecture.md](docs/04_system_architecture.md)

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18.3.1
- **Build Tool**: Vite 6.3.5
- **Routing**: React Router v7
- **UI Components**: Custom library built on Radix UI
- **Styling**: Tailwind CSS 4.1.12
- **Icons**: Lucide React, Material-UI Icons
- **Charts**: Recharts 2.15.4

### Backend
- **Framework**: Flask 3.1.2
- **Language**: Python 3.11+
- **Data Processing**: Pandas 2.3.3
- **CORS**: Flask-CORS 6.0.2
- **API Design**: RESTful JSON endpoints

### Data & Storage
- **Format**: CSV, JSON (file-based)
- **Processing**: Pandas DataFrames
- **Size**: ~5MB total dataset

### Future Enhancements
- **AI/ML**: Google Gemini / OpenAI GPT integration
- **Database**: PostgreSQL / MongoDB
- **Vector DB**: FAISS / Pinecone for semantic search
- **Deployment**: Docker + Kubernetes

**Full Stack Details**: See [docs/07_tech_stack_and_dependencies.md](docs/07_tech_stack_and_dependencies.md)

---

## 📁 Project Structure

```
AI-LAWYER-PROJECT/
│
├── src/                                # Frontend source code
│   ├── app/
│   │   ├── App.tsx                    # Root component & routing
│   │   ├── components/                # Shared components
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── ui/                    # UI component library
│   │   └── pages/                     # Page components
│   │       ├── LandingPage.tsx
│   │       ├── Dashboard.tsx
│   │       ├── IPCAIAssistant.tsx
│   │       ├── CaseOutcomePredictor.tsx
│   │       └── [...]
│   ├── styles/                        # Global styles
│   └── main.tsx                       # Entry point
│
├── backend/
│   ├── app.py                         # Flask application
│   ├── requirements.txt               # Python dependencies
│   ├── data/
│   │   ├── ipc_crime.csv             # Crime statistics
│   │   ├── women_crime.csv           # Women crimes data
│   │   ├── ipc_sections.json         # IPC legal text
│   │   ├── legal_awareness.json      # Educational content
│   │   ├── legal_faqs.json           # FAQ repository
│   │   └── helplines.json            # Emergency contacts
│   └── [data processing scripts]
│
├── docs/                              # Comprehensive documentation
│   ├── 01_project_overview.md
│   ├── 02_problem_statement.md
│   ├── 03_solution_overview.md
│   ├── 04_system_architecture.md
│   └── [... 15 more files]
│
├── index.html
├── package.json
├── vite.config.ts
├── .gitignore
├── README.md
└── LICENSE
```

**Detailed Structure**: See [docs/12_frontend_structure.md](docs/12_frontend_structure.md) & [docs/13_backend_structure.md](docs/13_backend_structure.md)

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v18+ ([Download](https://nodejs.org/))
- **Python**: 3.11+ ([Download](https://python.org/))
- **npm**: 9+ (comes with Node.js)
- **pip**: Latest version

### Installation

#### 1. Clone the Repository
```bash
git clone https://github.com/anish-dev09/AI-LAWYER-PROJECT.git
cd AI-LAWYER-PROJECT
```

#### 2. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Verify installation
python -c "import flask, pandas; print('Backend dependencies installed successfully')"
```

#### 3. Frontend Setup
```bash
# Navigate to project root (if in backend/)
cd ..

# Install Node dependencies
npm install

# Verify installation
npm list react react-dom
```

### Running the Application

#### Option 1: Manual Start (Recommended for Development)

**Terminal 1 - Backend:**
```bash
cd backend
python app.py

# Output:
# * Serving Flask app 'app'
# * Running on http://127.0.0.1:5000
```

**Terminal 2 - Frontend:**
```bash
npm run dev

# Output:
# VITE v6.3.5  ready in 360 ms
# ➜  Local:   http://localhost:5173/
```

### Access the Application

- **Frontend**: http://localhost:5173/
- **Backend API**: http://127.0.0.1:5000/
- **API Health Check**: http://127.0.0.1:5000/api/health

---

## 📡 API Documentation

### Base URL
```
Development: http://127.0.0.1:5000
Production: https://api.ailawyer.in (future)
```

### Available Endpoints

#### Health & Status
```http
GET /api/health
```
**Response:**
```json
{
  "status": "Backend running",
  "ipc_rows": 5000,
  "women_rows": 2500,
  "ipc_sections": 511
}
```

#### IPC Search
```http
GET /api/ipc/assistant/search?q={query}
```
**Example:**
```bash
curl "http://localhost:5000/api/ipc/assistant/search?q=theft"
```
**Response:**
```json
[
  {
    "section": "IPC 378",
    "title": "Theft",
    "law_text": "Whoever intends to take dishonestly...",
    "category": "Offenses Against Property"
  }
]
```

#### Crime Analytics
```http
GET /api/crime/summary
```

#### Women Crimes Dashboard
```http
GET /api/women/dashboard
```

#### Case Outcome Prediction
```http
POST /api/case/predict
Content-Type: application/json

{
  "evidence_strength": "Strong",
  "past_record": "None"
}
```

**Full API Reference**: See [docs/11_api_design.md](docs/11_api_design.md)

---

## 💡 Usage Examples

### Example 1: Search IPC Section
```javascript
// Frontend code
const searchIPC = async (query) => {
  const response = await fetch(
    `http://localhost:5000/api/ipc/assistant/search?q=${query}`
  );
  const data = await response.json();
  console.log(data);
};

searchIPC("murder");
```

### Example 2: Predict Case Outcome
```javascript
const predictCase = async (caseDetails) => {
  const response = await fetch(
    'http://localhost:5000/api/case/predict',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(caseDetails)
    }
  );
  return await response.json();
};

const result = await predictCase({
  evidence_strength: "Moderate",
  past_record: "Minor"
});
```

---

## 🗺️ Roadmap

### Phase 1: MVP ✅ (Current)
- [x] IPC search functionality
- [x] Basic crime analytics
- [x] Women crimes dashboard
- [x] Case outcome predictor
- [x] Legal awareness content

### Phase 2: Enhancement (Q1 2026)
- [ ] LLM-powered legal chatbot
- [ ] Advanced NLP search
- [ ] User authentication
- [ ] Bookmark & history features
- [ ] Mobile responsive optimization

### Phase 3: Scale (Q2 2026)
- [ ] Document upload & analysis
- [ ] PDF clause extraction
- [ ] Lawyer directory
- [ ] Multi-language support (Hindi, Tamil, Bengali)
- [ ] Mobile apps (iOS/Android)

### Phase 4: Intelligence (Q3 2026)
- [ ] AI legal assistant with memory
- [ ] Personalized recommendations
- [ ] Case law semantic search
- [ ] Collaborative research tools
- [ ] Public API for integrations

**Detailed Roadmap**: See [docs/16_scalability_and_future_scope.md](docs/16_scalability_and_future_scope.md)

---

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

### Ways to Contribute
- 🐛 **Bug Reports**: Open an issue with detailed reproduction steps
- 💡 **Feature Requests**: Suggest new features or improvements
- 📝 **Documentation**: Improve or translate documentation
- 💻 **Code**: Submit pull requests for bug fixes or features
- 🎨 **Design**: Contribute UI/UX improvements

### Contribution Process
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

**Full Guidelines**: See [docs/19_contribution_guidelines.md](docs/19_contribution_guidelines.md)

---

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

**Note**: Legal data sourced from public government repositories (NCRB, IPC official texts).

---

## 📧 Contact

**Project Maintainer**: Anish Kumar  
**GitHub**: [@anish-dev09](https://github.com/anish-dev09)  
**Project Link**: [https://github.com/anish-dev09/AI-LAWYER-PROJECT](https://github.com/anish-dev09/AI-LAWYER-PROJECT)

---

## 🙏 Acknowledgments

- **Data Sources**:
  - National Crime Records Bureau (NCRB) - Crime statistics
  - Ministry of Law & Justice - IPC legal texts
  - National Commission for Women - Women safety data

- **Technologies**:
  - React & Vite teams for excellent developer experience
  - Flask & Python community
  - Radix UI for accessible component primitives

---

## ⚠️ Disclaimer

**This platform is for educational and informational purposes only. It does not constitute legal advice. Users are strongly advised to consult qualified legal professionals for specific legal matters.**

---

<div align="center">

**Built with ❤️ for accessible justice in India**

[Documentation](docs/) • [Report Bug](https://github.com/anish-dev09/AI-LAWYER-PROJECT/issues) • [Request Feature](https://github.com/anish-dev09/AI-LAWYER-PROJECT/issues)

</div>
  