"use client";

import { Suspense } from "react";
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
    {/* Mobile / Grid */}
    <div className="flex flex-col gap-4 gap-y-10 md:hidden">
      {Array.from({ length: 18 }).map((_, idx) => (
        <VideoGridCardSkeleton key={idx} />
      ))}
    </div>

    {/* Desktop / Row */}
    <div className="hidden flex-col gap-4 md:flex">
      {Array.from({ length: 18 }).map((_, idx) => (
        <VideoRowCardSkeleton key={idx} size="compact" />
      ))}
    </div>
  </div>
);

const HistoryVideosSectionSuspense = () => {
  const [videos, query] = trpc.playlists.getHistory.useSuspenseInfiniteQuery(
    { limit: DEFAULT_LIMIT },
    { getNextPageParam: (lastPage) => lastPage.nextCursor },
  );

  // Mỗi video đảm bảo có progress
  const mapVideoWithProgress = (video: any) => ({
    ...video,
    progress: video.progress ?? 0, // 🔥 default 0 nếu chưa có progress
  });

  return (
    <>
      {/* Mobile / Grid */}
      <div className="flex flex-col gap-4 gap-y-10 md:hidden">
        {videos.pages
          .flatMap((page) => page.items)
          .map((video) => (
            <VideoGridCard
              key={video.id}
              data={mapVideoWithProgress(video)}
            />
          ))}
      </div>

      {/* Desktop / Row */}
      <div className="hidden flex-col gap-4 md:flex">
        {videos.pages
          .flatMap((page) => page.items)
          .map((video) => (
            <VideoRowCard
              key={video.id}
              data={mapVideoWithProgress(video)}
              size="compact"
              progress={mapVideoWithProgress(video).progress} // 🔥 truyền progress xuống VideoRowCard
            />
          ))}
      </div>

      {/* Infinite scroll */}
      <InfiniteScroll
        hasNextPage={query.hasNextPage}
        isFetchingNextPage={query.isFetchingNextPage}
        fetchNextPage={query.fetchNextPage}
      />
    </>
  );
};