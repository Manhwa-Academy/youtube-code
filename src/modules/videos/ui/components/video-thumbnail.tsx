import Image from "next/image";

import { formatDuration } from "@/lib/utils";

import { THUMBNAIL_FALLBACK } from "../../constants";
import { Skeleton } from "@/components/ui/skeleton";

interface VideoThumbnailProps {
  title: string;
  duration: number;
  imageUrl?: string | null;
  previewUrl?: string | null;
  progress?: number; // 👈 thêm cái này (0 → 100)
}

export const VideoThumbnailSkeleton = () => {
  return (
    <div className="relative w-full overflow-hidden rounded-xl aspect-video">
      <Skeleton className="size-full" />
    </div>
  );
};

export const VideoThumbnail = ({
  title,
  imageUrl,
  previewUrl,
  duration,
  progress = 0, // 👈 thêm dòng này
}: VideoThumbnailProps) => {
  return (
    <div className="relative group">
      {/* Thumbnail wrapper */}
      <div className="relative w-full overflow-hidden rounded-xl aspect-video">
        <Image
          src={imageUrl || THUMBNAIL_FALLBACK}
          alt={title}
          fill
          className="h-full w-full object-cover group-hover:opacity-0"
        />
        <Image
          unoptimized={!!previewUrl}
          src={previewUrl || THUMBNAIL_FALLBACK}
          alt={title}
          fill
          className="h-full w-full object-cover opacity-0 group-hover:opacity-100"
        />
        {/* Video duration box */}
        <div className="absolute bottom-2 right-2 px-1 py-0.5 rounded bg-black/80 text-white text-xs font-medium">
          {formatDuration(duration)}
        </div>
        {/* 🔥 Progress bar giống YouTube */}
        <div className="absolute bottom-0 left-0 w-full h-[3px] bg-neutral-700/60">
          <div
            className="h-full bg-red-600 transition-all"
            style={{ width: `${progress ?? 0}%` }}
          />
        </div>
      </div>
    </div>
  );
};
