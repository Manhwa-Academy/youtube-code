import { inferRouterOutputs } from "@trpc/server";
import { AppRouter } from "@/trpc/routers/_app";

// Lấy output của videos.getOne
export type VideoGetOneOutput = 
  inferRouterOutputs<AppRouter>["videos"]["getOne"];

// Lấy output của suggestions.getMany (giữ nguyên)
export type VideoGetManyOutput = 
  inferRouterOutputs<AppRouter>["suggestions"]["getMany"];

// Nếu muốn dùng trong VideoGridCard với progress:
// Chỉ cần lấy một item từ suggestions:
export type VideoGetManyItem = VideoGetManyOutput["items"][number];