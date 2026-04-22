import Mux from "@mux/mux-node";

export const mux = new Mux({
  tokenId: process.env.MUX_TOKEN_ID!,
  tokenSecret: process.env.MUX_TOKEN_SECRET!,
});

export async function deleteMuxVideo(assetId: string) {
  try {
    // ✨ sửa del → delete
    await mux.video.assets.delete(assetId);
    console.log("Deleted Mux asset:", assetId);
  } catch (err) {
    console.error("Failed to delete Mux asset:", err);
  }
}