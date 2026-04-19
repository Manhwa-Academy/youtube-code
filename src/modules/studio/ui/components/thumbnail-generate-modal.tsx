"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ResponsiveModal } from "@/components/responsive-modal";

interface ThumbnailGenerateModalProps {
  videoId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onThumbnailUpdate?: (url: string) => void;
}

export const ThumbnailGenerateModal = ({
  videoId,
  open,
  onOpenChange,
  onThumbnailUpdate,
}: ThumbnailGenerateModalProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const generateFromVideo = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/videos/generateThumbnailFromVideo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoId }),
      });

      if (!res.ok) {
        const err = await res.text();
        throw new Error(err);
      }

      const data = await res.json();

      toast.success("Thumbnail generated from video!");

      if (onThumbnailUpdate && data.thumbnailUrl) {
        onThumbnailUpdate(data.thumbnailUrl);
      }

      onOpenChange(false);
    } catch (err: any) {
      console.error("Generate thumbnail error:", err);
      toast.error("Failed to generate thumbnail: " + (err.message || ""));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ResponsiveModal title="Generate a thumbnail from video" open={open} onOpenChange={onOpenChange}>
      <div className="flex justify-end p-4">
        <Button onClick={generateFromVideo} disabled={isLoading}>
          {isLoading ? "Generating..." : "Generate"}
        </Button>
      </div>
    </ResponsiveModal>
  );
};