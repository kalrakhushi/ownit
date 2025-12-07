"use client";

import { useState } from "react";
import { Video, Send, Info, ShieldCheck } from "lucide-react";

export default function InfluencerSubmissionCard() {
  const [videoUrl, setVideoUrl] = useState("");
  const [note, setNote] = useState("");
  const [status, setStatus] = useState<"idle" | "submitted">("idle");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Placeholder: integrate with backend for real submissions
    setStatus("submitted");
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm space-y-4">
      <div className="flex items-center gap-2">
        <Video className="w-5 h-5 text-purple-600" />
        <h2 className="text-lg font-semibold text-gray-900">
          Influencer Video Submissions
        </h2>
      </div>
      <p className="text-sm text-gray-700">
        Share short clips, tips, or walkthroughs. Submit a video link and a brief
        description; we’ll review and feature it on the dashboard.
      </p>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-800 mb-1">
            Video link (YouTube, Vimeo, etc.)
          </label>
          <input
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="https://youtube.com/watch?v=..."
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-800 mb-1">
            Short description
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="What’s inside? (e.g., 5-min mobility routine)"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none"
            rows={3}
          />
        </div>

        <button
          type="submit"
          className="inline-flex items-center gap-2 rounded-md bg-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-purple-700 focus:outline-none"
        >
          <Send className="w-4 h-4" />
          Submit video
        </button>
      </form>

      {status === "submitted" && (
        <div className="flex items-start gap-2 rounded-md bg-green-50 border border-green-200 p-3 text-sm text-green-800">
          <ShieldCheck className="w-4 h-4 mt-0.5" />
          Submission recorded locally. Hook this up to your backend review
          queue to accept videos.
        </div>
      )}

      <div className="flex items-start gap-2 text-xs text-gray-600">
        <Info className="w-4 h-4 mt-0.5 text-gray-500" />
        <span>
          Tip: add moderation and storage by posting to an API endpoint that
          stores the link, creator handle, and status (pending/approved).
        </span>
      </div>
    </div>
  );
}
