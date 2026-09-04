"use client"

import Link from "next/link"

interface ProjectItem {
  id: string
  title: string
  targetAmount: number | null
  currentAmount: number
  status: string
  _count?: {
    donations: number
  }
}

interface ProjectsProgressCardProps {
  projects: ProjectItem[]
}

export default function ProjectsProgressCard({ projects }: ProjectsProgressCardProps) {
  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat("fr-FR").format(amount) + " FCFA"
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return { label: "En cours", bg: "#f0fdf4", color: "#166534", border: "#bbf7d0" }
      case "COMPLETED":
        return { label: "Terminé", bg: "#e0f2fe", color: "#0369a1", border: "#bae6fd" }
      case "PLANNING":
      default:
        return { label: "Planifié", bg: "#fef3c7", color: "#92400e", border: "#fde68a" }
    }
  }

  return (
    <div
      style={{
        background: "#ffffff",
        borderRadius: "20px",
        padding: "1.75rem",
        border: "1px solid #e2e8f0",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.04)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
        <div>
          <h3 style={{ fontSize: "1.125rem", fontWeight: 800, color: "#0f172a", margin: 0 }}>
            Objectifs & Projets en Cours
          </h3>
          <p style={{ fontSize: "0.8125rem", color: "#64748b", margin: "2px 0 0" }}>
            Avancement des levées de fonds par projet
          </p>
        </div>

        <Link
          href="/admin/projets"
          style={{
            fontSize: "0.8125rem",
            fontWeight: 700,
            color: "#0284c7",
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
            padding: "4px 8px",
            borderRadius: "6px",
            transition: "background 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#e0f2fe")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
        >
          Gérer les projets →
        </Link>
      </div>

      {projects.length === 0 ? (
        <div style={{ padding: "3rem 1rem", textAlign: "center", color: "#94a3b8" }}>
          <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>📁</div>
          <p style={{ fontWeight: 600, color: "#475569" }}>Aucun projet créé pour l'instant</p>
          <Link
            href="/admin/projets/nouveau"
            style={{
              display: "inline-block",
              marginTop: "0.75rem",
              fontSize: "0.8125rem",
              fontWeight: 700,
              color: "#0ea5e9",
              textDecoration: "none",
            }}
          >
            + Créer votre premier projet
          </Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {projects.map((p) => {
            const target = p.targetAmount || 1
            const percentage = Math.min(100, Math.round((p.currentAmount / target) * 100))
            const statusBadge = getStatusBadge(p.status)

            return (
              <div
                key={p.id}
                style={{
                  padding: "1rem",
                  borderRadius: "14px",
                  background: "#f8fafc",
                  border: "1px solid #f1f5f9",
                  transition: "all 0.2s ease",
                }}
                className="project-progress-item"
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px", marginBottom: "0.5rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontSize: "1rem" }}>🌱</span>
                    <h4 style={{ fontSize: "0.9375rem", fontWeight: 700, color: "#0f172a", margin: 0 }}>
                      {p.title}
                    </h4>
                  </div>

                  <span
                    style={{
                      padding: "2px 8px",
                      borderRadius: "50px",
                      fontSize: "0.6875rem",
                      fontWeight: 700,
                      background: statusBadge.bg,
                      color: statusBadge.color,
                      border: `1px solid ${statusBadge.border}`,
                    }}
                  >
                    {statusBadge.label}
                  </span>
                </div>

                {/* Progress Bar */}
                <div style={{ margin: "0.625rem 0" }}>
                  <div style={{ height: "8px", width: "100%", background: "#e2e8f0", borderRadius: "50px", overflow: "hidden" }}>
                    <div
                      style={{
                        height: "100%",
                        width: `${percentage}%`,
                        background:
                          percentage >= 100
                            ? "linear-gradient(90deg, #22c55e, #16a34a)"
                            : "linear-gradient(90deg, #0EA5E9, #0284C7)",
                        borderRadius: "50px",
                        transition: "width 0.6s ease",
                      }}
                    />
                  </div>
                </div>

                {/* Amounts & Metrics */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "0.75rem", color: "#64748b" }}>
                  <div>
                    <span style={{ fontWeight: 800, color: "#0f172a" }}>{formatMoney(p.currentAmount)}</span>
                    <span> / {p.targetAmount ? formatMoney(p.targetAmount) : "Objectif non fixé"}</span>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    {p._count && (
                      <span style={{ color: "#94a3b8" }}>{p._count.donations} don(s)</span>
                    )}
                    <span style={{ fontWeight: 800, color: percentage >= 100 ? "#16a34a" : "#0284c7" }}>
                      {percentage}%
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <style>{`
        .project-progress-item:hover {
          border-color: #cbd5e1;
          background: #ffffff;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
        }
      `}</style>
    </div>
  )
}
