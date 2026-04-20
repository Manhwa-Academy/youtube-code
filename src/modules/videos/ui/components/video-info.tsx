import Link from "next/link";
import { useMemo } from "react";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

import { Skeleton } from "@/components/ui/skeleton";
import { UserAvatar } from "@/components/user-avatar";
import { UserInfo } from "@/modules/users/ui/components/user-info";
import { VideoMenu } from "./video-menu";
import { VideoGetManyOutput } from "../../types";

interface VideoInfoProps {
  data: VideoGetManyOutput["items"][number];
  onRemove?: () => void;
}

export const VideoInfoSkeleton = () => {
  return (
    <div className="flex gap-3">
      <Skeleton className="size-10 flex-shrink-0 rounded-full" />
      <div className="min-w-0 flex-1 space-y-2">
        <Skeleton className="h-4 w-[90%]" />
        <Skeleton className="h-4 w-[70%]" />
      </div>
    </div>
  );
};

export const VideoInfo = ({ data, onRemove }: VideoInfoProps) => {
  const compactViews = useMemo(() => {
    return data.viewCount === 0
      ? "Chưa có"
      : new Intl.NumberFormat("vi-VN", {
          notation: "compact",
        }).format(data.viewCount);
  }, [data.viewCount]);

  const compactDate = useMemo(() => {
    return formatDistanceToNow(new Date(data.createdAt), {
      addSuffix: true,
      locale: vi,
    });
  }, [data.createdAt]);

  return (
    <div className="flex gap-3">
      <Link prefetch href={`/users/${data.user.id}`}>
        <UserAvatar imageUrl={data.user.imageUrl} name={data.user.name} />
      </Link>

      <div className="min-w-0 flex-1">
        <Link prefetch href={`/videos/${data.id}`}>
          <h3 className="font-medium line-clamp-1 lg:line-clamp-2 text-base break-words">
            {data.title}
          </h3>
        </Link>

        <Link prefetch href={`/users/${data.user.id}`}>
          <UserInfo name={data.user.name} />
        </Link>

        <Link prefetch href={`/videos/${data.id}`}>
          <p className="text-sm text-gray-600 line-clamp-1">
            {compactViews} lượt xem • {compactDate}
          </p>
        </Link>
      </div>

      <div className="flex-shrink-0">
        <VideoMenu videoId={data.id} onRemove={onRemove} />
      </div>
    </div>
  );
};
