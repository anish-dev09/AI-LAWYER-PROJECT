from flask import Flask, jsonify, request
from flask_cors import CORS
import pandas as pd
import json
import os
from datetime import datetime
import traceback

# optional import - google generative api
try:
    import google.generativeai as genai
except Exception:
    genai = None

# Load environment variables from .env file
try:
    from dotenv import load_dotenv
    load_dotenv()
    print("Loaded .env file")
except ImportError:
    print("python-dotenv not installed, skipping .env load")

app = Flask(__name__)

# Configure CORS for production (Vercel frontend) and development
CORS(app, resources={
    r"/api/*": {
        "origins": [
            "http://localhost:5173",  # Local development
            "http://localhost:5174",  # Alternative local port
            "https://*.vercel.app",   # Vercel preview deployments
            "https://*.vercel.com"    # Vercel production
        ]
    }
})

# ---------------- PATHS ----------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")

# ---------------- LOAD DATA ----------------
try:
    ipc_df = pd.read_csv(os.path.join(DATA_DIR, "ipc_crime.csv")).fillna(0)
    ipc_df.columns = ipc_df.columns.str.strip()
    print(f"Loaded IPC crime data: {len(ipc_df)} rows")
except Exception as e:
    print(f"Error loading ipc_crime.csv: {e}")
    ipc_df = pd.DataFrame()  # empty df

try:
    women_df = pd.read_csv(os.path.join(DATA_DIR, "women_crime.csv")).fillna(0)
    women_df.columns = women_df.columns.str.strip()
    print(f"Loaded women crime data: {len(women_df)} rows")
except Exception as e:
    print(f"Error loading women_crime.csv: {e}")
    women_df = pd.DataFrame()  # empty df

try:
    with open(os.path.join(DATA_DIR, "ipc_sections.json"), encoding="utf-8") as f:
        ipc_sections = json.load(f)
    print(f"Loaded IPC sections: {len(ipc_sections)} items")
except Exception as e:
    print(f"Error loading ipc_sections.json: {e}")
    ipc_sections = []

try:
    with open(os.path.join(DATA_DIR, "legal_awareness.json"), encoding="utf-8") as f:
        legal_awareness = json.load(f)
    print(f"Loaded legal awareness: {len(legal_awareness)} items")
except Exception as e:
    print(f"Error loading legal_awareness.json: {e}")
    legal_awareness = []

try:
    with open(os.path.join(DATA_DIR, "legal_faqs.json"), encoding="utf-8") as f:
        legal_faqs = json.load(f)
    print(f"Loaded legal FAQs: {len(legal_faqs)} items")
except Exception as e:
    print(f"Error loading legal_faqs.json: {e}")
    legal_faqs = []

try:
    with open(os.path.join(DATA_DIR, "helplines.json"), encoding="utf-8") as f:
        helplines = json.load(f)
    print(f"Loaded helplines: {len(helplines)} items")
except Exception as e:
    print(f"Error loading helplines.json: {e}")
    helplines = []

# ---------------- SUPREME COURT SEARCH ENGINE ----------------
# Initialize the Supreme Court semantic search engine
supreme_court_engine = None

def get_supreme_court_engine():
    """Lazy load Supreme Court search engine to avoid startup delay"""
    global supreme_court_engine
    if supreme_court_engine is None:
        from supreme_court_search import get_search_engine
        supreme_court_engine = get_search_engine()
    return supreme_court_engine

# =======================
# 🔥 ROOT LANDING PAGE
# =======================
@app.route("/")
def landing():
    return jsonify({
        "project": "AI Lawyer – Legal Analytics & Assistance Platform",
        "status": "Backend is running successfully",
        "available_endpoints": [
            "/api/health",
            "/api/crime/summary",
            "/api/ipc/records",
            "/api/ipc/assistant/search",
            "/api/ipc/assistant/explain",
            "/api/women/dashboard",
            "/api/legal-awareness",
            "/api/legal-faqs",
            "/api/helplines",
            "/api/case/predict",
            "/api/supreme-court/search"
        ],
        "note": "This backend is running locally for project demonstration."
    })

