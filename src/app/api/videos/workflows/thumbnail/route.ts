import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { UTApi } from "uploadthing/server";

import { db } from "@/db";
import { users, videos } from "@/db/schema";

interface InputType {
  videoId: string;
  clerkId: string; // từ frontend
  fileUrl?: string;
  useVideoFrame?: boolean;
}

export async function POST(req: NextRequest) {
  try {
    const { videoId, clerkId, fileUrl, useVideoFrame } =
      (await req.json()) as InputType;
    const utapi = new UTApi();

    // Lấy user từ clerkId
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, clerkId));
    if (!user) throw new Error("User not found");

    // Lấy video của user
    const [video] = await db
      .select()
      .from(videos)
      .where(and(eq(videos.id, videoId), eq(videos.userId, user.id)));
    if (!video) throw new Error("Video not found");

    // Xác định URL thumbnail tạm thời
    let tempThumbnailUrl: string;
    if (fileUrl) {
      tempThumbnailUrl = fileUrl;
    } else if (useVideoFrame) {
      if (!video.muxPlaybackId)
        throw new Error("Video chưa có Mux playback ID");
      const width = 1280;
      const height = 720;
      const randomPercent = Math.floor(Math.random() * 90) + 5;
      tempThumbnailUrl = `https://image.mux.com/${video.muxPlaybackId}/thumbnail.png?width=${width}&height=${height}&time=${randomPercent}`;
    } else {
      throw new Error("Chưa có nguồn thumbnail hợp lệ");
    }

    // Xóa thumbnail cũ nếu có
    if (video.thumbnailKey) {
      try {
        await utapi.deleteFiles(video.thumbnailKey);
      } catch {}
      await db
        .update(videos)
        .set({ thumbnailKey: null, thumbnailUrl: null })
        .where(and(eq(videos.id, videoId), eq(videos.userId, user.id)));
    }

    // Upload thumbnail mới
    const files = await utapi.uploadFilesFromUrl([{ url: tempThumbnailUrl }]);
    if (!files || !files[0]?.data) throw new Error("Upload thumbnail failed");
    const uploaded = files[0].data;

    // Cập nhật DB với thumbnail mới
    await db
      .update(videos)
      .set({ thumbnailKey: uploaded.key, thumbnailUrl: uploaded.url })
      .where(and(eq(videos.id, videoId), eq(videos.userId, user.id)));

    // Trả về URL cho frontend
    return NextResponse.json({ thumbnailUrl: uploaded.url });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Unknown error during thumbnail upload";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
