import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import AdminHeader from "../components/AdminHeader"
import MembersTable from "./components/MembersTable"

export const metadata = {
  title: "Gestion des Membres & Rôles – SuperAdmin",
  description: "Annuaire des membres, attribution des responsabilités et gestion des rôles.",
}

export default async function AdminMembersPage() {
  const session = await auth()

  const [users, allRoles] = await Promise.all([
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        roles: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            donations: true,
            createdProjects: true,
            registrations: true,
          },
        },
      },
    }),
    prisma.role.findMany({
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        name: true,
        description: true,
      },
    }),
  ])

  const totalUsers = users.length
  const adminCount = users.filter((u) => u.roles.some((r) => r.name === "ADMIN" || r.name === "SUPERADMIN")).length
  const pastorCount = users.filter((u) => u.roles.some((r) => r.name === "PASTEUR")).length
  const activeMembersCount = users.filter((u) => u.roles.some((r) => r.name === "MEMBRE")).length

  return (
    <div style={{ paddingBottom: "4rem" }}>
      <AdminHeader
        title="Membres & Gestion des Rôles"
        subtitle="Consultez l'annuaire communautaire et attribuez les responsabilités administratives et pastorales"
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
            <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "#0369a1", textTransform: "uppercase", margin: 0 }}>Total Comptes Inscrits</p>
            <h3 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0369a1", margin: "4px 0 0" }}>{totalUsers}</h3>
          </div>

          <div style={{ background: "#ffffff", padding: "1.25rem 1.5rem", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
            <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "#b45309", textTransform: "uppercase", margin: 0 }}>Administrateurs</p>
            <h3 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#b45309", margin: "4px 0 0" }}>{adminCount}</h3>
          </div>

          <div style={{ background: "#ffffff", padding: "1.25rem 1.5rem", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
            <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "#6d28d9", textTransform: "uppercase", margin: 0 }}>Corps Pastoral & Responsables</p>
            <h3 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#6d28d9", margin: "4px 0 0" }}>{pastorCount}</h3>
          </div>

          <div style={{ background: "#ffffff", padding: "1.25rem 1.5rem", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
            <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "#10b981", textTransform: "uppercase", margin: 0 }}>Membres Actifs</p>
            <h3 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#10b981", margin: "4px 0 0" }}>{activeMembersCount}</h3>
          </div>
        </div>

        {/* Tableau interactif des membres et rôles */}
        <MembersTable
          users={users}
          allRoles={allRoles}
          currentUserId={session?.user?.id}
        />
      </div>
    </div>
  )
}
