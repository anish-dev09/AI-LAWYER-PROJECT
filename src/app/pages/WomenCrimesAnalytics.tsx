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

interface StateCrime {
  State: string;
  TOTAL: number;
}

export default function WomenCrimesAnalytics() {
  const [data, setData] = useState<StateCrime[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://127.0.0.1:5000/api/women/dashboard")
      .then((res) => {
        if (!res.ok) throw new Error("API error");
        return res.json();
      })
      .then((json) => {
        setData(json.state_wise || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  /* 🔥 Transform data for charts */
  const crimeArray = data.map((d) => ({
    name: d.State,
    value: d.TOTAL,
  }));

  const top3Crimes = [...crimeArray]
    .sort((a, b) => b.value - a.value)
    .slice(0, 3);

  const COLORS = [
    "#ff6b6b",
    "#ff9f43",
    "#1dd1a1",
    "#54a0ff",
    "#5f27cd",
    "#00d2d3",
    "#e84393",
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <div className="flex-1 w-full px-6 py-10">
        <h1 className="text-3xl text-[#1a2847] mb-2">
          Women Crime Analytics
        </h1>
        <p className="text-gray-600 mb-6">
          Crime distribution by state (based on NCRB dataset)
        </p>

        {loading && <p>Loading analytics...</p>}

        {!loading && data.length > 0 && (
          <>
            {/* 🔥 TOP 3 STATES BAR GRAPH */}
            <Card className="mb-10">
              <CardHeader className="bg-[#1a2847] text-white">
                <CardTitle>Top 3 States – Crimes Against Women</CardTitle>
              </CardHeader>
              <CardContent style={{ height: 400 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={top3Crimes}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#ff6b6b" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* 🔥 PIE – ALL STATES */}
            <Card className="mb-10">
              <CardHeader className="bg-[#1a2847] text-white">
                <CardTitle>
                  State-wise Crime Distribution
                </CardTitle>
              </CardHeader>
              <CardContent style={{ height: 380 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={crimeArray}
                      dataKey="value"
                      nameKey="name"
                      label
                    >
                      {crimeArray.map((_, i) => (
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

            {/* 🔥 TABLE */}
            <Card>
              <CardHeader>
                <CardTitle>State-wise Crime Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <table className="min-w-full border text-sm">
                  <thead className="bg-gray-200">
                    <tr>
                      <th className="border px-3 py-2 text-left">State</th>
                      <th className="border px-3 py-2 text-right">
                        Total Cases
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {crimeArray.map((c, i) => (
                      <tr key={i}>
                        <td className="border px-3 py-2">{c.name}</td>
                        <td className="border px-3 py-2 text-right">
                          {c.value.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </>
        )}

        {!loading && data.length === 0 && (
          <p className="text-gray-500">
            No crime data available.
          </p>
        )}
      </div>

      <Footer />
    </div>
  );
}
