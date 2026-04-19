import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { UTApi } from "uploadthing/server";
import {
  VideoAssetCreatedWebhookEvent,
  VideoAssetErroredWebhookEvent,
  VideoAssetReadyWebhookEvent,
  VideoAssetTrackReadyWebhookEvent,
  VideoAssetDeletedWebhookEvent,
} from "@mux/mux-node/resources/webhooks";

import { db } from "@/db";
import { mux } from "@/lib/mux";
import { videos } from "@/db/schema";

const SIGNING_SECRET = process.env.MUX_WEBHOOK_SECRET!;
type WebhookEvent =
  | VideoAssetCreatedWebhookEvent
  | VideoAssetReadyWebhookEvent
  | VideoAssetErroredWebhookEvent
  | VideoAssetTrackReadyWebhookEvent
  | VideoAssetDeletedWebhookEvent;

export const POST = async (request: Request) => {
  if (!SIGNING_SECRET) throw new Error("MUX_WEBHOOK_SECRET not set");

  const headersPayload = await headers();
  const muxSignature = headersPayload.get("mux-signature");
  if (!muxSignature) return new Response("No signature", { status: 401 });

  let payload: WebhookEvent;
  try {
    payload = await request.json();
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  const body = JSON.stringify(payload);
  mux.webhooks.verifySignature(
    body,
    { "mux-signature": muxSignature },
    SIGNING_SECRET,
  );

  const updateVideo = async (
    muxStatus: string,
    updateFields: Partial<any> = {},
  ) => {
    await db
      .update(videos)
      .set({ muxStatus, ...updateFields } as any) // ép kiểu cho Drizzle
      .where(eq(videos.muxUploadId, (payload.data as any).upload_id as string));
  };

  switch (payload.type) {
    case "video.asset.created": {
      const data = payload.data as VideoAssetCreatedWebhookEvent["data"];
      await updateVideo(data.status, {
        muxAssetId: data.id as unknown as string,
      });
      console.log("Video created:", data.upload_id);
      break;
    }

    case "video.asset.ready": {
      const data = payload.data as VideoAssetReadyWebhookEvent["data"];
      const playbackId = data.playback_ids?.[0]?.id;
      if (!playbackId)
        return new Response("Missing playback ID", { status: 400 });

      const duration = data.duration ? Math.round(data.duration * 1000) : 0;

      let thumbnailUrl: string | undefined;
      let thumbnailKey: string | undefined;
      let previewUrl: string | undefined;
      let previewKey: string | undefined;

      try {
        const utapi = new UTApi();

        // Random time frame 5%-95% của video
        const randomPercent = Math.floor(Math.random() * 90) + 5;

        // Tuỳ chỉnh kích thước thumbnail
        const width = 640; // hoặc 720, 1080 tuỳ ý
        const height = 360; // giữ tỉ lệ 16:9

        const [thumb, prev] = await utapi.uploadFilesFromUrl([
          // Thumbnail PNG với width, height, time
          `https://image.mux.com/${playbackId}/thumbnail.png?width=${width}&height=${height}&time=${randomPercent}`,
          // Preview GIF
          `https://image.mux.com/${playbackId}/animated.gif`,
        ]);
        if (thumb.data) {
          thumbnailUrl = thumb.data.url;
          thumbnailKey = thumb.data.key;
        }
        if (prev.data) {
          previewUrl = prev.data.url;
          previewKey = prev.data.key;
        }
      } catch (err) {
        console.warn("Thumbnail/preview upload failed:", err);
      }

      await updateVideo("ready", {
        muxPlaybackId: playbackId,
        muxAssetId: data.id,
        thumbnailUrl,
        thumbnailKey,
        previewUrl,
        previewKey,
        duration,
      });

      console.log("Video ready:", data.upload_id);
      break;
    }

    case "video.asset.errored": {
      await updateVideo("errored");
      break;
    }

    case "video.asset.deleted": {
      const data = payload.data as VideoAssetDeletedWebhookEvent["data"];
      await db
        .delete(videos)
        .where(eq(videos.muxUploadId, data.upload_id as string));
      console.log("Video deleted:", data.upload_id);
      break;
    }

    case "video.asset.track.ready": {
      const data = payload.data as VideoAssetTrackReadyWebhookEvent["data"] & {
        asset_id: string;
      };
      await db
        .update(videos)
        .set({
          muxTrackId: data.id as unknown as string,
          muxTrackStatus: data.status as unknown as string,
        })
        .where(eq(videos.muxAssetId, data.asset_id as string));
      console.log("Track ready:", data.asset_id);
      break;
    }
  }

  return new Response("Webhook processed", { status: 200 });
};
