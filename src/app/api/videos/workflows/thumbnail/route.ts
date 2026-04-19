import { and, eq } from "drizzle-orm";
import { UTApi } from "uploadthing/server";
import { serve } from "@upstash/workflow/nextjs";

import { db } from "@/db";
import { videos } from "@/db/schema";

interface InputType {
  userId: string;
  videoId: string;
  fileUrl?: string;       // Nếu upload từ máy
  useVideoFrame?: boolean; // Nếu AI-generated từ video
}

// Workflow trả void
export const { POST } = serve<InputType>(async (context) => {
  const utapi = new UTApi();
  const { videoId, userId, fileUrl, useVideoFrame } = context.requestPayload;

  // Lấy video từ DB
  const [video] = await db
    .select()
    .from(videos)
    .where(and(eq(videos.id, videoId), eq(videos.userId, userId)));

  if (!video) throw new Error("Video not found");

  // Xác định URL thumbnail tạm thời
  let tempThumbnailUrl: string;
  if (fileUrl) {
    tempThumbnailUrl = fileUrl;
  } else if (useVideoFrame) {
    if (!video.muxPlaybackId) throw new Error("Video chưa có Mux playback ID");

    // Tăng kích thước thumbnail để nét hơn
    const width = 640;   // có thể dùng 720, 1080
    const height = 360;  // giữ tỉ lệ 16:9
    const randomPercent = Math.floor(Math.random() * 90) + 5; // frame 5%-95%
    
    tempThumbnailUrl = `https://image.mux.com/${video.muxPlaybackId}/thumbnail.png?width=${width}&height=${height}&time=${randomPercent}`;
  } else {
    throw new Error("Chưa có nguồn thumbnail hợp lệ");
  }

  // Xoá thumbnail cũ nếu có
  await context.run("cleanup-thumbnail", async () => {
    if (video.thumbnailKey) {
      try {
        await utapi.deleteFiles(video.thumbnailKey);
      } catch {
        console.warn("Old thumbnail key not found, skip delete");
      }

      await db
        .update(videos)
        .set({ thumbnailKey: null, thumbnailUrl: null })
        .where(and(eq(videos.id, videoId), eq(videos.userId, userId)));
    }
  });

  // Upload thumbnail mới
  await context.run("upload-thumbnail", async () => {
    const files = await utapi.uploadFilesFromUrl([{ url: tempThumbnailUrl }]);
    if (!files || !files[0]?.data) throw new Error("Upload thumbnail failed");

    const uploaded = files[0].data;

    // Cập nhật DB với thumbnail mới
    await db
      .update(videos)
      .set({
        thumbnailKey: uploaded.key,
        thumbnailUrl: uploaded.url,
      })
      .where(and(eq(videos.id, videoId), eq(videos.userId, userId)));
  });

  // Workflow void, không return gì
});