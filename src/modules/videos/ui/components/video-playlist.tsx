"use client";

import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { THUMBNAIL_FALLBACK } from "../../constants";

interface VideoPlaylistProps {
  playlist: {
    id: string;
    name: string;
    videos: { id: string; title: string; thumbnailUrl?: string | null }[];
  };
  currentIndex: number;
}

export const VideoPlaylist = ({
  playlist,
  currentIndex,
}: VideoPlaylistProps) => {
  const router = useRouter();

  return (
    <div className="w-full bg-black/80 backdrop-blur-md rounded-xl overflow-hidden shadow-xl">
      {/* HEADER */}
      <div className="p-3 border-b border-white/20 text-white text-sm font-semibold">
        {playlist.name}
      </div>

      {/* LIST */}
      <div className="overflow-y-auto max-h-[80vh]">
        {playlist.videos.map((v, i) => (
          <div
            key={v.id}
            onClick={() =>
              router.push(`/videos/${v.id}?list=${playlist.id}&index=${i}`)
            }
            className={cn(
              "flex gap-2 p-2 cursor-pointer hover:bg-white/10 text-white",
              i === currentIndex && "bg-white/20",
            )}
          >
            <div className="relative w-24 aspect-video bg-black rounded overflow-hidden">
              <img
                src={v.thumbnailUrl || THUMBNAIL_FALLBACK}
                className="w-full h-full object-cover"
              />
              {i === currentIndex && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                  <span className="text-white text-xl">▶️</span>
                </div>
              )}
            </div>
            <div className="flex-1 text-sm line-clamp-2">
              {i + 1}. {v.title}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
