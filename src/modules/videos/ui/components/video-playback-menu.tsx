"use client";

import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { RepeatIcon, SkipForwardIcon, SettingsIcon } from "lucide-react";

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
const QUALITY_OPTIONS: Array<"1080p" | "720p" | "480p"> = [
  "1080p",
  "720p",
  "480p",
];

export const VideoPlaybackMenu = ({
  playerRef,
  autoNextEnabled,
  setAutoNextEnabledAction,
  loopEnabled,
  setLoopEnabledAction,
  playbackRate,
  setPlaybackRate,
}: Props) => {
  const [selectedTrack, setSelectedTrack] = useState<"1080p" | "720p" | "480p">(
    "1080p",
  );

 const handleSelectTrack = (label: "1080p" | "720p" | "480p") => {
  setSelectedTrack(label);
  if (!playerRef.current) return;

  const qualityMap: Record<string, "high" | "medium" | "low"> = {
    "1080p": "high",
    "720p": "medium",
    "480p": "low",
  };

  // Gán chất lượng
  playerRef.current.preferredVideoQuality = qualityMap[label];

  // 🔥 Reload video để ép chất lượng, bỏ Auto
  if (playerRef.current.reload) {
    playerRef.current.reload();
  }
};

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
          onClick={() => setAutoNextEnabledAction(!autoNextEnabled)}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <SkipForwardIcon className="w-4 h-4 text-gray-500" />
            <span>Tự chuyển</span>
          </div>
          <div
            className={`w-9 h-5 flex items-center rounded-full p-1 transition ${autoNextEnabled ? "bg-blue-500" : "bg-gray-300"}`}
          >
            <div
              className={`w-4 h-4 bg-white rounded-full transition ${autoNextEnabled ? "translate-x-4" : ""}`}
            />
          </div>
        </DropdownMenuItem>

        {/* LOOP */}
        <DropdownMenuItem
          onClick={() => setLoopEnabledAction(!loopEnabled)}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <RepeatIcon className="w-4 h-4 text-gray-500" />
            <span>Lặp lại</span>
          </div>
          <div
            className={`w-9 h-5 flex items-center rounded-full p-1 transition ${loopEnabled ? "bg-green-500" : "bg-gray-300"}`}
          >
            <div
              className={`w-4 h-4 bg-white rounded-full transition ${loopEnabled ? "translate-x-4" : ""}`}
            />
          </div>
        </DropdownMenuItem>

        {/* QUALITY */}
        <DropdownMenuItem className="flex flex-col gap-1">
          <span className="text-gray-700 text-sm font-medium">Chất lượng</span>
          <div className="flex flex-wrap gap-2">
            {QUALITY_OPTIONS.map((label) => (
              <Button
                key={label}
                size="sm"
                variant={label === selectedTrack ? "default" : "outline"}
                onClick={() => handleSelectTrack(label)}
              >
                {label}
              </Button>
            ))}
          </div>
        </DropdownMenuItem>

        {/* SPEED */}
        <DropdownMenuItem className="flex flex-col gap-1">
          <span className="text-gray-700 text-sm font-medium">Tốc độ</span>
          <div className="flex flex-wrap gap-2">
            {SPEED_OPTIONS.map((s) => (
              <Button
                key={s}
                size="sm"
                variant={s === playbackRate ? "default" : "outline"}
                onClick={() => {
                  setPlaybackRate(s);
                  if (playerRef.current) playerRef.current.playbackRate = s;
                }}
              >
                {s}x
              </Button>
            ))}
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
