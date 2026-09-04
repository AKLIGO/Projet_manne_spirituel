import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import AdminHeader from "../components/AdminHeader"
import ActivitiesTable from "./components/ActivitiesTable"

export const metadata = {
  title: "Gestion des Activités & Événements – SuperAdmin",
  description: "Planification des cultes, séminaires et retraites spirituelles.",
}

export default async function AdminActivitiesPage() {
  const session = await auth()

  const activities = await prisma.activity.findMany({
    orderBy: { startDate: "desc" },
    include: {
      _count: {
        select: {
          registrations: true,
        },
      },
    },
  })

  const now = new Date()
  const upcomingCount = activities.filter((a) => new Date(a.startDate) >= now).length
  const pastCount = activities.filter((a) => new Date(a.startDate) < now).length
  const totalRegistrations = activities.reduce((acc, a) => acc + a._count.registrations, 0)

  return (
    <div style={{ paddingBottom: "4rem" }}>
      <AdminHeader
        title="Activités & Événements"
        subtitle="Planifiez, gérez et suivez les inscriptions aux programmes et cultes de la communauté"
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
            <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "#0369a1", textTransform: "uppercase", margin: 0 }}>Total Événements</p>
            <h3 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0369a1", margin: "4px 0 0" }}>{activities.length}</h3>
          </div>

          <div style={{ background: "#ffffff", padding: "1.25rem 1.5rem", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
            <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "#10b981", textTransform: "uppercase", margin: 0 }}>À Venir</p>
            <h3 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#10b981", margin: "4px 0 0" }}>{upcomingCount}</h3>
          </div>

          <div style={{ background: "#ffffff", padding: "1.25rem 1.5rem", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
            <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", margin: 0 }}>Passés / Archivés</p>
            <h3 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#64748b", margin: "4px 0 0" }}>{pastCount}</h3>
          </div>

          <div style={{ background: "#ffffff", padding: "1.25rem 1.5rem", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
            <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "#8b5cf6", textTransform: "uppercase", margin: 0 }}>Inscriptions Totales</p>
            <h3 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#8b5cf6", margin: "4px 0 0" }}>{totalRegistrations}</h3>
          </div>
        </div>

        {/* Tableau des Activités */}
        <ActivitiesTable activities={activities} />
      </div>
    </div>
  )
}
