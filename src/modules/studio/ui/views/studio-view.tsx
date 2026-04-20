import { VideosSection } from "../sections/videos-section";

export const StudioView = () => {
  return ( 
    <div className="flex flex-col gap-y-6 pt-2.5">
      <div className="px-4">
        <h1 className="text-2xl font-bold">Nội dung kênh</h1>
        <p className="text-xs text-muted-foreground">
          Quản lý video và nội dung trên kênh của bạn
        </p>
      </div>
      <VideosSection />
    </div>
  );
}