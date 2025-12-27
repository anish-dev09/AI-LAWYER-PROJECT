from flask import Flask, jsonify, request
from flask_cors import CORS
import pandas as pd
import json
import os

app = Flask(__name__)
CORS(app)

# ---------------- PATHS ----------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")

# ---------------- LOAD DATA ----------------
ipc_df = pd.read_csv(os.path.join(DATA_DIR, "ipc_crime.csv")).fillna(0)
women_df = pd.read_csv(os.path.join(DATA_DIR, "women_crime.csv")).fillna(0)

ipc_df.columns = ipc_df.columns.str.strip()
women_df.columns = women_df.columns.str.strip()

with open(os.path.join(DATA_DIR, "ipc_sections.json"), encoding="utf-8") as f:
    ipc_sections = json.load(f)

with open(os.path.join(DATA_DIR, "legal_awareness.json"), encoding="utf-8") as f:
    legal_awareness = json.load(f)

with open(os.path.join(DATA_DIR, "legal_faqs.json"), encoding="utf-8") as f:
    legal_faqs = json.load(f)

with open(os.path.join(DATA_DIR, "helplines.json"), encoding="utf-8") as f:
    helplines = json.load(f)

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
            "/api/case/predict"
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

# ---------------- RUN ----------------
if __name__ == "__main__":
    app.run(debug=True)

