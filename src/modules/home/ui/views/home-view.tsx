import { CategoriesSection } from "../sections/categories-section";
import { HomeVideosSection } from "../sections/home-videos-section";
import { PlaylistsView } from "@/modules/playlists/ui/sections/playlists-view";
interface HomeViewProps {
  categoryId?: string;
};

export const HomeView = ({ categoryId }: HomeViewProps) => {
  return (
    <div className="max-w-[2400px] mx-auto mb-10 px-4 pt-2.5 flex flex-col gap-y-6">
      
      <CategoriesSection categoryId={categoryId} />

      {/* 🔥 THÊM Ở ĐÂY */}
      <PlaylistsView />

      <HomeVideosSection categoryId={categoryId} />

    </div>
  );
};