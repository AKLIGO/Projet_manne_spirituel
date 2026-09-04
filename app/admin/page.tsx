import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import AdminHeader from "./components/AdminHeader"
import StatCard from "./components/StatCard"
import RecentDonationsTable from "./components/RecentDonationsTable"
import ProjectsProgressCard from "./components/ProjectsProgressCard"

export default async function AdminDashboardPage() {
  const session = await auth()

  // 1. Statistiques financières globales (Dons)
  const donationsAgg = await prisma.donation.aggregate({
    _sum: { amount: true },
    _count: { id: true },
  })
  const totalDonationsAmount = donationsAgg._sum.amount || 0
  const totalDonationsCount = donationsAgg._count.id || 0

  // 2. Projets et objectifs financiers
  const projects = await prisma.project.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { donations: true },
      },
    },
  })

  const totalTargetAmount = projects.reduce((acc, p) => acc + (p.targetAmount || 0), 0)
  const totalProjectsCount = projects.length
  const activeProjectsCount = projects.filter((p) => p.status === "ACTIVE").length
  const completedProjectsCount = projects.filter((p) => p.status === "COMPLETED").length
  const planningProjectsCount = projects.filter((p) => p.status === "PLANNING").length

  const globalAchievementRate =
    totalTargetAmount > 0
      ? Math.min(100, Math.round((totalDonationsAmount / totalTargetAmount) * 100))
      : 0

  const averageDonation =
    totalDonationsCount > 0
      ? Math.round(totalDonationsAmount / totalDonationsCount)
      : 0

  // 3. Derniers dons
  const recentDonations = await prisma.donation.findMany({
    take: 6,
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

  // Formatage des montants
  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat("fr-FR").format(amount) + " FCFA"
  }

  return (
    <div style={{ paddingBottom: "4rem" }}>
      <AdminHeader
        title="Tableau de Bord SuperAdmin"
        subtitle="Vue d'ensemble des collectes, des projets et de la santé financière"
        user={{
          name: session?.user?.name,
          email: session?.user?.email,
          roles: session?.user?.roles,
        }}
      />

      <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "2rem 1.5rem" }}>
        {/* Banner Welcome Quick Info */}
        <div
          style={{
            background: "linear-gradient(135deg, #0c1445 0%, #0369A1 60%, #0EA5E9 100%)",
            borderRadius: "24px",
            padding: "2rem 2.25rem",
            color: "#ffffff",
            marginBottom: "2rem",
            boxShadow: "0 10px 30px rgba(14, 165, 233, 0.2)",
            position: "relative",
            overflow: "hidden",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "1.5rem",
          }}
        >
          <div style={{ position: "relative", zIndex: 1, maxWidth: "600px" }}>
            <span style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", color: "#7dd3fc" }}>
              Espace de Supervision Financière & Projets
            </span>
            <h2 style={{ fontSize: "1.625rem", fontWeight: 800, margin: "0.375rem 0 0.5rem", lineHeight: 1.2 }}>
              Bienvenue, {session?.user?.name || "Administrateur"} 👋
            </h2>
            <p style={{ fontSize: "0.9375rem", color: "rgba(255, 255, 255, 0.85)", margin: 0, lineHeight: 1.6 }}>
              Voici le récapitulatif en temps réel de vos campagnes, des soutiens reçus et des objectifs pour l'œuvre du Seigneur.
            </p>
          </div>

          <div style={{ position: "relative", zIndex: 1, display: "flex", flexWrap: "wrap", gap: "10px" }}>
            <Link
              href="/admin/projets/nouveau"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "0.75rem 1.25rem",
                borderRadius: "12px",
                background: "#ffffff",
                color: "#0369a1",
                fontSize: "0.875rem",
                fontWeight: 700,
                textDecoration: "none",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                transition: "transform 0.2s ease",
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Créer un Projet
            </Link>

            <Link
              href="/admin/dons"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "0.75rem 1.25rem",
                borderRadius: "12px",
                background: "rgba(255, 255, 255, 0.15)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255, 255, 255, 0.3)",
                color: "#ffffff",
                fontSize: "0.875rem",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="5" width="20" height="14" rx="2" />
                <line x1="2" y1="10" x2="22" y2="10" />
              </svg>
              Consulter les Dons
            </Link>
          </div>
        </div>

        {/* ══════════════════════════════════════════
            GRILLE DES 4 KPI FINANCIERS
           ══════════════════════════════════════════ */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1.5rem", marginBottom: "2rem" }}>
          <StatCard
            title="Total Récolté"
            value={formatMoney(totalDonationsAmount)}
            subtitle="sur l'ensemble des campagnes"
            badgeText={`${totalDonationsCount} don(s)`}
            badgeType="success"
            gradient="linear-gradient(135deg, #10B981 0%, #059669 100%)"
            icon={
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            }
          />

          <StatCard
            title="Taux de Réalisation"
            value={`${globalAchievementRate}%`}
            subtitle={`sur ${formatMoney(totalTargetAmount)} ciblés`}
            badgeText={globalAchievementRate >= 100 ? "Objectif Atteint" : "En cours"}
            badgeType={globalAchievementRate >= 100 ? "success" : "info"}
            gradient="linear-gradient(135deg, #0EA5E9 0%, #0284C7 100%)"
            icon={
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10" />
                <path d="m9 12 2 2 4-4" />
              </svg>
            }
          />

          <StatCard
            title="Campagnes Actives"
            value={`${activeProjectsCount} / ${totalProjectsCount}`}
            subtitle={`${completedProjectsCount} terminé(s) • ${planningProjectsCount} en attente`}
            badgeText="Projets"
            badgeType="warning"
            gradient="linear-gradient(135deg, #F59E0B 0%, #D97706 100%)"
            icon={
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
              </svg>
            }
          />

          <StatCard
            title="Panier Moyen par Don"
            value={formatMoney(averageDonation)}
            subtitle="générosité moyenne constatée"
            badgeText="Moyenne"
            badgeType="neutral"
            gradient="linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)"
            icon={
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10" />
                <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                <line x1="9" y1="9" x2="9.01" y2="9" />
                <line x1="15" y1="9" x2="15.01" y2="9" />
              </svg>
            }
          />
        </div>

        {/* ══════════════════════════════════════════
            GRILLE PRINCIPALE : Objectifs & Derniers Dons
           ══════════════════════════════════════════ */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "2rem" }} className="dashboard-grid-layout">
          {/* Tableau des Dons Récents */}
          <div style={{ minWidth: 0 }}>
            <RecentDonationsTable donations={recentDonations} />
          </div>

          {/* Barres de Progression des Projets */}
          <div style={{ minWidth: 0 }}>
            <ProjectsProgressCard projects={projects} />
          </div>
        </div>
      </div>

      <style>{`
        @media (min-width: 1100px) {
          .dashboard-grid-layout {
            grid-template-columns: 1.3fr 1fr !important;
          }
        }
      `}</style>
    </div>
  )
}
