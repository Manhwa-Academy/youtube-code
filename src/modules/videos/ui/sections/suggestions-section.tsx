"use client";

import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { trpc } from "@/trpc/client";
import { DEFAULT_LIMIT } from "@/constants";

import {
  VideoGridCard,
  VideoGridCardSkeleton,
} from "../components/video-grid-card";
import {
  VideoRowCard,
  VideoRowCardSkeleton,
} from "../components/video-row-card";
import { VideoGetManyOutput } from "../../types";

interface SuggestionsSectionProps {
  videoId: string;
  isManual?: boolean;
}

type Video = VideoGetManyOutput["items"][number] & {
  playlist?: {
    id: string;
    name: string;
    videos: { id: string; title: string; thumbnailUrl?: string | null }[];
  };
};

export const SuggestionsSection = ({
  videoId,
  isManual,
}: SuggestionsSectionProps) => {
  return (
    <Suspense fallback={<SuggestionsSectionSkeleton />}>
      <ErrorBoundary fallback={<p>Error</p>}>
        <SuggestionsSectionSuspense videoId={videoId} isManual={isManual} />
      </ErrorBoundary>
    </Suspense>
  );
};

export const SuggestionsSectionSkeleton = () => {
  return (
    <>
      <div className="hidden md:block space-y-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <VideoRowCardSkeleton key={index} size="compact" />
        ))}
      </div>
      <div className="block md:hidden space-y-10">
        {Array.from({ length: 6 }).map((_, index) => (
          <VideoGridCardSkeleton key={index} />
        ))}
      </div>
    </>
  );
};

const SuggestionsSectionSuspense = ({ videoId }: SuggestionsSectionProps) => {
  const [data] = trpc.suggestions.getMany.useSuspenseQuery({
    videoId,
    limit: DEFAULT_LIMIT,
  });

  return (
    <>
      {/* Desktop */}
      <div className="hidden md:block space-y-3">
        {data.items.map((video: Video) => (
          <VideoRowCard key={video.id} data={video} size="compact" />
        ))}
      </div>

      {/* Mobile */}
      <div className="block md:hidden space-y-10">
        {data.items.map((video: Video) => (
          <VideoGridCard key={video.id} data={video} />
        ))}
      </div>
    </>
  );
};
