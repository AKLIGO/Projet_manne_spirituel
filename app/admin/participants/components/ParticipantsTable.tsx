"use client"

import { useState } from "react"
import Image from "next/image"
import { createManualRegistration, updateRegistrationStatus, deleteRegistration, updateFullRegistration } from "@/app/actions/registrationActions"

interface RegistrationItem {
  id: string
  registeredAt: Date
  status: string
  user: {
    id: string
    firstName: string
    lastName: string
    email: string
    profileImage: string | null
    church: string | null
  }
  activity: {
    id: string
    title: string
    startDate: Date
    location: string
  }
}

interface ActivityOption {
  id: string
  title: string
  startDate: Date
}

interface UserOption {
  id: string
  firstName: string
  lastName: string
  email: string
  church: string | null
}

interface ParticipantsTableProps {
  registrations: RegistrationItem[]
  activities: ActivityOption[]
  users: UserOption[]
}

export default function ParticipantsTable({ registrations: initialRegistrations, activities, users }: ParticipantsTableProps) {
  const [registrations, setRegistrations] = useState(initialRegistrations)
  const [search, setSearch] = useState("")
  const [activityFilter, setActivityFilter] = useState("ALL")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [showModal, setShowModal] = useState(false)
  const [editingRegistration, setEditingRegistration] = useState<RegistrationItem | null>(null)
  const [isPending, setIsPending] = useState(false)
  const [toast, setToast] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [regToDelete, setRegToDelete] = useState<RegistrationItem | null>(null)

  const normalize = (str: string | null | undefined) =>
    (str || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim()

  // Filtrage
  const filteredRegistrations = registrations.filter((r) => {
    const term = normalize(search)
    const fullName = normalize(`${r.user.firstName || ""} ${r.user.lastName || ""}`)
    const email = normalize(r.user.email)
    const activityTitle = normalize(r.activity.title)
    const church = normalize(r.user.church)

    const matchesSearch =
      !term ||
      fullName.includes(term) ||
      email.includes(term) ||
      activityTitle.includes(term) ||
      church.includes(term)

    const matchesActivity = activityFilter === "ALL" || r.activity.id === activityFilter
    const matchesStatus = statusFilter === "ALL" || r.status === statusFilter

    return matchesSearch && matchesActivity && matchesStatus
  })

  // Export CSV / Feuille d'émargement
  const handleExportCSV = () => {
    const headers = ["ID", "Participant", "Email", "Eglise / Communaute", "Activite", "Date Evenement", "Lieu", "Statut Inscription", "Date Inscription"]
    const rows = filteredRegistrations.map((r) => [
      r.id,
      `${r.user.firstName} ${r.user.lastName}`,
      r.user.email,
      r.user.church || "Non renseignee",
      r.activity.title,
      new Date(r.activity.startDate).toLocaleString("fr-FR"),
      r.activity.location,
      r.status,
      new Date(r.registeredAt).toLocaleDateString("fr-FR"),
    ])

    const csvContent =
      "data:text/csv;charset=utf-8,\uFEFF" +
      [headers.join(";"), ...rows.map((e) => e.map((val) => `"${val.replace(/"/g, '""')}"`).join(";"))].join("\n")

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `participants_manne_spirituelle_${new Date().toISOString().split("T")[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Soumission Inscription Manuelle
  const handleCreateRegistration = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsPending(true)
    setToast(null)

    const formData = new FormData(e.currentTarget)
    const res = await createManualRegistration(formData)

    if (res.success) {
      setToast({ type: "success", text: "Participant inscrit avec succès !" })
      setShowModal(false)
      window.location.reload()
    } else {
      setToast({ type: "error", text: res.error || "Erreur lors de l'inscription." })
    }
    setIsPending(false)
  }

  // Soumission Modification Inscription
  const handleUpdateRegistration = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!editingRegistration) return
    setIsPending(true)
    setToast(null)

    const formData = new FormData(e.currentTarget)
    const res = await updateFullRegistration(editingRegistration.id, formData)

    if (res.success) {
      setToast({ type: "success", text: "Inscription mise à jour avec succès !" })
      setEditingRegistration(null)
      window.location.reload()
    } else {
      setToast({ type: "error", text: res.error || "Erreur lors de la mise à jour." })
    }
    setIsPending(false)
  }

  // Mettre à jour statut
  const handleStatusChange = async (id: string, newStatus: string) => {
    const res = await updateRegistrationStatus(id, newStatus)
    if (res.success) {
      setRegistrations((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
      )
      setToast({ type: "success", text: "Statut de participation mis à jour." })
    } else {
      setToast({ type: "error", text: res.error || "Erreur de mise à jour." })
    }
  }

  // Suppression
  const handleDeleteRegistration = async () => {
    if (!regToDelete) return
    setIsPending(true)

    const res = await deleteRegistration(regToDelete.id)
    if (res.success) {
      setRegistrations((prev) => prev.filter((r) => r.id !== regToDelete.id))
      setToast({ type: "success", text: "Inscription retirée avec succès." })
      setRegToDelete(null)
    } else {
      setToast({ type: "error", text: res.error || "Erreur lors de la suppression." })
    }
    setIsPending(false)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return { label: "Confirmé", bg: "#dcfce7", color: "#15803d", border: "#bbf7d0" }
      case "PENDING":
        return { label: "En attente", bg: "#fef9c3", color: "#854d0e", border: "#fef08a" }
      case "CANCELLED":
        return { label: "Annulé", bg: "#fee2e2", color: "#b91c1c", border: "#fecaca" }
      default:
        return { label: status, bg: "#f1f5f9", color: "#475569", border: "#e2e8f0" }
    }
  }

  return (
    <div>
      {/* Toast Notification */}
      {toast && (
        <div
          style={{
            padding: "0.875rem 1.25rem",
            borderRadius: "12px",
            marginBottom: "1.5rem",
            background: toast.type === "success" ? "#ecfdf5" : "#fef2f2",
            color: toast.type === "success" ? "#065f46" : "#991b1b",
            border: `1px solid ${toast.type === "success" ? "#a7f3d0" : "#fecaca"}`,
            fontSize: "0.875rem",
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span>{toast.type === "success" ? "✅" : "⚠️"} {toast.text}</span>
          <button onClick={() => setToast(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "inherit", fontWeight: 700 }}>✕</button>
        </div>
      )}

      {/* Barre d'outils et filtres */}
      <div
        style={{
          background: "#ffffff",
          borderRadius: "20px",
          padding: "1.25rem 1.5rem",
          border: "1px solid #e2e8f0",
          boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
          marginBottom: "1.5rem",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1rem",
        }}
      >
        {/* Recherche */}
        <div style={{ position: "relative", minWidth: "260px", flex: "1 1 280px" }}>
          <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }}>
            🔍
          </span>
          <input
            type="text"
            placeholder="Rechercher un participant, email ou événement..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%",
              padding: "0.625rem 1rem 0.625rem 2.25rem",
              borderRadius: "10px",
              border: "1.5px solid #e2e8f0",
              fontSize: "0.875rem",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>

        {/* Filtres Activité & Statut */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          {/* Filtre Activité */}
          <select
            value={activityFilter}
            onChange={(e) => setActivityFilter(e.target.value)}
            style={{
              padding: "0.625rem 1rem",
              borderRadius: "10px",
              border: "1.5px solid #e2e8f0",
              fontSize: "0.8125rem",
              background: "#f8fafc",
              color: "#334155",
              outline: "none",
              fontWeight: 600,
              maxWidth: "220px",
            }}
          >
            <option value="ALL">Toutes les activités ({activities.length})</option>
            {activities.map((a) => (
              <option key={a.id} value={a.id}>{a.title}</option>
            ))}
          </select>

          {/* Filtre Statut */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
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
            <option value="ALL">Tous les statuts</option>
            <option value="CONFIRMED">🟢 Confirmés</option>
            <option value="PENDING">🟡 En attente</option>
            <option value="CANCELLED">🔴 Annulés</option>
          </select>

          {/* Export CSV */}
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
            📥 Feuille d'Émargement CSV
          </button>

          {/* Inscription Manuelle */}
          <button
            type="button"
            onClick={() => setShowModal(true)}
            style={{
              padding: "0.625rem 1.25rem",
              borderRadius: "10px",
              background: "linear-gradient(135deg, #0EA5E9, #0284C7)",
              color: "#ffffff",
              border: "none",
              fontSize: "0.8125rem",
              fontWeight: 700,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              boxShadow: "0 2px 8px rgba(14, 165, 233, 0.3)",
            }}
          >
            ＋ Inscrire un Membre
          </button>
        </div>
      </div>

      {/* Tableau des Participants */}
      <div
        style={{
          background: "#ffffff",
          borderRadius: "20px",
          border: "1px solid #e2e8f0",
          boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
          overflow: "hidden",
        }}
      >
        {filteredRegistrations.length === 0 ? (
          <div style={{ padding: "4rem 1.5rem", textAlign: "center", color: "#94a3b8" }}>
            <div style={{ fontSize: "3rem", marginBottom: "0.5rem" }}>👥</div>
            <p style={{ fontWeight: 700, color: "#1e293b", fontSize: "1.125rem" }}>Aucun participant trouvé</p>
            <p style={{ fontSize: "0.8125rem" }}>Ajustez vos critères de recherche ou inscrivez un premier participant.</p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.875rem" }}>
              <thead>
                <tr style={{ background: "#f8fafc", borderBottom: "1.5px solid #e2e8f0", color: "#64748b", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  <th style={{ padding: "1rem 1.25rem", fontWeight: 700 }}>Participant / Membre</th>
                  <th style={{ padding: "1rem 1rem", fontWeight: 700 }}>Activité Ciblée</th>
                  <th style={{ padding: "1rem 1rem", fontWeight: 700 }}>Date Événement</th>
                  <th style={{ padding: "1rem 1rem", fontWeight: 700 }}>Statut</th>
                  <th style={{ padding: "1rem 1rem", fontWeight: 700 }}>Inscrit le</th>
                  <th style={{ padding: "1rem 1.25rem", fontWeight: 700, textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRegistrations.map((r) => {
                  const badge = getStatusBadge(r.status)
                  const eventDate = new Date(r.activity.startDate)

                  return (
                    <tr key={r.id} style={{ borderBottom: "1px solid #f1f5f9", transition: "background 0.2s" }} onMouseEnter={(e) => (e.currentTarget.style.background = "#fafafa")} onMouseLeave={(e) => (e.currentTarget.style.background = "#ffffff")}>
                      {/* Participant */}
                      <td style={{ padding: "1rem 1.25rem" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div style={{ width: "38px", height: "38px", borderRadius: "50%", background: "linear-gradient(135deg, #0EA5E9, #0284C7)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: "0.875rem", overflow: "hidden", flexShrink: 0, position: "relative" }}>
                            {r.user.profileImage ? (
                              <Image src={r.user.profileImage} alt={r.user.firstName} fill sizes="38px" style={{ objectFit: "cover" }} />
                            ) : (
                              `${r.user.firstName[0] || ""}${r.user.lastName[0] || ""}`.toUpperCase()
                            )}
                          </div>
                          <div>
                            <p style={{ fontWeight: 700, color: "#0f172a", margin: "0 0 2px" }}>
                              {r.user.firstName} {r.user.lastName}
                            </p>
                            <p style={{ fontSize: "0.75rem", color: "#64748b", margin: 0 }}>
                              {r.user.email} {r.user.church && `• 🏛️ ${r.user.church}`}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Activité */}
                      <td style={{ padding: "1rem 1rem" }}>
                        <p style={{ fontWeight: 700, color: "#0369a1", margin: "0 0 2px", fontSize: "0.875rem" }}>
                          {r.activity.title}
                        </p>
                        <p style={{ fontSize: "0.75rem", color: "#64748b", margin: 0 }}>
                          📍 {r.activity.location}
                        </p>
                      </td>

                      {/* Date Événement */}
                      <td style={{ padding: "1rem 1rem" }}>
                        <span style={{ fontSize: "0.8125rem", color: "#334155", fontWeight: 600 }}>
                          📅 {eventDate.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </td>

                      {/* Statut avec Sélecteur Rapide */}
                      <td style={{ padding: "1rem 1rem" }}>
                        <select
                          value={r.status}
                          onChange={(e) => handleStatusChange(r.id, e.target.value)}
                          style={{
                            padding: "4px 8px",
                            borderRadius: "50px",
                            background: badge.bg,
                            color: badge.color,
                            border: `1px solid ${badge.border}`,
                            fontSize: "0.75rem",
                            fontWeight: 700,
                            cursor: "pointer",
                            outline: "none",
                          }}
                        >
                          <option value="CONFIRMED">🟢 Confirmé</option>
                          <option value="PENDING">🟡 En attente</option>
                          <option value="CANCELLED">🔴 Annulé</option>
                        </select>
                      </td>

                      {/* Date Inscription */}
                      <td style={{ padding: "1rem 1rem", color: "#64748b", fontSize: "0.8125rem" }}>
                        {new Date(r.registeredAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })}
                      </td>

                      {/* Actions */}
                      <td style={{ padding: "1rem 1.25rem", textAlign: "right" }}>
                        <div style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                          <button
                            type="button"
                            onClick={() => setEditingRegistration(r)}
                            title="Modifier cette inscription"
                            style={{
                              padding: "6px 10px",
                              borderRadius: "8px",
                              border: "1px solid #bae6fd",
                              background: "#f0f9ff",
                              color: "#0369a1",
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
                            onClick={() => setRegToDelete(r)}
                            title="Désinscrire ce participant"
                            style={{
                              padding: "6px 10px",
                              borderRadius: "8px",
                              border: "1px solid #fee2e2",
                              background: "#fef2f2",
                              color: "#ef4444",
                              fontSize: "0.8125rem",
                              cursor: "pointer",
                            }}
                          >
                            🗑️
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

      {/* ── MODAL : INSCRIRE UN MEMBRE MANUELLEMENT ── */}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: "1rem" }}>
          <div style={{ background: "#ffffff", borderRadius: "24px", width: "100%", maxWidth: "520px", padding: "2rem", boxShadow: "0 20px 50px rgba(0,0,0,0.2)", border: "1px solid #e2e8f0" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
              <div>
                <h3 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#0f172a", margin: 0 }}>
                  Inscrire un Membre à un Événement
                </h3>
                <p style={{ fontSize: "0.8125rem", color: "#64748b", margin: "2px 0 0" }}>
                  Ajoutez manuellement un participant à la liste d'émargement
                </p>
              </div>
              <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", fontSize: "1.25rem", cursor: "pointer", color: "#94a3b8" }}>
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateRegistration} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {/* Sélectionner le membre */}
              <div>
                <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "#334155", marginBottom: "0.375rem" }}>
                  Sélectionner le Membre <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <select
                  name="userId"
                  required
                  style={{ width: "100%", padding: "0.75rem 1rem", borderRadius: "10px", border: "1.5px solid #e2e8f0", fontSize: "0.875rem", boxSizing: "border-box" }}
                >
                  <option value="">-- Choisir un utilisateur inscrit --</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.firstName} {u.lastName} ({u.email}) {u.church ? `- ${u.church}` : ""}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sélectionner l'activité */}
              <div>
                <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "#334155", marginBottom: "0.375rem" }}>
                  Événement Cible <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <select
                  name="activityId"
                  required
                  style={{ width: "100%", padding: "0.75rem 1rem", borderRadius: "10px", border: "1.5px solid #e2e8f0", fontSize: "0.875rem", boxSizing: "border-box" }}
                >
                  <option value="">-- Choisir une activité --</option>
                  {activities.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.title} ({new Date(a.startDate).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })})
                    </option>
                  ))}
                </select>
              </div>

              {/* Statut initial */}
              <div>
                <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "#334155", marginBottom: "0.375rem" }}>
                  Statut de l'Inscription
                </label>
                <select
                  name="status"
                  defaultValue="CONFIRMED"
                  style={{ width: "100%", padding: "0.75rem 1rem", borderRadius: "10px", border: "1.5px solid #e2e8f0", fontSize: "0.875rem", boxSizing: "border-box" }}
                >
                  <option value="CONFIRMED">🟢 Confirmé</option>
                  <option value="PENDING">🟡 En attente de confirmation</option>
                </select>
              </div>

              {/* Actions */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "1rem" }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{ padding: "0.625rem 1.25rem", borderRadius: "10px", border: "1px solid #e2e8f0", background: "#fff", color: "#64748b", fontWeight: 600, fontSize: "0.875rem", cursor: "pointer" }}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  style={{ padding: "0.625rem 1.5rem", borderRadius: "10px", border: "none", background: isPending ? "#93c5fd" : "linear-gradient(135deg, #0EA5E9, #0284C7)", color: "#fff", fontWeight: 700, fontSize: "0.875rem", cursor: isPending ? "not-allowed" : "pointer" }}
                >
                  {isPending ? "Inscription..." : "Valider l'Inscription"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL : MODIFIER UNE INSCRIPTION ── */}
      {editingRegistration && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: "1rem" }}>
          <div style={{ background: "#ffffff", borderRadius: "24px", width: "100%", maxWidth: "520px", padding: "2rem", boxShadow: "0 20px 50px rgba(0,0,0,0.2)", border: "1px solid #e2e8f0" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
              <div>
                <h3 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#0f172a", margin: 0 }}>
                  Modifier l'Inscription
                </h3>
                <p style={{ fontSize: "0.8125rem", color: "#64748b", margin: "2px 0 0" }}>
                  Mettez à jour le participant, l'événement assigné ou le statut
                </p>
              </div>
              <button onClick={() => setEditingRegistration(null)} style={{ background: "none", border: "none", fontSize: "1.25rem", cursor: "pointer", color: "#94a3b8" }}>
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateRegistration} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {/* Membre */}
              <div>
                <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "#334155", marginBottom: "0.375rem" }}>
                  Membre Inscrit <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <select
                  name="userId"
                  defaultValue={editingRegistration.user.id}
                  required
                  style={{ width: "100%", padding: "0.75rem 1rem", borderRadius: "10px", border: "1.5px solid #e2e8f0", fontSize: "0.875rem", boxSizing: "border-box" }}
                >
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.firstName} {u.lastName} ({u.email}) {u.church ? `- ${u.church}` : ""}
                    </option>
                  ))}
                </select>
              </div>

              {/* Activité */}
              <div>
                <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "#334155", marginBottom: "0.375rem" }}>
                  Événement Cible <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <select
                  name="activityId"
                  defaultValue={editingRegistration.activity.id}
                  required
                  style={{ width: "100%", padding: "0.75rem 1rem", borderRadius: "10px", border: "1.5px solid #e2e8f0", fontSize: "0.875rem", boxSizing: "border-box" }}
                >
                  {activities.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.title} ({new Date(a.startDate).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })})
                    </option>
                  ))}
                </select>
              </div>

              {/* Statut */}
              <div>
                <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "#334155", marginBottom: "0.375rem" }}>
                  Statut de l'Inscription
                </label>
                <select
                  name="status"
                  defaultValue={editingRegistration.status}
                  style={{ width: "100%", padding: "0.75rem 1rem", borderRadius: "10px", border: "1.5px solid #e2e8f0", fontSize: "0.875rem", boxSizing: "border-box" }}
                >
                  <option value="CONFIRMED">🟢 Confirmé</option>
                  <option value="PENDING">🟡 En attente de confirmation</option>
                  <option value="CANCELLED">🔴 Annulé</option>
                </select>
              </div>

              {/* Actions */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "1rem" }}>
                <button
                  type="button"
                  onClick={() => setEditingRegistration(null)}
                  style={{ padding: "0.625rem 1.25rem", borderRadius: "10px", border: "1px solid #e2e8f0", background: "#fff", color: "#64748b", fontWeight: 600, fontSize: "0.875rem", cursor: "pointer" }}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  style={{ padding: "0.625rem 1.5rem", borderRadius: "10px", border: "none", background: isPending ? "#93c5fd" : "linear-gradient(135deg, #0EA5E9, #0284C7)", color: "#fff", fontWeight: 700, fontSize: "0.875rem", cursor: isPending ? "not-allowed" : "pointer" }}
                >
                  {isPending ? "Enregistrement..." : "Enregistrer les modifications"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL : CONFIRMATION DÉSINSCRIPTION ── */}
      {regToDelete && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: "1rem" }}>
          <div style={{ background: "#ffffff", borderRadius: "20px", padding: "2rem", maxWidth: "420px", width: "100%", textAlign: "center" }}>
            <div style={{ width: "60px", height: "60px", borderRadius: "50%", background: "#fef2f2", color: "#ef4444", fontSize: "1.75rem", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem" }}>
              ⚠️
            </div>
            <h3 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#1e293b", margin: "0 0 0.5rem" }}>
              Désinscrire ce participant ?
            </h3>
            <p style={{ fontSize: "0.875rem", color: "#64748b", margin: "0 0 1.5rem", lineHeight: 1.5 }}>
              Êtes-vous sûr de vouloir retirer <strong>{regToDelete.user.firstName} {regToDelete.user.lastName}</strong> de l'événement <strong>{regToDelete.activity.title}</strong> ?
            </p>
            <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
              <button
                onClick={() => setRegToDelete(null)}
                style={{ padding: "0.625rem 1.25rem", borderRadius: "10px", border: "1px solid #e2e8f0", background: "#fff", color: "#64748b", fontWeight: 600, fontSize: "0.875rem", cursor: "pointer" }}
              >
                Annuler
              </button>
              <button
                onClick={handleDeleteRegistration}
                disabled={isPending}
                style={{ padding: "0.625rem 1.5rem", borderRadius: "10px", border: "none", background: "#ef4444", color: "#fff", fontWeight: 700, fontSize: "0.875rem", cursor: isPending ? "not-allowed" : "pointer" }}
              >
                {isPending ? "Désinscription..." : "Oui, désinscrire"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
