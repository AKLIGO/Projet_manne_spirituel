import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import AdminHeader from "../components/AdminHeader"
import ProjectsTable from "./components/ProjectsTable"

export const metadata = {
  title: "Gestion des Projets – SuperAdmin",
  description: "Création, gestion et suivi des campagnes de projets caritatifs et spirituels.",
}

export default async function AdminProjectsPage() {
  const session = await auth()

  const [projects, availableUsers] = await Promise.all([
    prisma.project.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        author: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        media: {
          select: {
            id: true,
            url: true,
          },
        },
        team: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                profileImage: true,
                church: true,
              },
            },
          },
        },
        _count: {
          select: {
            donations: true,
          },
        },
      },
    }),
    prisma.user.findMany({
      orderBy: { firstName: "asc" },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        profileImage: true,
        church: true,
      },
    }),
  ])

  // Statistiques rapides
  const totalTarget = projects.reduce((acc, p) => acc + (p.targetAmount || 0), 0)
  const totalCollected = projects.reduce((acc, p) => acc + p.currentAmount, 0)
  const activeCount = projects.filter((p) => p.status === "ACTIVE").length

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat("fr-FR").format(amount) + " FCFA"
  }

  return (
    <div style={{ paddingBottom: "4rem" }}>
      <AdminHeader
        title="Gestion des Projets"
        subtitle="Créez, modifiez, assignez des équipes et suivez l'avancement de toutes vos campagnes"
        user={{
          name: session?.user?.name,
          email: session?.user?.email,
          roles: session?.user?.roles,
        }}
      />

      <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "2rem 1.5rem" }}>
        {/* Top Mini Summary Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
          <div style={{ background: "#ffffff", padding: "1.25rem 1.5rem", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
            <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", margin: 0 }}>Total Projets</p>
            <h3 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0f172a", margin: "4px 0 0" }}>{projects.length}</h3>
          </div>

          <div style={{ background: "#ffffff", padding: "1.25rem 1.5rem", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
            <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "#166534", textTransform: "uppercase", margin: 0 }}>Projets Actifs</p>
            <h3 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#166534", margin: "4px 0 0" }}>{activeCount}</h3>
          </div>

          <div style={{ background: "#ffffff", padding: "1.25rem 1.5rem", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
            <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "#0369a1", textTransform: "uppercase", margin: 0 }}>Budget Global Ciblé</p>
            <h3 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0369a1", margin: "4px 0 0" }}>{formatMoney(totalTarget)}</h3>
          </div>

          <div style={{ background: "#ffffff", padding: "1.25rem 1.5rem", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
            <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "#10b981", textTransform: "uppercase", margin: 0 }}>Fonds Déjà Récoltés</p>
            <h3 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#10b981", margin: "4px 0 0" }}>{formatMoney(totalCollected)}</h3>
          </div>
        </div>

        {/* Header Action Bar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#0f172a", margin: 0 }}>
              Toutes les Campagnes
            </h2>
            <p style={{ fontSize: "0.8125rem", color: "#64748b", margin: "2px 0 0" }}>
              Gérez les statuts, assignez les équipes, visualisez les dons et modifiez le contenu public
            </p>
          </div>

          <Link
            href="/admin/projets/nouveau"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "0.75rem 1.5rem",
              borderRadius: "12px",
              background: "linear-gradient(135deg, #0EA5E9 0%, #0284C7 100%)",
              color: "#ffffff",
              fontSize: "0.875rem",
              fontWeight: 700,
              textDecoration: "none",
              boxShadow: "0 4px 14px rgba(14, 165, 233, 0.35)",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Nouveau Projet
          </Link>
        </div>

        {/* Table Interactive */}
        <ProjectsTable projects={projects} availableUsers={availableUsers} />
      </div>
    </div>
  )
}
