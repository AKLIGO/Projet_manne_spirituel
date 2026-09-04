import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import AdminHeader from "../components/AdminHeader"
import ParticipantsTable from "./components/ParticipantsTable"

export const metadata = {
  title: "Liste des Participants & Émargement – SuperAdmin",
  description: "Suivi des inscriptions aux activités, cultes et programmes spirituels.",
}

export default async function AdminParticipantsPage() {
  const session = await auth()

  const [registrations, activities, users] = await Promise.all([
    prisma.registration.findMany({
      orderBy: { registeredAt: "desc" },
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
        activity: {
          select: {
            id: true,
            title: true,
            startDate: true,
            location: true,
          },
        },
      },
    }),
    prisma.activity.findMany({
      orderBy: { startDate: "desc" },
      select: {
        id: true,
        title: true,
        startDate: true,
      },
    }),
    prisma.user.findMany({
      orderBy: { firstName: "asc" },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        church: true,
      },
    }),
  ])

  const totalRegistrations = registrations.length
  const confirmedCount = registrations.filter((r) => r.status === "CONFIRMED").length
  const pendingCount = registrations.filter((r) => r.status === "PENDING").length
  const uniqueActivitiesCount = new Set(registrations.map((r) => r.activityId)).size

  return (
    <div style={{ paddingBottom: "4rem" }}>
      <AdminHeader
        title="Liste des Participants & Émargement"
        subtitle="Suivi des inscriptions, feuilles d'émargement et présences aux rassemblements"
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
            <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "#0369a1", textTransform: "uppercase", margin: 0 }}>Total Inscriptions</p>
            <h3 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0369a1", margin: "4px 0 0" }}>{totalRegistrations}</h3>
          </div>

          <div style={{ background: "#ffffff", padding: "1.25rem 1.5rem", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
            <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "#10b981", textTransform: "uppercase", margin: 0 }}>Confirmés</p>
            <h3 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#10b981", margin: "4px 0 0" }}>{confirmedCount}</h3>
          </div>

          <div style={{ background: "#ffffff", padding: "1.25rem 1.5rem", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
            <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "#f59e0b", textTransform: "uppercase", margin: 0 }}>En Attente</p>
            <h3 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#f59e0b", margin: "4px 0 0" }}>{pendingCount}</h3>
          </div>

          <div style={{ background: "#ffffff", padding: "1.25rem 1.5rem", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
            <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "#8b5cf6", textTransform: "uppercase", margin: 0 }}>Activités Concernées</p>
            <h3 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#8b5cf6", margin: "4px 0 0" }}>{uniqueActivitiesCount}</h3>
          </div>
        </div>

        {/* Tableau des participants */}
        <ParticipantsTable
          registrations={registrations}
          activities={activities}
          users={users}
        />
      </div>
    </div>
  )
}
