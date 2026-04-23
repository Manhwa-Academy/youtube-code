"use client";

import { useState, useEffect } from "react";

export const ScrollToTopCharacter = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShow(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div>
      {show && (
        <div
          className="fixed bottom-4 right-4 cursor-pointer z-50 transition-all duration-300 hover:scale-125"
          onClick={scrollToTop}
        >
          <img
            src="/characters/char_full.png"
            alt="Nhân vật lên đầu"
            className="w-34 h-60" // dùng h-[90px] mới đúng
          />
        </div>
      )}
      {!show && (
        <div className="fixed bottom-0 right-0 z-50">
          <img
            src="/characters/char_peek.png"
            alt="Nhân vật nửa ẩn"
            className="w-24 h-60 opacity-90"
          />
        </div>
      )}
    </div>
  );
};