# ---------------- HEALTH ----------------
@app.route("/api/health")
def health():
    return jsonify({
        "status": "Backend running",
        "ipc_rows": len(ipc_df),
        "women_rows": len(women_df),
        "ipc_sections": len(ipc_sections),
        "helplines": len(helplines)
    })

# ---------------- DASHBOARD ----------------
@app.route("/api/crime/summary")
def crime_summary():
    return jsonify(
        ipc_df.groupby("YEAR")["TOTAL IPC CRIMES"]
        .sum()
        .reset_index()
        .to_dict(orient="records")
    )

# ---------------- IPC RECORDS ----------------
@app.route("/api/ipc/records")
def ipc_records():
    return jsonify({
        "available_years": sorted(ipc_df["YEAR"].unique().tolist()),
        "available_states": sorted(ipc_df["STATE/UT"].unique().tolist())
    })

# ---------------- IPC DASHBOARD ----------------
@app.route("/api/ipc/dashboard")
def ipc_dashboard():
    year = request.args.get("year", type=int)
    state = request.args.get("state", "").strip()

    if not year or not state:
        return jsonify({"error": "year and state required"}), 400

    # Filter data
    filtered = ipc_df[(ipc_df["YEAR"] == year) & (ipc_df["STATE/UT"] == state)]

    if filtered.empty:
        return jsonify({"crime_totals": {}})

    # Crime columns (exclude non-crime columns)
    crime_cols = [col for col in ipc_df.columns if col not in ["STATE/UT", "DISTRICT", "YEAR", "TOTAL IPC CRIMES"]]

    # Sum crimes
    crime_totals = {}
    for col in crime_cols:
        total = filtered[col].sum()
        if total > 0:
            crime_totals[col] = int(total)

    return jsonify({"crime_totals": crime_totals})

# ---------------- IPC DISTRICTS ----------------
@app.route("/api/ipc/districts")
def ipc_districts():
    year = request.args.get("year", type=int)
    state = request.args.get("state", "").strip()

    if not year or not state:
        return jsonify({"error": "year and state required"}), 400

    # Filter data
    filtered = ipc_df[(ipc_df["YEAR"] == year) & (ipc_df["STATE/UT"] == state)]

    if filtered.empty:
        return jsonify([])

    # Group by district, sum TOTAL IPC CRIMES
    districts = filtered.groupby("DISTRICT")["TOTAL IPC CRIMES"].sum().reset_index()
    districts = districts.sort_values(by="TOTAL IPC CRIMES", ascending=False).head(20)  # Top 20 districts

    return jsonify(districts.to_dict(orient="records"))

# ---------------- IPC SEARCH ----------------
@app.route("/api/ipc/assistant/search")
def ipc_assistant_search():
    query = request.args.get("q", "").lower()
    if not query:
        return jsonify([])

    results = [
        sec for sec in ipc_sections
        if query in sec["section"].lower()
        or query in sec["title"].lower()
        or query in sec["law_text"].lower()
    ][:5]

    return jsonify(results)

# ---------------- IPC EXPLAIN ----------------
@app.route("/api/ipc/assistant/explain", methods=["POST"])
def ipc_assistant_explain():
    section_no = request.json.get("section", "").strip()
    section = next((s for s in ipc_sections if s["section"] == section_no), None)

    if not section:
        return jsonify({"error": "Section not found"}), 404

    return jsonify({
        "section": section["section"],
        "title": section["title"],
        "law_text": section["law_text"],
        "explanation": (
            "This section defines the offense, its legal ingredients, "
            "and the punishment prescribed under Indian Penal Code. "
            "Provided for educational understanding only."
        )
    })

