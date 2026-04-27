"use client";

import { useState, useEffect } from "react";
import {
  Film,
  Video,
  PieChart,
  FileText,
  HelpCircle,
  Hourglass,
} from "lucide-react";

export interface Post {
  id: string;
  content: string;
  type: "image" | "video";
}

export interface PostsViewProps {
  userId?: string; // nếu muốn fetch bên trong PostsView
  posts?: Post[]; // dữ liệu đã đăng
  scheduledPosts?: Post[]; // dữ liệu đã lên lịch
  archivedPosts?: Post[]; // dữ liệu đã lưu trữ
}

export const PostsView = ({ userId }: PostsViewProps) => {
  const tabs = ["Đã đăng", "Đã lên lịch", "Đã lưu trữ"] as const;
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>("Đã đăng");

  const [posts, setPosts] = useState<Post[]>([]);
  const [scheduledPosts, setScheduledPosts] = useState<Post[]>([]);
  const [archivedPosts, setArchivedPosts] = useState<Post[]>([]);

  // Fetch dữ liệu khi mount
  useEffect(() => {
    fetch(`/api/users/${userId}/posts`)
      .then((res) => res.json())
      .then((data: Post[]) => setPosts(data))
      .catch(() => setPosts([]));

    fetch(`/api/users/${userId}/posts/scheduled`)
      .then((res) => res.json())
      .then((data: Post[]) => setScheduledPosts(data))
      .catch(() => setScheduledPosts([]));

    fetch(`/api/users/${userId}/posts/archived`)
      .then((res) => res.json())
      .then((data: Post[]) => setArchivedPosts(data))
      .catch(() => setArchivedPosts([]));
  }, [userId]);

  const getTabContent = () => {
    switch (activeTab) {
      case "Đã đăng":
        return posts.length === 0 ? (
          <EmptyState
            icon="image" // thay "edit" => "image"
            title="Xuất bản bài đăng"
            description="Bài đăng xuất hiện ở đây sau khi bạn xuất bản"
          />
        ) : (
          <PostList posts={posts} />
        );
      case "Đã lên lịch":
        return scheduledPosts.length === 0 ? (
          <EmptyState
            icon="pollText" // thay "clock" => "pollText"
            title="Chưa có bài đăng lên lịch"
            description="Bài đăng lên lịch sẽ xuất hiện ở đây"
          />
        ) : (
          <PostList posts={scheduledPosts} />
        );
      case "Đã lưu trữ":
        return archivedPosts.length === 0 ? (
          <EmptyState
            icon="question" // thay "hourglass" => "question"
            title="Bài đăng đã hết hạn"
            description="Các bài đăng hết hạn sẽ xuất hiện tại đây"
          />
        ) : (
          <PostList posts={archivedPosts} />
        );
    }
  };

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Bảng tạo bài đăng ở trên */}
      <CreatePostBox />

      {/* Tabs ngay dưới CreatePostBox */}
      <div className="flex gap-4 border-b mb-4 mt-2">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-2 text-sm font-medium ${
              activeTab === tab
                ? "border-b-2 border-black text-black"
                : "text-gray-500"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Nội dung tab hiển thị bên dưới tabs */}
      <div>{getTabContent()}</div>
    </div>
  );
};

const CreatePostBox = () => {
  const [visibility, setVisibility] = useState<"public" | "private">("public");

  return (
    <div className="border rounded-lg p-3 flex flex-col gap-2 bg-gray-50 max-w-sm">
      {/* Trạng thái hiển thị */}
      <div className="flex items-center justify-between text-sm mb-1">
        <span>Trạng thái hiển thị:</span>
        <select
          value={visibility}
          onChange={(e) =>
            setVisibility(e.target.value as "public" | "private")
          }
          className="border rounded px-2 py-1 text-xs"
        >
          <option value="public">Công khai</option>
          <option value="private">Riêng tư</option>
        </select>
      </div>

      {/* Nội dung */}
      <textarea
        placeholder="Chia sẻ điều gì đó..."
        className="w-full p-2 border rounded resize-none focus:outline-none text-sm"
        rows={2}
      />

      {/* Loại bài đăng */}
      <div className="flex flex-wrap gap-1 text-xs mt-1">
        <button className="flex items-center gap-1 px-2 py-0.5 border rounded text-gray-600 hover:bg-gray-200 hover:text-black">
          <Film className="w-3 h-3" /> Hình ảnh
        </button>
        <button className="flex items-center gap-1 px-2 py-0.5 border rounded text-gray-600 hover:bg-gray-200 hover:text-black">
          <Video className="w-3 h-3" /> Video
        </button>
        <button className="flex items-center gap-1 px-2 py-0.5 border rounded text-gray-600 hover:bg-gray-200 hover:text-black">
          <PieChart className="w-3 h-3" /> Thăm dò ý kiến hinh ảnh
        </button>
        <button className="flex items-center gap-1 px-2 py-0.5 border rounded text-gray-600 hover:bg-gray-200 hover:text-black">
          <FileText className="w-3 h-3" /> Thăm dò ý kiến văn bản
        </button>
        <button className="flex items-center gap-1 px-2 py-0.5 border rounded text-gray-600 hover:bg-gray-200 hover:text-black">
          <HelpCircle className="w-3 h-3" /> Câu hỏi
        </button>
      </div>

      {/* Nút đăng */}
      <div className="flex justify-end mt-1">
        <button className="bg-black text-white px-3 py-0.5 rounded hover:bg-gray-800 text-sm">
          Đăng
        </button>
      </div>
    </div>
  );
};

const EmptyState = ({
  icon,
  title,
  description,
}: {
  icon: "image" | "video" | "pollImage" | "pollText" | "question";
  title: string;
  description: string;
}) => {
  let IconComponent: any;

  switch (icon) {
    case "image":
      IconComponent = Film;
      break;
    case "video":
      IconComponent = Video;
      break;
    case "pollImage":
      IconComponent = PieChart;
      break;
    case "pollText":
      IconComponent = FileText;
      break;
    case "question":
      IconComponent = HelpCircle;
      break;
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center text-gray-500">
      {IconComponent && <IconComponent className="w-12 h-12 mb-4" />}
      <h3 className="font-semibold text-lg mb-2">{title}</h3>
      <p className="text-sm">{description}</p>
    </div>
  );
};
const PostList = ({ posts }: { posts: Post[] }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
    {posts.map((post) => (
      <div key={post.id} className="border p-4 rounded-lg shadow-sm">
        <p className="text-gray-600">{post.content}</p>
        <p className="text-xs text-gray-400 mt-2">Loại: {post.type}</p>
      </div>
    ))}
  </div>
);
