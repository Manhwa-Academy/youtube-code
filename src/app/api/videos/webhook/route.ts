"use server";

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
import { InferModel } from "drizzle-orm";

// Type helper cho update video
type VideoUpdate = Partial<InferModel<typeof videos, "insert">>;

const SIGNING_SECRET = process.env.MUX_WEBHOOK_SECRET!;
if (!SIGNING_SECRET) throw new Error("MUX_WEBHOOK_SECRET not set");

type WebhookEvent =
  | VideoAssetCreatedWebhookEvent
  | VideoAssetReadyWebhookEvent
  | VideoAssetErroredWebhookEvent
  | VideoAssetTrackReadyWebhookEvent
  | VideoAssetDeletedWebhookEvent;

export const POST = async (request: Request) => {
  const headersPayload = await headers();
  const muxSignature = headersPayload.get("mux-signature");
  if (!muxSignature) return new Response("No signature", { status: 401 });

  let payload: WebhookEvent;
  try {
    payload = await request.json();
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  // verify signature
  mux.webhooks.verifySignature(
    JSON.stringify(payload),
    { "mux-signature": muxSignature },
    SIGNING_SECRET
  );

  // Helper: update video với type an toàn
  const updateVideo = async (
    muxStatus: string,
    updateFields: VideoUpdate = {},
    uploadId?: string
  ) => {
    if (!uploadId) return;
    await db
      .update(videos)
      .set({ muxStatus, ...updateFields })
      .where(eq(videos.muxUploadId, uploadId));
  };

  switch (payload.type) {
    case "video.asset.created": {
      const data = payload.data as VideoAssetCreatedWebhookEvent["data"];
      await updateVideo(data.status, { muxAssetId: data.id }, data.upload_id);
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
        const randomPercent = Math.floor(Math.random() * 90) + 5;
        const width = 1280;
        const height = 720;

        const [thumb, prev] = await utapi.uploadFilesFromUrl([
          `https://image.mux.com/${playbackId}/thumbnail.png?width=${width}&height=${height}&time=${randomPercent}`,
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

      await updateVideo(
        "ready",
        {
          muxPlaybackId: playbackId,
          muxAssetId: data.id,
          thumbnailUrl,
          thumbnailKey,
          previewUrl,
          previewKey,
          duration,
        },
        data.upload_id
      );

      console.log("Video ready:", data.upload_id);
      break;
    }

    case "video.asset.errored": {
      const data = payload.data as VideoAssetErroredWebhookEvent["data"];
      await updateVideo("errored", {}, data.upload_id);
      break;
    }

    case "video.asset.deleted": {
      const data = payload.data as VideoAssetDeletedWebhookEvent["data"];
      if (data.upload_id) {
        await db.delete(videos).where(eq(videos.muxUploadId, data.upload_id));
      }
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
          muxTrackId: data.id,
          muxTrackStatus: data.status,
        })
        .where(eq(videos.muxAssetId, data.asset_id));
      console.log("Track ready:", data.asset_id);
      break;
    }
  }

  return new Response("Webhook processed", { status: 200 });
};