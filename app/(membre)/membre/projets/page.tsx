import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"

export const metadata = {
  title: "Mes Projets – Espace Membre",
}

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  PLANNING:  { label: "En planification", color: "#b45309", bg: "#fef3c7" },
  ACTIVE:    { label: "Actif",            color: "#0369a1", bg: "#e0f2fe" },
  COMPLETED: { label: "Terminé",          color: "#166534", bg: "#dcfce7" },
}

export default async function MesProjetsPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const assignments = await prisma.projectMember.findMany({
    where: { userId: session.user.id },
    include: {
      project: {
        include: {
          author: { select: { firstName: true, lastName: true } },
          _count: { select: { team: true, donations: true } },
        },
      },
    },
    orderBy: { assignedAt: "desc" },
  })

  return (
    <div style={{ padding: "2rem 1.5rem", maxWidth: "1100px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "#0f172a", margin: 0 }}>Mes Projets</h1>
        <p style={{ color: "#64748b", marginTop: "0.4rem", fontSize: "0.9375rem" }}>
          Projets sur lesquels vous êtes assigné(e) en tant qu{`'`}intervenant.
        </p>
      </div>

      {assignments.length === 0 ? (
        <div style={{ textAlign: "center", padding: "4rem 2rem", background: "#fff", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📁</div>
          <h3 style={{ color: "#1e293b", fontWeight: 700, margin: "0 0 0.5rem" }}>Aucun projet assigné</h3>
          <p style={{ color: "#64748b", fontSize: "0.9375rem" }}>
            Vous n{`'`}êtes encore assigné(e) à aucun projet. Contactez un administrateur pour être ajouté.
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "1.25rem" }}>
          {assignments.map((assignment) => {
            const { project } = assignment
            const status = statusConfig[project.status] ?? { label: project.status, color: "#64748b", bg: "#f1f5f9" }
            const progress = project.targetAmount
              ? Math.min(100, Math.round((project.currentAmount / project.targetAmount) * 100))
              : null

            return (
              <div
                key={assignment.id}
                style={{ background: "#fff", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", overflow: "hidden" }}
              >
                {/* Card Header */}
                <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid #f1f5f9" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "0.75rem" }}>
                    <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#0f172a", margin: 0, lineHeight: 1.4 }}>{project.title}</h3>
                    <span style={{ fontSize: "0.6875rem", fontWeight: 700, color: status.color, background: status.bg, padding: "3px 10px", borderRadius: "50px", whiteSpace: "nowrap", flexShrink: 0 }}>
                      {status.label}
                    </span>
                  </div>
                  <p style={{ fontSize: "0.875rem", color: "#64748b", margin: "0.5rem 0 0", lineHeight: 1.5 }}>
                    {project.description.length > 120 ? project.description.slice(0, 120) + "…" : project.description}
                  </p>
                </div>

                {/* Mon rôle & mission */}
                <div style={{ padding: "1rem 1.5rem", background: "linear-gradient(135deg, #f0fdf4, #dcfce7)", borderBottom: "1px solid #e2e8f0" }}>
                  <p style={{ fontSize: "0.6875rem", fontWeight: 700, color: "#166534", textTransform: "uppercase", letterSpacing: "0.5px", margin: "0 0 4px" }}>Mon rôle</p>
                  <p style={{ fontSize: "0.9375rem", fontWeight: 700, color: "#15803d", margin: 0 }}>{assignment.role}</p>
                  {assignment.notes && (
                    <>
                      <p style={{ fontSize: "0.6875rem", fontWeight: 700, color: "#166534", textTransform: "uppercase", letterSpacing: "0.5px", margin: "0.75rem 0 4px" }}>Ma mission</p>
                      <p style={{ fontSize: "0.875rem", color: "#166534", margin: 0, lineHeight: 1.5 }}>{assignment.notes}</p>
                    </>
                  )}
                </div>

                {/* Stats */}
                <div style={{ padding: "1rem 1.5rem" }}>
                  <div style={{ display: "flex", gap: "1.5rem", fontSize: "0.8125rem", color: "#64748b", marginBottom: progress !== null ? "0.75rem" : 0 }}>
                    <span>👥 {project._count.team} intervenant(s)</span>
                    <span>🪙 {project._count.donations} don(s)</span>
                    <span style={{ color: "#94a3b8" }}>
                      Par {project.author.firstName} {project.author.lastName}
                    </span>
                  </div>

                  {progress !== null && (
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "#64748b", marginBottom: "4px" }}>
                        <span>Financement</span>
                        <span style={{ fontWeight: 700, color: progress >= 100 ? "#16a34a" : "#0369a1" }}>{progress}%</span>
                      </div>
                      <div style={{ height: "6px", background: "#e2e8f0", borderRadius: "50px", overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${progress}%`, background: progress >= 100 ? "linear-gradient(90deg, #22c55e, #16a34a)" : "linear-gradient(90deg, #0ea5e9, #0284c7)", borderRadius: "50px", transition: "width 0.4s ease" }} />
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "4px" }}>
                        {project.currentAmount.toLocaleString("fr-FR")} $ / {project.targetAmount!.toLocaleString("fr-FR")} $
                      </div>
                    </div>
                  )}

                  <p style={{ fontSize: "0.75rem", color: "#94a3b8", margin: "0.75rem 0 0" }}>
                    Assigné le {new Date(assignment.assignedAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
