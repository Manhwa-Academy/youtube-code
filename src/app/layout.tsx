import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";

import { TRPCProvider } from "@/trpc/client";
import { Toaster } from "@/components/ui/sonner";
import { ScrollToTopCharacter } from "@/components/scroll-to-top";

import ClickEffect from "@/components/ui/ClickEffect";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "YouTube",
  description: "Trang web video của chủ nhân-sama",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider afterSignOutUrl="/">
      <html lang="en">
        <head>
          <link rel="icon" href="/favicon.ico" />
        </head>
        <body className={inter.className}>
          <TRPCProvider>
            <Toaster />
            <ClickEffect imageSrc="/toTop.Cuiv4RfP.svg">{children}</ClickEffect>
            <ScrollToTopCharacter />
          </TRPCProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
