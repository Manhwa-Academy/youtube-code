"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ResponsiveModal } from "@/components/responsive-modal";
import { useAuth } from "@clerk/nextjs";

interface ThumbnailGenerateModalProps {
  videoId: string;
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  onThumbnailUpdate?: (url: string) => void;
}

interface ThumbnailResponse {
  thumbnailUrl: string;
}

export const ThumbnailGenerateModal = ({
  videoId,
  open,
  onOpenChange = () => {},
  onThumbnailUpdate = () => {},
}: ThumbnailGenerateModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { userId: clerkId } = useAuth();

  const generateFromVideo = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/videos/workflows/thumbnail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoId, clerkId, useVideoFrame: true }),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || "Failed to generate thumbnail");
      }

      const data: ThumbnailResponse = await res.json();

      if (typeof data.thumbnailUrl === "string") {
        onThumbnailUpdate(data.thumbnailUrl);
      } else {
        throw new Error("Invalid response from server");
      }

      toast.success(
        "Thumbnail generated from video! ⏳ Uploading… it will appear shortly.",
      );
      onOpenChange(false);
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error("Failed to generate thumbnail: " + err.message);
        console.error("Generate thumbnail error:", err);
      } else {
        toast.error("Failed to generate thumbnail: Unknown error");
        console.error("Generate thumbnail unknown error:", err);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ResponsiveModal
      title="Tạo thumbnail từ video"
      open={open}
      onOpenChange={onOpenChange}
    >
      <div className="flex justify-end p-4">
        <Button onClick={generateFromVideo} disabled={isLoading}>
          {isLoading ? "Đang tạo..." : "Tạo thumbnail"}
        </Button>
      </div>
    </ResponsiveModal>
  );
};
