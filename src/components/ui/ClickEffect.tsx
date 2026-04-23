"use client";

import { useState } from "react";

interface ClickEffectProps {
  imageSrc: string;
  children: React.ReactNode;
}

interface ClickItem {
  id: number;
  x: number;
  y: number;
}

export default function ClickEffect({ imageSrc, children }: ClickEffectProps) {
  const [clicks, setClicks] = useState<ClickItem[]>([]);

  const handleClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now();
    setClicks((prev) => [...prev, { id, x, y }]);
    // remove after animation
    setTimeout(() => setClicks((prev) => prev.filter((c) => c.id !== id)), 800);
  };

  return (
    <div
      className="relative w-full h-full"
      onClick={handleClick}
      style={{ cursor: "pointer" }}
    >
      {children}

      {clicks.map((click) => (
        <img
          key={click.id}
          src={imageSrc}
          style={{
            position: "absolute",
            left: click.x - 25,
            top: click.y - 25,
            width: 50,
            height: 50,
            pointerEvents: "none",
            animation: "pop 0.8s ease-out forwards",
            zIndex: 50,
          }}
        />
      ))}

      <style jsx>{`
        @keyframes pop {
          0% {
            transform: scale(0) translateY(0);
            opacity: 1;
          }
          50% {
            transform: scale(1.2) translateY(-20px); /* bay lên 20px */
            opacity: 1;
          }
          100% {
            transform: scale(1) translateY(-40px); /* kết thúc lên cao hơn */
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}