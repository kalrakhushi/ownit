"use client";

import { useState } from "react";
import { Video, Send, Info, ShieldCheck, Upload } from "lucide-react";

type Submission = {
  id: number;
  url: string;
  note: string;
  fromUpload: boolean;
};

export default function InfluencerSubmissionCard() {
  const [videoUrl, setVideoUrl] = useState("");
  const [note, setNote] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [status, setStatus] = useState<"idle" | "submitted">("idle");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoUrl && !file) {
      return;
    }

    let urlToUse = videoUrl;
    let fromUpload = false;

    if (file) {
      urlToUse = URL.createObjectURL(file); // local-only preview
      fromUpload = true;
    }

    setSubmissions((prev) => [
      ...prev,
      {
        id: Date.now(),
        url: urlToUse,
        note,
        fromUpload,
      },
    ]);

    setVideoUrl("");
    setNote("");
    setFile(null);
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
        Share short clips, tips, or walkthroughs. Add a hosted video link or
        pick a local file from Downloads to preview it here. Connect a backend
        later to persist and moderate.
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
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none placeholder:text-gray-900"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-800 mb-1">
            Or upload a file (local preview only)
          </label>
          <label className="flex items-center gap-2 w-full rounded-md border border-dashed border-gray-300 px-3 py-2 text-sm text-gray-700 hover:border-purple-400 cursor-pointer">
            <Upload className="w-4 h-4 text-purple-600" />
            <span className="flex-1 truncate">
              {file ? file.name : "Choose a video from Downloads"}
            </span>
            <input
              type="file"
              accept="video/*"
              className="hidden"
              onChange={(e) => {
                const selected = e.target.files?.[0];
                setFile(selected ?? null);
              }}
            />
          </label>
          <p className="text-xs text-gray-500 mt-1">
            Note: This stays in your browser; wire to storage (e.g., S3) to keep it.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-800 mb-1">
            Short description
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="What’s inside? (e.g., 5-min mobility routine)"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none placeholder:text-gray-900"
            rows={3}
          />
        </div>

        <button
          type="submit"
          className="inline-flex items-center gap-2 rounded-md bg-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-purple-700 focus:outline-none disabled:opacity-50"
          disabled={!videoUrl && !file}
        >
          <Send className="w-4 h-4" />
          Submit video
        </button>
      </form>

      {status === "submitted" && (
        <div className="flex items-start gap-2 rounded-md bg-green-50 border border-green-200 p-3 text-sm text-green-800">
          <ShieldCheck className="w-4 h-4 mt-0.5" />
          Saved in-memory for this session. Hook up an API to persist uploads.
        </div>
      )}

      {submissions.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-gray-200">
          <p className="text-sm font-semibold text-gray-800">Submitted videos</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {submissions.map((item) => (
              <div
                key={item.id}
                className="rounded-md border border-gray-200 p-3 space-y-2 bg-gray-50"
              >
                <div className="text-xs text-gray-600 flex items-center justify-between">
                  <span className="truncate">
                    {item.fromUpload ? "Local upload" : "Link"}
                  </span>
                  {item.fromUpload && (
                    <span className="text-[11px] text-purple-700">Preview only</span>
                  )}
                </div>
                <div className="aspect-video bg-black/5 rounded overflow-hidden">
                  {item.fromUpload ? (
                    <video src={item.url} controls className="w-full h-full object-cover" />
                  ) : (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noreferrer"
                      className="block w-full h-full text-xs text-indigo-700 underline p-2"
                    >
                      Open video link
                    </a>
                  )}
                </div>
                {item.note && (
                  <p className="text-xs text-gray-700 line-clamp-3">{item.note}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-start gap-2 text-xs text-gray-600">
        <Info className="w-4 h-4 mt-0.5 text-gray-500" />
        <span>
          Tip: add moderation and storage by posting to an API endpoint that
          stores the link/upload URL, creator handle, and status (pending/approved).
        </span>
      </div>
    </div>
  );
}
