"use client"

import { useState } from "react"
import Link from "next/link"
import { createActivity, updateActivity, deleteActivity } from "@/app/actions/activityActions"

interface ActivityItem {
  id: string
  title: string
  description: string
  startDate: Date
  location: string
  maxParticipants: number | null
  createdAt: Date
  _count: {
    registrations: number
  }
}

interface ActivitiesTableProps {
  activities: ActivityItem[]
}

export default function ActivitiesTable({ activities }: ActivitiesTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingActivity, setEditingActivity] = useState<ActivityItem | null>(null)
  const [activityToDelete, setActivityToDelete] = useState<ActivityItem | null>(null)
  const [isPending, setIsPending] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  const normalize = (str: string | null | undefined) =>
    (str || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim()

  // Filtrage
  const filteredActivities = activities.filter((a) => {
    if (!searchTerm.trim()) return true
    const term = normalize(searchTerm)
    return (
      normalize(a.title).includes(term) ||
      normalize(a.location).includes(term) ||
      normalize(a.description).includes(term)
    )
  })

  const handleOpenCreate = () => {
    setEditingActivity(null)
    setErrorMessage("")
    setIsModalOpen(true)
  }

  const handleOpenEdit = (activity: ActivityItem) => {
    setEditingActivity(activity)
    setErrorMessage("")
    setIsModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsPending(true)
    setErrorMessage("")

    const formData = new FormData(e.currentTarget)
    let res: { error?: string; success?: boolean }

    if (editingActivity) {
      res = await updateActivity(editingActivity.id, formData)
    } else {
      res = await createActivity(formData)
    }

    if (res.error) {
      setErrorMessage(res.error)
    } else {
      setIsModalOpen(false)
    }
    setIsPending(false)
  }

  const handleDelete = async () => {
    if (!activityToDelete) return
    setIsPending(true)

    const res = await deleteActivity(activityToDelete.id)
    if (res.error) {
      alert(res.error)
    } else {
      setActivityToDelete(null)
    }
    setIsPending(false)
  }

  return (
    <div style={{ background: "#ffffff", borderRadius: "20px", border: "1px solid #e2e8f0", overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}>
      {/* ── Toolbar ── */}
      <div style={{ padding: "1.5rem", borderBottom: "1px solid #f1f5f9", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "1rem" }}>
        {/* Recherche */}
        <div style={{ position: "relative", minWidth: "280px", flex: "1 1 300px" }}>
          <span style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8", fontSize: "1rem" }}>
            🔍
          </span>
          <input
            type="text"
            placeholder="Rechercher par titre, lieu ou mot-clé..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: "100%",
              padding: "0.625rem 1rem 0.625rem 2.5rem",
              borderRadius: "12px",
              border: "1.5px solid #e2e8f0",
              fontSize: "0.875rem",
              outline: "none",
              color: "#1e293b",
              background: "#f8fafc",
              boxSizing: "border-box",
            }}
          />
        </div>

        {/* Bouton Créer */}
        <button
          onClick={handleOpenCreate}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "0.625rem 1.25rem",
            borderRadius: "12px",
            border: "none",
            background: "linear-gradient(135deg, #0EA5E9, #0284C7)",
            color: "#fff",
            fontWeight: 700,
            fontSize: "0.875rem",
            cursor: "pointer",
            boxShadow: "0 4px 12px rgba(14, 165, 233, 0.3)",
          }}
        >
          <span>＋</span> Nouvelle Activité
        </button>
      </div>

      {/* ── Table ── */}
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.875rem" }}>
          <thead>
            <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0", color: "#64748b", fontWeight: 600, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              <th style={{ padding: "1rem 1.5rem" }}>Événement & Thème</th>
              <th style={{ padding: "1rem 1.5rem" }}>Date & Heure</th>
              <th style={{ padding: "1rem 1.5rem" }}>Lieu</th>
              <th style={{ padding: "1rem 1.5rem" }}>Inscriptions</th>
              <th style={{ padding: "1rem 1.5rem", textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredActivities.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: "3rem", textAlign: "center", color: "#94a3b8" }}>
                  Aucune activité programmée pour le moment.
                </td>
              </tr>
            ) : (
              filteredActivities.map((activity) => {
                const date = new Date(activity.startDate)
                const isPast = date < new Date()

                return (
                  <tr key={activity.id} style={{ borderBottom: "1px solid #f1f5f9", transition: "background 0.2s" }} onMouseEnter={(e) => (e.currentTarget.style.background = "#fafafa")} onMouseLeave={(e) => (e.currentTarget.style.background = "#ffffff")}>
                    <td style={{ padding: "1rem 1.5rem" }}>
                      <p style={{ fontWeight: 700, color: "#1e293b", margin: 0, fontSize: "0.9375rem" }}>
                        {activity.title}
                      </p>
                      <p style={{ fontSize: "0.8125rem", color: "#64748b", margin: "2px 0 0", maxWidth: "350px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {activity.description}
                      </p>
                    </td>

                    <td style={{ padding: "1rem 1.5rem" }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "4px 10px", borderRadius: "8px", background: isPast ? "#f1f5f9" : "#eff6ff", color: isPast ? "#64748b" : "#1d4ed8", fontSize: "0.8125rem", fontWeight: 600 }}>
                        📅 {date.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </td>

                    <td style={{ padding: "1rem 1.5rem", color: "#475569" }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "0.8125rem" }}>
                        📍 {activity.location}
                      </span>
                    </td>

                    <td style={{ padding: "1rem 1.5rem", color: "#64748b", fontSize: "0.8125rem" }}>
                      👥 {activity._count.registrations} {activity.maxParticipants ? `/ ${activity.maxParticipants} max` : "inscrits"}
                    </td>

                    <td style={{ padding: "1rem 1.5rem", textAlign: "right" }}>
                      <div style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                        <Link
                          href="/admin/participants"
                          style={{
                            padding: "6px 12px",
                            borderRadius: "8px",
                            border: "1px solid #bae6fd",
                            background: "#f0f9ff",
                            color: "#0369a1",
                            fontSize: "0.8125rem",
                            fontWeight: 600,
                            textDecoration: "none",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                          }}
                        >
                          👥 Inscrits ({activity._count.registrations})
                        </Link>
                        <button
                          onClick={() => handleOpenEdit(activity)}
                          style={{
                            padding: "6px 12px",
                            borderRadius: "8px",
                            border: "1px solid #e2e8f0",
                            background: "#fff",
                            color: "#475569",
                            fontSize: "0.8125rem",
                            fontWeight: 600,
                            cursor: "pointer",
                          }}
                        >
                          ✏️ Modifier
                        </button>
                        <button
                          onClick={() => setActivityToDelete(activity)}
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
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ── MODAL CRÉATION / ÉDITION ── */}
      {isModalOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: "1rem" }}>
          <div style={{ background: "#fff", borderRadius: "20px", padding: "2rem", maxWidth: "520px", width: "100%", boxShadow: "0 20px 40px rgba(0,0,0,0.2)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
              <h3 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#1e293b", margin: 0 }}>
                {editingActivity ? "Modifier l'Activité" : "Nouvelle Activité"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: "transparent", border: "none", fontSize: "1.25rem", cursor: "pointer", color: "#64748b" }}>
                ✕
              </button>
            </div>

            {errorMessage && (
              <div style={{ padding: "0.75rem 1rem", borderRadius: "10px", background: "#fef2f2", color: "#991b1b", border: "1px solid #fecaca", marginBottom: "1rem", fontSize: "0.875rem" }}>
                ⚠️ {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "#374151", marginBottom: "0.375rem" }}>
                  Titre de l'Événement *
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  defaultValue={editingActivity?.title || ""}
                  placeholder="Ex: Veillée de Prière & Louange"
                  style={{ width: "100%", padding: "0.625rem 0.875rem", borderRadius: "10px", border: "1.5px solid #e2e8f0", fontSize: "0.875rem", boxSizing: "border-box" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "#374151", marginBottom: "0.375rem" }}>
                  Description & Thème *
                </label>
                <textarea
                  name="description"
                  required
                  rows={3}
                  defaultValue={editingActivity?.description || ""}
                  placeholder="Détails du programme, orateurs, objectifs spirituels..."
                  style={{ width: "100%", padding: "0.625rem 0.875rem", borderRadius: "10px", border: "1.5px solid #e2e8f0", fontSize: "0.875rem", boxSizing: "border-box", resize: "vertical" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "#374151", marginBottom: "0.375rem" }}>
                    Date & Heure *
                  </label>
                  <input
                    type="datetime-local"
                    name="startDate"
                    required
                    defaultValue={editingActivity ? new Date(editingActivity.startDate).toISOString().slice(0, 16) : ""}
                    style={{ width: "100%", padding: "0.625rem 0.875rem", borderRadius: "10px", border: "1.5px solid #e2e8f0", fontSize: "0.875rem", boxSizing: "border-box" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "#374151", marginBottom: "0.375rem" }}>
                    Places Max (optionnel)
                  </label>
                  <input
                    type="number"
                    name="maxParticipants"
                    min="1"
                    defaultValue={editingActivity?.maxParticipants || ""}
                    placeholder="Illimité"
                    style={{ width: "100%", padding: "0.625rem 0.875rem", borderRadius: "10px", border: "1.5px solid #e2e8f0", fontSize: "0.875rem", boxSizing: "border-box" }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "#374151", marginBottom: "0.375rem" }}>
                  Lieu / Adresse *
                </label>
                <input
                  type="text"
                  name="location"
                  required
                  defaultValue={editingActivity?.location || ""}
                  placeholder="Ex: Temple Central, Lomé ou En Ligne (Zoom)"
                  style={{ width: "100%", padding: "0.625rem 0.875rem", borderRadius: "10px", border: "1.5px solid #e2e8f0", fontSize: "0.875rem", boxSizing: "border-box" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "1rem" }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{ padding: "0.625rem 1.25rem", borderRadius: "10px", border: "1px solid #e2e8f0", background: "#fff", color: "#64748b", fontWeight: 600, fontSize: "0.875rem", cursor: "pointer" }}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  style={{ padding: "0.625rem 1.5rem", borderRadius: "10px", border: "none", background: isPending ? "#93c5fd" : "linear-gradient(135deg, #0EA5E9, #0284C7)", color: "#fff", fontWeight: 700, fontSize: "0.875rem", cursor: isPending ? "not-allowed" : "pointer" }}
                >
                  {isPending ? "Enregistrement..." : editingActivity ? "Enregistrer les modifications" : "Créer l'activité"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL SUPPRESSION ── */}
      {activityToDelete && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: "1rem" }}>
          <div style={{ background: "#fff", borderRadius: "20px", padding: "2rem", maxWidth: "420px", width: "100%", textAlign: "center" }}>
            <div style={{ width: "60px", height: "60px", borderRadius: "50%", background: "#fef2f2", color: "#ef4444", fontSize: "1.75rem", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem" }}>
              ⚠️
            </div>
            <h3 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#1e293b", margin: "0 0 0.5rem" }}>
              Supprimer cette activité ?
            </h3>
            <p style={{ fontSize: "0.875rem", color: "#64748b", margin: "0 0 1.5rem", lineHeight: 1.5 }}>
              Êtes-vous sûr de vouloir supprimer l'activité <strong>{activityToDelete.title}</strong> ?
            </p>
            <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
              <button
                onClick={() => setActivityToDelete(null)}
                style={{ padding: "0.625rem 1.25rem", borderRadius: "10px", border: "1px solid #e2e8f0", background: "#fff", color: "#64748b", fontWeight: 600, fontSize: "0.875rem", cursor: "pointer" }}
              >
                Annuler
              </button>
              <button
                onClick={handleDelete}
                disabled={isPending}
                style={{ padding: "0.625rem 1.5rem", borderRadius: "10px", border: "none", background: "#ef4444", color: "#fff", fontWeight: 700, fontSize: "0.875rem", cursor: isPending ? "not-allowed" : "pointer" }}
              >
                {isPending ? "Suppression..." : "Oui, supprimer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
