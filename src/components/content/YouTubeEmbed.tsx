"use client";

import { useState } from "react";
import { isYouTubeId } from "@/lib/content/links";

/** A thumbnail until clicked. The player (privacy-enhanced domain) loads only then. */
export function YouTubeEmbed({ video, title }: { video: string; title: string | null }) {
  const [playing, setPlaying] = useState(false);

  if (!isYouTubeId(video)) {
    return null;
  }

  const label = title?.trim() || "YouTube video";

  return (
    <div className="relative aspect-video overflow-hidden rounded-lg bg-raised">
      {playing ? (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${video}?autoplay=1&rel=0`}
          title={label}
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
          className="absolute inset-0 h-full w-full border-0"
        />
      ) : (
        <button type="button" onClick={() => setPlaying(true)} aria-label={`Play video: ${label}`} className="group absolute inset-0 h-full w-full">
          <img
            src={`https://i.ytimg.com/vi/${video}/hqdefault.jpg`}
            alt=""
            width={480}
            height={360}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover"
          />
          <span className="absolute inset-0 flex items-center justify-center bg-black/30 transition-colors group-hover:bg-black/20">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-accent text-on-accent">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M8 5v14l11-7z" />
              </svg>
            </span>
          </span>
        </button>
      )}
    </div>
  );
}