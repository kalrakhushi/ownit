"use client";

import { useState } from "react";
import Papa from "papaparse";

interface DataUploaderProps {
  onDataLoaded: (data: any[]) => void;
}

export default function DataUploader({ onDataLoaded }: DataUploaderProps) {
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);

    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      complete: (result) => {
        onDataLoaded(result.data);
      },
    });
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow border">
      <h3 className="font-semibold mb-2 text-gray-800">Upload Health Data CSV</h3>

      <input 
        type="file" 
        accept=".csv" 
        onChange={handleFileUpload} 
        className="cursor-pointer"
      />

      {fileName && (
        <p className="text-sm text-gray-500 mt-2">Uploaded: {fileName}</p>
      )}
    </div>
  );
}

