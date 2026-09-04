"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { createProject, updateProject } from "@/app/actions/projectActions"
import { ProjectStatus } from "@/generated/prisma/enums"

export interface UserOption {
  id: string
  firstName: string
  lastName: string
  email: string
  profileImage?: string | null
  church?: string | null
  roles?: { name: string }[]
}

export interface TeamMemberItem {
  userId: string
  role: string
  notes?: string
  user?: {
    firstName: string
    lastName: string
    email: string
    profileImage?: string | null
    church?: string | null
  }
}

interface ProjectFormProps {
  initialData?: {
    id: string
    title: string
    description: string
    targetAmount: number | null
    currentAmount: number
    status: ProjectStatus
    imageUrl?: string | null
    team?: {
      id?: string
      userId: string
      role: string
      notes?: string | null
      user?: {
        firstName: string
        lastName: string
        email: string
        profileImage?: string | null
        church?: string | null
      }
    }[]
  }
  availableUsers?: UserOption[]
}

export default function ProjectForm({ initialData, availableUsers = [] }: ProjectFormProps) {
  const router = useRouter()
  const isEditing = !!initialData

  const [title, setTitle] = useState(initialData?.title || "")
  const [description, setDescription] = useState(initialData?.description || "")
  const [targetAmount, setTargetAmount] = useState(initialData?.targetAmount?.toString() || "")
  const [currentAmount, setCurrentAmount] = useState(initialData?.currentAmount?.toString() || "0")
  const [status, setStatus] = useState<ProjectStatus>(initialData?.status || ProjectStatus.ACTIVE)
  const [imageUrl, setImageUrl] = useState<string>(initialData?.imageUrl || "")

  // Équipe et intervenants
  const [teamMembers, setTeamMembers] = useState<TeamMemberItem[]>(
    initialData?.team?.map((t) => ({
      userId: t.userId,
      role: t.role || "Membre de l'équipe",
      notes: t.notes || "",
      user: t.user,
    })) || []
  )

  // Formulaire d'ajout d'intervenant
  const [selectedUserId, setSelectedUserId] = useState("")
  const [selectedRole, setSelectedRole] = useState("Responsable de Projet")
  const [memberNotes, setMemberNotes] = useState("")

  const [isPending, setIsPending] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Upload d'image de projet
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Prévisualisation immédiate
    setImageUrl(URL.createObjectURL(file))
    setIsUploading(true)
    setErrorMessage(null)

    const uploadData = new FormData()
    uploadData.append("file", file)

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: uploadData,
      })
      const data = await res.json()

      if (res.ok && data.url) {
        setImageUrl(data.url)
      } else {
        setErrorMessage(data.error || "Erreur lors du téléversement de l'image.")
      }
    } catch {
      setErrorMessage("Erreur de connexion au serveur d'upload.")
    } finally {
      setIsUploading(false)
    }
  }

  // Ajouter un intervenant à l'équipe
  const handleAddTeamMember = () => {
    if (!selectedUserId) {
      alert("Veuillez sélectionner un membre.")
      return
    }

    if (teamMembers.some((m) => m.userId === selectedUserId)) {
      alert("Ce membre est déjà assigné au projet.")
      return
    }

    const foundUser = availableUsers.find((u) => u.id === selectedUserId)
    const newMember: TeamMemberItem = {
      userId: selectedUserId,
      role: selectedRole.trim() || "Membre de l'équipe",
      notes: memberNotes.trim() || undefined,
      user: foundUser
        ? {
            firstName: foundUser.firstName,
            lastName: foundUser.lastName,
            email: foundUser.email,
            profileImage: foundUser.profileImage,
            church: foundUser.church,
          }
        : undefined,
    }

    setTeamMembers([...teamMembers, newMember])
    setSelectedUserId("")
    setSelectedRole("Responsable de Projet")
    setMemberNotes("")
  }

  // Retirer un intervenant
  const handleRemoveTeamMember = (userId: string) => {
    setTeamMembers(teamMembers.filter((m) => m.userId !== userId))
  }

  // Soumission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsPending(true)
    setErrorMessage(null)
    setSuccessMessage(null)

    const formData = new FormData()
    formData.append("title", title)
    formData.append("description", description)
    formData.append("targetAmount", targetAmount)
    formData.append("currentAmount", currentAmount)
    formData.append("status", status)
    if (imageUrl) {
      formData.append("imageUrl", imageUrl)
    }

    // Envoi des intervenants avec leurs rôles et descriptions
    formData.append(
      "teamMembers",
      JSON.stringify(
        teamMembers.map((m) => ({
          userId: m.userId,
          role: m.role,
          notes: m.notes,
        }))
      )
    )

    let res
    if (isEditing && initialData) {
      res = await updateProject(initialData.id, formData)
    } else {
      res = await createProject(formData)
    }

    if (res.error) {
      setErrorMessage(res.error)
      setIsPending(false)
    } else {
      setSuccessMessage(isEditing ? "Projet mis à jour avec succès !" : "Nouveau projet créé avec succès !")
      setTimeout(() => {
        router.push("/admin/projets")
        router.refresh()
      }, 1000)
    }
  }

  // Calcul pour la prévisualisation
  const targetNum = parseFloat(targetAmount) || 0
  const currentNum = parseFloat(currentAmount) || 0
  const percentage = targetNum > 0 ? Math.min(100, Math.round((currentNum / targetNum) * 100)) : 0

  const formatMoney = (val: number) => {
    return new Intl.NumberFormat("fr-FR").format(val) + " FCFA"
  }

  const roleSuggestions = [
    "👑 Chef de Projet",
    "💰 Trésorier Dédié",
    "📦 Logistique & Matériel",
    "📢 Communication & Médias",
    "🤝 Coordinateur Bénévoles",
    "✝️ Superviseur Spirituel",
  ]

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "2rem" }} className="project-form-layout">
      {/* ══════════════════════════════════════════
          COLONNE GAUCHE : Formulaire
         ══════════════════════════════════════════ */}
      <div>
        {errorMessage && (
          <div
            style={{
              padding: "1rem 1.25rem",
              borderRadius: "12px",
              marginBottom: "1.5rem",
              background: "#fef2f2",
              color: "#991b1b",
              border: "1px solid #fecaca",
              fontSize: "0.875rem",
              fontWeight: 600,
            }}
          >
            ⚠️ {errorMessage}
          </div>
        )}

        {successMessage && (
          <div
            style={{
              padding: "1rem 1.25rem",
              borderRadius: "12px",
              marginBottom: "1.5rem",
              background: "#ecfdf5",
              color: "#065f46",
              border: "1px solid #a7f3d0",
              fontSize: "0.875rem",
              fontWeight: 600,
            }}
          >
            ✅ {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
          {/* Card 1: Informations Générales */}
          <div
            style={{
              background: "#ffffff",
              borderRadius: "20px",
              padding: "2rem",
              border: "1px solid #e2e8f0",
              boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
            }}
          >
            <h3 style={{ fontSize: "1.125rem", fontWeight: 800, color: "#0f172a", marginBottom: "1.5rem" }}>
              1. Informations Générales
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              {/* Titre */}
              <div>
                <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "#334155", marginBottom: "0.5rem" }}>
                  Titre du Projet / Campagne <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Construction du Temple de Lomé, Vente de Charité..."
                  className="admin-input"
                />
              </div>

              {/* Statut & Objectif Cible */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }} className="grid-2-cols">
                <div>
                  <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "#334155", marginBottom: "0.5rem" }}>
                    Statut de la Campagne <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as ProjectStatus)}
                    className="admin-input"
                  >
                    <option value="ACTIVE">🟢 En cours (Actif)</option>
                    <option value="PLANNING">🟡 En planification</option>
                    <option value="COMPLETED">🔵 Terminé</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "#334155", marginBottom: "0.5rem" }}>
                    Objectif Financier Cible (FCFA)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    placeholder="Ex: 5000000"
                    className="admin-input"
                  />
                </div>
              </div>

              {/* Montant déjà collecté */}
              <div>
                <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "#334155", marginBottom: "0.5rem" }}>
                  Fonds Déjà Récoltés Initialement (FCFA)
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={currentAmount}
                  onChange={(e) => setCurrentAmount(e.target.value)}
                  placeholder="0"
                  className="admin-input"
                />
                <p style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: "0.25rem" }}>
                  Ce montant sera automatiquement incrémenté à chaque nouveau don enregistré.
                </p>
              </div>

              {/* Description */}
              <div>
                <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "#334155", marginBottom: "0.5rem" }}>
                  Description Détaillée & Vision du Projet <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <textarea
                  required
                  rows={5}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Décrivez la vision, les besoins, les bénéficiaires et l'impact spirituel de cette campagne..."
                  className="admin-input"
                  style={{ resize: "vertical", minHeight: "120px" }}
                />
              </div>
            </div>
          </div>

          {/* Card 2: Image de Couverture */}
          <div
            style={{
              background: "#ffffff",
              borderRadius: "20px",
              padding: "2rem",
              border: "1px solid #e2e8f0",
              boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
            }}
          >
            <h3 style={{ fontSize: "1.125rem", fontWeight: 800, color: "#0f172a", marginBottom: "0.5rem" }}>
              2. Photo de Couverture
            </h3>
            <p style={{ fontSize: "0.8125rem", color: "#64748b", marginBottom: "1.25rem" }}>
              Ajoutez une image attrayante pour illustrer le projet sur le site public.
            </p>

            <div
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: "2px dashed #cbd5e1",
                borderRadius: "16px",
                padding: "2rem 1.5rem",
                textAlign: "center",
                cursor: "pointer",
                background: "#f8fafc",
                transition: "all 0.2s ease",
              }}
              className="dropzone-area"
            >
              {imageUrl ? (
                <div>
                  <div style={{ position: "relative", width: "100%", height: "200px", borderRadius: "12px", overflow: "hidden", marginBottom: "1rem" }}>
                    <Image
                      src={imageUrl}
                      alt="Aperçu"
                      fill
                      style={{ objectFit: "cover" }}
                    />
                  </div>
                  <button
                    type="button"
                    style={{
                      fontSize: "0.8125rem",
                      fontWeight: 600,
                      color: "#0ea5e9",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    Changer l'image
                  </button>
                </div>
              ) : (
                <div>
                  <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>🖼️</div>
                  <p style={{ fontWeight: 700, color: "#1e293b", margin: "0 0 4px" }}>
                    Cliquez pour téléverser une image
                  </p>
                  <p style={{ fontSize: "0.75rem", color: "#94a3b8", margin: 0 }}>
                    PNG, JPG, WebP jusqu'à 5 Mo
                  </p>
                </div>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              style={{ display: "none" }}
            />
          </div>

          {/* Card 3: Équipe & Intervenants Assignés */}
          <div
            style={{
              background: "#ffffff",
              borderRadius: "20px",
              padding: "2rem",
              border: "1px solid #e2e8f0",
              boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
              <h3 style={{ fontSize: "1.125rem", fontWeight: 800, color: "#0f172a", margin: 0 }}>
                3. Équipe & Intervenants du Projet
              </h3>
              <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#0369a1", background: "#e0f2fe", padding: "3px 10px", borderRadius: "50px" }}>
                {teamMembers.length} intervenant(s) assigné(s)
              </span>
            </div>
            <p style={{ fontSize: "0.8125rem", color: "#64748b", marginBottom: "1.5rem" }}>
              Assignez des responsables ou membres avec leur rôle et la description de leurs tâches sur ce projet.
            </p>

            {/* Bloc d'Ajout d'Intervenant */}
            <div
              style={{
                background: "#f8fafc",
                borderRadius: "16px",
                padding: "1.25rem",
                border: "1px solid #e2e8f0",
                marginBottom: "1.5rem",
              }}
            >
              <h4 style={{ fontSize: "0.875rem", fontWeight: 700, color: "#1e293b", margin: "0 0 1rem" }}>
                ➕ Assigner un nouvel intervenant
              </h4>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }} className="grid-2-cols">
                {/* Choix du membre */}
                <div>
                  <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "#475569", marginBottom: "0.375rem" }}>
                    Sélectionner le Membre
                  </label>
                  <select
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                    className="admin-input"
                    style={{ fontSize: "0.875rem" }}
                  >
                    <option value="">-- Choisir un utilisateur --</option>
                    {availableUsers.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.firstName} {u.lastName} ({u.email})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Rôle sur le projet */}
                <div>
                  <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "#475569", marginBottom: "0.375rem" }}>
                    Rôle / Responsabilité sur ce projet
                  </label>
                  <input
                    type="text"
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    placeholder="Ex: Chef de Projet, Trésorier..."
                    className="admin-input"
                    style={{ fontSize: "0.875rem" }}
                  />
                </div>
              </div>

              {/* Suggestions rapides de rôles */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "1rem" }}>
                {roleSuggestions.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSelectedRole(s.replace(/^[^\w\s]*\s*/, ""))}
                    style={{
                      padding: "4px 10px",
                      borderRadius: "50px",
                      border: "1px solid #cbd5e1",
                      background: "#fff",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      color: "#334155",
                      cursor: "pointer",
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>

              {/* Description de la mission */}
              <div style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "#475569", marginBottom: "0.375rem" }}>
                  Description de la mission / Tâches spécifiques
                </label>
                <input
                  type="text"
                  value={memberNotes}
                  onChange={(e) => setMemberNotes(e.target.value)}
                  placeholder="Ex: Responsable de la commande des stands, de la comptabilité et du compte-rendu hebdomadaire..."
                  className="admin-input"
                  style={{ fontSize: "0.875rem" }}
                />
              </div>

              <button
                type="button"
                onClick={handleAddTeamMember}
                style={{
                  padding: "0.625rem 1.25rem",
                  borderRadius: "10px",
                  background: "linear-gradient(135deg, #0EA5E9, #0284C7)",
                  color: "#fff",
                  border: "none",
                  fontWeight: 700,
                  fontSize: "0.8125rem",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                ＋ Ajouter cet Intervenant
              </button>
            </div>

            {/* Liste des Intervenants Déjà Assignés */}
            {teamMembers.length === 0 ? (
              <p style={{ textAlign: "center", color: "#94a3b8", fontSize: "0.875rem", margin: "1rem 0" }}>
                Aucun membre assigné pour le moment.
              </p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {teamMembers.map((m) => (
                  <div
                    key={m.userId}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                      gap: "1rem",
                      padding: "1rem",
                      background: "#ffffff",
                      borderRadius: "14px",
                      border: "1px solid #e2e8f0",
                      boxShadow: "0 2px 6px rgba(0,0,0,0.02)",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                      <div
                        style={{
                          width: "40px",
                          height: "40px",
                          borderRadius: "50%",
                          background: "linear-gradient(135deg, #0EA5E9, #0284C7)",
                          color: "#fff",
                          fontWeight: 700,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          fontSize: "0.875rem",
                          position: "relative",
                          overflow: "hidden",
                        }}
                      >
                        {m.user?.profileImage ? (
                          <Image src={m.user.profileImage} alt={m.user.firstName} fill style={{ objectFit: "cover" }} />
                        ) : (
                          `${m.user?.firstName?.[0] || ""}${m.user?.lastName?.[0] || ""}`.toUpperCase() || "👤"
                        )}
                      </div>

                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                          <p style={{ fontWeight: 700, color: "#0f172a", margin: 0, fontSize: "0.9375rem" }}>
                            {m.user ? `${m.user.firstName} ${m.user.lastName}` : `Membre ID: ${m.userId}`}
                          </p>
                          <span
                            style={{
                              padding: "2px 8px",
                              borderRadius: "50px",
                              fontSize: "0.75rem",
                              fontWeight: 700,
                              background: "#e0f2fe",
                              color: "#0369a1",
                              border: "1px solid #bae6fd",
                            }}
                          >
                            🎯 {m.role}
                          </span>
                        </div>
                        {m.user?.email && (
                          <p style={{ fontSize: "0.75rem", color: "#64748b", margin: "2px 0 0" }}>{m.user.email}</p>
                        )}
                        {m.notes && (
                          <p style={{ fontSize: "0.8125rem", color: "#334155", background: "#f8fafc", padding: "6px 10px", borderRadius: "8px", margin: "6px 0 0", borderLeft: "3px solid #0ea5e9", fontStyle: "italic" }}>
                            &ldquo;{m.notes}&rdquo;
                          </p>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveTeamMember(m.userId)}
                      title="Retirer cet intervenant"
                      style={{
                        padding: "4px 8px",
                        borderRadius: "8px",
                        border: "1px solid #fee2e2",
                        background: "#fef2f2",
                        color: "#ef4444",
                        fontSize: "0.8125rem",
                        cursor: "pointer",
                      }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Bar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "1rem",
              background: "#ffffff",
              padding: "1.25rem 1.75rem",
              borderRadius: "16px",
              border: "1px solid #e2e8f0",
            }}
          >
            <Link
              href="/admin/projets"
              style={{
                textDecoration: "none",
                fontSize: "0.875rem",
                color: "#64748b",
                fontWeight: 600,
              }}
            >
              ← Annuler et retour
            </Link>

            <button
              type="submit"
              disabled={isPending || isUploading}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "0.8125rem 2rem",
                background: "linear-gradient(135deg, #0EA5E9 0%, #0284C7 100%)",
                color: "#fff",
                border: "none",
                borderRadius: "50px",
                fontSize: "0.9375rem",
                fontWeight: 700,
                cursor: isPending ? "not-allowed" : "pointer",
                boxShadow: "0 4px 14px rgba(14, 165, 233, 0.4)",
              }}
            >
              {isPending ? "Enregistrement..." : isEditing ? "Mettre à jour le projet" : "Publier le projet"}
            </button>
          </div>
        </form>
      </div>

      {/* ══════════════════════════════════════════
          COLONNE DROITE : Prévisualisation Carte
         ══════════════════════════════════════════ */}
      <div>
        <div style={{ position: "sticky", top: "90px" }}>
          <div style={{ marginBottom: "1rem", display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "1rem" }}>👁️</span>
            <h4 style={{ fontSize: "0.9375rem", fontWeight: 800, color: "#0f172a", margin: 0 }}>
              Aperçu en Direct sur le Site
            </h4>
          </div>

          {/* Mock Card du projet */}
          <div
            style={{
              background: "#ffffff",
              borderRadius: "20px",
              overflow: "hidden",
              border: "1px solid #e2e8f0",
              boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
            }}
          >
            {/* Image Header */}
            <div style={{ position: "relative", width: "100%", height: "180px", background: "linear-gradient(135deg, #0c2a45 0%, #0284C7 100%)" }}>
              {imageUrl ? (
                <Image src={imageUrl} alt="Preview" fill style={{ objectFit: "cover" }} />
              ) : (
                <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.7)", fontSize: "2rem" }}>
                  ✝
                </div>
              )}

              <div style={{ position: "absolute", top: "12px", right: "12px" }}>
                <span
                  style={{
                    padding: "4px 10px",
                    borderRadius: "50px",
                    fontSize: "0.6875rem",
                    fontWeight: 700,
                    background: status === "ACTIVE" ? "#22c55e" : status === "COMPLETED" ? "#0ea5e9" : "#f59e0b",
                    color: "#fff",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
                  }}
                >
                  {status === "ACTIVE" ? "En cours" : status === "COMPLETED" ? "Terminé" : "Planifié"}
                </span>
              </div>
            </div>

            {/* Content */}
            <div style={{ padding: "1.5rem" }}>
              <h3 style={{ fontSize: "1.125rem", fontWeight: 800, color: "#0f172a", margin: "0 0 0.5rem" }}>
                {title || "Titre du projet"}
              </h3>
              <p style={{ fontSize: "0.8125rem", color: "#64748b", margin: "0 0 1.25rem", lineHeight: 1.6, minHeight: "40px" }}>
                {description ? (description.length > 110 ? description.substring(0, 110) + "..." : description) : "La description apparaîtra ici..."}
              </p>

              {/* Progression Bar */}
              <div style={{ marginBottom: "1rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", fontWeight: 700, marginBottom: "4px" }}>
                  <span style={{ color: "#0ea5e9" }}>{percentage}% atteint</span>
                  <span style={{ color: "#64748b" }}>Cible : {targetNum > 0 ? formatMoney(targetNum) : "Libre"}</span>
                </div>
                <div style={{ height: "8px", width: "100%", background: "#e2e8f0", borderRadius: "50px", overflow: "hidden" }}>
                  <div
                    style={{
                      height: "100%",
                      width: `${percentage}%`,
                      background: "linear-gradient(90deg, #0EA5E9, #0284C7)",
                      borderRadius: "50px",
                    }}
                  />
                </div>
                <p style={{ fontSize: "0.875rem", fontWeight: 800, color: "#0f172a", marginTop: "6px" }}>
                  {formatMoney(currentNum)} <span style={{ fontSize: "0.75rem", fontWeight: 500, color: "#64748b" }}>collectés</span>
                </p>
              </div>

              {/* Équipe preview */}
              {teamMembers.length > 0 && (
                <div style={{ marginBottom: "1.25rem", padding: "0.75rem", background: "#f8fafc", borderRadius: "12px", border: "1px solid #f1f5f9" }}>
                  <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "#475569", margin: "0 0 6px" }}>
                    👥 Équipe Assignée ({teamMembers.length})
                  </p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                    {teamMembers.map((m) => (
                      <span
                        key={m.userId}
                        style={{
                          fontSize: "0.6875rem",
                          fontWeight: 600,
                          background: "#e0f2fe",
                          color: "#0369a1",
                          padding: "2px 8px",
                          borderRadius: "50px",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        {m.user?.firstName || "Membre"} • {m.role}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Bouton fictif */}
              <div
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  textAlign: "center",
                  borderRadius: "10px",
                  background: "linear-gradient(135deg, #0EA5E9, #0284C7)",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: "0.8125rem",
                  boxShadow: "0 4px 12px rgba(14,165,233,0.3)",
                }}
              >
                Soutenir ce projet ❤️
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (min-width: 1024px) {
          .project-form-layout {
            grid-template-columns: 1fr 360px !important;
          }
        }
        @media (max-width: 640px) {
          .grid-2-cols {
            grid-template-columns: 1fr !important;
          }
        }
        .admin-input {
          width: 100%;
          padding: 0.75rem 1rem;
          border: 1.5px solid #e2e8f0;
          border-radius: 12px;
          font-size: 0.9375rem;
          color: #0f172a;
          background: #ffffff;
          outline: none;
          transition: all 0.2s ease;
          box-sizing: border-box;
        }
        .admin-input:focus {
          border-color: #0ea5e9;
          box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.15);
        }
        .dropzone-area:hover {
          border-color: #0ea5e9 !important;
          background: #f0f9ff !important;
        }
      `}</style>
    </div>
  )
}
