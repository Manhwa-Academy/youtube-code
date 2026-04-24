"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import MuxPlayer from "@mux/mux-player-react";

import { THUMBNAIL_FALLBACK } from "../../constants";

interface VideoPlayerProps {
  playbackId?: string | null;
  thumbnailUrl?: string | null;
  autoPlay?: boolean;
  onPlay?: () => void;

  nextVideo?: {
    id: string;
    title: string;
    thumbnail: string;
    playlistId?: string;
    index?: number;
  };

  onEnded?: () => void;

  autoNextEnabled?: boolean; // ✅ NEW
  loopEnabled?: boolean;
}

export const VideoPlayerSkeleton = () => {
  return <div className="aspect-video bg-black rounded-xl" />;
};

export const VideoPlayer = ({
  playbackId,
  thumbnailUrl,
  autoPlay,
  onPlay,
  nextVideo,
  onEnded,
  autoNextEnabled = true, // ✅ default bật
  loopEnabled = false,
}: VideoPlayerProps) => {
  const router = useRouter();
  const playerRef = useRef<any>(null);

  const [showNext, setShowNext] = useState(false);
  const [countdown, setCountdown] = useState(6);
  const [hasRedirected, setHasRedirected] = useState(false);

  // 🎬 VIDEO END
  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;

    const handleEnded = () => {
      const p = playerRef.current;

      if (loopEnabled && p) {
        p.currentTime = 0;
        p.play();
        return;
      }

      if (!autoNextEnabled) return;

      setCountdown(6);
      setShowNext(true);
      setHasRedirected(false);
    };
    player.addEventListener("ended", handleEnded);

    return () => {
      player.removeEventListener("ended", handleEnded);
    };
  }, [autoNextEnabled, loopEnabled]);

  // 🔥 RESET khi đổi video
  useEffect(() => {
    setShowNext(false);
    setCountdown(6);
    setHasRedirected(false);
  }, [playbackId]);

  // ⏱ COUNTDOWN
  useEffect(() => {
    if (!showNext) return;

    const interval = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [showNext]);

  // 🚀 AUTO NEXT
  useEffect(() => {
    if (
      countdown <= 0 &&
      nextVideo &&
      !hasRedirected &&
      autoNextEnabled // ✅ chặn tại đây
    ) {
      setHasRedirected(true);

      if (onEnded) {
        onEnded();
        return;
      }

      if (nextVideo.playlistId) {
        router.push(
          `/videos/${nextVideo.id}?list=${nextVideo.playlistId}&index=${nextVideo.index}`,
        );
      } else {
        router.push(`/videos/${nextVideo.id}`);
      }
    }
  }, [countdown, nextVideo, hasRedirected, onEnded, router, autoNextEnabled]);

  return (
    <div className="relative w-full h-full">
      <MuxPlayer
        ref={playerRef}
        playbackId={playbackId || ""}
        streamType="on-demand"
        poster={thumbnailUrl || THUMBNAIL_FALLBACK}
        autoPlay={autoPlay}
        className="w-full h-full object-contain"
        accentColor="#FF2056"
        onPlay={onPlay}
      />

      {/* OVERLAY */}
      {autoNextEnabled &&
        showNext &&
        nextVideo && ( // ✅ thêm điều kiện
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-white px-4">
            <p className="mb-2 text-xs sm:text-sm opacity-80 text-center w-full">
              Video tiếp theo sau {countdown}
            </p>

            <div className="w-full max-w-md flex items-center gap-3 mb-4">
              <div className="relative flex-shrink-0 w-24 aspect-video rounded-lg overflow-hidden -translate-y-2">
                <img
                  src={nextVideo.thumbnail}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>

              <p className="text-xs sm:text-sm font-medium line-clamp-2 flex-1">
                {nextVideo.title}
              </p>
            </div>

            <div className="flex gap-2 w-full max-w-md">
              <button
                onClick={() => setShowNext(false)}
                className="flex-1 px-4 py-2 bg-gray-700 rounded-full text-sm"
              >
                HỦY
              </button>

              <button
                onClick={() => {
                  setHasRedirected(true);

                  if (onEnded) {
                    onEnded();
                  } else if (nextVideo.playlistId) {
                    router.push(
                      `/videos/${nextVideo.id}?list=${nextVideo.playlistId}&index=${nextVideo.index}`,
                    );
                  } else {
                    router.push(`/videos/${nextVideo.id}`);
                  }
                }}
                className="flex-1 px-4 py-2 bg-white text-black rounded-full font-semibold text-sm"
              >
                PHÁT NGAY
              </button>
            </div>
          </div>
        )}
    </div>
  );
};
