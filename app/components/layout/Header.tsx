"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

const navLinks = [
  { label: "Accueil", href: "#accueil" },
  { label: "À Propos", href: "#apropos" },
  { label: "Nos Activités", href: "#activites" },
  { label: "Contact", href: "#contact" },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { data: session } = useSession();
  const pathname = usePathname();
  const isHomePage = pathname === "/";
  const isLoggedIn = !!session?.user;

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
          href={isHomePage ? "#accueil" : "/"}
          style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "10px" }}
        >
          <div style={{ position: "relative", width: "50px", height: "50px" }}>
            <Image
              src="/logo.jpg"
              alt="La Manne Spirituelle Logo"
              fill
              sizes="50px"
              priority
              loading="eager"
              style={{ objectFit: "contain", borderRadius: "50%" }}
            />
          </div>
          <div className="hide-mobile">
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
          {isHomePage ? (
            navLinks.map((link) => (
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
            ))
          ) : (
            <Link
              href="/"
              style={{
                textDecoration: "none",
                padding: "8px 16px",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: 600,
                color: scrolled ? "#374151" : "rgba(255,255,255,0.95)",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLElement).style.color = "#0EA5E9";
                (e.target as HTMLElement).style.background = "rgba(14,165,233,0.08)";
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLElement).style.color = scrolled
                  ? "#374151"
                  : "rgba(255,255,255,0.95)";
                (e.target as HTMLElement).style.background = "transparent";
              }}
            >
              ← Retour à l'accueil
            </Link>
          )}
          {/* Boutons Connexion / Profil / Admin */}
          {isLoggedIn ? (
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginLeft: "8px" }}>
              {(session?.user?.roles?.includes("ADMIN") || session?.user?.roles?.includes("SUPERADMIN")) && (
                <Link
                  href="/admin"
                  style={{
                    textDecoration: "none",
                    padding: "8px 14px",
                    borderRadius: "8px",
                    fontSize: "14px",
                    fontWeight: 700,
                    color: "#fff",
                    background: "linear-gradient(135deg, #0EA5E9, #0284C7)",
                    boxShadow: "0 2px 10px rgba(14,165,233,0.3)",
                    transition: "all 0.2s ease",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  ⚡ SuperAdmin
                </Link>
              )}
              <Link
                href="/membre/profil"
                style={{
                  textDecoration: "none",
                  padding: "8px 16px",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: 500,
                  color: scrolled ? "#374151" : "rgba(255,255,255,0.9)",
                  transition: "all 0.2s ease",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                👤 Mon Profil
              </Link>
              <button
                onClick={async () => {
                  await signOut({ redirect: false })
                  window.location.href = "/"
                }}
                style={{
                  padding: "10px 20px",
                  borderRadius: "50px",
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "#fff",
                  background: "linear-gradient(135deg, #EF4444, #F87171)",
                  boxShadow: "0 4px 14px rgba(239,68,68,0.4)",
                  border: "none",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                }}
              >
                Déconnexion
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginLeft: "8px" }}>
              <Link
                href="/login"
                style={{
                  textDecoration: "none",
                  padding: "8px 16px",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: 500,
                  color: scrolled ? "#374151" : "rgba(255,255,255,0.9)",
                  border: scrolled ? "1px solid #E5E7EB" : "1px solid rgba(255,255,255,0.4)",
                  transition: "all 0.2s ease",
                }}
              >
                Connexion
              </Link>
              <Link
                href="/register"
                id="btn-register-header"
                style={{
                  textDecoration: "none",
                  padding: "10px 22px",
                  borderRadius: "50px",
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "#fff",
                  background: "linear-gradient(135deg, #0EA5E9, #38BDF8)",
                  boxShadow: "0 4px 14px rgba(14,165,233,0.4)",
                  transition: "all 0.3s ease",
                }}
              >
                S'inscrire
              </Link>
            </div>
          )}
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
          {isHomePage ? (
            navLinks.map((link) => (
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
            ))
          ) : (
            <Link
              href="/"
              onClick={() => setMenuOpen(false)}
              style={{
                display: "block",
                padding: "12px 0",
                textDecoration: "none",
                color: "#374151",
                fontWeight: 600,
                fontSize: "15px",
                borderBottom: "1px solid #F3F4F6",
              }}
            >
              ← Retour à l'accueil
            </Link>
          )}
          {/* Mobile: Boutons Connexion/Profil */}
          {isLoggedIn ? (
            <>
              {(session?.user?.roles?.includes("ADMIN") || session?.user?.roles?.includes("SUPERADMIN")) && (
                <Link
                  href="/admin"
                  onClick={() => setMenuOpen(false)}
                  style={{
                    display: "block",
                    padding: "12px 0",
                    textDecoration: "none",
                    color: "#0284c7",
                    fontWeight: 700,
                    fontSize: "15px",
                    borderBottom: "1px solid #F3F4F6",
                  }}
                >
                  ⚡ Espace SuperAdmin
                </Link>
              )}
              <Link
                href="/membre/profil"
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
                👤 Mon Profil
              </Link>
              <button
                onClick={async () => {
                  setMenuOpen(false)
                  await signOut({ redirect: false })
                  window.location.href = "/"
                }}
                style={{
                  display: "block",
                  width: "100%",
                  marginTop: "12px",
                  padding: "12px",
                  textAlign: "center",
                  borderRadius: "50px",
                  background: "linear-gradient(135deg, #EF4444, #F87171)",
                  color: "#fff",
                  fontWeight: 600,
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Déconnexion
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
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
                Connexion
              </Link>
              <Link
                href="/register"
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
                S'inscrire
              </Link>
            </>
          )}
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
