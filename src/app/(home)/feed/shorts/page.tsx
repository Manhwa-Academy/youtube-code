import { HydrateClient, trpc } from "@/trpc/server";
import { DEFAULT_LIMIT } from "@/constants";
import { ShortsView } from "@/modules/home/ui/views/shorts-view";

export const dynamic = "force-dynamic";

const Page = async () => {
  // Đây là Server Component, prefetch được server-only
  await trpc.videos.getMany.prefetchInfinite({ limit: DEFAULT_LIMIT });

  return (
    <HydrateClient>
      <ShortsView />
    </HydrateClient>
  );
};

export default Page;