"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const slides = [
  {
    id: 1,
    title: "Grandissons Ensemble",
    subtitle: "Dans la Foi & l'Amour",
    tagline: "ASSOCIATION LA MANNE SPIRITUELLE",
    cta: "Découvrir nos activités",
    ctaHref: "#activites",
    bg: "linear-gradient(135deg, rgba(30,99,50,0.85) 0%, rgba(26,26,46,0.75) 100%)",
    emoji: "🌿",
  },
  {
    id: 2,
    title: "Servir avec",
    subtitle: "Cœur & Conviction",
    tagline: "ÉVANGÉLISATION & ENTRAIDE",
    cta: "À propos de nous",
    ctaHref: "#apropos",
    bg: "linear-gradient(135deg, rgba(26,26,46,0.85) 0%, rgba(30,99,50,0.75) 100%)",
    emoji: "🤝",
  },
  {
    id: 3,
    title: "Rayonner la",
    subtitle: "Lumière de l'Évangile",
    tagline: "MISSION & SPIRITUALITÉ",
    cta: "Nous rejoindre",
    ctaHref: "#contact",
    bg: "linear-gradient(135deg, rgba(100,70,20,0.7) 0%, rgba(30,99,50,0.85) 100%)",
    emoji: "✨",
  },
];

export default function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrent((prev) => (prev + 1) % slides.length);
        setIsAnimating(false);
      }, 400);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const goTo = (idx: number) => {
    if (idx === current) return;
    setIsAnimating(true);
    setTimeout(() => {
      setCurrent(idx);
      setIsAnimating(false);
    }, 300);
  };

  const slide = slides[current];

  return (
    <section
      id="accueil"
      style={{
        position: "relative",
        width: "100%",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        overflow: "hidden",
      }}
    >
      {/* Background gradient (placeholder pour votre future photo) */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(160deg, #0d3320 0%, #1E6332 40%, #2D8C45 70%, #1a2e1a 100%)",
          transition: "background 1s ease",
        }}
      />

      {/* Animated pattern overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `radial-gradient(circle at 20% 50%, rgba(45,140,69,0.3) 0%, transparent 50%),
                            radial-gradient(circle at 80% 20%, rgba(212,168,67,0.15) 0%, transparent 40%)`,
        }}
      />

      {/* Floating décor elements */}
      <div style={{ position: "absolute", top: "15%", right: "10%", opacity: 0.08, fontSize: "180px" }}>
        ✦
      </div>
      <div style={{ position: "absolute", bottom: "20%", left: "5%", opacity: 0.06, fontSize: "120px" }}>
        ✦
      </div>

      {/* CONTENT */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "120px 2rem 80px",
          width: "100%",
        }}
      >
        <div
          style={{
            opacity: isAnimating ? 0 : 1,
            transform: isAnimating ? "translateY(20px)" : "translateY(0)",
            transition: "all 0.5s ease",
            maxWidth: "680px",
          }}
        >
          {/* Tag */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              background: "rgba(212,168,67,0.2)",
              border: "1px solid rgba(212,168,67,0.4)",
              borderRadius: "50px",
              padding: "6px 16px",
              marginBottom: "24px",
              backdropFilter: "blur(8px)",
            }}
          >
            <span style={{ fontSize: "16px" }}>{slide.emoji}</span>
            <span style={{ fontSize: "12px", fontWeight: 700, color: "#F0C965", letterSpacing: "1.5px" }}>
              {slide.tagline}
            </span>
          </div>

          {/* Title */}
          <h1
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
              fontWeight: 900,
              lineHeight: 1.1,
              color: "#fff",
              marginBottom: "8px",
              textShadow: "0 2px 20px rgba(0,0,0,0.3)",
            }}
          >
            {slide.title}
          </h1>
          <h2
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "clamp(2rem, 5vw, 3.8rem)",
              fontWeight: 900,
              lineHeight: 1.1,
              background: "linear-gradient(90deg, #4CAF68, #F0C965)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              marginBottom: "28px",
            }}
          >
            {slide.subtitle}
          </h2>

          {/* Description */}
          <p
            style={{
              fontSize: "17px",
              color: "rgba(255,255,255,0.75)",
              lineHeight: 1.7,
              maxWidth: "520px",
              marginBottom: "44px",
            }}
          >
            Une communauté chrétienne unie autour de la Parole de Dieu, dédiée à l'évangélisation, la prière et l'entraide fraternelle.
          </p>

          {/* CTAs */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", alignItems: "center" }}>
            <Link
              href={slide.ctaHref}
              id={`hero-cta-${slide.id}`}
              style={{
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "14px 32px",
                borderRadius: "50px",
                fontSize: "15px",
                fontWeight: 700,
                color: "#fff",
                background: "linear-gradient(135deg, #2D8C45, #4CAF68)",
                boxShadow: "0 6px 24px rgba(45,140,69,0.5)",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.transform = "translateY(-3px)";
                (e.currentTarget as HTMLElement).style.boxShadow = "0 10px 32px rgba(45,140,69,0.6)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                (e.currentTarget as HTMLElement).style.boxShadow = "0 6px 24px rgba(45,140,69,0.5)";
              }}
            >
              {slide.cta} →
            </Link>

            <Link
              href="#apropos"
              style={{
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "14px 32px",
                borderRadius: "50px",
                fontSize: "15px",
                fontWeight: 600,
                color: "#fff",
                border: "2px solid rgba(255,255,255,0.35)",
                backdropFilter: "blur(8px)",
                background: "rgba(255,255,255,0.08)",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.18)";
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.6)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.08)";
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.35)";
              }}
            >
              En savoir plus
            </Link>
          </div>
        </div>

        {/* SLIDE DOTS */}
        <div
          style={{
            position: "absolute",
            bottom: "40px",
            left: "2rem",
            display: "flex",
            gap: "8px",
          }}
        >
          {slides.map((_, i) => (
            <button
              key={i}
              id={`hero-dot-${i}`}
              onClick={() => goTo(i)}
              aria-label={`Slide ${i + 1}`}
              style={{
                width: i === current ? "32px" : "10px",
                height: "10px",
                borderRadius: "5px",
                border: "none",
                cursor: "pointer",
                background: i === current ? "#F0C965" : "rgba(255,255,255,0.35)",
                transition: "all 0.4s ease",
                padding: 0,
              }}
            />
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div
        style={{
          position: "absolute",
          bottom: "40px",
          right: "2rem",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "6px",
          opacity: 0.5,
        }}
      >
        <span style={{ fontSize: "11px", color: "#fff", letterSpacing: "1px", writingMode: "vertical-rl" }}>
          DÉFILER
        </span>
        <div
          style={{
            width: "1px",
            height: "40px",
            background: "linear-gradient(to bottom, #fff, transparent)",
          }}
        />
      </div>
    </section>
  );
}
