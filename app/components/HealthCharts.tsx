"use client";

import { useMemo } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface HealthChartsProps {
  data: any[];
}

export default function HealthCharts({ data }: HealthChartsProps) {
  // Transform data for Sleep Line Chart
  const sleepData = useMemo(() => {
    return data
      .filter((r) => r.sleep && r.sleep > 0)
      .map((r) => ({
        date: new Date(r.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        sleep: parseFloat(r.sleep),
        fullDate: r.date,
      }))
      .sort((a, b) => new Date(a.fullDate).getTime() - new Date(b.fullDate).getTime())
      .slice(-30); // Last 30 days max
  }, [data]);

  // Transform data for Steps Bar Chart
  const stepsData = useMemo(() => {
    return data
      .filter((r) => r.steps && r.steps > 0)
      .map((r) => ({
        date: new Date(r.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        steps: parseInt(r.steps),
        fullDate: r.date,
      }))
      .sort((a, b) => new Date(a.fullDate).getTime() - new Date(b.fullDate).getTime())
      .slice(-30); // Last 30 days max
  }, [data]);

  // Calculate macros for Pie Chart
  // Note: Currently only tracking protein, so we'll show protein vs estimated other macros
  const macrosData = useMemo(() => {
    const recordsWithMacros = data.filter((r) => r.protein || r.calories);
    
    if (recordsWithMacros.length === 0) return [];

    // Calculate total protein
    const totalProtein = recordsWithMacros
      .filter((r) => r.protein)
      .reduce((sum, r) => sum + parseFloat(r.protein), 0);

    // Estimate carbs and fats from calories if available
    // Rough estimate: if we have calories, estimate carbs/fats
    const recordsWithCalories = recordsWithMacros.filter((r) => r.calories);
    
    if (recordsWithCalories.length > 0) {
      const avgCalories = recordsWithCalories.reduce((sum, r) => sum + parseInt(r.calories), 0) / recordsWithCalories.length;
      // Estimate: protein ~25%, carbs ~40%, fats ~35% of calories
      // Protein: 4 cal/g, Carbs: 4 cal/g, Fats: 9 cal/g
      const estimatedProteinCal = totalProtein * 4;
      const remainingCal = avgCalories - estimatedProteinCal;
      const estimatedCarbs = (remainingCal * 0.4) / 4; // 40% carbs
      const estimatedFats = (remainingCal * 0.35) / 9; // 35% fats

      return [
        { name: "Protein", value: Math.round(totalProtein / recordsWithMacros.length) },
        { name: "Carbs (est.)", value: Math.round(estimatedCarbs) },
        { name: "Fats (est.)", value: Math.round(estimatedFats) },
      ].filter((item) => item.value > 0);
    }

    // If no calories, just show protein
    return [
      { name: "Protein", value: Math.round(totalProtein / recordsWithMacros.length) },
    ];
  }, [data]);

  // Comparison data (last 7 days vs previous 7 days)
  const comparisonData = useMemo(() => {
    const sortedData = [...data].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const today = new Date();
    today.setHours(23, 59, 59, 999);
    
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);
    
    const fourteenDaysAgo = new Date(today);
    fourteenDaysAgo.setDate(today.getDate() - 14);
    fourteenDaysAgo.setHours(0, 0, 0, 0);

    const last7Days = sortedData.filter((r) => {
      const recordDate = new Date(r.date);
      recordDate.setHours(12, 0, 0, 0);
      return recordDate >= sevenDaysAgo && recordDate <= today;
    });

    const previous7Days = sortedData.filter((r) => {
      const recordDate = new Date(r.date);
      recordDate.setHours(12, 0, 0, 0);
      return recordDate >= fourteenDaysAgo && recordDate < sevenDaysAgo;
    });

    // Calculate averages
    const calculateAvg = (records: any[], field: string) => {
      const filtered = records.filter((r) => r[field] && r[field] > 0);
      if (filtered.length === 0) return 0;
      const sum = filtered.reduce((acc, r) => {
        if (field === "sleep" || field === "protein") {
          return acc + parseFloat(r[field]);
        }
        return acc + parseInt(r[field]);
      }, 0);
      return sum / filtered.length;
    };

    const metrics = ["sleep", "steps", "calories", "protein"];
    const chartData = metrics
      .map((metric) => {
        const last7 = calculateAvg(last7Days, metric);
        const prev7 = calculateAvg(previous7Days, metric);
        
        if (last7 === 0 && prev7 === 0) return null;

        return {
          metric: metric.charAt(0).toUpperCase() + metric.slice(1),
          "Last 7 Days": last7,
          "Previous 7 Days": prev7,
        };
      })
      .filter((item) => item !== null);

    return chartData;
  }, [data]);

  // Colors for charts
  const COLORS = {
    sleep: "#3b82f6", // blue
    steps: "#10b981", // green
    calories: "#f97316", // orange
    protein: "#a855f7", // purple
    macros: ["#a855f7", "#10b981", "#f97316"], // purple, green, orange
  };

  // Format large numbers for tooltips
  const formatNumber = (value: number) => {
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toFixed(1);
  };

  // Check if we have any data to show
  const hasData = sleepData.length > 0 || stepsData.length > 0 || macrosData.length > 0 || comparisonData.length > 0;

  if (!hasData) {
    return (
      <div className="mt-6 p-6 bg-white rounded-lg border border-gray-200">
        <p className="text-sm text-gray-500 text-center">
          Add more health data to see visualizations
        </p>
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-6">
      <h3 className="text-lg font-semibold text-gray-800">Charts & Visualizations</h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sleep Line Chart */}
        {sleepData.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-4">Sleep Over Time</h4>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={sleepData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="date"
                  stroke="#6b7280"
                  fontSize={12}
                  tick={{ fill: "#6b7280" }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis
                  stroke="#6b7280"
                  fontSize={12}
                  tick={{ fill: "#6b7280" }}
                  domain={[0, "auto"]}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "6px",
                  }}
                  formatter={(value: number) => [`${value.toFixed(1)} hrs`, "Sleep"]}
                />
                <Line
                  type="monotone"
                  dataKey="sleep"
                  stroke={COLORS.sleep}
                  strokeWidth={2}
                  dot={{ fill: COLORS.sleep, r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Steps Bar Chart */}
        {stepsData.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-4">Steps Over Time</h4>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={stepsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="date"
                  stroke="#6b7280"
                  fontSize={12}
                  tick={{ fill: "#6b7280" }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis
                  stroke="#6b7280"
                  fontSize={12}
                  tick={{ fill: "#6b7280" }}
                  tickFormatter={formatNumber}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "6px",
                  }}
                  formatter={(value: number) => [`${value.toLocaleString()} steps`, "Steps"]}
                />
                <Bar dataKey="steps" fill={COLORS.steps} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Macros Pie Chart */}
        {macrosData.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-4">Macros Distribution</h4>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={macrosData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                  outerRadius={80}
                  innerRadius={40}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {macrosData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS.macros[index % COLORS.macros.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "6px",
                  }}
                  formatter={(value: number) => [`${value} g`, ""]}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(value) => value}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Comparison Chart */}
        {comparisonData.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-4">7-Day Comparison</h4>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={comparisonData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="metric"
                  stroke="#6b7280"
                  fontSize={12}
                  tick={{ fill: "#6b7280" }}
                />
                <YAxis
                  stroke="#6b7280"
                  fontSize={12}
                  tick={{ fill: "#6b7280" }}
                  tickFormatter={formatNumber}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "6px",
                  }}
                />
                <Legend />
                <Bar dataKey="Last 7 Days" fill={COLORS.steps} radius={[4, 4, 0, 0]} />
                <Bar dataKey="Previous 7 Days" fill="#94a3b8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
