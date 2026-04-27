"use client";

import { useState, useEffect, Suspense } from "react";
import { UserSection } from "../sections/user-section";
import { VideosSection } from "../sections/videos-section";
import { UserTabs } from "../components/user-tabs";
import { Film } from "lucide-react";
import { ErrorBoundary } from "react-error-boundary";

interface UserViewProps {
  userId: string;
}

export const UserView = ({ userId }: UserViewProps) => {
  const [activeTab, setActiveTab] = useState<
    "home" | "videos" | "shorts"
  >("home");
  const [activeVideoTab, setActiveVideoTab] = useState<
    "latest" | "popular" | "oldest"
  >("latest");

  const [homeCount, setHomeCount] = useState<number | null>(null);
  const [videoCount, setVideoCount] = useState<number | null>(null);
  const [shortsCount, setShortsCount] = useState<number | null>(null);

  return (
    <div className="flex flex-col max-w-[1300px] px-4 pt-2.5 mx-auto mb-10 gap-y-6">
      <UserSection userId={userId} />

      <UserTabs
        userId={userId}
        activeVideoTab={activeVideoTab}
        setActiveVideoTabAction={setActiveVideoTab}
        activeTab={activeTab}
        setActiveTabAction={setActiveTab}
      />

      {/* Homepage */}
      {activeTab === "home" && (
        <>
          <h2
            className={`font-semibold text-lg mb-4 ${homeCount === 0 ? "hidden" : ""}`}
          >
            Dành cho bạn
          </h2>
          <VideosSection
            userId={userId}
            filterType="home"
            showCarousel
            onVideosCount={setHomeCount}
          />

          <h2
            className={`font-semibold text-lg mb-4 mt-6 ${videoCount === 0 ? "hidden" : ""}`}
          >
            Video
          </h2>
          <VideosSection
            userId={userId}
            filterType="videos"
            sortBy={activeVideoTab}
            onVideosCount={setVideoCount}
          />

          <h2
            className={`font-semibold text-lg mb-4 mt-6 flex items-center gap-1 ${shortsCount === 0 ? "hidden" : ""}`}
          >
            Shorts <Film className="w-4 h-4" />
          </h2>
          <VideosSection
            userId={userId}
            filterType="shorts"
            onVideosCount={setShortsCount}
          />
        </>
      )}

      {/* Tab Video */}
      {activeTab === "videos" && (
        <VideosSection
          userId={userId}
          filterType="videos"
          sortBy={activeVideoTab}
        />
      )}

      {/* Tab Shorts */}
      {activeTab === "shorts" && (
        <VideosSection userId={userId} filterType="shorts" />
      )}
    </div>
  );
};
