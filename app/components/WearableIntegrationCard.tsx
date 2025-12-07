"use client";

import React from "react";

// Apple Health Logo (Red heart icon)
const AppleHealthLogo = () => (
  <svg
    width="40"
    height="40"
    viewBox="0 0 40 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M20 8C20 8 15.5 4 10.5 4C9.3 4 8.1 4.3 6.9 4.7C5.7 5.1 4.8 5.7 4 6.5C3.2 7.3 2.6 8.2 2.2 9.4C1.8 10.6 1.5 11.8 1.5 13C1.5 17.5 6 21 20 35.5C34 21 38.5 17.5 38.5 13C38.5 11.8 38.2 10.6 37.8 9.4C37.4 8.2 36.8 7.3 36 6.5C35.2 5.7 34.3 5.1 33.1 4.7C31.9 4.3 30.7 4 29.5 4C24.5 4 20 8 20 8Z"
      fill="#FF3B30"
    />
  </svg>
);

// MyFitnessPal Logo (Blue circle with fork and knife)
const MyFitnessPalLogo = () => (
  <svg
    width="40"
    height="40"
    viewBox="0 0 40 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="20" cy="20" r="18" fill="#1E88E5" />
    {/* Fork */}
    <path
      d="M14 10V26M14 10H16M14 10H12M12 10V12M16 10V12"
      stroke="white"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    {/* Knife */}
    <path
      d="M20 10V26M20 10H22M20 10H18M18 10V12M22 10V12"
      stroke="white"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    {/* Plate */}
    <circle cx="20" cy="28" r="3" stroke="white" strokeWidth="1.5" fill="none" />
  </svg>
);

// Strava Logo (Orange chevron pattern)
const StravaLogo = () => (
  <svg
    width="40"
    height="40"
    viewBox="0 0 40 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M20 5L12.5 20H17.5L20 15L22.5 20H27.5L20 5Z"
      fill="#FC4C02"
    />
    <path
      d="M12.5 20L5 35H10L12.5 30L15 35H20L12.5 20Z"
      fill="#FC4C02"
    />
  </svg>
);

export default function WearableIntegrationCard() {
  const integrations = [
    {
      id: "apple-health",
      name: "Apple Health",
      logo: <AppleHealthLogo />,
    },
    {
      id: "myfitnesspal",
      name: "MyFitnessPal",
      logo: <MyFitnessPalLogo />,
    },
    {
      id: "strava",
      name: "Strava",
      logo: <StravaLogo />,
    },
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <div className="grid grid-cols-3 gap-4">
        {integrations.map((integration) => (
          <button
            key={integration.id}
            className="flex flex-col items-center justify-center gap-3 p-4 rounded-lg border border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center justify-center">
              {integration.logo}
            </div>
            <span className="text-sm font-medium text-gray-900 text-center">
              Connect with {integration.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
