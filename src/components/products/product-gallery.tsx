"use client";

import Image from "next/image";
import { useState } from "react";

type ProductGalleryProps = {
  images: string[];
  name: string;
};

export default function ProductGallery({ images, name }: ProductGalleryProps) {
  const allImages = images.length ? images : ["/placeholder.svg"];
  const [active, setActive] = useState(allImages[0]);

  return (
    <div className="flex flex-col gap-4">
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-border/60 bg-[radial-gradient(circle_at_20%_20%,rgba(148,163,184,0.24),transparent_46%),linear-gradient(155deg,rgba(226,232,240,0.62),rgba(248,250,252,0.88))] shadow-sm dark:bg-[radial-gradient(circle_at_20%_20%,rgba(148,163,184,0.14),transparent_46%),linear-gradient(155deg,rgba(30,41,59,0.7),rgba(2,6,23,0.92))]">
        <Image
          src={active}
          alt={name}
          fill
          sizes="(min-width: 1024px) 55vw, 100vw"
          className="bg-transparent object-contain p-6 drop-shadow-[0_14px_20px_rgba(15,23,42,0.3)] dark:drop-shadow-[0_16px_24px_rgba(0,0,0,0.58)]"
          priority
          loading="eager"
        />
      </div>
      <div className="flex flex-wrap gap-3">
        {allImages.map((src) => (
          <button
            key={src}
            type="button"
            onClick={() => setActive(src)}
            className={`relative h-20 w-24 overflow-hidden rounded-xl border ${
              active === src ? "border-primary" : "border-border/60"
            } bg-[linear-gradient(160deg,rgba(226,232,240,0.66),rgba(248,250,252,0.9))] dark:bg-[linear-gradient(160deg,rgba(30,41,59,0.75),rgba(2,6,23,0.92))]`}
          >
            <Image
              src={src}
              alt={name}
              fill
              sizes="96px"
              className="bg-transparent object-contain p-1 drop-shadow-[0_8px_10px_rgba(15,23,42,0.28)] dark:drop-shadow-[0_10px_12px_rgba(0,0,0,0.55)]"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
