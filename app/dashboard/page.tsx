"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, BarChart3 } from "lucide-react";
import DataUploader from "../components/DataUploader";
import DataTable from "../components/DataTable";
import DashboardOverview from "../components/DashboardOverview";
import HealthCharts from "../components/HealthCharts";
import RiskAlerts from "../components/RiskAlerts";
import ComparisonView from "../components/ComparisonView";
import BottomNav from "../components/BottomNav";
import { RiskAlert } from "@/lib/risk-detection";
import { ComparisonResult } from "@/lib/comparison-utils";
import WearableIntegrationCard from "../components/WearableIntegrationCard";
import LeaderboardCard from "../components/LeaderboardCard";

export default function DashboardPage() {
  const [healthData, setHealthData] = useState<any[]>([]);
  const [dataFileName, setDataFileName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [riskAlerts, setRiskAlerts] = useState<RiskAlert[]>([]);
  const [isLoadingAlerts, setIsLoadingAlerts] = useState(true);
  const [comparisons, setComparisons] = useState<ComparisonResult[]>([]);
  const [isLoadingComparison, setIsLoadingComparison] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch("/api/health-records");
        if (response.ok) {
          const data = await response.json();
          setHealthData(data);
          if (data.length > 0) {
            setDataFileName("Database");
          }
        }
      } catch (error) {
        console.error("Error loading health data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    const loadRiskAlerts = async () => {
      setIsLoadingAlerts(true);
      try {
        const response = await fetch("/api/risk-alerts");
        if (response.ok) {
          const data = await response.json();
          setRiskAlerts(data.alerts || []);
        }
      } catch (error) {
        console.error("Error loading risk alerts:", error);
      } finally {
        setIsLoadingAlerts(false);
      }
    };

    loadRiskAlerts();
  }, [healthData]);

  const handleDataLoaded = async (data: any[], fileName: string) => {
    try {
      const response = await fetch("/api/health-records");
      if (response.ok) {
        const allData = await response.json();
        setHealthData(allData);
        if (fileName === "quick-entry") {
          setDataFileName("Database");
        } else {
          setDataFileName(fileName);
        }
      } else {
        if (fileName === "quick-entry") {
          setHealthData((prev) => [...prev, ...data]);
          setDataFileName("Quick entries");
        } else {
          setHealthData(data);
          setDataFileName(fileName);
        }
      }
    } catch (error) {
      console.error("Error reloading data:", error);
      if (fileName === "quick-entry") {
        setHealthData((prev) => [...prev, ...data]);
        setDataFileName("Quick entries");
      } else {
        setHealthData(data);
        setDataFileName(fileName);
      }
    }
  };

  return (
    <>
      <main className="min-h-screen bg-gray-100 pb-20">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Dashboard</h1>

          <div className="mb-6">
            <WearableIntegrationCard />
          </div>

          {/* Leaderboard */}
          <div className="mb-6">
            <LeaderboardCard limit={5} />
          </div>

          <DataUploader onDataLoaded={handleDataLoaded} />

          {isLoading ? (
            <p className="text-gray-600 mt-4 text-center">Loading data...</p>
          ) : healthData.length > 0 ? (
            <>
              <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm text-green-800 mb-2 font-medium flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  {healthData.length} record{healthData.length !== 1 ? "s" : ""} loaded
                  {dataFileName && ` from ${dataFileName}`}
                </p>
                <p className="text-sm text-gray-600 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Data is now available for charts, insights, and ML predictions.
                </p>
              </div>

              {/* Risk Alerts */}
              <div className="mt-6">
                <RiskAlerts alerts={riskAlerts} isLoading={isLoadingAlerts} />
              </div>

              {/* Comparison View */}
              {comparisons.length > 0 && (
                <div className="mt-6 bg-white rounded-lg border border-gray-200 p-6">
                  <ComparisonView
                    comparisons={comparisons}
                    isLoading={isLoadingComparison}
                    period="7 days"
                  />
                </div>
              )}

              <DashboardOverview data={healthData} />
              <HealthCharts data={healthData} />
              <DataTable data={healthData} />
            </>
          ) : (
            <p className="text-gray-600 mt-4 text-center flex items-center justify-center gap-2">
              <BarChart3 className="w-5 h-5" />
              <span>
                Use <strong>Quick Entry</strong> to log daily data, or <strong>CSV Upload</strong> to import historical data.
              </span>
            </p>
          )}
        </div>
      </main>
      <BottomNav />
    </>
  );
}
