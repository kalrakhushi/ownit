"use client";

import VideoReelFeed from "../components/VideoReelFeed";
import BottomNav from "../components/BottomNav";

export default function InfluencersPage() {
  return (
    <>
      <main className="min-h-screen bg-black">
        <VideoReelFeed />
      </main>
      <BottomNav />
    </>
  );
}
