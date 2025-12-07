"use client";

import { useState } from "react";
import { Smile, Frown, Meh, Save, Loader2 } from "lucide-react";

interface MoodLoggerProps {
  onSave?: () => void;
}

export default function MoodLogger({ onSave }: MoodLoggerProps) {
  const [mood, setMood] = useState<number>(5);
  const [energy, setEnergy] = useState<number>(5);
  const [stress, setStress] = useState<number>(5);
  const [reflection, setReflection] = useState("");
  const [tags, setTags] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaved(false);

    try {
      const response = await fetch("/api/mood", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: today,
          mood,
          energy,
          stress,
          reflection: reflection.trim() || null,
          tags: tags.trim() || null,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save mood entry");
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      
      // Reset form
      setReflection("");
      setTags("");
      
      if (onSave) {
        onSave();
      }
    } catch (error) {
      console.error("Error saving mood:", error);
      alert("Failed to save mood entry. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const getMoodEmoji = (value: number) => {
    if (value >= 8) return <Smile className="w-6 h-6 text-green-600" />;
    if (value >= 5) return <Meh className="w-6 h-6 text-yellow-600" />;
    return <Frown className="w-6 h-6 text-red-600" />;
  };

  const getMoodLabel = (value: number) => {
    if (value >= 9) return "Excellent";
    if (value >= 7) return "Good";
    if (value >= 5) return "Okay";
    if (value >= 3) return "Low";
    return "Very Low";
  };

  const Slider = ({
    label,
    value,
    onChange,
    icon,
  }: {
    label: string;
    value: number;
    onChange: (value: number) => void;
    icon?: React.ReactNode;
  }) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
          {icon}
          {label}
        </label>
        <span className="text-sm font-semibold text-gray-900">{value}/10</span>
      </div>
      <input
        type="range"
        min="1"
        max="10"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600"
      />
      <div className="flex justify-between text-xs text-gray-500">
        <span>Low</span>
        <span>High</span>
      </div>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">How are you feeling today?</h3>
        
        {/* Mood Display */}
        <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
          <div className="flex items-center justify-center gap-4 mb-2">
            {getMoodEmoji(mood)}
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">{mood}</div>
              <div className="text-sm text-gray-600">{getMoodLabel(mood)}</div>
            </div>
          </div>
        </div>

        {/* Mood Slider */}
        <div className="mb-6">
          <Slider
            label="Overall Mood"
            value={mood}
            onChange={setMood}
            icon={<Smile className="w-4 h-4" />}
          />
        </div>

        {/* Energy Slider */}
        <div className="mb-6">
          <Slider
            label="Energy Level"
            value={energy}
            onChange={setEnergy}
          />
        </div>

        {/* Stress Slider */}
        <div className="mb-6">
          <Slider
            label="Stress Level"
            value={stress}
            onChange={setStress}
          />
        </div>

        {/* Reflection Textarea */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Reflection (optional)
          </label>
          <textarea
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
            placeholder="How did today go? What made you feel this way?"
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none placeholder:text-gray-900"
          />
        </div>

        {/* Tags Input */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tags (optional, comma-separated)
          </label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="e.g., happy, productive, exercise, tired"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent placeholder:text-gray-900"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSaving}
          className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-all ${
            isSaving
              ? "bg-gray-400 cursor-not-allowed"
              : saved
              ? "bg-green-600"
              : "bg-green-600 hover:bg-green-700 active:scale-95"
          }`}
        >
          {isSaving ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              Saving...
            </span>
          ) : saved ? (
            <span className="flex items-center justify-center gap-2">
              <Save className="w-5 h-5" />
              Saved!
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <Save className="w-5 h-5" />
              Save Mood Entry
            </span>
          )}
        </button>
      </div>
    </form>
  );
}
