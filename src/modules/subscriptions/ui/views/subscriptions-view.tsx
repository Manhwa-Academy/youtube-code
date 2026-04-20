"use client";

import { SubscriptionsSection } from "../sections/subscriptions-section";

export const SubscriptionsView = () => {
  return (
    <div className="max-w-[2400px] mx-auto mb-10 px-4 pt-2.5 flex flex-col gap-y-6">
      <div>
        <h1 className="text-2xl font-bold">Tất cả kênh đã đăng ký</h1>
        <p className="text-xs text-muted-foreground">
          Xem và quản lý tất cả kênh bạn đã đăng ký
        </p>
      </div>
      <SubscriptionsSection />
    </div>
  );
};