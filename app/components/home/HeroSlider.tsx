"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";

const slides = [
  {
    id: 1,
    title: "Grandissons Ensemble",
    subtitle: "Dans la Foi & l'Amour",
    tagline: "ASSOCIATION LA MANNE SPIRITUELLE",
    cta: "Découvrir nos activités",
    ctaHref: "#activites",
    image: "/hero/slide1.png",
    emoji: "🌿",
  },
  {
    id: 2,
    title: "Servir avec",
    subtitle: "Cœur & Conviction",
    tagline: "ÉVANGÉLISATION & ENTRAIDE",
    cta: "À propos de nous",
    ctaHref: "#apropos",
    image: "/hero/slide2.png",
    emoji: "🤝",
  },
  {
    id: 3,
    title: "Rayonner la",
    subtitle: "Lumière de l'Évangile",
    tagline: "MISSION & SPIRITUALITÉ",
    cta: "Nous rejoindre",
    ctaHref: "#contact",
    image: "/hero/slide3.png",
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
      {/* Background image crossfade container */}
      {slides.map((s, idx) => (
        <div
          key={s.id}
          style={{
            position: "absolute",
            inset: 0,
            opacity: idx === current ? 1 : 0,
            transition: "opacity 1s ease-in-out",
            zIndex: 0,
            background: "linear-gradient(160deg, #0c2a45 0%, #0369A1 40%, #0EA5E9 70%, #0c2233 100%)",
          }}
        >
          {/* Background image */}
          <Image
            src={s.image}
            alt={s.title}
            fill
            priority={idx === 0}
            sizes="100vw"
            style={{
              objectFit: "cover",
              objectPosition: "center",
            }}
          />
          {/* Dark Overlay for readability */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(to bottom, rgba(12,42,69,0.85) 0%, rgba(3,105,161,0.7) 50%, rgba(12,34,51,0.9) 100%)",
            }}
          />
        </div>
      ))}

      {/* Animated pattern overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 1,
          backgroundImage: `radial-gradient(circle at 20% 50%, rgba(14,165,233,0.3) 0%, transparent 50%),
                            radial-gradient(circle at 80% 20%, rgba(212,168,67,0.15) 0%, transparent 40%)`,
          pointerEvents: "none",
        }}
      />

      {/* Floating décor elements */}
      <div style={{ position: "absolute", top: "15%", right: "10%", opacity: 0.08, fontSize: "180px", zIndex: 1 }}>
        ✦
      </div>
      <div style={{ position: "absolute", bottom: "20%", left: "5%", opacity: 0.06, fontSize: "120px", zIndex: 1 }}>
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
              background: "linear-gradient(90deg, #38BDF8, #F0C965)",
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
            Une communauté chrétienne unie autour de la Parole de Dieu, dédiée à
            l'évangélisation, la prière et l'entraide fraternelle.
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
                background: "linear-gradient(135deg, #0EA5E9, #38BDF8)",
                boxShadow: "0 6px 24px rgba(14,165,233,0.5)",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.transform = "translateY(-3px)";
                (e.currentTarget as HTMLElement).style.boxShadow = "0 10px 32px rgba(14,165,233,0.6)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                (e.currentTarget as HTMLElement).style.boxShadow = "0 6px 24px rgba(14,165,233,0.5)";
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
                background: i === current ? "#38BDF8" : "rgba(255,255,255,0.35)",
                transition: "all 0.4s ease",
                padding: 0,
              }}
            />
          ))}
        </div>
      </div>

      {/* Bottom right information */}
      <div
        style={{
          position: "absolute",
          bottom: "40px",
          right: "2rem",
          display: "flex",
          alignItems: "flex-end",
          gap: "24px",
          zIndex: 10,
        }}
      >
        <div
          style={{
            maxWidth: "280px",
            textAlign: "right",
            color: "#fff",
            opacity: 0.85,
            fontSize: "13px",
            fontWeight: 500,
            lineHeight: 1.5,
            paddingBottom: "8px",
          }}
          className="hide-mobile"
        >
          <strong style={{ color: "#38BDF8", display: "inline-flex", alignItems: "center", gap: "6px", justifyContent: "flex-end" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
            Réunion de prière
          </strong><br />
          tous les jeudis à 19h sur le terrain de Lakaza, non loin de Gbossimé.
        </div>

        {/* Scroll indicator */}
        <div
          style={{
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
      </div>
    </section>
  );
}
