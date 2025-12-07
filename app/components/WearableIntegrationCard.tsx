"use client";

import { Link2, UploadCloud, Smartphone, ShieldCheck } from "lucide-react";
import React from "react";

const endpoint = "/api/wearables";

const samplePayload = [
  {
    source: "apple_health",
    type: "steps",
    startTime: "2025-12-07T07:00:00Z",
    endTime: "2025-12-07T08:00:00Z",
    value: 1234,
    unit: "count",
    metadata: { device: "Apple Watch", app: "Health" },
  },
];

export default function WearableIntegrationCard() {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm space-y-4">
      <div className="flex items-center gap-2">
        <Link2 className="w-5 h-5 text-indigo-600" />
        <h2 className="text-lg font-semibold text-gray-900">
          Connect Apple Health, Google Fit, Fitbit, MyFitnessPal
        </h2>
      </div>
      <p className="text-sm text-gray-700">
        Bring in steps, calories, sleep, heart rate, distance, and nutrition
        from your wearable or health apps. Use the endpoint below from your
        mobile client or integration service—no manual entry required.
      </p>

      <div className="grid gap-3 sm:grid-cols-3">
        <InfoPill icon={<UploadCloud className="w-4 h-4" />} title="Endpoint">
          <code className="text-xs break-all">{endpoint}</code>
        </InfoPill>
        <InfoPill icon={<Smartphone className="w-4 h-4" />} title="Sources">
          apple_health • fitbit • google_fit • myfitnesspal
        </InfoPill>
        <InfoPill icon={<ShieldCheck className="w-4 h-4" />} title="Deduped">
          We skip duplicates by source/type/time window.
        </InfoPill>
      </div>

      <div>
        <p className="text-sm font-medium text-gray-800 mb-2">
          Example request
        </p>
        <pre className="text-xs bg-gray-50 border border-gray-200 rounded-md p-3 overflow-x-auto">
{`POST ${endpoint}
Content-Type: application/json

${JSON.stringify(samplePayload, null, 2)}`}
        </pre>
      </div>

      <ul className="text-sm text-gray-700 list-disc list-inside space-y-1">
        <li>Send batches; we accept arrays.</li>
        <li>Timestamps must be ISO strings; we normalize and validate.</li>
        <li>Use this from your mobile app’s HealthKit/Google Fit/Fitbit sync.</li>
      </ul>
    </div>
  );
}

function InfoPill({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2">
      <div className="flex items-center gap-2 text-sm font-semibold text-gray-800 mb-1">
        {icon}
        {title}
      </div>
      <p className="text-xs text-gray-700">{children}</p>
    </div>
  );
}
