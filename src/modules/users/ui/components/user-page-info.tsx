import { useState } from "react";
import Link from "next/link";
import { useClerk, useAuth } from "@clerk/nextjs";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { UserAvatar } from "@/components/user-avatar";

import { UserGetOneOutput } from "../../types";

import { useSubscription } from "@/modules/subscriptions/hooks/use-subscription";
import { SubscriptionButton } from "@/modules/subscriptions/ui/components/subscription-button";
import { useUpdateBio } from "@/hooks/useUpdateBio";

interface UserPageInfoProps {
  user: UserGetOneOutput;
}

export const UserPageInfoSkeleton = () => {
  return (
    <div className="py-6">
      {/* Mobile layout */}
      <div className="flex flex-col md:hidden">
        <div className="flex items-center gap-3">
          <Skeleton className="h-[60px] w-[60px] rounded-full" />
          <div className="flex-1 min-w-0">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-48 mt-1" />
            <Skeleton className="h-4 w-full mt-2" />
          </div>
        </div>
        <Skeleton className="h-10 w-full mt-3 rounded-full" />
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:flex items-start gap-4">
        <Skeleton className="h-[160px] w-[160px] rounded-full" />
        <div className="flex-1 min-w-0">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-5 w-48 mt-4" />
          <Skeleton className="h-4 w-full mt-2" />
          <Skeleton className="h-10 w-32 mt-3 rounded-full" />
        </div>
      </div>
    </div>
  );
};

export const UserPageInfo = ({ user }: UserPageInfoProps) => {
  const { userId, isLoaded } = useAuth();
  const clerk = useClerk();

  const { isPending, onClick } = useSubscription({
    userId: user.id,
    isSubscribed: user.viewerSubscribed,
  });

  const isOwner = userId === user.clerkId;
  const [bio, setBio] = useState(user.bio || "");
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  // ✅ Hook mutation TRPC để update bio trực tiếp vào DB
  const updateBioMutation = useUpdateBio();

  const handleSave = async () => {
    if (!bio) return;
    setLoading(true);
    try {
      await updateBioMutation.mutateAsync({ bio });
      setEditing(false);
    } catch (error) {
      console.error("Lỗi khi update bio:", error);
    }
    setLoading(false);
  };

  const renderBio = () => {
    if (isOwner) {
      return editing ? (
        <div className="mt-2 flex flex-col gap-2">
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full border rounded-md p-2 text-sm resize-none"
            rows={3}
          />
          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={loading}>
              Lưu
            </Button>
            <Button variant="secondary" onClick={() => setEditing(false)}>
              Hủy
            </Button>
          </div>
        </div>
      ) : (
        <div className="text-sm text-muted-foreground mt-2 flex items-center gap-2">
          {bio || "Chưa có bio"}
          <Button variant="link" onClick={() => setEditing(true)}>
            Chỉnh sửa
          </Button>
        </div>
      );
    }
    return bio ? (
      <p className="text-sm text-muted-foreground mt-2 line-clamp-3">{bio}</p>
    ) : null;
  };

  return (
    <div className="py-6">
      {/* Mobile layout */}
      <div className="flex flex-col md:hidden">
        <div className="flex items-center gap-3">
          <UserAvatar
            size="lg"
            imageUrl={user.imageUrl}
            name={user.name}
            className="h-[60px] w-[60px]"
            onClick={() => {
              if (isOwner) clerk.openUserProfile();
            }}
          />
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold">{user.name}</h1>
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
              <span>{user.subscriberCount} người đăng ký</span>
              <span>&bull;</span>
              <span>{user.videoCount} videos</span>
            </div>
            {renderBio()}
          </div>
        </div>
        {isOwner ? (
          <Button
            variant="secondary"
            asChild
            className="w-full mt-3 rounded-full"
          >
            <Link prefetch href="/studio">
              Đi đến studio
            </Link>
          </Button>
        ) : (
          <SubscriptionButton
            disabled={isPending || !isLoaded}
            isSubscribed={user.viewerSubscribed}
            onClick={onClick}
            className="w-full mt-3"
          />
        )}
      </div>

      {/* Desktop layout */}
      <div className="hidden md:flex items-start gap-4">
        <UserAvatar
          size="xl"
          imageUrl={user.imageUrl}
          name={user.name}
          className={cn(
            isOwner &&
              "cursor-pointer hover:opacity-80 transition-opacity duration-300",
          )}
          onClick={() => {
            if (isOwner) clerk.openUserProfile();
          }}
        />
        <div className="flex-1 min-w-0">
          <h1 className="text-4xl font-bold">{user.name}</h1>
          <div className="flex items-center gap-1 text-sm text-muted-foreground mt-3">
            <span>{user.subscriberCount} người đăng ký</span>
            <span>&bull;</span>
            <span>{user.videoCount} videos</span>
          </div>
          {renderBio()}
          {isOwner ? (
            <Button variant="secondary" asChild className="mt-3 rounded-full">
              <Link prefetch href="/studio">
                Đi đến studio
              </Link>
            </Button>
          ) : (
            <SubscriptionButton
              disabled={isPending || !isLoaded}
              isSubscribed={user.viewerSubscribed}
              onClick={onClick}
              className="mt-3"
            />
          )}
        </div>
      </div>
    </div>
  );
};
