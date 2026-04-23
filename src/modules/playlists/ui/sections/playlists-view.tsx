"use client";

import { useRouter } from "next/navigation";
import { trpc } from "@/trpc/client";
import { THUMBNAIL_FALLBACK } from "@/modules/videos/constants";
import { useAuth } from "@clerk/nextjs";

export const PlaylistsView = () => {
  const router = useRouter();
  const { userId } = useAuth(); // ID user hiện tại

  const { data, isLoading } = trpc.playlists.getMany.useQuery({ limit: 100 });

  if (isLoading) {
    return <p className="p-4">Đang tải...</p>;
  }

  if (!data?.items || data.items.length === 0) {
    return <p className="p-4">Chưa có danh sách kết hợp nào</p>;
  }

  // Chỉ show public hoặc private của user hiện tại
  const visiblePlaylists = data.items.filter(
    (p) => p.visibility === "public" || p.user.id === userId
  );

  return (
    <div className="px-4 mt-4">
      <h2 className="text-lg font-semibold mb-4">Danh sách kết hợp</h2>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {visiblePlaylists.map((playlist) => {
          const videoCount = playlist.videoCount ?? 0;
          const thumbnail = playlist.thumbnailUrl || THUMBNAIL_FALLBACK; // 🔹 dùng thumbnailUrl

          return (
            <div
              key={playlist.id}
              onClick={() => {
                router.push(`/videos?list=${playlist.id}`); // chỉ push playlist
              }}
              className="cursor-pointer group"
            >
              <div className="relative aspect-video rounded-xl overflow-hidden bg-black">
                <img
                  src={thumbnail}
                  alt={playlist.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = THUMBNAIL_FALLBACK;
                  }}
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white text-sm opacity-0 group-hover:opacity-100 transition">
                  ▶ {videoCount} video
                </div>
              </div>

              <p className="mt-2 text-sm font-semibold line-clamp-2">{playlist.name}</p>
              <p className="text-xs text-muted-foreground">Danh sách kết hợp</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};