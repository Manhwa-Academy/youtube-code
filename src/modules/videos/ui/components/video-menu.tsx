import { toast } from "sonner";
import { useState } from "react";
import {
  ListPlusIcon,
  MoreVerticalIcon,
  ShareIcon,
  Trash2Icon,
  PlusIcon,
} from "lucide-react";

import { APP_URL } from "@/constants";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { PlaylistAddModal } from "@/modules/playlists/ui/components/playlist-add-modal";
import { PlaylistCreateModal } from "@/modules/playlists/ui/components/playlist-create-modal";

interface VideoMenuProps {
  videoId: string;
  variant?: "ghost" | "secondary";
  onRemove?: () => void;
}

export const VideoMenu = ({
  videoId,
  variant = "ghost",
  onRemove,
}: VideoMenuProps) => {
  const [isOpenPlaylistAddModal, setIsOpenPlaylistAddModal] = useState(false);
  const [isOpenCreateModal, setIsOpenCreateModal] = useState(false);

  const onShare = () => {
    const fullUrl = `${APP_URL}/videos/${videoId}`;
    navigator.clipboard.writeText(fullUrl);
    toast.success("Đã sao chép liên kết");
  };

  return (
    <>
      {/* Modal thêm video vào playlist */}
      <PlaylistAddModal
        videoId={videoId}
        open={isOpenPlaylistAddModal}
        onOpenChange={setIsOpenPlaylistAddModal}
      />

      {/* Modal tạo playlist mới */}
      <PlaylistCreateModal
        open={isOpenCreateModal}
        onOpenChange={setIsOpenCreateModal}
        initialVideoIds={[videoId]} // ✅ tự động thêm video hiện tại vào playlist mới
      />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant={variant} size="icon" className="rounded-full">
            <MoreVerticalIcon />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
          <DropdownMenuItem onClick={onShare}>
            <ShareIcon className="mr-2 size-4" />
            Chia sẻ
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => setIsOpenPlaylistAddModal(true)}>
            <ListPlusIcon className="mr-2 size-4" />
            Thêm vào danh sách phát
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => setIsOpenCreateModal(true)}>
            <PlusIcon className="mr-2 size-4" />
            Tạo playlist kết hợp mới
          </DropdownMenuItem>
          {onRemove && (
            <DropdownMenuItem onClick={onRemove}>
              <Trash2Icon className="mr-2 size-4" />
              Xóa khỏi lịch sử
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
