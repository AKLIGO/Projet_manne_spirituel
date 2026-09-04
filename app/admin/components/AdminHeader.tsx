"use client"

import Link from "next/link"

interface AdminHeaderProps {
  title: string
  subtitle?: string
  user: {
    name?: string | null
    email?: string | null
    roles?: string[]
  }
}

export default function AdminHeader({ title, subtitle, user }: AdminHeaderProps) {
  return (
    <header
      style={{
        background: "#ffffff",
        borderBottom: "1px solid #e2e8f0",
        padding: "1rem 2rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "1.5rem",
        position: "sticky",
        top: 0,
        zIndex: 50,
        boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
      }}
      className="admin-header-bar"
    >
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <h1 style={{ fontSize: "1.375rem", fontWeight: 800, color: "#0f172a", margin: 0, letterSpacing: "-0.3px" }}>
            {title}
          </h1>
          <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "2px 8px", borderRadius: "50px", background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#166534", fontSize: "0.6875rem", fontWeight: 700 }}>
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 6px #22c55e" }}></span>
            EN DIRECT
          </span>
        </div>
        {subtitle && (
          <p style={{ fontSize: "0.8125rem", color: "#64748b", margin: "2px 0 0" }}>
            {subtitle}
          </p>
        )}
      </div>

      {/* Right Actions */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        {/* Quick Add Project */}
        <Link
          href="/admin/projets/nouveau"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            padding: "0.5rem 1rem",
            borderRadius: "10px",
            background: "linear-gradient(135deg, #0EA5E9, #0284C7)",
            color: "#fff",
            fontSize: "0.8125rem",
            fontWeight: 600,
            textDecoration: "none",
            boxShadow: "0 2px 8px rgba(14, 165, 233, 0.3)",
            transition: "all 0.2s ease",
          }}
          className="hide-on-small"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Nouveau Projet
        </Link>

        {/* View Site */}
        <Link
          href="/"
          target="_blank"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            padding: "0.5rem 0.875rem",
            borderRadius: "10px",
            border: "1.5px solid #e2e8f0",
            background: "#f8fafc",
            color: "#334155",
            fontSize: "0.8125rem",
            fontWeight: 600,
            textDecoration: "none",
            transition: "all 0.2s ease",
          }}
          className="hide-on-small"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
          Voir le Site
        </Link>

        {/* Admin Profile Pill */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "4px 8px 4px 4px", borderRadius: "50px", background: "#f1f5f9", border: "1px solid #e2e8f0" }}>
          <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "#0ea5e9", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 700 }}>
            {user.name ? user.name.charAt(0).toUpperCase() : "A"}
          </div>
          <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "#1e293b" }} className="hide-on-small">
            {user.name || "Admin"}
          </span>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .admin-header-bar {
            padding: 1rem 1rem 1rem 4.5rem !important;
          }
          .hide-on-small {
            display: none !important;
          }
        }
      `}</style>
    </header>
  )
}
