import { and, eq } from "drizzle-orm";
import { serve } from "@upstash/workflow/nextjs";

import { db } from "@/db";
import { videos } from "@/db/schema";

interface InputType {
  userId: string;
  videoId: string;
}

export const { POST } = serve(async (context) => {
  console.log("🚀 WORKFLOW START");

  const input = context.requestPayload as InputType | undefined;
  console.log("📦 PAYLOAD:", input);

  if (!input?.videoId || !input?.userId) {
    throw new Error("Missing videoId or userId");
  }

  const { videoId, userId } = input;

  // ================= GET VIDEO =================
  const video = await context.run("get-video", async () => {
    const [existingVideo] = await db
      .select()
      .from(videos)
      .where(and(eq(videos.id, videoId), eq(videos.userId, userId)));

    if (!existingVideo) throw new Error("Video not found");

    return existingVideo;
  });

  // ================= GET TRANSCRIPT =================
  const transcript = await context.run("get-transcript", async () => {
    if (!video.muxPlaybackId || !video.muxTrackId) {
      return "";
    }

    const trackUrl = `https://stream.mux.com/${video.muxPlaybackId}/text/${video.muxTrackId}.txt`;

    const res = await fetch(trackUrl);

    if (!res.ok) return "";

    const text = await res.text();

    if (!text || text.length < 50) {
      return "";
    }

    return text;
  });

  // ================= AI GENERATE =================
  console.log("🤖 Sending to AI...");

  const isGoodTranscript = transcript && transcript.length > 200;

  const inputText = isGoodTranscript
    ? `
Transcript:
${transcript}
`
    : `
Video information:

Title: unknown
Thumbnail: ${video.thumbnailUrl || "no thumbnail"}

Generate a YouTube title that matches THIS video's actual content.
`;

  const SYSTEM_PROMPT = `
Generate ONLY a YouTube title.

Rules:
- Max 10 words
- No explanation
- No quotes
- Match the actual content of the video
- Do NOT assume genre (manhwa, anime, etc.) unless clear
`;

  const aiResponse = await fetch(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY!}`,
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-120b:free",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: inputText.slice(0, 8000) },
        ],
        max_tokens: 30,
        temperature: 0.7,
      }),
    },
  );

  if (!aiResponse.ok) {
    const err = await aiResponse.text();
    console.error("❌ AI ERROR:", err);
    throw new Error("AI request failed");
  }

  const data = await aiResponse.json();

  let title = data.choices?.[0]?.message?.content?.trim();

  // ================= CLEAN OUTPUT =================
  title = title?.split("\n")[0].replace(/[*"]/g, "").trim();

  if (
    !title ||
    title.length > 100 ||
    title.toLowerCase().includes("user") ||
    title.toLowerCase().includes("transcript")
  ) {
    console.warn("⚠️ Bad AI output → fallback");

    title = video.title || "🔥 Amazing Manhwa Story";
  }

  console.log("✨ FINAL TITLE:", title);

  // ================= UPDATE DB =================
  await context.run("update-video", async () => {
    await db
      .update(videos)
      .set({
        title,
        updatedAt: new Date(),
      })
      .where(and(eq(videos.id, video.id), eq(videos.userId, video.userId)));
  });

  console.log("🎉 WORKFLOW DONE");
});
