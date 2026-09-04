import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import AdminHeader from "../components/AdminHeader"
import DonationsTable from "./components/DonationsTable"

export const metadata = {
  title: "Gestion des Dons & Transactions – SuperAdmin",
  description: "Suivi des transactions, saisie manuelle et comptabilité des dons.",
}

export default async function AdminDonationsPage() {
  const session = await auth()

  const donations = await prisma.donation.findMany({
    orderBy: { donationDate: "desc" },
    include: {
      user: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      project: {
        select: {
          id: true,
          title: true,
        },
      },
    },
  })

  const projects = await prisma.project.findMany({
    select: {
      id: true,
      title: true,
    },
    orderBy: { title: "asc" },
  })

  const totalAmount = donations.reduce((acc, d) => acc + d.amount, 0)
  const averageAmount = donations.length > 0 ? Math.round(totalAmount / donations.length) : 0

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat("fr-FR").format(amount) + " FCFA"
  }

  return (
    <div style={{ paddingBottom: "4rem" }}>
      <AdminHeader
        title="Dons & Transactions"
        subtitle="Historique des paiements, réconciliations comptables et saisie de dons physiques"
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
            <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "#10b981", textTransform: "uppercase", margin: 0 }}>Total Encaissé</p>
            <h3 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#10b981", margin: "4px 0 0" }}>{formatMoney(totalAmount)}</h3>
          </div>

          <div style={{ background: "#ffffff", padding: "1.25rem 1.5rem", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
            <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "#0369a1", textTransform: "uppercase", margin: 0 }}>Nombre de Transactions</p>
            <h3 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0369a1", margin: "4px 0 0" }}>{donations.length}</h3>
          </div>

          <div style={{ background: "#ffffff", padding: "1.25rem 1.5rem", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
            <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "#8b5cf6", textTransform: "uppercase", margin: 0 }}>Don Moyen Constaté</p>
            <h3 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#8b5cf6", margin: "4px 0 0" }}>{formatMoney(averageAmount)}</h3>
          </div>
        </div>

        {/* Tableau des Dons */}
        <DonationsTable
          donations={donations}
          projects={projects}
        />
      </div>
    </div>
  )
}
