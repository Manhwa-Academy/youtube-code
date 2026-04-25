"use client";

import { useEffect, useRef, useState, forwardRef } from "react";
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
  autoNextEnabled?: boolean;
  loopEnabled?: boolean;
  onTimeUpdate?: (current: number, duration: number) => void;
}

export const VideoPlayerSkeleton = () => (
  <div className="aspect-video bg-black rounded-xl" />
);

export const VideoPlayer = forwardRef<any, VideoPlayerProps>(
  (
    {
      playbackId,
      thumbnailUrl,
      autoPlay,
      onPlay,
      nextVideo,
      onEnded,
      autoNextEnabled = true,
      loopEnabled = false,
      onTimeUpdate,
    },
    ref,
  ) => {
    const router = useRouter();
    const internalRef = useRef<any>(null);
    const playerRef = (ref as React.RefObject<any>) || internalRef;

    const [showNext, setShowNext] = useState(false);
    const [countdown, setCountdown] = useState(6);
    const [hasRedirected, setHasRedirected] = useState(false);

    // 🟢 Thêm method chọn chất lượng và ép bỏ Auto
    useEffect(() => {
      if (!playerRef.current) return;

      playerRef.current.setQuality = (label: "1080p" | "720p" | "480p") => {
        const map: Record<string, "high" | "medium" | "low"> = {
          "1080p": "high",
          "720p": "medium",
          "480p": "low",
        };

        // 🔥 Ép chất lượng và bỏ Auto bằng load()
        if (playerRef.current.load) {
          playerRef.current.load({
            playbackId: playerRef.current.playbackId,
            preferredVideoQuality: map[label], // "low"/"medium"/"high"
          });
        } else {
          // fallback nếu load không có
          playerRef.current.preferredVideoQuality = map[label];
          if (playerRef.current.reload) playerRef.current.reload();
        }

        console.log("Changed quality to", label);
      };
    }, [playerRef]);
    // 🎬 Video ended
    useEffect(() => {
      const player = playerRef.current;
      if (!player) return;

      const handleEnded = () => {
        if (loopEnabled) {
          player.currentTime = 0;
          player.play();
          return;
        }
        if (!autoNextEnabled) return;

        setCountdown(6);
        setShowNext(true);
        setHasRedirected(false);
      };
      player.addEventListener("ended", handleEnded);
      return () => player.removeEventListener("ended", handleEnded);
    }, [autoNextEnabled, loopEnabled]);

    // RESET khi đổi video
    useEffect(() => {
      setShowNext(false);
      setCountdown(6);
      setHasRedirected(false);
    }, [playbackId]);

    // Countdown overlay
    useEffect(() => {
      if (!showNext) return;
      const interval = setInterval(() => setCountdown((p) => p - 1), 1000);
      return () => clearInterval(interval);
    }, [showNext]);

    // AUTO NEXT
    useEffect(() => {
      if (countdown <= 0 && nextVideo && !hasRedirected && autoNextEnabled) {
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
          onTimeUpdate={(e: any) =>
            onTimeUpdate?.(e.target.currentTime, e.target.duration)
          }
        />

        {autoNextEnabled && showNext && nextVideo && (
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
          </div>
        )}
      </div>
    );
  },
);

VideoPlayer.displayName = "VideoPlayer";
