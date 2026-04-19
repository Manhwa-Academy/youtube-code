"use client";

import { trpc } from "@/trpc/client";
import { UploadDropzone } from "@/lib/uploadthing";
import { ResponsiveModal } from "@/components/responsive-modal";

// Tạo type custom cho UploadDropzone response
interface UploadedFile {
  key: string; // file key trên UploadThing
  url: string; // URL file upload
  name?: string;
  size?: number;
  type?: string;
}

interface ThumbnailUploadModalProps {
  videoId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onThumbnailUpdate?: (url: string) => void; // callback cập nhật form
}

export const ThumbnailUploadModal = ({
  videoId,
  open,
  onOpenChange,
  onThumbnailUpdate,
}: ThumbnailUploadModalProps) => {
  const utils = trpc.useUtils();

  const onUploadComplete = (res: UploadedFile[]) => {
    console.group("=== UploadDropzone Result ===");
    console.log("VideoId:", videoId);
    console.log("Raw Upload response:", res);
    console.groupEnd();

    const uploaded = res[0]; // Lấy file đầu tiên (thumbnail)

    if (!uploaded?.key || !uploaded?.url) {
      console.error("UploadDropzone: Invalid upload response", res);
      return;
    }

    console.log("Uploaded thumbnail URL:", uploaded.url);

    // Cập nhật cache TRPC
    utils.studio.getMany.invalidate();
    utils.studio.getOne.invalidate({ id: videoId });

    // Callback để cập nhật ngay thumbnail ở form
    onThumbnailUpdate?.(uploaded.url);

    // Đóng modal
    onOpenChange(false);
  };

  return (
    <ResponsiveModal
      title="Upload a thumbnail"
      open={open}
      onOpenChange={onOpenChange}
    >
      <div className="p-4">
        <UploadDropzone
          endpoint="thumbnailUploader"
          input={{ videoId }}
          onClientUploadComplete={onUploadComplete}
        />
      </div>
    </ResponsiveModal>
  );
};