# ---------------- WOMEN DASHBOARD ----------------
@app.route("/api/women/dashboard")
def women_dashboard():
    crime_cols = [
        "No. of Rape cases",
        "Kidnap And Assault",
        "Dowry Deaths",
        "Assault against women",
        "Assault against modesty of women",
        "Domestic violence",
        "Women Trafficking"
    ]

    df = women_df.copy()
    df[crime_cols] = df[crime_cols].apply(pd.to_numeric, errors="coerce").fillna(0)
    df["TOTAL"] = df[crime_cols].sum(axis=1)

    return jsonify({
        "state_wise": (
            df.groupby("State")["TOTAL"]
            .sum()
            .reset_index()
            .sort_values(by="TOTAL", ascending=False)
            .head(10)
            .to_dict(orient="records")
        )
    })

# ---------------- LEGAL AWARENESS ----------------
@app.route("/api/legal-awareness")
def get_legal_awareness():
    return jsonify(legal_awareness)

@app.route("/api/legal-faqs")
def get_legal_faqs():
    return jsonify(legal_faqs)

@app.route("/api/helplines")
def get_helplines():
    return jsonify(helplines)


# ---------------- CONSULTATION REQUESTS ----------------
@app.route("/api/consultation", methods=["POST"])
def consultation_request():
    """
    Accepts POST with JSON:
    { name, phone, email, preferred_method, message, cost }
    Stores a simple record in data/consultations.json and returns success.
    """
    data = request.json or {}
    name = data.get("name", "").strip()
    phone = data.get("phone", "").strip()
    email = data.get("email", "").strip()
    preferred = data.get("preferred_method", "call").strip()
    message = data.get("message", "").strip()
    cost = data.get("cost", None)

    if not name or not phone:
        return jsonify({"error": "name and phone are required"}), 400

    consult_record = {
        "id": int(datetime.utcnow().timestamp()),
        "name": name,
        "phone": phone,
        "email": email,
        "preferred_method": preferred,
        "message": message,
        "cost": cost,
        "received_at": datetime.utcnow().isoformat() + "Z"
    }

    consultations_path = os.path.join(DATA_DIR, "consultations.json")
    try:
        if os.path.exists(consultations_path):
            with open(consultations_path, "r", encoding="utf-8") as f:
                existing = json.load(f) or []
        else:
            existing = []

        existing.append(consult_record)

        with open(consultations_path, "w", encoding="utf-8") as f:
            json.dump(existing, f, ensure_ascii=False, indent=2)

    except Exception as e:
        return jsonify({"error": "failed to save consultation", "detail": str(e)}), 500

    # In a real app you might trigger an SMS/call API or notify lawyers here.
    return jsonify({"status": "success", "message": "Consultation request received"}), 201


