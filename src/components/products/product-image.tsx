"use client";

import Image, { type ImageProps } from "next/image";
import { useEffect, useMemo, useState } from "react";
import { getProductImageWithFallback } from "@/lib/cloudinary";

type ProductImageProps = Omit<ImageProps, "src" | "alt"> & {
  src: string;
  alt: string;
};

export default function ProductImage({ src, alt, onError, ...props }: ProductImageProps) {
  const { primary, fallback } = useMemo(() => getProductImageWithFallback(src), [src]);
  const [currentSrc, setCurrentSrc] = useState(primary);

  useEffect(() => {
    setCurrentSrc(primary);
  }, [primary]);

  return (
    <Image
      {...props}
      src={currentSrc}
      alt={alt}
      onError={(event) => {
        if (currentSrc !== fallback) {
          setCurrentSrc(fallback);
        }
        onError?.(event);
      }}
    />
  );
}
