"use client";

import { SubscribedVideosSection } from "../sections/subscribed-videos-section";

export const SubscribedView = () => {
  return (
    <div className="max-w-[2400px] mx-auto mb-10 px-4 pt-2.5 flex flex-col gap-y-6">
      <div>
        <h1 className="text-2xl font-bold">Kênh đăng ký</h1>
        <p className="text-xs text-muted-foreground">
          Video từ các kênh bạn đã đăng ký
        </p>
      </div>
      <SubscribedVideosSection />
    </div>
  );
};