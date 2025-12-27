import { useEffect, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface CrimeSummary {
  YEAR: number;
  "TOTAL IPC CRIMES": number;
}

export default function IPCCrimeDashboard() {
  const [data, setData] = useState<CrimeSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://127.0.0.1:5000/api/crime/summary")
      .then((res) => {
        if (!res.ok) throw new Error("API error");
        return res.json();
      })
      .then((json) => {
        setData(json || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  /* 🔹 Prepare chart data */
  const barData = data.slice(-10);

  const pieData = data.map((d) => ({
    name: String(d.YEAR),
    value: d["TOTAL IPC CRIMES"],
  }));

  const COLORS = [
    "#ff9933",
    "#1a2847",
    "#ff6b6b",
    "#6a5acd",
    "#2ecc71",
    "#e84393",
    "#00cec9",
    "#fdcb6e",
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <div className="flex-1 py-10 w-full px-6">
        <h1 className="text-3xl text-[#1a2847] mb-2">
          IPC Crime Trends Dashboard
        </h1>
        <p className="text-gray-600 mb-6">
          Year-wise IPC crime analytics (NCRB dataset)
        </p>

        {loading && <p>Loading analytics…</p>}

        {!loading && data.length > 0 && (
          <>
            {/* 🔥 YEAR-WISE BAR CHART */}
            <Card className="mb-10">
              <CardHeader className="bg-[#1a2847] text-white">
                <CardTitle>IPC Crimes by Year</CardTitle>
              </CardHeader>
              <CardContent style={{ height: 420 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="YEAR" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="TOTAL IPC CRIMES" fill="#ff9933" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* 🔥 PIE CHART */}
            <Card>
              <CardHeader className="bg-[#1a2847] text-white">
                <CardTitle>Crime Distribution by Year</CardTitle>
              </CardHeader>
              <CardContent style={{ height: 360 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      outerRadius={140}
                    >
                      {pieData.map((_, i) => (
                        <Cell
                          key={i}
                          fill={COLORS[i % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </>
        )}

        {!loading && data.length === 0 && (
          <p className="text-gray-500">
            No IPC crime data available.
          </p>
        )}
      </div>

      <Footer />
    </div>
  );
}
