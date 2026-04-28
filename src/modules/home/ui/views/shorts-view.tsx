"use client";

import { ShortsVideosSection } from "../sections/shorts-videos-section";

export const ShortsView = () => {
  return (
    <div className="max-w-[2400px] mx-auto mb-10 px-4 pt-2.5 flex flex-col gap-y-6">
      <div>
        <h1 className="text-2xl font-bold">Shorts</h1>
        <p className="text-xs text-muted-foreground">
          Những video ngắn dưới 1 phút
        </p>
      </div>
      <ShortsVideosSection /> {/* Dùng component ShortsVideosSection */}
    </div>
  );
};