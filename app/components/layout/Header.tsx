"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

const navLinks = [
  { label: "Accueil", href: "#accueil" },
  { label: "À Propos", href: "#apropos" },
  { label: "Nos Activités", href: "#activites" },
  { label: "Contact", href: "#contact" },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      id="header"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        transition: "all 0.4s ease",
        background: scrolled ? "rgba(255,255,255,0.97)" : "transparent",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        boxShadow: scrolled ? "0 2px 20px rgba(0,0,0,0.1)" : "none",
        padding: "0 2rem",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          height: "72px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* LOGO */}
        <Link
          href="#accueil"
          style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "10px" }}
        >
          <div
            style={{
              width: "42px",
              height: "42px",
              background: "linear-gradient(135deg, #0EA5E9, #38BDF8)",
              borderRadius: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "22px",
              boxShadow: "0 4px 12px rgba(14,165,233,0.35)",
            }}
          >
            ✦
          </div>
          <div>
            <p
              style={{
                fontSize: "13px",
                fontWeight: 600,
                color: scrolled ? "#0EA5E9" : "#fff",
                lineHeight: 1,
                letterSpacing: "0.5px",
              }}
            >
              LA
            </p>
            <p
              style={{
                fontSize: "16px",
                fontWeight: 800,
                color: scrolled ? "#1A1A2E" : "#fff",
                lineHeight: 1.1,
                letterSpacing: "-0.3px",
              }}
            >
              Manne Spirituelle
            </p>
          </div>
        </Link>

        {/* DESKTOP NAV */}
        <nav style={{ display: "flex", alignItems: "center", gap: "8px" }} className="hide-mobile">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              style={{
                textDecoration: "none",
                padding: "8px 16px",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: 500,
                color: scrolled ? "#374151" : "rgba(255,255,255,0.9)",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLElement).style.color = "#0EA5E9";
                (e.target as HTMLElement).style.background = "rgba(14,165,233,0.08)";
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLElement).style.color = scrolled
                  ? "#374151"
                  : "rgba(255,255,255,0.9)";
                (e.target as HTMLElement).style.background = "transparent";
              }}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="#contact"
            id="btn-contact-header"
            style={{
              textDecoration: "none",
              marginLeft: "8px",
              padding: "10px 22px",
              borderRadius: "50px",
              fontSize: "14px",
              fontWeight: 600,
              color: "#fff",
              background: "linear-gradient(135deg, #0EA5E9, #38BDF8)",
              boxShadow: "0 4px 14px rgba(14,165,233,0.4)",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
              (e.currentTarget as HTMLElement).style.boxShadow = "0 6px 20px rgba(14,165,233,0.5)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
              (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 14px rgba(14,165,233,0.4)";
            }}
          >
            Nous Contacter
          </Link>
        </nav>

        {/* HAMBURGER MOBILE */}
        <button
          id="btn-menu-mobile"
          aria-label="Ouvrir le menu"
          onClick={() => setMenuOpen(!menuOpen)}
          className="show-mobile"
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "8px",
            color: scrolled ? "#1A1A2E" : "#fff",
            fontSize: "24px",
          }}
        >
          {menuOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* MOBILE MENU */}
      {menuOpen && (
        <div
          style={{
            background: "#fff",
            padding: "1rem 2rem 1.5rem",
            borderTop: "1px solid #E5E7EB",
            boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
          }}
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              style={{
                display: "block",
                padding: "12px 0",
                textDecoration: "none",
                color: "#374151",
                fontWeight: 500,
                fontSize: "15px",
                borderBottom: "1px solid #F3F4F6",
              }}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="#contact"
            onClick={() => setMenuOpen(false)}
            style={{
              display: "block",
              marginTop: "12px",
              padding: "12px",
              textAlign: "center",
              borderRadius: "50px",
              background: "linear-gradient(135deg, #0EA5E9, #38BDF8)",
              color: "#fff",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            Nous Contacter
          </Link>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .hide-mobile { display: none !important; }
          .show-mobile { display: block !important; }
        }
        @media (min-width: 769px) {
          .show-mobile { display: none !important; }
        }
      `}</style>
    </header>
  );
}
