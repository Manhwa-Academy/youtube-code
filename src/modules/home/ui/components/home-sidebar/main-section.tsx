"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuth, useClerk } from "@clerk/nextjs";
import { FlameIcon, HomeIcon, PlaySquareIcon, VideoIcon  } from "lucide-react";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const items = [
  {
    title: "Trang chủ",
    url: "/",
    icon: HomeIcon,
  },
  {
    title: "Kênh đăng ký",
    url: "/feed/subscribed",
    icon: PlaySquareIcon,
    auth: true,
  },
  {
    title: "Thịnh hành",
    url: "/feed/trending",
    icon: FlameIcon,
  },
  {
    title: "Shorts", // <-- thêm mục mới
    url: "/feed/shorts", // đường dẫn bạn muốn
    icon: VideoIcon, // bạn có thể đổi icon khác nếu muốn
  },
];
export const MainSection = () => {
  const clerk = useClerk();
  const { isSignedIn } = useAuth();
  const pathname = usePathname();

  return (
    <SidebarGroup>
      {/* 🔥 LOGO + TITLE (mobile sidebar header) */}
      <div className="flex items-center gap-2 px-4 py-3 border-b sm:hidden">
        <Image src="/yuuka.png" alt="Logo" width={28} height={28} />
        <span className="font-semibold text-base">Hayase Yuuka</span>
      </div>

      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                tooltip={item.title}
                asChild
                isActive={pathname === item.url}
                onClick={(e) => {
                  if (!isSignedIn && item.auth) {
                    e.preventDefault();
                    return clerk.openSignIn();
                  }
                }}
              >
                <Link href={item.url} className="flex items-center gap-4">
                  <item.icon />
                  <span className="text-sm">{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
};
