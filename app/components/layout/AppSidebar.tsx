"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import { useState } from "react"

interface AppSidebarProps {
  user: {
    name?: string | null
    email?: string | null
    roles?: string[]
    image?: string | null
  }
}

export default function AppSidebar({ user }: AppSidebarProps) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const initiale = user.name ? user.name.charAt(0).toUpperCase() : "U"

  const roles = user.roles || []
  const isSuperAdmin = roles.includes("SUPERADMIN")
  const isAdmin = isSuperAdmin || roles.includes("ADMIN")
  const isSecretaire = roles.includes("SECRETAIRE")
  const isMembre = roles.includes("MEMBRE") || true // Par défaut, tout le monde a un profil

  // Détermination du badge et de la couleur principale selon le rôle le plus élevé
  let roleLabel = "UTILISATEUR"
  let accentColor = "#0ea5e9" // Bleu par défaut (Admin/Secretaire)
  let accentGradient = "linear-gradient(135deg, rgba(14,165,233,0.9), rgba(2,132,199,0.9))"
  let badgeBg = "rgba(14,165,233,0.2)"
  let badgeBorder = "rgba(14,165,233,0.4)"
  let badgeDot = "#38bdf8"
  let badgeText = "#7dd3fc"

  if (isSuperAdmin) {
    roleLabel = "SUPERADMIN"
  } else if (roles.includes("ADMIN")) {
    roleLabel = "ADMIN"
  } else if (isSecretaire) {
    roleLabel = "SECRÉTAIRE"
    accentColor = "#ec4899" // Rose pour secrétaire
    accentGradient = "linear-gradient(135deg, rgba(236,72,153,0.9), rgba(219,39,119,0.9))"
    badgeBg = "rgba(236,72,153,0.15)"
    badgeBorder = "rgba(236,72,153,0.35)"
    badgeDot = "#f472b6"
    badgeText = "#f9a8d4"
  } else if (isMembre) {
    roleLabel = "ESPACE MEMBRE"
    accentColor = "#22c55e" // Vert pour membre
    accentGradient = "linear-gradient(135deg, rgba(74,222,128,0.85), rgba(34,197,94,0.85))"
    badgeBg = "rgba(74,222,128,0.15)"
    badgeBorder = "rgba(74,222,128,0.35)"
    badgeDot = "#4ade80"
    badgeText = "#86efac"
  }

  // Définition des sections et liens selon les rôles
  const navSections = []

  // SECTION 1 : Espace Personnel (Visible pour Membres et tous les utilisateurs connectés)
  const espacePersonnelLinks = [
    {
      label: "Mon Profil",
      href: "/membre/profil",
      show: true,
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
    },
    {
      label: "Mes Projets",
      href: "/membre/projets",
      show: isMembre,
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /><line x1="12" y1="11" x2="12" y2="17" /><line x1="9" y1="14" x2="15" y2="14" /></svg>
    },
    {
      label: "Mes Participations",
      href: "/membre/participations",
      show: isMembre,
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><polyline points="16 11 18 13 22 9" /></svg>
    },
    {
      label: "Événements Disponibles",
      href: "/membre/evenements",
      show: isMembre,
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
    },
  ].filter(link => link.show)

  if (espacePersonnelLinks.length > 0) {
    navSections.push({ title: "Mon Espace", links: espacePersonnelLinks })
  }

  // SECTION 2 : Administration & Finances (Visible pour Admin, SuperAdmin, Secretaire)
  const hasAdminAccess = isAdmin || isSecretaire
  if (hasAdminAccess) {
    const adminLinks = [
      {
        label: "Tableau de Bord",
        href: "/admin",
        show: isAdmin,
        icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /></svg>
      },
      {
        label: "Gestion des Projets",
        href: "/admin/projets",
        show: isAdmin,
        icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /><line x1="12" y1="11" x2="12" y2="17" /><line x1="9" y1="14" x2="15" y2="14" /></svg>
      },
      {
        label: "Dons & Transactions",
        href: "/admin/dons",
        show: true, // Secrétaire + Admin
        icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" /><circle cx="8" cy="15" r="1" /><circle cx="16" cy="15" r="1" /></svg>
      },
      {
        label: "Activités & Événements",
        href: "/admin/activites",
        show: true, // Secrétaire + Admin
        icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
      },
      {
        label: "Liste des Participants",
        href: "/admin/participants",
        show: true, // Secrétaire + Admin
        icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><polyline points="16 11 18 13 22 9" /></svg>
      },
      {
        label: "Membres & Utilisateurs",
        href: "/admin/membres",
        show: isSuperAdmin,
        icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
      },
    ].filter(link => link.show)

    navSections.push({ title: "Gestion & Finances", links: adminLinks })
  }

  return (
    <>
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="app-mobile-toggle"
        aria-label="Ouvrir le menu"
      >
        {mobileOpen ? "✕" : "☰"}
      </button>

      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.6)", backdropFilter: "blur(4px)", zIndex: 998 }}
        />
      )}

      <aside className={`app-sidebar ${mobileOpen ? "open" : ""}`}>
        {/* Header */}
        <div style={{ padding: "1.5rem 1.25rem", borderBottom: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ position: "relative", width: "42px", height: "42px", borderRadius: "50%", background: "#fff", padding: "2px", flexShrink: 0, boxShadow: `0 0 15px ${badgeBorder}` }}>
            <Image src="/logo.jpg" alt="Logo" fill sizes="42px" priority loading="eager" style={{ objectFit: "contain", borderRadius: "50%" }} />
          </div>
          <div>
            <span style={{ fontSize: "0.875rem", fontWeight: 800, color: "#fff", letterSpacing: "-0.2px", display: "block" }}>
              MANNE SPIRITUELLE
            </span>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "2px 8px", borderRadius: "50px", background: badgeBg, border: `1px solid ${badgeBorder}`, marginTop: "3px" }}>
              <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: badgeDot, boxShadow: `0 0 6px ${badgeDot}` }}></span>
              <span style={{ fontSize: "0.6875rem", fontWeight: 700, color: badgeText, letterSpacing: "0.5px" }}>{roleLabel}</span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: "1.25rem 0.875rem", display: "flex", flexDirection: "column", gap: "1rem", overflowY: "auto" }}>
          
          {navSections.map((section, idx) => (
            <div key={idx} style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <div style={{ fontSize: "0.6875rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "1px", padding: "0.25rem 0.75rem" }}>
                {section.title}
              </div>
              
              {section.links.map((item) => {
                const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href + "/"))
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    style={{
                      display: "flex", alignItems: "center", gap: "12px",
                      padding: "0.75rem 1rem", borderRadius: "12px", textDecoration: "none",
                      fontSize: "0.875rem", fontWeight: isActive ? 700 : 500,
                      color: isActive ? "#ffffff" : "#94a3b8",
                      background: isActive ? accentGradient : "transparent",
                      boxShadow: isActive ? `0 4px 14px ${badgeBg}` : "none",
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={(e) => { if (!isActive) { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = "#fff" } }}
                    onMouseLeave={(e) => { if (!isActive) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#94a3b8" } }}
                  >
                    <span style={{ color: isActive ? "#fff" : accentColor, display: "flex" }}>{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </div>
          ))}

          {/* Séparateur Navigation Rapide */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "0.5rem" }}>
            <div style={{ fontSize: "0.6875rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "1px", padding: "0.25rem 0.75rem" }}>
              Navigation Rapide
            </div>
            <Link
              href="/"
              style={{ display: "flex", alignItems: "center", gap: "12px", padding: "0.75rem 1rem", borderRadius: "12px", textDecoration: "none", fontSize: "0.875rem", fontWeight: 500, color: "#94a3b8", transition: "all 0.2s ease" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = "#fff" }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#94a3b8" }}
            >
              <span style={{ color: accentColor, display: "flex" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
              </span>
              <span>Site Public</span>
            </Link>
          </div>
        </nav>

        {/* User Card */}
        <div style={{ padding: "1rem 1.25rem", borderTop: "1px solid rgba(255,255,255,0.08)", background: "rgba(0,0,0,0.2)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", overflow: "hidden" }}>
              <div style={{ width: "38px", height: "38px", borderRadius: "50%", background: accentGradient, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: "0.875rem", flexShrink: 0 }}>
                {initiale}
              </div>
              <div style={{ overflow: "hidden" }}>
                <p style={{ fontSize: "0.8125rem", fontWeight: 700, color: "#fff", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user.name || "Utilisateur"}</p>
                <p style={{ fontSize: "0.6875rem", color: "#64748b", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user.email}</p>
              </div>
            </div>
            <button
              onClick={async () => { await signOut({ redirect: false }); window.location.href = "/" }}
              title="Déconnexion"
              style={{ width: "32px", height: "32px", borderRadius: "8px", border: "none", background: "rgba(239,68,68,0.15)", color: "#f87171", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 0.2s ease", flexShrink: 0 }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "#ef4444"; e.currentTarget.style.color = "#fff" }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(239,68,68,0.15)"; e.currentTarget.style.color = "#f87171" }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </button>
          </div>
        </div>
      </aside>

      <style>{`
        .app-sidebar { width: 260px; height: 100vh; position: fixed; top: 0; left: 0; background: linear-gradient(180deg, #0b132b 0%, #1c2541 100%); border-right: 1px solid rgba(255,255,255,0.08); display: flex; flex-direction: column; z-index: 999; transition: transform 0.3s ease; }
        .app-mobile-toggle { display: none; position: fixed; top: 14px; left: 14px; z-index: 1001; width: 42px; height: 42px; border-radius: 10px; background: ${accentColor}; color: #fff; border: none; font-size: 1.25rem; cursor: pointer; box-shadow: 0 4px 12px ${badgeBg}; }
        @media (max-width: 1024px) { .app-mobile-toggle { display: flex; align-items: center; justify-content: center; } .app-sidebar { transform: translateX(-100%); } .app-sidebar.open { transform: translateX(0); } }
      `}</style>
    </>
  )
}
