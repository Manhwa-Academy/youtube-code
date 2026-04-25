"use client";

import Link from "next/link";
import { useState } from "react";
import { VideoInfo, VideoInfoSkeleton } from "./video-info";
import { VideoThumbnail, VideoThumbnailSkeleton } from "./video-thumbnail";
import { VideoGetManyOutput } from "../../types";
import { VideoPlaylist } from "./video-playlist";

interface VideoGridCardProps {
  data: VideoGetManyOutput["items"][number];
  onRemove?: () => void;
  playlist?: {
    id: string;
    name: string;
    videos: { id: string; title: string; thumbnailUrl?: string | null }[];
  };
  currentIndex?: number;
  progress?: number; // 🔥 thêm prop progress
  menu?: React.ReactNode; // ✅ thêm prop menu
}

// Skeleton export để SuggestionsSection sử dụng
export const VideoGridCardSkeleton = () => {
  return (
    <div className="flex flex-col gap-2 w-full">
      <VideoThumbnailSkeleton />
      <VideoInfoSkeleton />
    </div>
  );
};

// Main VideoGridCard với playlist toggle
export const VideoGridCard = ({
  data,
  onRemove,
  playlist,
  currentIndex = 0,
  menu, // nhận menu
}: VideoGridCardProps) => {
  const [showPlaylist, setShowPlaylist] = useState(false);

  const handleTogglePlaylist = () => setShowPlaylist((prev) => !prev);
  const progress = data.progress ?? 0;

  return (
    <div className="flex flex-col gap-2 w-full group relative">
      {/* Nếu có menu, hiển thị góc trên bên phải */}
      {menu && <div className="absolute top-2 right-2 z-10">{menu}</div>}

      {/* Video thumbnail */}
      <Link prefetch href={`/videos/${data.id}`}>
        <VideoThumbnail
          imageUrl={data.thumbnailUrl}
          previewUrl={data.previewUrl}
          title={data.title}
          duration={data.duration}
          progress={progress}
        />
      </Link>

      {/* Video info */}
      <VideoInfo data={data} onRemove={onRemove} />

      {/* Button toggle playlist */}
      {playlist && (
        <button
          className="text-sm text-blue-400 hover:underline"
          onClick={handleTogglePlaylist}
        >
          {showPlaylist ? "Ẩn danh sách kết hợp" : "Xem danh sách kết hợp"}
        </button>
      )}

      {/* Playlist toggle */}
      {showPlaylist && playlist && (
        <div className="w-full mt-2 max-h-[300px] overflow-y-auto">
          <VideoPlaylist playlist={playlist} currentIndex={currentIndex} />
        </div>
      )}
    </div>
  );
};
