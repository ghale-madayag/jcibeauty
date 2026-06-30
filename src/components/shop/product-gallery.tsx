"use client";

import * as React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export function ProductGallery({
  images,
  name,
}: {
  images: { url: string; alt: string | null }[];
  name: string;
}) {
  const [active, setActive] = React.useState(0);
  const list = images.length ? images : [{ url: "", alt: name }];

  return (
    <div className="flex flex-col gap-4">
      <div className="relative aspect-square overflow-hidden rounded-xl bg-secondary">
        {list[active]?.url && (
          <Image
            src={list[active].url}
            alt={list[active].alt ?? name}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
          />
        )}
      </div>
      {list.length > 1 && (
        <div className="flex gap-3">
          {list.map((img, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={cn(
                "relative size-20 overflow-hidden rounded-md bg-secondary ring-offset-2 transition",
                i === active ? "ring-2 ring-gold" : "hover:opacity-80",
              )}
            >
              <Image
                src={img.url}
                alt={img.alt ?? name}
                fill
                sizes="80px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
