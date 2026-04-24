"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { trpc } from "@/trpc/client";
import { THUMBNAIL_FALLBACK } from "@/modules/videos/constants";

const PAGE_SIZE = 20;

export const PlaylistsView = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const page = Number(searchParams.get("page") || "1");

  // ✅ DÙNG API PUBLIC
  const { data, isLoading } =
    trpc.playlists.getPublicMixPlaylists.useQuery();

  if (isLoading) {
    return <p className="p-4">Đang tải...</p>;
  }

  if (!data || data.length === 0) {
    return <p className="p-4">Chưa có danh sách kết hợp nào</p>;
  }

  // ✅ KHÔNG CẦN FILTER NỮA
  const totalPages = Math.ceil(data.length / PAGE_SIZE);

  const currentPlaylists = data.slice(
    PAGE_SIZE * (page - 1),
    PAGE_SIZE * page,
  );

  return (
    <div className="px-4 mt-4">
      <h2 className="text-lg font-semibold mb-4">
        Danh sách kết hợp
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {currentPlaylists.map((playlist) => {
          const videoCount = playlist.videoCount ?? 0;
          const thumbnail = playlist.thumbnail || THUMBNAIL_FALLBACK;

          const firstVideoId = playlist.videos?.[0]?.id;

          return (
            <div
              key={playlist.id}
              onClick={() => {
                if (!firstVideoId) return;

                router.push(
                  `/videos/${firstVideoId}?list=${playlist.id}&index=0`,
                );
              }}
              className="cursor-pointer group"
            >
              <div className="relative aspect-video rounded-xl overflow-hidden bg-black">
                <img
                  src={thumbnail}
                  alt={playlist.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src =
                      THUMBNAIL_FALLBACK;
                  }}
                />
                <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs font-semibold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap">
                  ▶ {videoCount} video
                </div>
              </div>

              <p className="mt-2 text-sm font-semibold line-clamp-2">
                {playlist.name}
              </p>
              <p className="text-xs text-muted-foreground">
                Danh sách kết hợp
              </p>
            </div>
          );
        })}
      </div>

      {page < totalPages && (
        <div className="flex justify-center mt-6">
          <button
            onClick={() =>
              router.push(`/playlists?page=${page + 1}`)
            }
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Xem thêm
          </button>
        </div>
      )}
    </div>
  );
};