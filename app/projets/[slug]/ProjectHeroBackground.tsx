"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

export default function ProjectHeroBackground({ images, folderName }: { images: string[], folderName: string }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [images.length]);

  if (images.length === 0) return null;

  return (
    <>
      {/* Arrière-plan bleu ciel */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(135deg, #0369A1 0%, #0EA5E9 100%)",
          zIndex: -2,
        }}
      />

      {/* Image principale non coupée */}
      {images.map((img, i) => (
        <Image
          key={`main-${img}`}
          src={`/${folderName}/${img}`}
          alt="Hero image"
          fill
          priority={i === 0}
          sizes="100vw"
          style={{
            objectFit: "contain",
            opacity: i === current ? 1 : 0,
            transition: "opacity 1.5s ease-in-out",
            zIndex: 0,
          }}
        />
      ))}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.6) 100%)",
          zIndex: 0,
        }}
      />
    </>
  );
}
