import { z } from "zod";
import { eq, getTableColumns, inArray, isNotNull } from "drizzle-orm";

import { db } from "@/db";
import { TRPCError } from "@trpc/server";
import { subscriptions, users, videos } from "@/db/schema";
import { baseProcedure, createTRPCRouter } from "@/trpc/init";

export const usersRouter = createTRPCRouter({
  // GET ONE USER
  getOne: baseProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      const { clerkUserId } = ctx;

      let userId;

      const [user] = await db
        .select()
        .from(users)
        .where(inArray(users.clerkId, clerkUserId ? [clerkUserId] : []));

      if (user) {
        userId = user.id;
      }

      const viewerSubscriptions = db.$with("viewer_subscriptions").as(
        db
          .select()
          .from(subscriptions)
          .where(inArray(subscriptions.viewerId, userId ? [userId] : [])),
      );

      const [existingUser] = await db
        .with(viewerSubscriptions)
        .select({
          ...getTableColumns(users),
          viewerSubscribed: isNotNull(viewerSubscriptions.viewerId).mapWith(Boolean),
          videoCount: db.$count(videos, eq(videos.userId, users.id)),
          subscriberCount: db.$count(subscriptions, eq(subscriptions.creatorId, users.id)),
          bio: users.bio, // lấy bio từ DB
        })
        .from(users)
        .leftJoin(viewerSubscriptions, eq(viewerSubscriptions.creatorId, users.id))
        .where(eq(users.id, input.id));

      if (!existingUser) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return existingUser;
    }),

  // UPDATE BIO
  updateBio: baseProcedure
    .input(z.object({ bio: z.string().max(200) })) // giới hạn 200 ký tự
    .mutation(async ({ input, ctx }) => {
      const { clerkUserId } = ctx; // ID của chính chủ

      if (!clerkUserId) throw new TRPCError({ code: "UNAUTHORIZED" });

      const [updatedUser] = await db
        .update(users)
        .set({ bio: input.bio, updatedAt: new Date() })
        .where(eq(users.clerkId, clerkUserId))
        .returning();

      if (!updatedUser) throw new TRPCError({ code: "NOT_FOUND" });

      return updatedUser;
    }),
});