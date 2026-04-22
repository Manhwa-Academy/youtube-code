import { z } from "zod";
import {
  eq,
  and,
  getTableColumns,
  not,
  inArray,
  sql,
} from "drizzle-orm";

import { db } from "@/db";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, baseProcedure } from "@/trpc/init";
import { users, videoReactions, videos, videoViews } from "@/db/schema";

export const suggestionsRouter = createTRPCRouter({
  getMany: baseProcedure
    .input(
      z.object({
        videoId: z.string().uuid(),
        limit: z.number().min(1).max(20).default(5),
        excludeIds: z.array(z.string().uuid()).optional(), // 🔥 chống lặp
      }),
    )
    .query(async ({ input }) => {
      const { videoId, limit, excludeIds = [] } = input;

      // 🔍 lấy video hiện tại
      const [existingVideo] = await db
        .select()
        .from(videos)
        .where(eq(videos.id, videoId));

      if (!existingVideo) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      // 🔥 danh sách cần loại bỏ
      const excluded = [videoId, ...excludeIds];

      // =========================
      // 🎯 1. VIDEO CÙNG CATEGORY (RANDOM)
      // =========================
      const sameCategory = await db
        .select({
          ...getTableColumns(videos),
          user: users,
          viewCount: db.$count(videoViews, eq(videoViews.videoId, videos.id)),
          likeCount: db.$count(
            videoReactions,
            and(
              eq(videoReactions.videoId, videos.id),
              eq(videoReactions.type, "like"),
            ),
          ),
          dislikeCount: db.$count(
            videoReactions,
            and(
              eq(videoReactions.videoId, videos.id),
              eq(videoReactions.type, "dislike"),
            ),
          ),
        })
        .from(videos)
        .innerJoin(users, eq(videos.userId, users.id))
        .where(
          and(
            eq(videos.visibility, "public"),
            existingVideo.categoryId
              ? eq(videos.categoryId, existingVideo.categoryId)
              : undefined,
            not(inArray(videos.id, excluded)),
          ),
        )
        .orderBy(sql`RANDOM()`)
        .limit(limit);

      // nếu đủ rồi → return luôn
      if (sameCategory.length >= limit) {
        return {
          items: sameCategory,
          nextCursor: null,
        };
      }

      // =========================
      // 🔥 2. FALLBACK RANDOM KHÁC CATEGORY
      // =========================
      const otherVideos = await db
        .select({
          ...getTableColumns(videos),
          user: users,
          viewCount: db.$count(videoViews, eq(videoViews.videoId, videos.id)),
          likeCount: db.$count(
            videoReactions,
            and(
              eq(videoReactions.videoId, videos.id),
              eq(videoReactions.type, "like"),
            ),
          ),
          dislikeCount: db.$count(
            videoReactions,
            and(
              eq(videoReactions.videoId, videos.id),
              eq(videoReactions.type, "dislike"),
            ),
          ),
        })
        .from(videos)
        .innerJoin(users, eq(videos.userId, users.id))
        .where(
          and(
            eq(videos.visibility, "public"),
            not(inArray(videos.id, excluded)),
          ),
        )
        .orderBy(sql`RANDOM()`)
        .limit(limit - sameCategory.length);

      // =========================
      // 🔥 3. MERGE KHÔNG TRÙNG
      // =========================
      const merged = [...sameCategory];

      for (const v of otherVideos) {
        if (!merged.find((m) => m.id === v.id)) {
          merged.push(v);
        }
      }

      return {
        items: merged,
        nextCursor: null, // 👉 không cần infinite nữa
      };
    }),
});