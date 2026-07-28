"use client";

import Link from "next/link";

const footerLinks = [
  { label: "Accueil", href: "#accueil" },
  { label: "À Propos", href: "#apropos" },
  { label: "Nos Activités", href: "#activites" },
  { label: "Contact", href: "#contact" },
];

const socialLinks = [
  {
    id: "footer-facebook",
    label: "Facebook",
    href: "#",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
      </svg>
    ),
  },
  {
    id: "footer-instagram",
    label: "Instagram",
    href: "#",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    id: "footer-youtube",
    label: "YouTube",
    href: "#",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
        <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="white" />
      </svg>
    ),
  },
];

export default function Footer() {
  return (
    <footer
      id="contact"
      style={{
        background: "linear-gradient(135deg, #1E6332 0%, #2D8C45 60%, #1a5c2a 100%)",
        color: "#fff",
        paddingTop: "60px",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "0 2rem",
        }}
      >
        {/* TOP: Logo + Links + Social */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "48px",
            paddingBottom: "48px",
            borderBottom: "1px solid rgba(255,255,255,0.15)",
          }}
        >
          {/* Brand */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
              <div
                style={{
                  width: "42px",
                  height: "42px",
                  background: "rgba(255,255,255,0.15)",
                  borderRadius: "12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "22px",
                  backdropFilter: "blur(4px)",
                  border: "1px solid rgba(255,255,255,0.2)",
                }}
              >
                ✦
              </div>
              <div>
                <p style={{ fontSize: "12px", opacity: 0.7, lineHeight: 1 }}>LA</p>
                <p style={{ fontSize: "16px", fontWeight: 800, lineHeight: 1.1 }}>Manne Spirituelle</p>
              </div>
            </div>
            <p style={{ fontSize: "14px", opacity: 0.75, lineHeight: 1.7, maxWidth: "280px" }}>
              Une communauté fondée sur la foi, l'amour et le service. Ensemble, nous grandissons dans la grâce de Dieu.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h3 style={{ fontSize: "14px", fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", opacity: 0.5, marginBottom: "20px" }}>
              Navigation
            </h3>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "10px" }}>
              {footerLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    style={{
                      textDecoration: "none",
                      color: "rgba(255,255,255,0.8)",
                      fontSize: "14px",
                      transition: "color 0.2s",
                    }}
                    onMouseEnter={(e) => ((e.target as HTMLElement).style.color = "#fff")}
                    onMouseLeave={(e) => ((e.target as HTMLElement).style.color = "rgba(255,255,255,0.8)")}
                  >
                    → {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 style={{ fontSize: "14px", fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", opacity: 0.5, marginBottom: "20px" }}>
              Contact
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "14px", opacity: 0.8 }}>
              <p>📍 Lomé, Togo</p>
              <p>📞 +228 XX XX XX XX</p>
              <p>✉️ contact@mannespirituelle.org</p>
            </div>

            {/* Social */}
            <div style={{ display: "flex", gap: "10px", marginTop: "24px" }}>
              {socialLinks.map((s) => (
                <a
                  key={s.id}
                  id={s.id}
                  href={s.href}
                  aria-label={s.label}
                  style={{
                    width: "38px",
                    height: "38px",
                    background: "rgba(255,255,255,0.12)",
                    border: "1px solid rgba(255,255,255,0.2)",
                    borderRadius: "10px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.25)";
                    (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.12)";
                    (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                  }}
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* BOTTOM BAR */}
        <div
          style={{
            padding: "20px 0",
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "12px",
            fontSize: "13px",
            opacity: 0.6,
          }}
        >
          <p>© {new Date().getFullYear()} La Manne Spirituelle — Tous droits réservés.</p>
          <div style={{ display: "flex", gap: "16px" }}>
            <Link href="#" style={{ color: "inherit", textDecoration: "none" }}>Mentions légales</Link>
            <Link href="#" style={{ color: "inherit", textDecoration: "none" }}>Confidentialité</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
