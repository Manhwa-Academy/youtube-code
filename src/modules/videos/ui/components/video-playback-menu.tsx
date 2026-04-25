"use client";

import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  RepeatIcon,
  SkipForwardIcon,
  SettingsIcon,
  ClockIcon,
} from "lucide-react";

interface Props {
  playerRef: React.RefObject<any>;
  autoNextEnabled: boolean;
  setAutoNextEnabledAction: (v: boolean) => void;
  loopEnabled: boolean;
  setLoopEnabledAction: (v: boolean) => void;
  playbackRate: number;
  setPlaybackRate: (r: number) => void;
}

const SPEED_OPTIONS = [0.5, 1, 1.5, 2];

export const VideoPlaybackMenu = ({
  playerRef,
  autoNextEnabled,
  setAutoNextEnabledAction,
  loopEnabled,
  setLoopEnabledAction,
  playbackRate,
  setPlaybackRate,
}: Props) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <SettingsIcon className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-56 p-2 rounded-xl shadow-lg"
      >
        {/* AUTO NEXT */}
        <DropdownMenuItem
          className="flex items-center justify-between"
          onClick={() => setAutoNextEnabledAction(!autoNextEnabled)}
        >
          <div className="flex items-center gap-2">
            <SkipForwardIcon className="w-4 h-4 text-gray-500" />
            <span>Tự chuyển</span>
          </div>
          <div
            className={`w-9 h-5 flex items-center rounded-full p-1 transition ${
              autoNextEnabled ? "bg-blue-500" : "bg-gray-300"
            }`}
          >
            <div
              className={`w-4 h-4 bg-white rounded-full transition ${
                autoNextEnabled ? "translate-x-4" : ""
              }`}
            />
          </div>
        </DropdownMenuItem>

        {/* LOOP */}
        <DropdownMenuItem
          className="flex items-center justify-between"
          onClick={() => setLoopEnabledAction(!loopEnabled)}
        >
          <div className="flex items-center gap-2">
            <RepeatIcon className="w-4 h-4 text-gray-500" />
            <span>Lặp lại</span>
          </div>
          <div
            className={`w-9 h-5 flex items-center rounded-full p-1 transition ${
              loopEnabled ? "bg-green-500" : "bg-gray-300"
            }`}
          >
            <div
              className={`w-4 h-4 bg-white rounded-full transition ${
                loopEnabled ? "translate-x-4" : ""
              }`}
            />
          </div>
        </DropdownMenuItem>

        {/* SPEED Submenu */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {/* Icon giống Tự chuyển/Lặp lại */}
              <ClockIcon className="w-4 h-4 text-gray-500" />
              <span>Tốc độ phát</span>
            </div>
          </DropdownMenuSubTrigger>

          <DropdownMenuSubContent className="w-36 p-2">
            {SPEED_OPTIONS.map((s) => (
              <DropdownMenuItem
                key={s}
                onClick={() => {
                  setPlaybackRate(s);
                  if (playerRef.current) playerRef.current.playbackRate = s;
                }}
              >
                {s}x
              </DropdownMenuItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
