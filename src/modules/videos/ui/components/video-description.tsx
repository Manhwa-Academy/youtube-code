import { useState, useMemo } from "react";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import DOMPurify from "dompurify";

import { cn } from "@/lib/utils";

interface VideoDescriptionProps {
  compactViews: string;
  expandedViews: string;
  compactDate: string;
  expandedDate: string;
  description?: string | null;
}

export const VideoDescription = ({
  compactViews,
  expandedViews,
  compactDate,
  expandedDate,
  description,
}: VideoDescriptionProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const parsedDescription = useMemo(() => {
    if (!description) return "Không có mô tả";

    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const hashtagRegex = /#(\w+)/g;

    let parsed = description
      .replace(urlRegex, (url) => {
        return `<a 
          href="${url}" 
          target="_blank" 
          rel="noopener noreferrer"
          class="text-blue-500 hover:underline"
        >${url}</a>`;
      })
      .replace(hashtagRegex, (tag) => {
        const clean = tag.replace("#", "");
        return `<a 
          href="/search?q=${clean}" 
          class="text-blue-500 hover:underline"
        >${tag}</a>`;
      });

 return DOMPurify.sanitize(parsed, {
  ADD_ATTR: ["target"],
});
  }, [description]);

  return (
    <div
      onClick={() => setIsExpanded((current) => !current)}
      className="bg-secondary/50 rounded-xl p-3 cursor-pointer hover:bg-secondary/70 transition"
    >
      <div className="flex gap-2 text-sm mb-2">
        <span className="font-medium">
          {isExpanded ? expandedViews : compactViews} lượt xem
        </span>
        <span className="font-medium">
          {isExpanded ? expandedDate : compactDate}
        </span>
      </div>

      <div className="relative">
        <p
          onClick={(e) => {
            // 🔥 chặn click nếu bấm vào link
            const target = e.target as HTMLElement;
            if (target.closest("a")) {
              e.stopPropagation();
            }
          }}
          className={cn(
            "text-sm whitespace-pre-wrap",
            !isExpanded && "line-clamp-2"
          )}
          dangerouslySetInnerHTML={{ __html: parsedDescription }}
        />

        <div className="flex items-center gap-1 mt-4 text-sm font-medium">
          {isExpanded ? (
            <>
              Thu gọn <ChevronUpIcon className="size-4" />
            </>
          ) : (
            <>
              Xem thêm <ChevronDownIcon className="size-4" />
            </>
          )}
        </div>
      </div>
    </div>
  );
};