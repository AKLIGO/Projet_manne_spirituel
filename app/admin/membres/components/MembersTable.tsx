"use client"

import { useState } from "react"
import Image from "next/image"
import { updateUserRoles, deleteUser } from "@/app/actions/memberActions"

interface RoleItem {
  id: string
  name: string
  description?: string | null
}

interface UserItem {
  id: string
  firstName: string
  lastName: string
  email: string
  profileImage: string | null
  church: string | null
  createdAt: Date
  roles: {
    id: string
    name: string
  }[]
  _count: {
    donations: number
    createdProjects: number
    registrations: number
  }
}

interface MembersTableProps {
  users: UserItem[]
  allRoles: RoleItem[]
  currentUserId?: string
}

export default function MembersTable({ users, allRoles, currentUserId }: MembersTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedRoleFilter, setSelectedRoleFilter] = useState("ALL")
  const [editingUser, setEditingUser] = useState<UserItem | null>(null)
  const [selectedRoleNames, setSelectedRoleNames] = useState<string[]>([])
  const [isPending, setIsPending] = useState(false)
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null)
  const [userToDelete, setUserToDelete] = useState<UserItem | null>(null)

  const normalize = (str: string | null | undefined) =>
    (str || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim()

  // Filtrage
  const filteredUsers = users.filter((u) => {
    const term = normalize(searchTerm)
    const fullName = normalize(`${u.firstName || ""} ${u.lastName || ""}`)
    const email = normalize(u.email)
    const church = normalize(u.church)

    const matchesSearch =
      !term ||
      fullName.includes(term) ||
      email.includes(term) ||
      church.includes(term)

    const matchesRole =
      selectedRoleFilter === "ALL" ||
      u.roles.some((r) => r.name === selectedRoleFilter)

    return matchesSearch && matchesRole
  })

  // Ouvrir le modal d'édition des rôles
  const handleOpenRoleModal = (user: UserItem) => {
    setEditingUser(user)
    setSelectedRoleNames(user.roles.map((r) => r.name))
    setFeedback(null)
  }

  // Toggle un rôle
  const toggleRole = (roleName: string) => {
    if (selectedRoleNames.includes(roleName)) {
      setSelectedRoleNames(selectedRoleNames.filter((r) => r !== roleName))
    } else {
      setSelectedRoleNames([...selectedRoleNames, roleName])
    }
  }

  // Sauvegarder les rôles
  const handleSaveRoles = async () => {
    if (!editingUser) return
    setIsPending(true)
    setFeedback(null)

    const res = await updateUserRoles(editingUser.id, selectedRoleNames)

    if (res.error) {
      setFeedback({ type: "error", message: res.error })
    } else {
      setFeedback({ type: "success", message: `Rôles de ${editingUser.firstName} mis à jour avec succès !` })
      setTimeout(() => {
        setEditingUser(null)
      }, 1200)
    }
    setIsPending(false)
  }

  // Confirmer suppression
  const handleDeleteUser = async () => {
    if (!userToDelete) return
    setIsPending(true)

    const res = await deleteUser(userToDelete.id)

    if (res.error) {
      alert(res.error)
    } else {
      setUserToDelete(null)
    }
    setIsPending(false)
  }

  const getRoleBadgeStyle = (name: string) => {
    switch (name) {
      case "SUPERADMIN":
        return { bg: "#fef3c7", color: "#b45309", border: "#fde68a", icon: "🛡️" }
      case "ADMIN":
        return { bg: "#e0f2fe", color: "#0369a1", border: "#bae6fd", icon: "⚡" }
      case "PASTEUR":
        return { bg: "#ede9fe", color: "#6d28d9", border: "#ddd6fe", icon: "✝️" }
      case "SECRETAIRE":
        return { bg: "#fce7f3", color: "#be185d", border: "#fbcfe8", icon: "📝" }
      case "TRESORIER":
        return { bg: "#d1fae5", color: "#047857", border: "#a7f3d0", icon: "💰" }
      case "MEMBRE":
        return { bg: "#f1f5f9", color: "#334155", border: "#e2e8f0", icon: "🤝" }
      default:
        return { bg: "#f8fafc", color: "#64748b", border: "#e2e8f0", icon: "👤" }
    }
  }

  return (
    <div style={{ background: "#ffffff", borderRadius: "20px", border: "1px solid #e2e8f0", overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}>
      {/* ── Barre d'outils et Filtres ── */}
      <div style={{ padding: "1.5rem", borderBottom: "1px solid #f1f5f9", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "1rem" }}>
        {/* Recherche */}
        <div style={{ position: "relative", minWidth: "280px", flex: "1 1 300px" }}>
          <span style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8", fontSize: "1rem" }}>
            🔍
          </span>
          <input
            type="text"
            placeholder="Rechercher par nom, email ou communauté..."
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

        {/* Filtres par Rôle */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
          <button
            onClick={() => setSelectedRoleFilter("ALL")}
            style={{
              padding: "6px 14px",
              borderRadius: "50px",
              border: "none",
              fontSize: "0.8125rem",
              fontWeight: 600,
              cursor: "pointer",
              background: selectedRoleFilter === "ALL" ? "#0284c7" : "#f1f5f9",
              color: selectedRoleFilter === "ALL" ? "#fff" : "#475569",
              transition: "all 0.2s",
            }}
          >
            Tous ({users.length})
          </button>
          {allRoles.map((role) => {
            const count = users.filter((u) => u.roles.some((r) => r.name === role.name)).length
            const isSelected = selectedRoleFilter === role.name
            return (
              <button
                key={role.id}
                onClick={() => setSelectedRoleFilter(role.name)}
                style={{
                  padding: "6px 14px",
                  borderRadius: "50px",
                  border: "none",
                  fontSize: "0.8125rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  background: isSelected ? "#0284c7" : "#f1f5f9",
                  color: isSelected ? "#fff" : "#475569",
                  transition: "all 0.2s",
                }}
              >
                {role.name} ({count})
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Tableau des Membres ── */}
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.875rem" }}>
          <thead>
            <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0", color: "#64748b", fontWeight: 600, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              <th style={{ padding: "1rem 1.5rem" }}>Utilisateur / Profil</th>
              <th style={{ padding: "1rem 1.5rem" }}>Communauté / Église</th>
              <th style={{ padding: "1rem 1.5rem" }}>Rôles Attribués</th>
              <th style={{ padding: "1rem 1.5rem" }}>Engagement</th>
              <th style={{ padding: "1rem 1.5rem" }}>Inscrit le</th>
              <th style={{ padding: "1rem 1.5rem", textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: "3rem", textAlign: "center", color: "#94a3b8" }}>
                  Aucun membre trouvé correspondant à vos critères.
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => {
                const isSelf = user.id === currentUserId
                return (
                  <tr key={user.id} style={{ borderBottom: "1px solid #f1f5f9", transition: "background 0.2s" }} onMouseEnter={(e) => (e.currentTarget.style.background = "#fafafa")} onMouseLeave={(e) => (e.currentTarget.style.background = "#ffffff")}>
                    {/* Nom & Email */}
                    <td style={{ padding: "1rem 1.5rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div style={{ width: "42px", height: "42px", borderRadius: "50%", background: "linear-gradient(135deg, #0EA5E9, #0284C7)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: "0.9375rem", overflow: "hidden", flexShrink: 0, position: "relative" }}>
                          {user.profileImage ? (
                            <Image src={user.profileImage} alt={user.firstName} fill sizes="42px" style={{ objectFit: "cover" }} />
                          ) : (
                            `${user.firstName[0] || ""}${user.lastName[0] || ""}`.toUpperCase()
                          )}
                        </div>
                        <div>
                          <p style={{ fontWeight: 700, color: "#1e293b", margin: 0, fontSize: "0.9375rem" }}>
                            {user.firstName} {user.lastName} {isSelf && <span style={{ fontSize: "0.6875rem", background: "#e0f2fe", color: "#0369a1", padding: "2px 6px", borderRadius: "4px", marginLeft: "4px" }}>Vous</span>}
                          </p>
                          <p style={{ fontSize: "0.8125rem", color: "#64748b", margin: "2px 0 0" }}>{user.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Église */}
                    <td style={{ padding: "1rem 1.5rem", color: "#475569" }}>
                      {user.church ? (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "0.8125rem" }}>
                          🏛️ {user.church}
                        </span>
                      ) : (
                        <span style={{ color: "#94a3b8", fontStyle: "italic", fontSize: "0.8125rem" }}>Non renseignée</span>
                      )}
                    </td>

                    {/* Rôles */}
                    <td style={{ padding: "1rem 1.5rem" }}>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                        {user.roles.map((r) => {
                          const badge = getRoleBadgeStyle(r.name)
                          return (
                            <span
                              key={r.id}
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "4px",
                                padding: "3px 10px",
                                borderRadius: "50px",
                                background: badge.bg,
                                color: badge.color,
                                border: `1px solid ${badge.border}`,
                                fontSize: "0.75rem",
                                fontWeight: 700,
                                textTransform: "uppercase",
                              }}
                            >
                              <span>{badge.icon}</span>
                              {r.name}
                            </span>
                          )
                        })}
                      </div>
                    </td>

                    {/* Engagement */}
                    <td style={{ padding: "1rem 1.5rem", color: "#64748b", fontSize: "0.8125rem" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                        <span>🪙 {user._count.donations} don(s)</span>
                        <span>📁 {user._count.createdProjects} projet(s)</span>
                      </div>
                    </td>

                    {/* Date d'inscription */}
                    <td style={{ padding: "1rem 1.5rem", color: "#64748b", fontSize: "0.8125rem" }}>
                      {new Date(user.createdAt).toLocaleDateString("fr-FR", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>

                    {/* Actions */}
                    <td style={{ padding: "1rem 1.5rem", textAlign: "right" }}>
                      <div style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                        <button
                          onClick={() => handleOpenRoleModal(user)}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            padding: "6px 12px",
                            borderRadius: "8px",
                            border: "1px solid #bae6fd",
                            background: "#f0f9ff",
                            color: "#0369a1",
                            fontSize: "0.8125rem",
                            fontWeight: 600,
                            cursor: "pointer",
                            transition: "all 0.2s",
                          }}
                        >
                          ⚙️ Gérer Rôles
                        </button>

                        {!isSelf && (
                          <button
                            onClick={() => setUserToDelete(user)}
                            title="Supprimer l'utilisateur"
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
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ── MODAL : GESTION DES RÔLES ── */}
      {editingUser && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: "1rem" }}>
          <div style={{ background: "#fff", borderRadius: "20px", padding: "2rem", maxWidth: "500px", width: "100%", boxShadow: "0 20px 40px rgba(0,0,0,0.2)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
              <h3 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#1e293b", margin: 0 }}>
                Attribution des Rôles
              </h3>
              <button onClick={() => setEditingUser(null)} style={{ background: "transparent", border: "none", fontSize: "1.25rem", cursor: "pointer", color: "#64748b" }}>
                ✕
              </button>
            </div>

            <p style={{ fontSize: "0.875rem", color: "#64748b", marginBottom: "1.5rem" }}>
              Sélectionnez les rôles accordés à <strong>{editingUser.firstName} {editingUser.lastName}</strong> ({editingUser.email}) :
            </p>

            {feedback && (
              <div style={{ padding: "0.75rem 1rem", borderRadius: "10px", marginBottom: "1.25rem", fontSize: "0.875rem", background: feedback.type === "success" ? "#ecfdf5" : "#fef2f2", color: feedback.type === "success" ? "#065f46" : "#991b1b", border: `1px solid ${feedback.type === "success" ? "#a7f3d0" : "#fecaca"}` }}>
                {feedback.message}
              </div>
            )}

            {/* Liste des rôles sous forme de Checkboxes stylisées */}
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "2rem", maxHeight: "280px", overflowY: "auto" }}>
              {allRoles.map((role) => {
                const isChecked = selectedRoleNames.includes(role.name)
                const badge = getRoleBadgeStyle(role.name)
                return (
                  <label
                    key={role.id}
                    onClick={() => toggleRole(role.name)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "12px 16px",
                      borderRadius: "12px",
                      border: `1.5px solid ${isChecked ? "#0284c7" : "#e2e8f0"}`,
                      background: isChecked ? "#f0f9ff" : "#ffffff",
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}} // géré par le parent
                        style={{ width: "18px", height: "18px", accentColor: "#0284c7", cursor: "pointer" }}
                      />
                      <div>
                        <p style={{ margin: 0, fontWeight: 700, fontSize: "0.875rem", color: isChecked ? "#0369a1" : "#1e293b" }}>
                          {badge.icon} {role.name}
                        </p>
                        {role.description && (
                          <p style={{ margin: "2px 0 0", fontSize: "0.75rem", color: "#64748b" }}>
                            {role.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </label>
                )
              })}
            </div>

            {/* Boutons d'action */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "10px" }}>
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                style={{
                  padding: "0.625rem 1.25rem",
                  borderRadius: "10px",
                  border: "1px solid #e2e8f0",
                  background: "#fff",
                  color: "#64748b",
                  fontWeight: 600,
                  fontSize: "0.875rem",
                  cursor: "pointer",
                }}
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleSaveRoles}
                disabled={isPending}
                style={{
                  padding: "0.625rem 1.5rem",
                  borderRadius: "10px",
                  border: "none",
                  background: isPending ? "#93c5fd" : "linear-gradient(135deg, #0EA5E9, #0284C7)",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: "0.875rem",
                  cursor: isPending ? "not-allowed" : "pointer",
                  boxShadow: "0 4px 12px rgba(14, 165, 233, 0.3)",
                }}
              >
                {isPending ? "Enregistrement..." : "Appliquer les Rôles"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL : CONFIRMATION SUPPRESSION ── */}
      {userToDelete && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: "1rem" }}>
          <div style={{ background: "#fff", borderRadius: "20px", padding: "2rem", maxWidth: "420px", width: "100%", textAlign: "center" }}>
            <div style={{ width: "60px", height: "60px", borderRadius: "50%", background: "#fef2f2", color: "#ef4444", fontSize: "1.75rem", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem" }}>
              ⚠️
            </div>
            <h3 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#1e293b", margin: "0 0 0.5rem" }}>
              Supprimer cet utilisateur ?
            </h3>
            <p style={{ fontSize: "0.875rem", color: "#64748b", margin: "0 0 1.5rem", lineHeight: 1.5 }}>
              Êtes-vous sûr de vouloir supprimer définitivement le compte de <strong>{userToDelete.firstName} {userToDelete.lastName}</strong> ? Cette action est irréversible.
            </p>
            <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
              <button
                onClick={() => setUserToDelete(null)}
                style={{
                  padding: "0.625rem 1.25rem",
                  borderRadius: "10px",
                  border: "1px solid #e2e8f0",
                  background: "#fff",
                  color: "#64748b",
                  fontWeight: 600,
                  fontSize: "0.875rem",
                  cursor: "pointer",
                }}
              >
                Annuler
              </button>
              <button
                onClick={handleDeleteUser}
                disabled={isPending}
                style={{
                  padding: "0.625rem 1.5rem",
                  borderRadius: "10px",
                  border: "none",
                  background: "#ef4444",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: "0.875rem",
                  cursor: isPending ? "not-allowed" : "pointer",
                }}
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
