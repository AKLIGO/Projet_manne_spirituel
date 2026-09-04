"use client"

import Link from "next/link"

interface DonationItem {
  id: string
  amount: number
  paymentMethod: string
  donationDate: Date
  status: string
  user?: {
    firstName: string
    lastName: string
    email: string
  } | null
  project?: {
    id: string
    title: string
  } | null
}

interface RecentDonationsTableProps {
  donations: DonationItem[]
}

export default function RecentDonationsTable({ donations }: RecentDonationsTableProps) {
  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat("fr-FR").format(amount) + " FCFA"
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getMethodBadge = (method: string) => {
    const m = (method || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    if (m.includes("tmoney") || m.includes("t-money")) {
      return { label: "T-Money", bg: "#fef3c7", color: "#b45309" }
    }
    if (m.includes("flooz") || m.includes("moov")) {
      return { label: "Flooz", bg: "#dbeafe", color: "#1d4ed8" }
    }
    if (m.includes("card") || m.includes("carte") || m.includes("stripe") || m.includes("visa")) {
      return { label: "Carte", bg: "#f3e8ff", color: "#7e22ce" }
    }
    if (m.includes("espece") || m.includes("cash") || m.includes("culte")) {
      return { label: "Espèces", bg: "#dcfce7", color: "#15803d" }
    }
    if (m.includes("virement") || m.includes("banque")) {
      return { label: "Virement", bg: "#e0e7ff", color: "#4338ca" }
    }
    if (m.includes("cheque")) {
      return { label: "Chèque", bg: "#fef9c3", color: "#854d0e" }
    }
    return { label: method || "Mobile Money", bg: "#f1f5f9", color: "#475569" }
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
            Derniers Dons Reçus
          </h3>
          <p style={{ fontSize: "0.8125rem", color: "#64748b", margin: "2px 0 0" }}>
            Transactions et soutiens financiers enregistrés en temps réel
          </p>
        </div>

        <Link
          href="/admin/dons"
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
          Voir tout →
        </Link>
      </div>

      {donations.length === 0 ? (
        <div style={{ padding: "3rem 1rem", textAlign: "center", color: "#94a3b8" }}>
          <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>🕊️</div>
          <p style={{ fontWeight: 600, color: "#475569" }}>Aucun don enregistré pour le moment</p>
          <p style={{ fontSize: "0.8125rem" }}>Les contributions apparaîtront ici dès leur réception.</p>
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem", textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: "1.5px solid #f1f5f9", color: "#64748b", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                <th style={{ padding: "0.75rem 0.5rem", fontWeight: 700 }}>Donateur</th>
                <th style={{ padding: "0.75rem 0.5rem", fontWeight: 700 }}>Projet Soutenu</th>
                <th style={{ padding: "0.75rem 0.5rem", fontWeight: 700 }}>Montant</th>
                <th style={{ padding: "0.75rem 0.5rem", fontWeight: 700 }}>Paiement</th>
                <th style={{ padding: "0.75rem 0.5rem", fontWeight: 700 }}>Date</th>
                <th style={{ padding: "0.75rem 0.5rem", fontWeight: 700 }}>Statut</th>
              </tr>
            </thead>
            <tbody>
              {donations.map((d) => {
                const methodBadge = getMethodBadge(d.paymentMethod)
                const donorName = d.user
                  ? `${d.user.firstName} ${d.user.lastName}`
                  : "Donateur Anonyme"

                return (
                  <tr
                    key={d.id}
                    style={{
                      borderBottom: "1px solid #f8fafc",
                      transition: "background 0.15s ease",
                    }}
                    className="donation-row"
                  >
                    <td style={{ padding: "0.875rem 0.5rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <div style={{ width: "30px", height: "30px", borderRadius: "50%", background: "#f1f5f9", color: "#0284c7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 700 }}>
                          {donorName.charAt(0)}
                        </div>
                        <div>
                          <p style={{ fontWeight: 600, color: "#1e293b", margin: 0, fontSize: "0.875rem" }}>
                            {donorName}
                          </p>
                          {d.user?.email && (
                            <p style={{ fontSize: "0.6875rem", color: "#94a3b8", margin: 0 }}>
                              {d.user.email}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    <td style={{ padding: "0.875rem 0.5rem" }}>
                      <span style={{ fontWeight: 500, color: "#334155" }}>
                        {d.project ? d.project.title : "Donation Générale"}
                      </span>
                    </td>

                    <td style={{ padding: "0.875rem 0.5rem" }}>
                      <span style={{ fontWeight: 800, color: "#0f172a" }}>
                        {formatMoney(d.amount)}
                      </span>
                    </td>

                    <td style={{ padding: "0.875rem 0.5rem" }}>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "2px 8px",
                          borderRadius: "6px",
                          fontSize: "0.6875rem",
                          fontWeight: 700,
                          background: methodBadge.bg,
                          color: methodBadge.color,
                        }}
                      >
                        {methodBadge.label}
                      </span>
                    </td>

                    <td style={{ padding: "0.875rem 0.5rem", color: "#64748b", fontSize: "0.75rem" }}>
                      {formatDate(d.donationDate)}
                    </td>

                    <td style={{ padding: "0.875rem 0.5rem" }}>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                          padding: "2px 8px",
                          borderRadius: "50px",
                          fontSize: "0.6875rem",
                          fontWeight: 700,
                          background: d.status === "COMPLETED" ? "#f0fdf4" : "#fffbeb",
                          color: d.status === "COMPLETED" ? "#166534" : "#b45309",
                          border: `1px solid ${d.status === "COMPLETED" ? "#bbf7d0" : "#fde68a"}`,
                        }}
                      >
                        <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: d.status === "COMPLETED" ? "#22c55e" : "#f59e0b" }}></span>
                        {d.status === "COMPLETED" ? "Validé" : "En cours"}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      <style>{`
        .donation-row:hover {
          background: #f8fafc;
        }
      `}</style>
    </div>
  )
}
