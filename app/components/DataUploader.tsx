"use client";

import { useState } from "react";
import Papa from "papaparse";
import { CheckCircle2 } from "lucide-react";

interface DataUploaderProps {
  onDataLoaded: (data: any[], fileName: string) => void;
}

export default function DataUploader({ onDataLoaded }: DataUploaderProps) {
  const [mode, setMode] = useState<"quick" | "upload">("quick");
  const [fileName, setFileName] = useState<string | null>(null);
  
  // Quick entry form state
  const [quickEntry, setQuickEntry] = useState({
    date: new Date().toISOString().split("T")[0],
    weight: "",
    steps: "",
    sleep: "",
    calories: "",
    protein: "",
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);

    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      complete: async (result) => {
        try {
          // Save to database
          const response = await fetch('/api/health-records', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(result.data),
          });

          if (!response.ok) {
            throw new Error('Failed to save data to database');
          }

          const savedData = await response.json();
          onDataLoaded(Array.isArray(savedData) ? savedData : [savedData], file.name);
        } catch (error) {
          console.error('Error saving CSV data:', error);
          alert('Failed to save data to database. Please try again.');
        }
      },
    });
  };

  const handleQuickSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Convert quick entry to array format (single record)
    const entry: any = {
      date: quickEntry.date,
    };
    
    if (quickEntry.weight) entry.weight = parseFloat(quickEntry.weight);
    if (quickEntry.steps) entry.steps = parseInt(quickEntry.steps);
    if (quickEntry.sleep) entry.sleep = parseFloat(quickEntry.sleep);
    if (quickEntry.calories) entry.calories = parseInt(quickEntry.calories);
    if (quickEntry.protein) entry.protein = parseFloat(quickEntry.protein);

    try {
      // Save to database
      const response = await fetch('/api/health-records', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(entry),
      });

      if (!response.ok) {
        throw new Error('Failed to save data to database');
      }

      const savedEntry = await response.json();
      onDataLoaded([savedEntry], "quick-entry");
      
      // Reset form (keep date)
      setQuickEntry({
        date: new Date().toISOString().split("T")[0],
        weight: "",
        steps: "",
        sleep: "",
        calories: "",
        protein: "",
      });
    } catch (error) {
      console.error('Error saving quick entry:', error);
      alert('Failed to save entry to database. Please try again.');
    }
  };

  return (
    <div className="space-y-4">
      {/* Mode Toggle */}
      <div className="flex gap-2 border-b pb-2">
        <button
          onClick={() => setMode("quick")}
          className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
            mode === "quick"
              ? "bg-green-100 text-green-700 border-b-2 border-green-500"
              : "text-gray-600 hover:text-gray-800"
          }`}
        >
          Quick Entry
        </button>
        <button
          onClick={() => setMode("upload")}
          className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
            mode === "upload"
              ? "bg-green-100 text-green-700 border-b-2 border-green-500"
              : "text-gray-600 hover:text-gray-800"
          }`}
        >
          CSV Upload
        </button>
      </div>

      {/* Quick Entry Form */}
      {mode === "quick" && (
        <form onSubmit={handleQuickSubmit} className="p-4 bg-white rounded-lg shadow border">
          <h3 className="font-semibold mb-4 text-gray-800">Log Today's Health Data</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              <input
                type="date"
                value={quickEntry.date}
                onChange={(e) => setQuickEntry({ ...quickEntry, date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Weight (kg)
              </label>
              <input
                type="number"
                step="0.1"
                value={quickEntry.weight}
                onChange={(e) => setQuickEntry({ ...quickEntry, weight: e.target.value })}
                placeholder="e.g., 70.5"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Steps
              </label>
              <input
                type="number"
                value={quickEntry.steps}
                onChange={(e) => setQuickEntry({ ...quickEntry, steps: e.target.value })}
                placeholder="e.g., 10000"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sleep (hours)
              </label>
              <input
                type="number"
                step="0.1"
                value={quickEntry.sleep}
                onChange={(e) => setQuickEntry({ ...quickEntry, sleep: e.target.value })}
                placeholder="e.g., 7.5"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Calories
              </label>
              <input
                type="number"
                value={quickEntry.calories}
                onChange={(e) => setQuickEntry({ ...quickEntry, calories: e.target.value })}
                placeholder="e.g., 2000"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Protein (g)
              </label>
              <input
                type="number"
                step="0.1"
                value={quickEntry.protein}
                onChange={(e) => setQuickEntry({ ...quickEntry, protein: e.target.value })}
                placeholder="e.g., 150"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          <button
            type="submit"
            className="mt-4 w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors font-medium"
          >
            Add Entry
          </button>
          
          <p className="text-xs text-gray-500 mt-2 text-center">
            Fill in any fields you want to track. Leave others blank.
          </p>
        </form>
      )}

      {/* CSV Upload */}
      {mode === "upload" && (
        <div className="p-4 bg-white rounded-lg shadow border">
          <h3 className="font-semibold mb-2 text-gray-800">Upload Health Data CSV</h3>
          <p className="text-sm text-gray-600 mb-4">
            Import historical data from Apple Health, Google Fit, or other health apps.
          </p>

          <input 
            type="file" 
            accept=".csv" 
            onChange={handleFileUpload} 
            className="cursor-pointer w-full px-3 py-2 border border-gray-300 rounded-md"
          />

          {fileName && (
            <p className="text-sm text-green-600 mt-2 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Uploaded: {fileName}
            </p>
          )}

          <p className="text-xs text-gray-500 mt-3">
            CSV should have headers like: date, weight, steps, sleep, calories, protein
          </p>
        </div>
      )}
    </div>
  );
}

