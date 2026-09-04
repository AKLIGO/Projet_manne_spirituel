"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import {
  toggleProjectStatus,
  deleteProject,
  addProjectMember,
  updateProjectMember,
  removeProjectMember,
} from "@/app/actions/projectActions"
import { ProjectStatus } from "@/generated/prisma/enums"

export interface UserOption {
  id: string
  firstName: string
  lastName: string
  email: string
  profileImage?: string | null
  church?: string | null
}

export interface ProjectMemberData {
  id: string
  role: string
  notes: string | null
  user: {
    id: string
    firstName: string
    lastName: string
    email: string
    profileImage: string | null
    church?: string | null
  }
}

export interface ProjectItem {
  id: string
  title: string
  description: string
  targetAmount: number | null
  currentAmount: number
  status: ProjectStatus
  createdAt: Date
  author?: {
    firstName: string
    lastName: string
  } | null
  media?: {
    id: string
    url: string
  }[]
  team?: ProjectMemberData[]
  _count?: {
    donations: number
  }
}

interface ProjectsTableProps {
  projects: ProjectItem[]
  availableUsers?: UserOption[]
}

export default function ProjectsTable({ projects: initialProjects, availableUsers = [] }: ProjectsTableProps) {
  const [projects, setProjects] = useState(initialProjects)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("ALL")
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [toast, setToast] = useState<{ type: "success" | "error"; text: string } | null>(null)

  // Modal Équipe
  const [managingTeamProject, setManagingTeamProject] = useState<ProjectItem | null>(null)
  const [newMemberUserId, setNewMemberUserId] = useState("")
  const [newMemberRole, setNewMemberRole] = useState("Chef de Projet")
  const [newMemberNotes, setNewMemberNotes] = useState("")
  const [isSubmittingTeam, setIsSubmittingTeam] = useState(false)

  // Édition d'un membre existant dans le modal
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null)
  const [editRole, setEditRole] = useState("")
  const [editNotes, setEditNotes] = useState("")

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat("fr-FR").format(amount) + " FCFA"
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  }

  const normalize = (str: string | null | undefined) =>
    (str || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim()

  // Filtrage
  const filteredProjects = projects.filter((p) => {
    const term = normalize(search)
    const teamNames = p.team
      ? p.team.map((t) => `${t.user.firstName} ${t.user.lastName} ${t.role} ${t.notes || ""}`).join(" ")
      : ""

    const matchesSearch =
      !term ||
      normalize(p.title).includes(term) ||
      normalize(p.description).includes(term) ||
      normalize(teamNames).includes(term)

    const matchesStatus = statusFilter === "ALL" || p.status === statusFilter

    return matchesSearch && matchesStatus
  })

  // Changer de statut
  const handleStatusChange = async (id: string, newStatus: ProjectStatus) => {
    setActionLoading(id)
    const res = await toggleProjectStatus(id, newStatus)
    if (res.success) {
      setProjects((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status: newStatus } : p))
      )
      setToast({ type: "success", text: "Statut du projet mis à jour." })
    } else {
      setToast({ type: "error", text: res.error || "Erreur lors du changement." })
    }
    setActionLoading(null)
  }

  // Supprimer un projet
  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer définitivement ce projet ?")) {
      return
    }

    const res = await deleteProject(id)
    if (res.success) {
      setProjects((prev) => prev.filter((p) => p.id !== id))
      setToast({ type: "success", text: "Projet supprimé avec succès." })
    } else {
      setToast({ type: "error", text: res.error || "Erreur lors de la suppression." })
    }
  }

  // ── GESTION D'ÉQUIPE VIA MODAL ──
  const handleOpenTeamModal = (project: ProjectItem) => {
    setManagingTeamProject(project)
    setNewMemberUserId("")
    setNewMemberRole("Chef de Projet")
    setNewMemberNotes("")
    setEditingMemberId(null)
  }

  const handleAddMemberToProject = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!managingTeamProject || !newMemberUserId) return

    setIsSubmittingTeam(true)
    const res = await addProjectMember(
      managingTeamProject.id,
      newMemberUserId,
      newMemberRole,
      newMemberNotes
    )

    if (res.success) {
      const foundUser = availableUsers.find((u) => u.id === newMemberUserId)
      const newTeamMember: ProjectMemberData = {
        id: `temp-${Date.now()}`,
        role: newMemberRole || "Membre de l'équipe",
        notes: newMemberNotes || null,
        user: {
          id: newMemberUserId,
          firstName: foundUser?.firstName || "Membre",
          lastName: foundUser?.lastName || "",
          email: foundUser?.email || "",
          profileImage: foundUser?.profileImage || null,
          church: foundUser?.church || null,
        },
      }

      // Mise à jour locale
      const updatedProject = {
        ...managingTeamProject,
        team: [...(managingTeamProject.team || []), newTeamMember],
      }
      setManagingTeamProject(updatedProject)
      setProjects((prev) => prev.map((p) => (p.id === updatedProject.id ? updatedProject : p)))

      setToast({ type: "success", text: "Intervenant assigné au projet avec succès !" })
      setNewMemberUserId("")
      setNewMemberRole("Chef de Projet")
      setNewMemberNotes("")
    } else {
      setToast({ type: "error", text: res.error || "Erreur lors de l'assignation." })
    }
    setIsSubmittingTeam(false)
  }

  const handleStartEditMember = (member: ProjectMemberData) => {
    setEditingMemberId(member.id)
    setEditRole(member.role)
    setEditNotes(member.notes || "")
  }

  const handleSaveEditMember = async (memberId: string) => {
    if (!managingTeamProject) return
    setIsSubmittingTeam(true)

    const res = await updateProjectMember(memberId, editRole, editNotes)
    if (res.success) {
      const updatedTeam = (managingTeamProject.team || []).map((m) =>
        m.id === memberId ? { ...m, role: editRole, notes: editNotes } : m
      )
      const updatedProject = { ...managingTeamProject, team: updatedTeam }
      setManagingTeamProject(updatedProject)
      setProjects((prev) => prev.map((p) => (p.id === updatedProject.id ? updatedProject : p)))

      setEditingMemberId(null)
      setToast({ type: "success", text: "Rôle et description de l'intervenant mis à jour." })
    } else {
      setToast({ type: "error", text: res.error || "Erreur lors de la modification." })
    }
    setIsSubmittingTeam(false)
  }

  const handleRemoveMember = async (memberId: string) => {
    if (!managingTeamProject || !confirm("Voulez-vous retirer cet intervenant du projet ?")) return

    setIsSubmittingTeam(true)
    const res = await removeProjectMember(memberId)
    if (res.success) {
      const updatedTeam = (managingTeamProject.team || []).filter((m) => m.id !== memberId)
      const updatedProject = { ...managingTeamProject, team: updatedTeam }
      setManagingTeamProject(updatedProject)
      setProjects((prev) => prev.map((p) => (p.id === updatedProject.id ? updatedProject : p)))

      setToast({ type: "success", text: "Intervenant retiré du projet." })
    } else {
      setToast({ type: "error", text: res.error || "Erreur lors du retrait." })
    }
    setIsSubmittingTeam(false)
  }

  const getStatusBadge = (status: ProjectStatus) => {
    switch (status) {
      case "ACTIVE":
        return { bg: "#f0fdf4", color: "#166534", border: "#bbf7d0", label: "En cours" }
      case "PLANNING":
        return { bg: "#fffbeb", color: "#b45309", border: "#fde68a", label: "Planifié" }
      case "COMPLETED":
        return { bg: "#eff6ff", color: "#1d4ed8", border: "#bfdbfe", label: "Terminé" }
      default:
        return { bg: "#f8fafc", color: "#64748b", border: "#e2e8f0", label: status }
    }
  }

  const roleSuggestions = [
    "👑 Chef de Projet",
    "💰 Trésorier Dédié",
    "📦 Logistique & Matériel",
    "📢 Communication",
    "🤝 Bénévole",
  ]

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
          <button
            onClick={() => setToast(null)}
            style={{ background: "none", border: "none", cursor: "pointer", color: "inherit", fontWeight: 700 }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Barre de Filtres et Recherche */}
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
        {/* Barre de Recherche */}
        <div style={{ position: "relative", minWidth: "280px", flex: "1 1 300px" }}>
          <span style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }}>
            🔍
          </span>
          <input
            type="text"
            placeholder="Rechercher par titre, description ou membre..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%",
              padding: "0.625rem 1rem 0.625rem 2.5rem",
              borderRadius: "10px",
              border: "1.5px solid #e2e8f0",
              fontSize: "0.875rem",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>

        {/* Filtres de statut (Pilules) */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
          {[
            { id: "ALL", label: "Tous" },
            { id: "ACTIVE", label: "En cours" },
            { id: "PLANNING", label: "Planifiés" },
            { id: "COMPLETED", label: "Terminés" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              style={{
                padding: "0.5rem 1rem",
                borderRadius: "8px",
                fontSize: "0.8125rem",
                fontWeight: statusFilter === tab.id ? 700 : 500,
                border: "none",
                cursor: "pointer",
                background: statusFilter === tab.id ? "#0ea5e9" : "#f1f5f9",
                color: statusFilter === tab.id ? "#ffffff" : "#475569",
                transition: "all 0.2s ease",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tableau des Projets */}
      <div
        style={{
          background: "#ffffff",
          borderRadius: "20px",
          border: "1px solid #e2e8f0",
          boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
          overflow: "hidden",
        }}
      >
        {filteredProjects.length === 0 ? (
          <div style={{ padding: "4rem 1.5rem", textAlign: "center", color: "#94a3b8" }}>
            <div style={{ fontSize: "3rem", marginBottom: "0.75rem" }}>📁</div>
            <h4 style={{ fontSize: "1.125rem", fontWeight: 700, color: "#1e293b", margin: "0 0 0.25rem" }}>
              Aucun projet trouvé
            </h4>
            <p style={{ fontSize: "0.875rem", color: "#64748b", margin: "0 0 1.25rem" }}>
              {search || statusFilter !== "ALL"
                ? "Essayez de modifier vos critères de recherche ou de filtre."
                : "Commencez par créer votre première campagne de projet."}
            </p>
            <Link
              href="/admin/projets/nouveau"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "0.6875rem 1.5rem",
                borderRadius: "50px",
                background: "linear-gradient(135deg, #0EA5E9, #0284C7)",
                color: "#fff",
                fontWeight: 700,
                fontSize: "0.875rem",
                textDecoration: "none",
                boxShadow: "0 4px 12px rgba(14, 165, 233, 0.3)",
              }}
            >
              + Nouveau Projet
            </Link>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.875rem" }}>
              <thead>
                <tr style={{ background: "#f8fafc", borderBottom: "1.5px solid #e2e8f0", color: "#64748b", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  <th style={{ padding: "1rem 1.25rem", fontWeight: 700 }}>Projet & Équipe</th>
                  <th style={{ padding: "1rem 0.75rem", fontWeight: 700 }}>Objectif & Récolté</th>
                  <th style={{ padding: "1rem 0.75rem", fontWeight: 700 }}>Progression</th>
                  <th style={{ padding: "1rem 0.75rem", fontWeight: 700 }}>Statut</th>
                  <th style={{ padding: "1rem 0.75rem", fontWeight: 700 }}>Date</th>
                  <th style={{ padding: "1rem 1.25rem", fontWeight: 700, textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProjects.map((p) => {
                  const target = p.targetAmount || 1
                  const percentage = Math.min(100, Math.round((p.currentAmount / target) * 100))
                  const statusBadge = getStatusBadge(p.status)
                  const coverImage = p.media?.[0]?.url || null
                  const team = p.team || []

                  return (
                    <tr
                      key={p.id}
                      style={{
                        borderBottom: "1px solid #f1f5f9",
                        transition: "background 0.15s ease",
                      }}
                      className="project-row"
                    >
                      {/* Titre, Cover & Équipe */}
                      <td style={{ padding: "1rem 1.25rem" }}>
                        <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                          <div
                            style={{
                              width: "48px",
                              height: "48px",
                              borderRadius: "10px",
                              overflow: "hidden",
                              background: "#e2e8f0",
                              position: "relative",
                              flexShrink: 0,
                            }}
                          >
                            {coverImage ? (
                              <Image
                                src={coverImage}
                                alt={p.title}
                                fill
                                sizes="48px"
                                style={{ objectFit: "cover" }}
                              />
                            ) : (
                              <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.25rem", background: "linear-gradient(135deg, #0EA5E9, #0284C7)", color: "#fff" }}>
                                ✝
                              </div>
                            )}
                          </div>

                          <div>
                            <p style={{ fontWeight: 800, color: "#0f172a", margin: "0 0 2px", fontSize: "0.9375rem" }}>
                              {p.title}
                            </p>
                            <p style={{ fontSize: "0.75rem", color: "#64748b", margin: "0 0 6px", maxWidth: "260px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {p.description}
                            </p>

                            {/* Équipe Assignée Pills */}
                            {team.length > 0 ? (
                              <div style={{ display: "flex", alignItems: "center", gap: "4px", flexWrap: "wrap" }}>
                                {team.slice(0, 3).map((m) => (
                                  <span
                                    key={m.id}
                                    title={m.notes ? `${m.role} : "${m.notes}"` : m.role}
                                    style={{
                                      fontSize: "0.6875rem",
                                      fontWeight: 600,
                                      background: "#f0f9ff",
                                      color: "#0369a1",
                                      border: "1px solid #bae6fd",
                                      padding: "1px 6px",
                                      borderRadius: "50px",
                                      display: "inline-flex",
                                      alignItems: "center",
                                      gap: "3px",
                                    }}
                                  >
                                    👤 {m.user.firstName} ({m.role})
                                  </span>
                                ))}
                                {team.length > 3 && (
                                  <span style={{ fontSize: "0.6875rem", color: "#64748b", fontWeight: 700 }}>
                                    +{team.length - 3}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span style={{ fontSize: "0.6875rem", color: "#94a3b8", fontStyle: "italic" }}>
                                Aucune équipe assignée
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Objectif & Récolté */}
                      <td style={{ padding: "1rem 0.75rem" }}>
                        <p style={{ fontWeight: 800, color: "#0f172a", margin: "0 0 2px" }}>
                          {formatMoney(p.currentAmount)}
                        </p>
                        <p style={{ fontSize: "0.75rem", color: "#64748b", margin: 0 }}>
                          Cible : {p.targetAmount ? formatMoney(p.targetAmount) : "Libre"}
                        </p>
                      </td>

                      {/* Progression */}
                      <td style={{ padding: "1rem 0.75rem", minWidth: "140px" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "0.75rem", marginBottom: "4px" }}>
                          <span style={{ fontWeight: 800, color: percentage >= 100 ? "#16a34a" : "#0284c7" }}>
                            {percentage}%
                          </span>
                          <span style={{ color: "#94a3b8" }}>{p._count?.donations || 0} don(s)</span>
                        </div>
                        <div style={{ height: "6px", width: "100%", background: "#e2e8f0", borderRadius: "50px", overflow: "hidden" }}>
                          <div
                            style={{
                              height: "100%",
                              width: `${percentage}%`,
                              background:
                                percentage >= 100
                                  ? "linear-gradient(90deg, #22c55e, #16a34a)"
                                  : "linear-gradient(90deg, #0EA5E9, #0284C7)",
                              borderRadius: "50px",
                            }}
                          />
                        </div>
                      </td>

                      {/* Statut sélecteur rapide */}
                      <td style={{ padding: "1rem 0.75rem" }}>
                        <select
                          value={p.status}
                          disabled={actionLoading === p.id}
                          onChange={(e) => handleStatusChange(p.id, e.target.value as ProjectStatus)}
                          style={{
                            padding: "4px 8px",
                            borderRadius: "50px",
                            fontSize: "0.75rem",
                            fontWeight: 700,
                            background: statusBadge.bg,
                            color: statusBadge.color,
                            border: `1px solid ${statusBadge.border}`,
                            outline: "none",
                            cursor: "pointer",
                          }}
                        >
                          <option value="ACTIVE">En cours</option>
                          <option value="PLANNING">Planifié</option>
                          <option value="COMPLETED">Terminé</option>
                        </select>
                      </td>

                      {/* Date */}
                      <td style={{ padding: "1rem 0.75rem", color: "#64748b", fontSize: "0.75rem" }}>
                        {formatDate(p.createdAt)}
                      </td>

                      {/* Actions */}
                      <td style={{ padding: "1rem 1.25rem", textAlign: "right" }}>
                        <div style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                          {/* Bouton Gérer l'Équipe */}
                          <button
                            type="button"
                            onClick={() => handleOpenTeamModal(p)}
                            title="Gérer l'équipe assignée"
                            style={{
                              padding: "6px 10px",
                              borderRadius: "8px",
                              background: "#f0f9ff",
                              color: "#0369a1",
                              border: "1px solid #bae6fd",
                              fontSize: "0.75rem",
                              fontWeight: 700,
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                            }}
                          >
                            👥 Équipe ({team.length})
                          </button>

                          {/* Bouton Éditer */}
                          <Link
                            href={`/admin/projets/${p.id}/editer`}
                            title="Modifier le projet"
                            style={{
                              padding: "6px 10px",
                              borderRadius: "8px",
                              background: "#f1f5f9",
                              color: "#334155",
                              textDecoration: "none",
                              fontSize: "0.75rem",
                              fontWeight: 600,
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                            }}
                          >
                            ✏️ Éditer
                          </Link>

                          {/* Bouton Supprimer */}
                          <button
                            onClick={() => handleDelete(p.id)}
                            title="Supprimer définitivement"
                            style={{
                              padding: "6px 8px",
                              borderRadius: "8px",
                              background: "#fef2f2",
                              color: "#ef4444",
                              border: "1px solid #fee2e2",
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

      {/* ══════════════════════════════════════════
          MODAL GESTION DE L'ÉQUIPE DU PROJET
         ══════════════════════════════════════════ */}
      {managingTeamProject && (
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
              maxWidth: "600px",
              maxHeight: "90vh",
              overflowY: "auto",
              padding: "2rem",
              boxShadow: "0 20px 50px rgba(0,0,0,0.2)",
              border: "1px solid #e2e8f0",
            }}
          >
            {/* Header Modal */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
              <div>
                <h3 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#0f172a", margin: 0 }}>
                  👥 Équipe : {managingTeamProject.title}
                </h3>
                <p style={{ fontSize: "0.8125rem", color: "#64748b", margin: "2px 0 0" }}>
                  Gérez les responsables, leurs rôles et descriptions de tâches
                </p>
              </div>
              <button
                onClick={() => setManagingTeamProject(null)}
                style={{ background: "none", border: "none", fontSize: "1.25rem", cursor: "pointer", color: "#94a3b8" }}
              >
                ✕
              </button>
            </div>

            {/* Formulaire d'assignation d'un nouvel intervenant */}
            <form
              onSubmit={handleAddMemberToProject}
              style={{
                background: "#f8fafc",
                borderRadius: "16px",
                padding: "1.25rem",
                border: "1px solid #e2e8f0",
                marginBottom: "1.5rem",
              }}
            >
              <h4 style={{ fontSize: "0.875rem", fontWeight: 700, color: "#1e293b", margin: "0 0 0.75rem" }}>
                ➕ Assigner un nouvel intervenant
              </h4>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "0.75rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "#475569", marginBottom: "0.25rem" }}>
                    Membre
                  </label>
                  <select
                    value={newMemberUserId}
                    onChange={(e) => setNewMemberUserId(e.target.value)}
                    required
                    style={{
                      width: "100%",
                      padding: "0.625rem",
                      borderRadius: "8px",
                      border: "1.5px solid #e2e8f0",
                      fontSize: "0.8125rem",
                      boxSizing: "border-box",
                    }}
                  >
                    <option value="">-- Choisir un membre --</option>
                    {availableUsers.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.firstName} {u.lastName} ({u.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "#475569", marginBottom: "0.25rem" }}>
                    Rôle / Titre sur ce projet
                  </label>
                  <input
                    type="text"
                    value={newMemberRole}
                    onChange={(e) => setNewMemberRole(e.target.value)}
                    required
                    placeholder="Ex: Chef de Projet, Trésorier..."
                    style={{
                      width: "100%",
                      padding: "0.625rem",
                      borderRadius: "8px",
                      border: "1.5px solid #e2e8f0",
                      fontSize: "0.8125rem",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
              </div>

              {/* Suggestions rapides de rôles */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginBottom: "0.75rem" }}>
                {roleSuggestions.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setNewMemberRole(s.replace(/^[^\w\s]*\s*/, ""))}
                    style={{
                      padding: "2px 8px",
                      borderRadius: "50px",
                      border: "1px solid #cbd5e1",
                      background: "#fff",
                      fontSize: "0.6875rem",
                      fontWeight: 600,
                      color: "#334155",
                      cursor: "pointer",
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>

              <div style={{ marginBottom: "0.75rem" }}>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "#475569", marginBottom: "0.25rem" }}>
                  Description de la mission / Responsabilités
                </label>
                <input
                  type="text"
                  value={newMemberNotes}
                  onChange={(e) => setNewMemberNotes(e.target.value)}
                  placeholder="Ex: Responsable des achats et de la gestion de la caisse..."
                  style={{
                    width: "100%",
                    padding: "0.625rem",
                    borderRadius: "8px",
                    border: "1.5px solid #e2e8f0",
                    fontSize: "0.8125rem",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={isSubmittingTeam}
                style={{
                  padding: "0.5rem 1rem",
                  borderRadius: "8px",
                  background: "linear-gradient(135deg, #0EA5E9, #0284C7)",
                  color: "#fff",
                  border: "none",
                  fontWeight: 700,
                  fontSize: "0.8125rem",
                  cursor: isSubmittingTeam ? "not-allowed" : "pointer",
                }}
              >
                {isSubmittingTeam ? "Assignation..." : "＋ Assigner ce Membre"}
              </button>
            </form>

            {/* Liste des membres assignés */}
            <h4 style={{ fontSize: "0.875rem", fontWeight: 700, color: "#0f172a", marginBottom: "0.75rem" }}>
              Membres Assignés ({(managingTeamProject.team || []).length})
            </h4>

            {(managingTeamProject.team || []).length === 0 ? (
              <p style={{ textAlign: "center", color: "#94a3b8", fontSize: "0.8125rem", margin: "1.5rem 0" }}>
                Aucun intervenant n'est encore assigné à ce projet.
              </p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {(managingTeamProject.team || []).map((m) => (
                  <div
                    key={m.id}
                    style={{
                      padding: "1rem",
                      borderRadius: "12px",
                      border: "1px solid #e2e8f0",
                      background: "#ffffff",
                    }}
                  >
                    {editingMemberId === m.id ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                        <p style={{ fontWeight: 700, fontSize: "0.875rem", margin: 0 }}>
                          Modifier : {m.user.firstName} {m.user.lastName}
                        </p>
                        <div>
                          <label style={{ fontSize: "0.6875rem", fontWeight: 600, color: "#475569" }}>Rôle</label>
                          <input
                            type="text"
                            value={editRole}
                            onChange={(e) => setEditRole(e.target.value)}
                            style={{ width: "100%", padding: "6px 8px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.8125rem", boxSizing: "border-box" }}
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: "0.6875rem", fontWeight: 600, color: "#475569" }}>Description / Mission</label>
                          <input
                            type="text"
                            value={editNotes}
                            onChange={(e) => setEditNotes(e.target.value)}
                            style={{ width: "100%", padding: "6px 8px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.8125rem", boxSizing: "border-box" }}
                          />
                        </div>
                        <div style={{ display: "flex", gap: "6px", marginTop: "4px" }}>
                          <button
                            type="button"
                            onClick={() => handleSaveEditMember(m.id)}
                            style={{ padding: "4px 10px", borderRadius: "6px", background: "#0ea5e9", color: "#fff", border: "none", fontWeight: 700, fontSize: "0.75rem", cursor: "pointer" }}
                          >
                            Enregistrer
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingMemberId(null)}
                            style={{ padding: "4px 10px", borderRadius: "6px", background: "#f1f5f9", color: "#64748b", border: "none", fontSize: "0.75rem", cursor: "pointer" }}
                          >
                            Annuler
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "10px" }}>
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <p style={{ fontWeight: 700, color: "#0f172a", margin: 0, fontSize: "0.875rem" }}>
                              {m.user.firstName} {m.user.lastName}
                            </p>
                            <span style={{ fontSize: "0.6875rem", fontWeight: 700, background: "#e0f2fe", color: "#0369a1", padding: "1px 6px", borderRadius: "50px" }}>
                              🎯 {m.role}
                            </span>
                          </div>
                          <p style={{ fontSize: "0.75rem", color: "#64748b", margin: "2px 0 0" }}>{m.user.email}</p>
                          {m.notes && (
                            <p style={{ fontSize: "0.75rem", color: "#334155", background: "#f8fafc", padding: "4px 8px", borderRadius: "6px", margin: "4px 0 0", fontStyle: "italic" }}>
                              &ldquo;{m.notes}&rdquo;
                            </p>
                          )}
                        </div>

                        <div style={{ display: "flex", gap: "4px" }}>
                          <button
                            type="button"
                            onClick={() => handleStartEditMember(m)}
                            title="Modifier ce rôle"
                            style={{ padding: "4px 8px", borderRadius: "6px", background: "#f0f9ff", color: "#0369a1", border: "1px solid #bae6fd", fontSize: "0.75rem", cursor: "pointer" }}
                          >
                            ✏️
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveMember(m.id)}
                            title="Retirer ce membre"
                            style={{ padding: "4px 8px", borderRadius: "6px", background: "#fef2f2", color: "#ef4444", border: "1px solid #fee2e2", fontSize: "0.75rem", cursor: "pointer" }}
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Bouton Fermer */}
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "1.5rem" }}>
              <button
                type="button"
                onClick={() => setManagingTeamProject(null)}
                style={{
                  padding: "0.625rem 1.5rem",
                  borderRadius: "10px",
                  background: "#f1f5f9",
                  color: "#334155",
                  border: "none",
                  fontWeight: 700,
                  fontSize: "0.875rem",
                  cursor: "pointer",
                }}
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
