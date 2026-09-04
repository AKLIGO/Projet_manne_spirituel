"use client"

import { useState } from "react"
import { createManualDonation, deleteDonation, updateManualDonation } from "@/app/actions/donationActions"

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

interface ProjectOption {
  id: string
  title: string
}

interface DonationsTableProps {
  donations: DonationItem[]
  projects: ProjectOption[]
}

export default function DonationsTable({ donations: initialDonations, projects }: DonationsTableProps) {
  const [donations, setDonations] = useState(initialDonations)
  const [search, setSearch] = useState("")
  const [methodFilter, setMethodFilter] = useState("ALL")
  const [projectFilter, setProjectFilter] = useState("ALL")
  const [showModal, setShowModal] = useState(false)
  const [editingDonation, setEditingDonation] = useState<DonationItem | null>(null)
  const [isPending, setIsPending] = useState(false)
  const [toast, setToast] = useState<{ type: "success" | "error"; text: string } | null>(null)

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

  const normalize = (str: string | null | undefined) =>
    (str || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim()

  const normalizeMethod = (raw: string) => {
    return (raw || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]/g, "")
  }

  // Filtrage
  const filteredDonations = donations.filter((d) => {
    const term = normalize(search)
    const donor = d.user
      ? `${d.user.firstName || ""} ${d.user.lastName || ""} ${d.user.email || ""}`
      : d.paymentMethod || ""
    const projectTitle = d.project?.title || "Donation Générale"

    const matchesSearch =
      !term ||
      normalize(donor).includes(term) ||
      normalize(projectTitle).includes(term) ||
      d.amount.toString().includes(term)

    const matchesMethod = () => {
      if (methodFilter === "ALL") return true
      const normalizedPayment = normalizeMethod(d.paymentMethod)
      const normalizedFilter = normalizeMethod(methodFilter)

      if (normalizedFilter === "tmoney") {
        return normalizedPayment.includes("tmoney") || normalizedPayment.includes("togocom")
      }
      if (normalizedFilter === "flooz") {
        return normalizedPayment.includes("flooz") || normalizedPayment.includes("moov")
      }
      if (normalizedFilter === "espece" || normalizedFilter === "especes") {
        return (
          normalizedPayment.includes("espece") ||
          normalizedPayment.includes("cash") ||
          normalizedPayment.includes("culte")
        )
      }
      if (normalizedFilter === "carte") {
        return (
          normalizedPayment.includes("carte") ||
          normalizedPayment.includes("card") ||
          normalizedPayment.includes("stripe") ||
          normalizedPayment.includes("visa")
        )
      }
      if (normalizedFilter === "virement") {
        return normalizedPayment.includes("virement") || normalizedPayment.includes("banque")
      }
      if (normalizedFilter === "cheque") {
        return normalizedPayment.includes("cheque")
      }
      return normalizedPayment.includes(normalizedFilter)
    }

    const matchesProject =
      projectFilter === "ALL" || (projectFilter === "NONE" ? !d.project : d.project?.id === projectFilter)

    return matchesSearch && matchesMethod() && matchesProject
  })

  // Export CSV
  const handleExportCSV = () => {
    const headers = ["ID", "Donateur", "Email", "Projet", "Montant (FCFA)", "Moyen de Paiement", "Statut", "Date"]
    const rows = filteredDonations.map((d) => [
      d.id,
      d.user ? `${d.user.firstName} ${d.user.lastName}` : "Anonyme / Saisie Manuelle",
      d.user?.email || "",
      d.project ? d.project.title : "Général",
      d.amount.toString(),
      d.paymentMethod,
      d.status,
      new Date(d.donationDate).toISOString(),
    ])

    const csvContent =
      "data:text/csv;charset=utf-8,\uFEFF" +
      [headers.join(";"), ...rows.map((e) => e.map((val) => `"${val.replace(/"/g, '""')}"`).join(";"))].join("\n")

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `dons_manne_spirituelle_${new Date().toISOString().split("T")[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Soumission don manuel
  const handleCreateDonation = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsPending(true)
    setToast(null)

    const formData = new FormData(e.currentTarget)
    const res = await createManualDonation(formData)

    if (res.success) {
      setToast({ type: "success", text: "Don enregistré avec succès !" })
      setShowModal(false)
      // Rafraîchir localement
      window.location.reload()
    } else {
      setToast({ type: "error", text: res.error || "Erreur lors de l'enregistrement." })
    }
    setIsPending(false)
  }

  // Soumission modification don
  const handleUpdateDonation = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!editingDonation) return
    setIsPending(true)
    setToast(null)

    const formData = new FormData(e.currentTarget)
    const res = await updateManualDonation(editingDonation.id, formData)

    if (res.success) {
      setToast({ type: "success", text: "Don mis à jour avec succès !" })
      setEditingDonation(null)
      window.location.reload()
    } else {
      setToast({ type: "error", text: res.error || "Erreur lors de la mise à jour." })
    }
    setIsPending(false)
  }

  // Suppression
  const handleDeleteDonation = async (id: string) => {
    if (!confirm("Voulez-vous supprimer cet enregistrement de don ?")) return

    const res = await deleteDonation(id)
    if (res.success) {
      setDonations((prev) => prev.filter((d) => d.id !== id))
      setToast({ type: "success", text: "Don supprimé avec succès." })
    } else {
      setToast({ type: "error", text: res.error || "Erreur lors de la suppression." })
    }
  }

  const getMethodBadge = (method: string) => {
    const m = (method || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    if (m.includes("tmoney") || m.includes("t-money")) return { label: "T-Money", bg: "#fef3c7", color: "#b45309" }
    if (m.includes("flooz") || m.includes("moov")) return { label: "Flooz", bg: "#dbeafe", color: "#1d4ed8" }
    if (m.includes("card") || m.includes("carte") || m.includes("visa")) return { label: "Carte", bg: "#f3e8ff", color: "#7e22ce" }
    if (m.includes("espece") || m.includes("cash") || m.includes("culte")) return { label: "Espèces", bg: "#dcfce7", color: "#15803d" }
    if (m.includes("virement") || m.includes("banque")) return { label: "Virement", bg: "#e0e7ff", color: "#4338ca" }
    if (m.includes("cheque")) return { label: "Chèque", bg: "#fef9c3", color: "#854d0e" }
    return { label: method || "Mobile Money", bg: "#f1f5f9", color: "#475569" }
  }

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div
          style={{
            padding: "0.875rem 1.25rem",
            borderRadius: "12px",
            marginBottom: "1.5rem",
            background: toast.type === "success" ? "#f0fdf4" : "#fef2f2",
            color: toast.type === "success" ? "#166534" : "#991b1b",
            border: `1px solid ${toast.type === "success" ? "#bbf7d0" : "#fecaca"}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span>{toast.type === "success" ? "✅" : "⚠️"} {toast.text}</span>
          <button onClick={() => setToast(null)} style={{ background: "none", border: "none", cursor: "pointer" }}>✕</button>
        </div>
      )}

      {/* Barre d'Actions & Filtres */}
      <div
        style={{
          background: "#ffffff",
          borderRadius: "18px",
          padding: "1.25rem",
          marginBottom: "1.5rem",
          border: "1px solid #e2e8f0",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1rem",
        }}
      >
        {/* Recherche */}
        <div style={{ position: "relative", minWidth: "260px", flex: 1, maxWidth: "400px" }}>
          <input
            type="text"
            placeholder="Rechercher par donateur, projet, montant..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%",
              padding: "0.625rem 1rem",
              borderRadius: "10px",
              border: "1.5px solid #e2e8f0",
              fontSize: "0.875rem",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>

        {/* Filtres méthode & projet */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            style={{
              padding: "0.625rem 1rem",
              borderRadius: "10px",
              border: "1.5px solid #e2e8f0",
              fontSize: "0.8125rem",
              background: "#f8fafc",
              color: "#334155",
              outline: "none",
              fontWeight: 600,
            }}
          >
            <option value="ALL">Tous les moyens</option>
            <option value="tmoney">📱 T-Money</option>
            <option value="flooz">📱 Flooz</option>
            <option value="espece">💵 Espèces / Culte</option>
            <option value="carte">💳 Carte Bancaire</option>
            <option value="virement">🏦 Virement Bancaire</option>
            <option value="cheque">📜 Chèque</option>
          </select>

          <select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            style={{
              padding: "0.625rem 1rem",
              borderRadius: "10px",
              border: "1.5px solid #e2e8f0",
              fontSize: "0.8125rem",
              background: "#f8fafc",
              color: "#334155",
              outline: "none",
              fontWeight: 600,
            }}
          >
            <option value="ALL">Tous les projets</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.title}</option>
            ))}
          </select>

          {/* Bouton Export CSV */}
          <button
            type="button"
            onClick={handleExportCSV}
            style={{
              padding: "0.625rem 1rem",
              borderRadius: "10px",
              border: "1.5px solid #e2e8f0",
              background: "#ffffff",
              color: "#334155",
              fontSize: "0.8125rem",
              fontWeight: 600,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Export CSV
          </button>

          {/* Bouton Ajouter Don Manuel */}
          <button
            type="button"
            onClick={() => setShowModal(true)}
            style={{
              padding: "0.625rem 1.25rem",
              borderRadius: "10px",
              background: "linear-gradient(135deg, #10B981, #059669)",
              color: "#ffffff",
              border: "none",
              fontSize: "0.8125rem",
              fontWeight: 700,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              boxShadow: "0 2px 8px rgba(16, 185, 129, 0.3)",
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            + Enregistrer un Don
          </button>
        </div>
      </div>

      {/* Tableau des Dons */}
      <div
        style={{
          background: "#ffffff",
          borderRadius: "20px",
          border: "1px solid #e2e8f0",
          boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
          overflow: "hidden",
        }}
      >
        {filteredDonations.length === 0 ? (
          <div style={{ padding: "4rem 1.5rem", textAlign: "center", color: "#94a3b8" }}>
            <div style={{ fontSize: "3rem", marginBottom: "0.5rem" }}>💳</div>
            <p style={{ fontWeight: 700, color: "#1e293b", fontSize: "1.125rem" }}>Aucune transaction trouvée</p>
            <p style={{ fontSize: "0.8125rem" }}>Ajustez vos filtres ou enregistrez un premier don.</p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.875rem" }}>
              <thead>
                <tr style={{ background: "#f8fafc", borderBottom: "1.5px solid #e2e8f0", color: "#64748b", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  <th style={{ padding: "1rem 1.25rem", fontWeight: 700 }}>Donateur</th>
                  <th style={{ padding: "1rem 0.75rem", fontWeight: 700 }}>Projet Soutenu</th>
                  <th style={{ padding: "1rem 0.75rem", fontWeight: 700 }}>Montant</th>
                  <th style={{ padding: "1rem 0.75rem", fontWeight: 700 }}>Moyen</th>
                  <th style={{ padding: "1rem 0.75rem", fontWeight: 700 }}>Date</th>
                  <th style={{ padding: "1rem 0.75rem", fontWeight: 700 }}>Statut</th>
                  <th style={{ padding: "1rem 1.25rem", fontWeight: 700, textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDonations.map((d) => {
                  const methodBadge = getMethodBadge(d.paymentMethod)
                  const donorName = d.user
                    ? `${d.user.firstName} ${d.user.lastName}`
                    : d.paymentMethod.includes("(") ? d.paymentMethod : "Donateur Anonyme"

                  return (
                    <tr key={d.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "1rem 1.25rem" }}>
                        <p style={{ fontWeight: 700, color: "#0f172a", margin: "0 0 2px" }}>{donorName}</p>
                        {d.user?.email && (
                          <p style={{ fontSize: "0.75rem", color: "#94a3b8", margin: 0 }}>{d.user.email}</p>
                        )}
                      </td>

                      <td style={{ padding: "1rem 0.75rem" }}>
                        <span style={{ fontWeight: 600, color: "#334155" }}>
                          {d.project ? d.project.title : "Donation Générale"}
                        </span>
                      </td>

                      <td style={{ padding: "1rem 0.75rem" }}>
                        <span style={{ fontWeight: 800, color: "#0f172a", fontSize: "0.9375rem" }}>
                          {formatMoney(d.amount)}
                        </span>
                      </td>

                      <td style={{ padding: "1rem 0.75rem" }}>
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

                      <td style={{ padding: "1rem 0.75rem", color: "#64748b", fontSize: "0.75rem" }}>
                        {formatDate(d.donationDate)}
                      </td>

                      <td style={{ padding: "1rem 0.75rem" }}>
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
                          }}
                        >
                          ● {d.status === "COMPLETED" ? "Validé" : "En cours"}
                        </span>
                      </td>

                      <td style={{ padding: "1rem 1.25rem", textAlign: "right" }}>
                        <div style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                          <button
                            type="button"
                            onClick={() => setEditingDonation(d)}
                            title="Modifier ce don"
                            style={{
                              padding: "6px 10px",
                              borderRadius: "8px",
                              background: "#f0f9ff",
                              color: "#0369a1",
                              border: "1px solid #bae6fd",
                              fontSize: "0.8125rem",
                              fontWeight: 600,
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                            }}
                          >
                            ✏️ Modifier
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteDonation(d.id)}
                            title="Supprimer la transaction"
                            style={{
                              padding: "6px 8px",
                              borderRadius: "8px",
                              background: "#fef2f2",
                              color: "#ef4444",
                              border: "1px solid #fee2e2",
                              cursor: "pointer",
                            }}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════
          MODAL ENREGISTRER UN DON MANUEL
         ══════════════════════════════════════════ */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.6)",
            backdropFilter: "blur(4px)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1.5rem",
          }}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: "24px",
              width: "100%",
              maxWidth: "520px",
              padding: "2rem",
              boxShadow: "0 20px 50px rgba(0,0,0,0.2)",
              border: "1px solid #e2e8f0",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
              <div>
                <h3 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#0f172a", margin: 0 }}>
                  Enregistrer un Don Hors-Ligne
                </h3>
                <p style={{ fontSize: "0.8125rem", color: "#64748b", margin: "2px 0 0" }}>
                  Saisie d'un don reçu lors d'un culte, rassemblement ou par virement direct
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                style={{ background: "none", border: "none", fontSize: "1.25rem", cursor: "pointer", color: "#94a3b8" }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateDonation} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "#334155", marginBottom: "0.375rem" }}>
                  Montant du Don (FCFA) <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <input
                  type="number"
                  name="amount"
                  required
                  min="1"
                  step="any"
                  placeholder="Ex: 50000"
                  style={{
                    width: "100%",
                    padding: "0.75rem 1rem",
                    borderRadius: "10px",
                    border: "1.5px solid #e2e8f0",
                    fontSize: "0.9375rem",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "#334155", marginBottom: "0.375rem" }}>
                  Projet Destinataire
                </label>
                <select
                  name="projectId"
                  style={{
                    width: "100%",
                    padding: "0.75rem 1rem",
                    borderRadius: "10px",
                    border: "1.5px solid #e2e8f0",
                    fontSize: "0.875rem",
                    boxSizing: "border-box",
                  }}
                >
                  <option value="NONE">Donation Générale (Fonds Communautaire)</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>{p.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "#334155", marginBottom: "0.375rem" }}>
                  Mode de Réception
                </label>
                <select
                  name="paymentMethod"
                  style={{
                    width: "100%",
                    padding: "0.75rem 1rem",
                    borderRadius: "10px",
                    border: "1.5px solid #e2e8f0",
                    fontSize: "0.875rem",
                    boxSizing: "border-box",
                  }}
                >
                  <option value="Espèces / Culte">💵 Espèces (Quête / Culte)</option>
                  <option value="T-Money">📱 T-Money (Togo)</option>
                  <option value="Flooz / Moov">📱 Flooz (Moov)</option>
                  <option value="Virement Bancaire">🏦 Virement Bancaire</option>
                  <option value="Chèque">📜 Chèque</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "#334155", marginBottom: "0.375rem" }}>
                  Nom du Donateur ou Référence
                </label>
                <input
                  type="text"
                  name="donorName"
                  placeholder="Ex: Frère Marc D., Famille K., ou Anonyme..."
                  style={{
                    width: "100%",
                    padding: "0.75rem 1rem",
                    borderRadius: "10px",
                    border: "1.5px solid #e2e8f0",
                    fontSize: "0.875rem",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "1rem" }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{
                    padding: "0.6875rem 1.25rem",
                    borderRadius: "10px",
                    background: "#f1f5f9",
                    color: "#475569",
                    border: "none",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  style={{
                    padding: "0.6875rem 1.5rem",
                    borderRadius: "10px",
                    background: "linear-gradient(135deg, #10B981, #059669)",
                    color: "#fff",
                    border: "none",
                    fontWeight: 700,
                    cursor: isPending ? "not-allowed" : "pointer",
                  }}
                >
                  {isPending ? "Enregistrement..." : "Valider le Don"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════
          MODAL MODIFIER UN DON
         ══════════════════════════════════════════ */}
      {editingDonation && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "1rem",
          }}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: "24px",
              width: "100%",
              maxWidth: "520px",
              padding: "2rem",
              boxShadow: "0 20px 50px rgba(0,0,0,0.2)",
              border: "1px solid #e2e8f0",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
              <div>
                <h3 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#0f172a", margin: 0 }}>
                  Modifier la Transaction de Don
                </h3>
                <p style={{ fontSize: "0.8125rem", color: "#64748b", margin: "2px 0 0" }}>
                  Ajustez le montant, le projet rattaché ou le statut de validation
                </p>
              </div>
              <button
                onClick={() => setEditingDonation(null)}
                style={{ background: "none", border: "none", fontSize: "1.25rem", cursor: "pointer", color: "#94a3b8" }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateDonation} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "#334155", marginBottom: "0.375rem" }}>
                  Montant du Don (FCFA) <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <input
                  type="number"
                  name="amount"
                  required
                  min="1"
                  step="any"
                  defaultValue={editingDonation.amount}
                  style={{
                    width: "100%",
                    padding: "0.75rem 1rem",
                    borderRadius: "10px",
                    border: "1.5px solid #e2e8f0",
                    fontSize: "0.9375rem",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "#334155", marginBottom: "0.375rem" }}>
                  Projet Destinataire
                </label>
                <select
                  name="projectId"
                  defaultValue={editingDonation.project?.id || "NONE"}
                  style={{
                    width: "100%",
                    padding: "0.75rem 1rem",
                    borderRadius: "10px",
                    border: "1.5px solid #e2e8f0",
                    fontSize: "0.875rem",
                    boxSizing: "border-box",
                  }}
                >
                  <option value="NONE">Donation Générale (Fonds Communautaire)</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>{p.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "#334155", marginBottom: "0.375rem" }}>
                  Mode de Réception
                </label>
                <select
                  name="paymentMethod"
                  defaultValue={
                    editingDonation.paymentMethod.includes("T-Money") ? "T-Money" :
                    editingDonation.paymentMethod.includes("Flooz") ? "Flooz / Moov" :
                    editingDonation.paymentMethod.includes("Virement") ? "Virement Bancaire" :
                    editingDonation.paymentMethod.includes("Chèque") ? "Chèque" : "Espèces / Culte"
                  }
                  style={{
                    width: "100%",
                    padding: "0.75rem 1rem",
                    borderRadius: "10px",
                    border: "1.5px solid #e2e8f0",
                    fontSize: "0.875rem",
                    boxSizing: "border-box",
                  }}
                >
                  <option value="Espèces / Culte">💵 Espèces (Quête / Culte)</option>
                  <option value="T-Money">📱 T-Money (Togo)</option>
                  <option value="Flooz / Moov">📱 Flooz (Moov)</option>
                  <option value="Virement Bancaire">🏦 Virement Bancaire</option>
                  <option value="Chèque">📜 Chèque</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "#334155", marginBottom: "0.375rem" }}>
                  Nom du Donateur ou Référence
                </label>
                <input
                  type="text"
                  name="donorName"
                  defaultValue={
                    editingDonation.user
                      ? `${editingDonation.user.firstName} ${editingDonation.user.lastName}`
                      : editingDonation.paymentMethod.includes("(")
                      ? editingDonation.paymentMethod.replace(/^[^(]*\((.*)\)[^)]*$/, "$1")
                      : ""
                  }
                  placeholder="Ex: Frère Marc D., Famille K., ou Anonyme..."
                  style={{
                    width: "100%",
                    padding: "0.75rem 1rem",
                    borderRadius: "10px",
                    border: "1.5px solid #e2e8f0",
                    fontSize: "0.875rem",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "#334155", marginBottom: "0.375rem" }}>
                  Statut du Don
                </label>
                <select
                  name="status"
                  defaultValue={editingDonation.status}
                  style={{
                    width: "100%",
                    padding: "0.75rem 1rem",
                    borderRadius: "10px",
                    border: "1.5px solid #e2e8f0",
                    fontSize: "0.875rem",
                    boxSizing: "border-box",
                  }}
                >
                  <option value="COMPLETED">🟢 Validé / Reçu</option>
                  <option value="PENDING">🟡 En attente</option>
                </select>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "1rem" }}>
                <button
                  type="button"
                  onClick={() => setEditingDonation(null)}
                  style={{
                    padding: "0.6875rem 1.25rem",
                    borderRadius: "10px",
                    background: "#f1f5f9",
                    color: "#475569",
                    border: "none",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  style={{
                    padding: "0.6875rem 1.5rem",
                    borderRadius: "10px",
                    background: "linear-gradient(135deg, #0EA5E9, #0284C7)",
                    color: "#fff",
                    border: "none",
                    fontWeight: 700,
                    cursor: isPending ? "not-allowed" : "pointer",
                  }}
                >
                  {isPending ? "Enregistrement..." : "Enregistrer les modifications"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
