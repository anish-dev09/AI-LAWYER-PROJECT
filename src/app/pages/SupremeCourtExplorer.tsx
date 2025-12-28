import { useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Search, AlertCircle, Gavel, Calendar, Award } from "lucide-react";

interface SearchResult {
  case_name: string;
  judgement_date: string;
  matched_question: string;
  answer: string;
  confidence_score: number;
}

interface APIResponse {
  query: string;
  total_results: number;
  results: SearchResult[];
  note: string;
}

export default function SupremeCourtExplorer() {
  const [question, setQuestion] = useState("");
  const [response, setResponse] = useState<APIResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async () => {
    if (!question.trim()) {
      setError("Please enter a legal question");
      return;
    }

    setLoading(true);
    setError("");
    setResponse(null);

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await fetch(
        `${API_URL}/api/supreme-court/search?q=${encodeURIComponent(question)}`
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Search failed");
      }

      const data: APIResponse = await res.json();
      
      if (data.total_results === 0) {
        setError("No relevant Supreme Court judgments found. Try rephrasing your question.");
      } else {
        setResponse(data);
      }
    } catch (err) {
      setError(
        err instanceof Error 
          ? err.message 
          : "Failed to search Supreme Court judgments. Please ensure the backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <div className="flex-1 py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-[#1a2847] mb-3 flex items-center justify-center gap-3">
              <Gavel className="w-10 h-10 text-[#ff9933]" />
              Supreme Court AI Lawyer
            </h1>
            <p className="text-gray-600 text-lg">
              Ask legal questions and receive answers based on verified Supreme Court judgments
            </p>
            <p className="text-sm text-gray-500 mt-2">
              ✅ No hallucinations • ✅ Semantic search • ✅ Top 5 relevant cases
            </p>
          </div>

          {/* SEARCH BOX */}
          <Card className="mb-8 shadow-lg">
            <CardContent className="p-6">
              <div className="flex gap-4">
                <Input
                  placeholder="e.g., Was the remand order valid under PMLA?"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="text-lg"
                  disabled={loading}
                />
                <Button
                  onClick={handleSearch}
                  className="bg-[#1a2847] hover:bg-[#2a3857] px-8"
                  disabled={loading}
                >
                  <Search className="w-4 h-4 mr-2" />
                  {loading ? "Searching..." : "Search"}
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-3">
                💡 Tip: Use legal terminology for better results (e.g., "remand", "bail", "conviction")
              </p>
            </CardContent>
          </Card>

          {/* LOADING */}
          {loading && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#1a2847] border-t-transparent"></div>
              <p className="text-gray-600 mt-4 text-lg">Searching Supreme Court judgments...</p>
              <p className="text-gray-500 text-sm mt-2">
                {response === null && "First search may take longer while building the search index"}
              </p>
            </div>
          )}

          {/* ERROR */}
          {error && !loading && (
            <Card className="bg-red-50 border-2 border-red-300">
              <CardContent className="p-6 flex gap-3 items-start">
                <AlertCircle className="text-red-700 flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold text-red-900">Search Error</p>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* RESULTS */}
          {response && !loading && (
            <div className="space-y-6">
              <div className="bg-white border-2 border-[#ff9933] rounded-lg p-4">
                <p className="text-sm text-gray-700">
                  <strong>Your Query:</strong> "{response.query}"
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Found <strong>{response.total_results}</strong> relevant Supreme Court cases
                </p>
              </div>

              {response.results.map((result, index) => (
                <Card key={index} className="shadow-lg hover:shadow-xl transition-shadow">
                  <CardHeader className="bg-gradient-to-r from-[#1a2847] to-[#2a3857] text-white">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <Award className="w-5 h-5 text-[#ff9933]" />
                          Result #{index + 1}: {result.case_name}
                        </CardTitle>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-300">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {result.judgement_date}
                          </span>
                          <span className="bg-[#ff9933] text-white px-3 py-1 rounded-full text-xs font-semibold">
                            Confidence: {(result.confidence_score * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="p-6 space-y-4">
                    <div>
                      <h3 className="text-base font-semibold text-[#1a2847] mb-2 flex items-center gap-2">
                        <span className="w-2 h-2 bg-[#ff9933] rounded-full"></span>
                        Matched Question
                      </h3>
                      <p className="text-gray-700 bg-gray-50 p-3 rounded-lg italic">
                        "{result.matched_question}"
                      </p>
                    </div>

                    <div>
                      <h3 className="text-base font-semibold text-[#1a2847] mb-2 flex items-center gap-2">
                        <span className="w-2 h-2 bg-[#ff9933] rounded-full"></span>
                        Supreme Court Answer
                      </h3>
                      <p className="text-gray-800 leading-relaxed bg-blue-50 p-4 rounded-lg border-l-4 border-[#1a2847]">
                        {result.answer}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}

              <Card className="bg-yellow-50 border-2 border-yellow-400">
                <CardContent className="p-4">
                  <p className="text-sm text-gray-700 flex items-start gap-2">
                    <AlertCircle className="text-yellow-700 flex-shrink-0 mt-0.5" />
                    <span>
                      <strong>Disclaimer:</strong> {response.note} This system is for educational purposes only and does not constitute legal advice. Always consult a qualified lawyer for legal matters.
                    </span>
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
