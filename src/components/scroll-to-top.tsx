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
          className="fixed right-4 cursor-pointer z-30 transition-all duration-300 hover:scale-125 bottom-16 sm:bottom-4"
          onClick={scrollToTop}
        >
          <img
            src="/characters/char_full.png"
            alt="Nhân vật lên đầu"
            className="w-34 h-[90px]"
          />
        </div>
      )}
      {!show && (
        <div className="fixed right-0 z-30 bottom-12 sm:bottom-0">
          <img
            src="/characters/char_peek.png"
            alt="Nhân vật nửa ẩn"
            className="w-24 h-45 opacity-90"
          />
        </div>
      )}
    </div>
  );
};
