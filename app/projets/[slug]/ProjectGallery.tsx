"use client";

import { useState } from "react";
import Image from "next/image";

export default function ProjectGallery({ images, folderName, title }: { images: string[], folderName: string, title: string }) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  if (images.length === 0) return null;

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedIndex !== null) {
      setSelectedIndex((selectedIndex + 1) % images.length);
    }
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedIndex !== null) {
      setSelectedIndex((selectedIndex - 1 + images.length) % images.length);
    }
  };

  return (
    <>
      <section style={{ padding: "0 2rem 80px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <h2 style={{ fontSize: "32px", fontWeight: 800, color: "#1A1A2E", marginBottom: "40px", textAlign: "center" }}>
            Galerie Photos
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: "24px",
            }}
          >
            {images.map((img, idx) => (
              <div
                key={idx}
                onClick={() => setSelectedIndex(idx)}
                style={{
                  position: "relative",
                  aspectRatio: "4/3",
                  borderRadius: "16px",
                  overflow: "hidden",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
                  background: "#e2e8f0",
                  cursor: "pointer",
                }}
              >
                <Image
                  src={`/${folderName}/${img}`}
                  alt={`${title} photo ${idx + 1}`}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  style={{ objectFit: "cover", transition: "transform 0.3s ease" }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox Modal */}
      {selectedIndex !== null && (
        <div
          onClick={() => setSelectedIndex(null)}
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.9)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* Close Button */}
          <button
            onClick={() => setSelectedIndex(null)}
            style={{
              position: "absolute",
              top: "20px",
              right: "30px",
              background: "transparent",
              color: "#fff",
              border: "none",
              fontSize: "40px",
              cursor: "pointer",
              zIndex: 1010,
            }}
          >
            &times;
          </button>

          {/* Prev Button */}
          <button
            onClick={handlePrev}
            style={{
              position: "absolute",
              left: "20px",
              background: "rgba(255,255,255,0.1)",
              color: "#fff",
              border: "none",
              fontSize: "30px",
              cursor: "pointer",
              width: "50px",
              height: "50px",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1010,
              transition: "background 0.3s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.3)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.1)")}
          >
            &#10094;
          </button>

          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "relative",
              width: "90vw",
              height: "85vh",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Image
              src={`/${folderName}/${images[selectedIndex]}`}
              alt={`${title} photo zoom`}
              fill
              style={{ objectFit: "contain" }}
              sizes="100vw"
            />
          </div>

          {/* Next Button */}
          <button
            onClick={handleNext}
            style={{
              position: "absolute",
              right: "20px",
              background: "rgba(255,255,255,0.1)",
              color: "#fff",
              border: "none",
              fontSize: "30px",
              cursor: "pointer",
              width: "50px",
              height: "50px",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1010,
              transition: "background 0.3s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.3)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.1)")}
          >
            &#10095;
          </button>
        </div>
      )}
    </>
  );
}
