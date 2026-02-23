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
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-border/60 bg-slate-100 shadow-sm">
        <Image
          src={active}
          alt={name}
          fill
          sizes="(min-width: 1024px) 55vw, 100vw"
          className="bg-transparent object-contain p-6"
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
            } bg-slate-100`}
          >
            <Image
              src={src}
              alt={name}
              fill
              sizes="96px"
              className="bg-transparent object-contain p-1"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
