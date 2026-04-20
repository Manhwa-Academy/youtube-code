"use client";

import { TrendingVideosSection } from "../sections/trending-videos-section";

export const TrendingView = () => {
  return (
    <div className="max-w-[2400px] mx-auto mb-10 px-4 pt-2.5 flex flex-col gap-y-6">
      <div>
        <h1 className="text-2xl font-bold">Thịnh hành</h1>
        <p className="text-xs text-muted-foreground">
          Những video phổ biến nhất hiện tại
        </p>
      </div>
      <TrendingVideosSection />
    </div>
  );
};
