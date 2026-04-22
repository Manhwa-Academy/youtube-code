import { db } from "@/db";
import { eq } from "drizzle-orm";
import { users } from "@/db/schema";
import { auth, clerkClient, User as ClerkUser } from "@clerk/nextjs/server";
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

export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const baseProcedure = t.procedure;

// Middleware bảo vệ procedure và auto-upsert user
export const protectedProcedure = t.procedure.use(async function isAuthed(opts) {
  const { ctx } = opts;

  if (!ctx.clerkUserId) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  const client = await clerkClient();
  const clerkUser: ClerkUser = await client.users.getUser(ctx.clerkUserId);

  const name = clerkUser.fullName || "Anonymous";

  const imageUrl =
    "profileImageUrl" in clerkUser && typeof clerkUser.profileImageUrl === "string"
      ? clerkUser.profileImageUrl
      : clerkUser.imageUrl || "/default-avatar.png";

  let [user] = await db
    .select()
    .from(users)
    .where(eq(users.clerkId, ctx.clerkUserId))
    .limit(1);

  if (!user) {
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
    if (user.name !== name || user.imageUrl !== imageUrl) {
      await db
        .update(users)
        .set({ name, imageUrl, updatedAt: new Date() })
        .where(eq(users.clerkId, ctx.clerkUserId));
      user.name = name;
      user.imageUrl = imageUrl;
    }
  }

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
});

// ✅ Tạo publicProcedure để mọi người có thể gọi mà không cần login
export const publicProcedure = t.procedure;