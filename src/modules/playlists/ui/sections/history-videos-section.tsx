"use client";

import { Suspense, useState, useEffect } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { trpc } from "@/trpc/client";
import { DEFAULT_LIMIT } from "@/constants";
import { InfiniteScroll } from "@/components/infinite-scroll";
import {
  VideoGridCard,
  VideoGridCardSkeleton,
} from "@/modules/videos/ui/components/video-grid-card";
import {
  VideoRowCard,
  VideoRowCardSkeleton,
} from "@/modules/videos/ui/components/video-row-card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { VideoMenu } from "@/modules/videos/ui/components/video-menu";
import { PauseIcon, Trash2Icon, PlayIcon } from "lucide-react";

export const HistoryVideosSection = () => {
  return (
    <Suspense fallback={<HistoryVideosSectionSkeleton />}>
      <ErrorBoundary fallback={<p>Error</p>}>
        <HistoryVideosSectionSuspense />
      </ErrorBoundary>
    </Suspense>
  );
};

const HistoryVideosSectionSkeleton = () => (
  <div>
    <div className="flex flex-col gap-4 gap-y-10 md:hidden">
      {Array.from({ length: 18 }).map((_, idx) => (
        <VideoGridCardSkeleton key={idx} />
      ))}
    </div>

    <div className="hidden flex-col gap-4 md:flex">
      {Array.from({ length: 18 }).map((_, idx) => (
        <VideoRowCardSkeleton key={idx} size="compact" />
      ))}
    </div>
  </div>
);

const HistoryVideosSectionSuspense = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isTracking, setIsTracking] = useState<boolean>(true);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const utils = trpc.useContext();
  const { data: initialTracking } =
    trpc.playlists.getHistoryTracking.useQuery();

  // Khi mount, set state nếu data có sẵn
  useEffect(() => {
    if (initialTracking !== undefined) {
      setIsTracking(initialTracking);
    }
  }, [initialTracking]);
  // Mutation duy nhất
  const toggleTrackingMutation =
    trpc.playlists.toggleHistoryTracking.useMutation({
      onSuccess: (_, variables) => {
        toast.success(
          variables.enabled ? "Đang lưu lịch sử" : "Đã tạm dừng lưu lịch sử",
        );
      },
    });

  const handleToggleTracking = () => {
    if (isTracking) {
      setShowConfirmDialog(true);
    } else {
      toggleTrackingMutation.mutate({ enabled: true }); // <-- sửa tên
      setIsTracking(true);
    }
  };

  const confirmToggleTracking = () => {
    toggleTrackingMutation.mutate({ enabled: false }); // <-- sửa tên
    setIsTracking(false);
    setShowConfirmDialog(false);
  };

  const cancelToggleTracking = () => setShowConfirmDialog(false);

  const [videos, query] = trpc.playlists.getHistory.useSuspenseInfiniteQuery(
    { limit: DEFAULT_LIMIT },
    { getNextPageParam: (lastPage) => lastPage.nextCursor },
  );

  const clearHistoryMutation = trpc.playlists.clearHistory.useMutation({
    onSuccess: () => {
      toast.success("Đã xóa tất cả lịch sử");
      // 🟢 invalidate query để load lại danh sách
      utils.playlists.getHistory.invalidate();
    },
  });
  const removeFromHistoryMutation =
    trpc.playlists.removeFromHistory.useMutation({
      onSuccess: () => {
        toast.success("Đã xóa video khỏi lịch sử");
        utils.playlists.getHistory.invalidate();
      },
    });

  const clearHistory = () => clearHistoryMutation.mutate();
  const removeFromHistory = (videoId: string) =>
    removeFromHistoryMutation.mutate({ videoId });

  const mapVideoWithProgress = (video: any) => ({
    ...video,
    progress: video.progress ?? 0,
  });

  const filteredVideos = videos.pages
    .flatMap((page) => page.items)
    .filter((video) =>
      video.title.toLowerCase().includes(searchTerm.toLowerCase()),
    );

  return (
    <div className="flex gap-6">
      <div className="flex-1 flex flex-col gap-4">
        {filteredVideos.map((video) => (
          <VideoRowCard
            key={video.id}
            data={mapVideoWithProgress(video)}
            size="compact"
            progress={video.progress}
            menu={
              <VideoMenu
                videoId={video.id}
                onRemove={() => removeFromHistory(video.id)}
              />
            }
          />
        ))}

        <InfiniteScroll
          hasNextPage={query.hasNextPage}
          isFetchingNextPage={query.isFetchingNextPage}
          fetchNextPage={query.fetchNextPage}
        />
      </div>

      <div className="flex flex-col gap-4 w-80">
        {/* Search input */}
        <div className="relative w-full max-w-xs">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg
              className="w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 1 0 0-15 7.5 7.5 0 0 0 0 15z"
              />
            </svg>
          </div>

          <input
            type="text"
            placeholder="Tìm kiếm trong danh sách..."
            className="w-full pl-10 pr-8 border-b border-gray-400 focus:border-blue-500 focus:outline-none h-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          {searchTerm && (
            <button
              type="button"
              className="absolute right-0 bottom-0 mb-0 mr-1 flex items-center text-gray-400 hover:text-gray-600 h-6"
              onClick={() => setSearchTerm("")}
            >
              &#10005;
            </button>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex flex-col gap-2 mt-2">
          <Button
            variant="ghost"
            className="flex items-center gap-2 justify-start"
            onClick={clearHistory}
          >
            <Trash2Icon className="w-4 h-4" />
            Xóa tất cả nhật ký xem
          </Button>

          <Button
            variant="ghost"
            className="flex items-center gap-2 justify-start"
            onClick={handleToggleTracking}
          >
            {isTracking ? (
              <PauseIcon className="w-4 h-4" />
            ) : (
              <PlayIcon className="w-4 h-4" />
            )}
            {isTracking ? "Tạm dừng lưu lịch sử" : "Tiếp tục lưu lịch sử"}
          </Button>

          {showConfirmDialog && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-96 text-gray-900 dark:text-gray-100">
                <h2 className="text-lg font-semibold mb-2">
                  Tạm dừng lưu lịch sử xem?
                </h2>
                <p className="text-sm mb-4">
                  Việc tạm dừng nhật ký xem trên YouTube có thể khiến bạn khó
                  tìm thấy những video đã xem hơn và ít được gợi ý video mới hơn
                  trên YouTube và các sản phẩm khác của Google.
                </p>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={cancelToggleTracking}>
                    Hủy
                  </Button>
                  <Button variant="default" onClick={confirmToggleTracking}>
                    Tạm dừng
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
