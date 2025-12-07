"use client";

import { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";

type VideoItem = {
  id: string;
  src: string;
  title?: string;
};

export default function VideoReelFeed() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  const videos: VideoItem[] = [
    { id: "1", src: "/Download.mp4" },
    { id: "2", src: "/Download (1).mp4" },
  ];

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;

      const container = containerRef.current;
      const scrollTop = container.scrollTop;
      const itemHeight = container.clientHeight;
      const newIndex = Math.round(scrollTop / itemHeight);

      if (newIndex !== currentIndex && newIndex >= 0 && newIndex < videos.length) {
        // Pause all videos first
        videoRefs.current.forEach((video) => {
          if (video) {
            video.pause();
          }
        });

        setCurrentIndex(newIndex);

        // Play new video
        const newVideo = videoRefs.current[newIndex];
        if (newVideo) {
          newVideo.currentTime = 0;
          newVideo.play().catch(() => {
            // Autoplay might be blocked
          });
          setIsPlaying(true);
        }
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
      return () => container.removeEventListener("scroll", handleScroll);
    }
  }, [currentIndex, videos.length]);

  useEffect(() => {
    // Auto-play current video when isPlaying changes
    const currentVideo = videoRefs.current[currentIndex];
    if (currentVideo) {
      if (isPlaying) {
        currentVideo.play().catch(() => {
          // Autoplay might be blocked, user will need to interact
        });
      } else {
        currentVideo.pause();
      }
    }
  }, [isPlaying, currentIndex]);

  const handleVideoClick = () => {
    const video = videoRefs.current[currentIndex];
    if (video) {
      if (video.paused) {
        video.play();
        setIsPlaying(true);
      } else {
        video.pause();
        setIsPlaying(false);
      }
    }
  };

  const toggleMute = () => {
    const video = videoRefs.current[currentIndex];
    if (video) {
      video.muted = !video.muted;
      setIsMuted(video.muted);
    }
  };

  const handleVideoEnd = (index: number) => {
    // Auto-scroll to next video when current ends
    if (index < videos.length - 1) {
      const container = containerRef.current;
      if (container) {
        const nextIndex = index + 1;
        container.scrollTo({
          top: nextIndex * container.clientHeight,
          behavior: "smooth",
        });
      }
    }
  };

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      <div
        ref={containerRef}
        className="h-screen overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
        style={{ scrollBehavior: "smooth" }}
      >
        {videos.map((video, index) => (
          <div
            key={video.id}
            className="relative w-full h-screen snap-start flex items-center justify-center bg-black"
          >
            <video
              ref={(el) => {
                videoRefs.current[index] = el;
              }}
              src={video.src}
              className="w-full h-full object-contain cursor-pointer"
              loop={false}
              muted={isMuted || index !== currentIndex}
              playsInline
              onEnded={() => handleVideoEnd(index)}
              onClick={handleVideoClick}
              autoPlay={index === 0}
              preload="auto"
            />

            {/* Controls overlay - only show on current video */}
            {index === currentIndex && (
              <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={handleVideoClick}
                      className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                    >
                      {isPlaying ? (
                        <Pause className="w-6 h-6 text-white" />
                      ) : (
                        <Play className="w-6 h-6 text-white" />
                      )}
                    </button>
                    <button
                      onClick={toggleMute}
                      className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                    >
                      {isMuted ? (
                        <VolumeX className="w-6 h-6 text-white" />
                      ) : (
                        <Volume2 className="w-6 h-6 text-white" />
                      )}
                    </button>
                  </div>
                  <div className="text-white text-sm">
                    {index + 1} / {videos.length}
                  </div>
                </div>
              </div>
            )}

            {/* Scroll indicator */}
            {index === currentIndex && index < videos.length - 1 && (
              <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 animate-bounce">
                <div className="w-6 h-10 border-2 border-white/50 rounded-full flex items-start justify-center p-2">
                  <div className="w-1 h-3 bg-white/50 rounded-full"></div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
