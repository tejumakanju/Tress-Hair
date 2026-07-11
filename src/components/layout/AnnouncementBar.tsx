"use client";

import { announcementMessages } from "@/lib/constants/navigation";

export function AnnouncementBar() {
  const message = announcementMessages.join("  ·  ");

  return (
    <div className="bg-noir text-white text-center py-2.5 overflow-hidden safe-pt">
      <div className="animate-marquee whitespace-nowrap text-[10px] md:text-xs tracking-[0.25em] uppercase font-sans">
        <span className="inline-block px-8">{message}</span>
        <span className="inline-block px-8">{message}</span>
      </div>
    </div>
  );
}
