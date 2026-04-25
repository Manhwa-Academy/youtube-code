"use client";

import { useMemo, useState, useEffect } from "react";
import { formatDistanceToNowStrict } from "date-fns";
import { vi } from "date-fns/locale";

import { VideoOwner } from "./video-owner";
import { VideoReactions } from "./video-reactions";
import { VideoMenu } from "./video-menu";
import { VideoDescription } from "./video-description";
import { VideoGetOneOutput } from "../../types";
import { VideoPlaybackMenu } from "./video-playback-menu";

interface VideoTopRowProps {
  video: VideoGetOneOutput;
  playerRef: React.RefObject<any>; // 🔹 ref tới MuxPlayer
  autoNextEnabled: boolean;
  setAutoNextEnabledAction: (v: boolean) => void;
  loopEnabled: boolean;
  setLoopEnabledAction: (v: boolean) => void;
}

export const VideoTopRowSkeleton = () => (
  <div className="flex flex-col gap-4 mt-4">
    <div className="h-6 w-4/5 bg-gray-300 rounded" />
    <div className="h-5 w-3/5 bg-gray-300 rounded" />
  </div>
);

export const VideoTopRow = ({
  video,
  playerRef,
  autoNextEnabled,
  setAutoNextEnabledAction,
  loopEnabled,
  setLoopEnabledAction,
}: VideoTopRowProps) => {
  const [playbackRate, setPlaybackRate] = useState(1);

  // Áp dụng playbackRate trực tiếp
  useEffect(() => {
    if (playerRef.current) playerRef.current.playbackRate = playbackRate;
  }, [playbackRate, playerRef]);

  const compactViews = useMemo(
    () =>
      Intl.NumberFormat("vi-VN", { notation: "compact" }).format(video.viewCount),
    [video.viewCount]
  );

  const expandedViews = useMemo(
    () => Intl.NumberFormat("vi-VN").format(video.viewCount),
    [video.viewCount]
  );

  const compactDate = useMemo(
    () =>
      formatDistanceToNowStrict(new Date(video.createdAt), {
        addSuffix: true,
        locale: vi,
      }),
    [video.createdAt]
  );

  const expandedDate = useMemo(
    () => new Date(video.createdAt).toLocaleDateString("vi-VN"),
    [video.createdAt]
  );

  return (
    <div className="flex flex-col gap-4 mt-4">
      <h1 className="text-xl font-semibold">{video.title}</h1>

      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <VideoOwner user={video.user} videoId={video.id} />

        <div className="flex overflow-x-auto sm:min-w-[calc(50%-6px)] sm:justify-end sm:overflow-visible pb-2 -mb-2 sm:pb-0 sm:mb-0 gap-2">
          <VideoReactions
            videoId={video.id}
            likes={video.likeCount}
            dislikes={video.dislikeCount}
            viewerReaction={video.viewerReaction}
          />

          {/* 🔹 VideoPlaybackMenu tự động lấy track từ playerRef */}
          <VideoPlaybackMenu
            playerRef={playerRef}
            playbackRate={playbackRate}
            setPlaybackRate={setPlaybackRate}
            autoNextEnabled={autoNextEnabled}
            setAutoNextEnabledAction={setAutoNextEnabledAction}
            loopEnabled={loopEnabled}
            setLoopEnabledAction={setLoopEnabledAction}
          />

          <VideoMenu videoId={video.id} variant="secondary" />
        </div>
      </div>

      <VideoDescription
        compactViews={compactViews}
        expandedViews={expandedViews}
        compactDate={compactDate}
        expandedDate={expandedDate}
        description={video.description}
      />
    </div>
  );
};