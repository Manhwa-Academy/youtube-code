"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/trpc/client";
import { PlaylistGetManyOutput } from "../../../types";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreVerticalIcon } from "lucide-react";

interface PlaylistInfoProps {
  data: PlaylistGetManyOutput["items"][number];
}

export const PlaylistInfoSkeleton = () => {
  return (
    <div className="flex gap-3">
      <div className="min-w-0 flex-1 space-y-2">
        <Skeleton className="h-5 w-[90%]" />
        <Skeleton className="h-5 w-[70%]" />
        <Skeleton className="h-5 w-[50%]" />
      </div>
    </div>
  );
};

export const PlaylistInfo = ({ data }: PlaylistInfoProps) => {
  const [visibility, setVisibility] = useState<"public" | "private">(
    data.visibility,
  );

  // TRPC mutation update visibility
  const updateVisibility = trpc.playlists.updateVisibility.useMutation({
    onSuccess: (data) => {
      toast.success(
        `Cập nhật quyền ${data.visibility === "public" ? "công khai" : "riêng tư"} thành công!`,
      );
    },
    onError: () => toast.error("Cập nhật quyền thất bại!"),
  });

  const handleChange = (newVisibility: "public" | "private") => {
    setVisibility(newVisibility); // update UI ngay
    updateVisibility.mutate({ playlistId: data.id, visibility: newVisibility }); // gửi lên server
  };

  return (
    <div className="flex gap-3 items-center">
      <div className="min-w-0 flex-1">
        <h3 className="font-medium line-clamp-1 lg:line-clamp-2 text-sm break-words">
          {data.name}
        </h3>
        <p className="text-sm text-muted-foreground">Danh sách phát</p>
        <p
          className="text-sm text-muted-foreground font-semibold hover:text-primary cursor-pointer"
          onClick={() => {
            console.log("Mở tất cả video của playlist", data.name);
          }}
        >
          Xem tất cả video
        </p>
      </div>

      {/* Dropdown chọn public/private */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" className="rounded-full">
            <MoreVerticalIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
          <DropdownMenuItem onClick={() => handleChange("public")}>
            Công khai {visibility === "public" ? "✔️" : ""}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleChange("private")}>
            Riêng tư {visibility === "private" ? "✔️" : ""}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
