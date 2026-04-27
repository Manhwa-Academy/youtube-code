"use client";

import { useState, useEffect } from "react"; // ✅ thêm useState
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";


interface Post {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
}

interface PostsSectionProps {
  userId: string;
}

export const PostsSection = ({ userId }: PostsSectionProps) => {
  const [posts, setPosts] = useState<Post[] | null>(null); // ✅ đã import useState

  useEffect(() => {
    fetch(`/api/users/${userId}/posts`)
      .then((res) => res.json())
      .then((data: Post[]) => setPosts(data)) // ✅ thêm kiểu Post[]
      .catch(() => setPosts([]));
  }, [userId]);

  if (!posts) return <p>Đang tải bài đăng...</p>;
  if (posts.length === 0) return <p>Chưa có bài đăng nào</p>;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {posts.map(
        (
          post: Post, // ✅ thêm kiểu Post
        ) => (
          <div key={post.id} className="border p-4 rounded-lg shadow-sm">
            <h3 className="font-semibold mb-2">{post.title}</h3>
            <p className="text-gray-600">{post.content}</p>
            <p className="text-xs text-gray-400 mt-2">
              {new Date(post.createdAt).toLocaleDateString()}
            </p>
          </div>
        ),
      )}
    </div>
  );
};