# ---------------- CHAT / AI PROXY ----------------
@app.route("/api/chat", methods=["POST"])
def chat_proxy():
    """
    Proxy endpoint to forward user messages to Gemini / Google Generative API.
    Expects JSON: { message: string, history?: [{role:'user'|'assistant', content: string}] }
    Reads GEMINI_API_KEY (or GOOGLE_API_KEY) and GEMINI_MODEL from environment.
    """
    data = request.json or {}
    message = data.get("message", "").strip()
    history = data.get("history", [])

    if not message:
        return jsonify({"error": "message is required"}), 400

    api_key = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
    model = os.environ.get("GEMINI_MODEL") or os.environ.get("GOOGLE_MODEL") or "models/gemini-1.0"

    if not api_key:
        return jsonify({"error": "GEMINI_API_KEY not set on server"}), 500

    try:
        # prefer official library if available
        if genai is not None:
            genai.configure(api_key=api_key)
            # build messages in expected format
            msgs = []
            for h in history:
                role = h.get("role", "user")
                content = h.get("content", "")
                msgs.append({"author": role, "content": [{"type": "text","text": content}]})

            msgs.append({"author": "user", "content": [{"type": "text", "text": message}]})

            resp = genai.chat.create(model=model, messages=msgs)
            # try to extract text
            reply = ""
            try:
                for part in resp.output:
                    if isinstance(part, dict) and part.get("content"):
                        for c in part.get("content"):
                            if c.get("type") == "text":
                                reply += c.get("text", "")
                    elif isinstance(part, str):
                        reply += part
            except Exception:
                # fallback
                reply = str(resp)

            return jsonify({"reply": reply})

        # fallback to REST HTTP call
        import requests
        url = f"https://generativelanguage.googleapis.com/v1beta2/{model}:generateMessage?key={api_key}"
        payload = {
            "messages": [
                *[{"author": {"role": h.get("role", "user")}, "content": [{"type":"text","text": h.get("content","")}] } for h in history],
                {"author": {"role": "user"}, "content": [{"type":"text","text": message}]}
            ]
        }
        r = requests.post(url, json=payload, timeout=30)
        r.raise_for_status()
        jr = r.json()
        # extract text reply heuristically
        reply = ""
        try:
            # older API names
            if "candidates" in jr:
                for c in jr.get("candidates", []):
                    reply += c.get("content", "")
            elif "output" in jr:
                for item in jr.get("output", []):
                    if isinstance(item, dict) and item.get("content"):
                        for c in item.get("content"):
                            if c.get("type") == "text":
                                reply += c.get("text", "")
            else:
                reply = jr.get("response", "") or str(jr)
        except Exception:
            reply = str(jr)

        return jsonify({"reply": reply})

    except Exception as e:
        tb = traceback.format_exc()
        return jsonify({"error": "chat failed", "detail": str(e), "trace": tb}), 500

# ---------------- CASE OUTCOME ----------------
@app.route("/api/case/predict", methods=["POST"])
def predict_case():
    data = request.json
    evidence = data.get("evidence_strength", "Moderate")
    past = data.get("past_record", "None")

    score = 50
    score += 25 if evidence == "Strong" else 15 if evidence == "Moderate" else 5
    score += 10 if past == "Serious" else 5 if past == "Minor" else 0
    score = min(score, 95)

    return jsonify({
        "possible_outcome": {
            "probability": f"{score}%",
            "result": "Conviction" if score >= 60 else "Acquittal",
            "basis": "Based on case facts and evidence strength"
        },
        "key_factors": [
            "Strength of available evidence",
            "Nature of the offense",
            "Legal precedents in similar cases",
            "Criminal history consideration"
        ],
        "ai_reasoning": (
            "Based on the provided information, the evidence strength and "
            "nature of the offense significantly influence outcomes. "
            "This is an educational simulation, not a legal prediction."
        ),
        "next_steps": [
            "Gather all documentary evidence",
            "Consult with a qualified lawyer immediately",
            "Prepare witness statements if available"
        ],
        "disclaimer": (
            "This tool is for educational understanding purposes only "
            "and does not constitute legal advice."
        )
    })

# ---------------- SUPREME COURT SEARCH ----------------
@app.route("/api/supreme-court/search", methods=["GET", "POST"])
def supreme_court_search():
    """
    Semantic search endpoint for Supreme Court judgments
    Accepts: ?q=query OR POST {"query": "..."}
    Returns: Top 5 most relevant Supreme Court cases
    """
    try:
        # Get query from GET or POST
        if request.method == "POST":
            data = request.get_json()
            query = data.get("query", "").strip()
        else:
            query = request.args.get("q", "").strip()
        
        # Validate query
        if not query:
            return jsonify({
                "error": "Query parameter is required",
                "example": "/api/supreme-court/search?q=remand order validity under PMLA"
            }), 400
        
        # Get search engine and perform search
        engine = get_supreme_court_engine()
        results = engine.search(query, top_k=5)
        
        # Return results
        return jsonify({
            "query": query,
            "total_results": len(results),
            "results": results,
            "note": "All answers are derived from verified Supreme Court judgments. No legal opinions generated."
        })
    
    except Exception as e:
        return jsonify({
            "error": "Search failed",
            "message": str(e),
            "note": "If this is the first request, the system is building the search index. Please wait and try again."
        }), 500

# ---------------- RUN ----------------
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=False)

