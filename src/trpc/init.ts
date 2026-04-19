import { db } from "@/db";
import { eq } from "drizzle-orm";
import { users } from "@/db/schema";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { initTRPC, TRPCError } from "@trpc/server";
import { cache } from "react";
import superjson from "superjson";
import { ratelimit } from "@/lib/ratelimit";

// Tạo context TRPC
export const createTRPCContext = cache(async () => {
  const { userId } = await auth();
  return { clerkUserId: userId };
});

export type Context = Awaited<ReturnType<typeof createTRPCContext>>;

// Khởi tạo TRPC
const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

// Router và procedure helpers
export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const baseProcedure = t.procedure;

// Middleware bảo vệ procedure và auto-upsert user
export const protectedProcedure = t.procedure.use(
  async function isAuthed(opts) {
    const { ctx } = opts;

    if (!ctx.clerkUserId) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    // Lấy thông tin từ Clerk
    const client = await clerkClient(); // <-- quan trọng: await
    const clerkUser = await client.users.getUser(ctx.clerkUserId);

    // Lấy tên và avatar an toàn
    const name = clerkUser.fullName || "Anonymous";

    // Clerk v4: ảnh đại diện nằm trong `imageUrl` hoặc `profileImageUrl`
    const imageUrl =
      (clerkUser as any).profileImageUrl ||
      clerkUser.imageUrl ||
      "/default-avatar.png";

    // Tìm user trong DB
    let [user] = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, ctx.clerkUserId))
      .limit(1);

    if (!user) {
      // Insert nếu chưa có
      const [newUser] = await db
        .insert(users)
        .values({
          clerkId: ctx.clerkUserId,
          name,
          imageUrl,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();
      user = newUser;
    } else {
      // Update tên và avatar nếu khác
      if (user.name !== name || user.imageUrl !== imageUrl) {
        await db
          .update(users)
          .set({ name, imageUrl, updatedAt: new Date() })
          .where(eq(users.clerkId, ctx.clerkUserId));
        user.name = name;
        user.imageUrl = imageUrl;
      }
    }

    // Rate limit
    const { success } = await ratelimit.limit(user.id);
    if (!success) {
      throw new TRPCError({ code: "TOO_MANY_REQUESTS" });
    }

    return opts.next({
      ctx: {
        ...ctx,
        user,
      },
    });
  },
);
