"use client"

import { useState, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { signOut } from "next-auth/react"
import { updateProfile } from "@/app/actions/updateProfile"

interface ProfileFormProps {
  initialData: {
    id: string
    firstName: string
    lastName: string
    email: string
    bio: string
    church: string
    profileImage: string
    roles: string[]
    createdAt: Date
  }
}

export default function ProfileForm({ initialData }: ProfileFormProps) {
  const [firstName, setFirstName] = useState(initialData.firstName)
  const [lastName, setLastName] = useState(initialData.lastName)
  const [church, setChurch] = useState(initialData.church)
  const [bio, setBio] = useState(initialData.bio)

  const [isPending, setIsPending] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [previewImage, setPreviewImage] = useState<string>(initialData.profileImage)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handlePhotoClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Instant local preview
    const localUrl = URL.createObjectURL(file)
    setPreviewImage(localUrl)

    // Upload to API
    setIsUploading(true)
    setMessage(null)
    const uploadData = new FormData()
    uploadData.append("file", file)

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: uploadData,
      })
      const data = await res.json()
      if (res.ok) {
        setPreviewImage(data.imageUrl)
        setMessage({ type: "success", text: "Photo de profil mise à jour avec succès !" })
      } else {
        setMessage({ type: "error", text: data.message || "Erreur lors de l'upload." })
        setPreviewImage(initialData.profileImage)
      }
    } catch {
      setMessage({ type: "error", text: "Erreur réseau lors de l'upload." })
      setPreviewImage(initialData.profileImage)
    } finally {
      setIsUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsPending(true)
    setMessage(null)

    const formData = new FormData(e.currentTarget)
    const result = await updateProfile(formData)

    if (result.error) {
      setMessage({ type: "error", text: result.error })
    } else if (result.success) {
      setMessage({ type: "success", text: "Vos informations de profil ont été enregistrées avec succès !" })
    }
    setIsPending(false)
  }

  const initials = `${firstName[0] || ""}${lastName[0] || ""}`.toUpperCase() || "👤"

  const isAdmin =
    initialData.roles.includes("ADMIN") ||
    initialData.roles.includes("SUPERADMIN")

  const memberSince = new Date(initialData.createdAt).toLocaleDateString("fr-FR", {
    month: "long",
    year: "numeric",
  })

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "2rem" }} className="profile-grid">
      {/* ── Feedback Message Toast ── */}
      {message && (
        <div
          style={{
            gridColumn: "1 / -1",
            padding: "1rem 1.25rem",
            borderRadius: "14px",
            fontSize: "0.9375rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "1rem",
            background: message.type === "success" ? "#f0fdf4" : "#fef2f2",
            color: message.type === "success" ? "#166534" : "#991b1b",
            border: `1px solid ${message.type === "success" ? "#bbf7d0" : "#fecaca"}`,
            boxShadow: "0 4px 12px rgba(0,0,0,0.04)",
            animation: "fadeIn 0.3s ease forwards",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <span style={{ fontSize: "1.25rem" }}>{message.type === "success" ? "✅" : "⚠️"}</span>
            <span style={{ fontWeight: 500 }}>{message.text}</span>
          </div>
          <button
            onClick={() => setMessage(null)}
            type="button"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "1.125rem",
              color: message.type === "success" ? "#166534" : "#991b1b",
              opacity: 0.7,
              padding: "4px 8px",
            }}
          >
            ✕
          </button>
        </div>
      )}

      {/* ══════════════════════════════════════════
          COLONNE GAUCHE : Carte Résumé Profil
         ══════════════════════════════════════════ */}
      <div className="profile-left-col">
        <div
          style={{
            background: "#fff",
            borderRadius: "20px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
            border: "1px solid #e2e8f0",
            overflow: "hidden",
            position: "sticky",
            top: "90px",
          }}
        >
          {/* Card Top Decorative Header */}
          <div
            style={{
              height: "100px",
              background: "linear-gradient(135deg, #0EA5E9 0%, #0369A1 100%)",
              position: "relative",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                backgroundImage:
                  "radial-gradient(circle at 80% 20%, rgba(255,255,255,0.2) 0%, transparent 40%)",
              }}
            />
          </div>

          <div style={{ padding: "0 1.5rem 1.75rem", marginTop: "-55px", textAlign: "center" }}>
            {/* Avatar Section */}
            <div style={{ position: "relative", display: "inline-block", marginBottom: "1rem" }}>
              <div
                style={{
                  width: "110px",
                  height: "110px",
                  borderRadius: "50%",
                  overflow: "hidden",
                  border: "4px solid #fff",
                  boxShadow: "0 8px 24px rgba(14,165,233,0.25)",
                  background: "#f1f5f9",
                  position: "relative",
                  margin: "0 auto",
                }}
              >
                {previewImage ? (
                  <Image
                    src={previewImage}
                    alt="Photo de profil"
                    fill
                    sizes="110px"
                    style={{ objectFit: "cover" }}
                    priority
                  />
                ) : (
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      background: "linear-gradient(135deg, #0EA5E9 0%, #0284C7 100%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "2.25rem",
                      fontWeight: 800,
                      color: "#fff",
                    }}
                  >
                    {initials}
                  </div>
                )}

                {/* Uploading Spinner Overlay */}
                {isUploading && (
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background: "rgba(15, 23, 42, 0.7)",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#fff",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      gap: "4px",
                    }}
                  >
                    <div className="upload-spinner" />
                    <span>Upload...</span>
                  </div>
                )}
              </div>

              {/* Bouton Crayon / Caméra */}
              <button
                type="button"
                onClick={handlePhotoClick}
                disabled={isUploading}
                title="Changer la photo"
                aria-label="Changer la photo de profil"
                style={{
                  position: "absolute",
                  bottom: "4px",
                  right: "4px",
                  width: "34px",
                  height: "34px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #0EA5E9, #0284C7)",
                  border: "3px solid #fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  color: "#fff",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                  transition: "transform 0.2s ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
                onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                style={{ display: "none" }}
                onChange={handleFileChange}
              />
            </div>

            {/* Nom & Email */}
            <h2 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#0f172a", margin: "0 0 0.25rem" }}>
              {firstName} {lastName}
            </h2>
            <p style={{ fontSize: "0.875rem", color: "#64748b", margin: "0 0 0.75rem" }}>{initialData.email}</p>

            {/* Badges Rôles Cumulés */}
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "6px", marginBottom: isAdmin ? "0.75rem" : "1.25rem" }}>
              {initialData.roles.length > 0 ? (
                initialData.roles.map((r) => {
                  const getRoleStyle = (name: string) => {
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
                  const badge = getRoleStyle(r)

                  return (
                    <span
                      key={r}
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
                        letterSpacing: "0.5px",
                      }}
                    >
                      <span>{badge.icon}</span>
                      {r}
                    </span>
                  )
                })
              ) : (
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    padding: "3px 10px",
                    borderRadius: "50px",
                    background: "#f1f5f9",
                    color: "#64748b",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                  }}
                >
                  👤 Membre
                </span>
              )}
            </div>

            {/* Bouton SuperAdmin pour les admins */}
            {isAdmin && (
              <div style={{ marginBottom: "1rem" }}>
                <Link
                  href="/admin"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                    width: "100%",
                    padding: "0.625rem 1rem",
                    borderRadius: "10px",
                    background: "linear-gradient(135deg, #0EA5E9, #0284C7)",
                    color: "#fff",
                    fontSize: "0.8125rem",
                    fontWeight: 700,
                    textDecoration: "none",
                    boxShadow: "0 4px 12px rgba(14, 165, 233, 0.3)",
                    transition: "transform 0.2s ease",
                    boxSizing: "border-box",
                  }}
                >
                  ⚡ Dashboard SuperAdmin
                </Link>
              </div>
            )}

            {/* Bouton action Changer Photo */}
            <div>
              <button
                type="button"
                onClick={handlePhotoClick}
                disabled={isUploading}
                style={{
                  width: "100%",
                  padding: "0.625rem 1rem",
                  borderRadius: "10px",
                  border: "1.5px solid #e2e8f0",
                  background: "#f8fafc",
                  color: "#334155",
                  fontSize: "0.8125rem",
                  fontWeight: 600,
                  cursor: isUploading ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#0EA5E9"
                  e.currentTarget.style.color = "#0284C7"
                  e.currentTarget.style.background = "#fff"
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#e2e8f0"
                  e.currentTarget.style.color = "#334155"
                  e.currentTarget.style.background = "#f8fafc"
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                {isUploading ? "Upload en cours..." : "Modifier la photo"}
              </button>
              <p style={{ fontSize: "0.6875rem", color: "#94a3b8", marginTop: "0.375rem" }}>JPG, PNG ou WebP — Max 5MB</p>
            </div>

            {/* Détails Récapitulatifs */}
            <div
              style={{
                marginTop: "1.5rem",
                paddingTop: "1.25rem",
                borderTop: "1px solid #f1f5f9",
                display: "flex",
                flexDirection: "column",
                gap: "0.875rem",
                textAlign: "left",
                fontSize: "0.8125rem",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", color: "#64748b" }}>
                <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  Adhésion
                </span>
                <span style={{ fontWeight: 600, color: "#1e293b", textTransform: "capitalize" }}>{memberSince}</span>
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", color: "#64748b" }}>
                <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 21h18M3 7v14M21 7v14M6 7V3h12v4M9 11h6M9 15h6" />
                  </svg>
                  Assemblée
                </span>
                <span style={{ fontWeight: 600, color: "#1e293b", maxWidth: "160px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {church || "Non renseignée"}
                </span>
              </div>
            </div>

            {/* Déconnexion */}
            <div style={{ marginTop: "1.25rem", paddingTop: "1rem", borderTop: "1px solid #f1f5f9" }}>
              <button
                type="button"
                onClick={async () => {
                  await signOut({ redirect: false })
                  window.location.href = "/"
                }}
                style={{
                  width: "100%",
                  padding: "0.5rem",
                  background: "transparent",
                  border: "none",
                  color: "#ef4444",
                  fontSize: "0.8125rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                  borderRadius: "8px",
                  transition: "background 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#fef2f2")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                Se déconnecter
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          COLONNE DROITE : Formulaire d'Édition
         ══════════════════════════════════════════ */}
      <div className="profile-right-col">
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {/* Card: Informations d'identité */}
          <div
            style={{
              background: "#fff",
              borderRadius: "20px",
              padding: "2rem",
              boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
              border: "1px solid #e2e8f0",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "1.5rem", paddingBottom: "1rem", borderBottom: "1px solid #f1f5f9" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "#e0f2fe", color: "#0284c7", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <div>
                <h3 style={{ fontSize: "1.125rem", fontWeight: 700, color: "#0f172a", margin: 0 }}>Identité Personnelle</h3>
                <p style={{ fontSize: "0.8125rem", color: "#64748b", margin: 0 }}>Renseignez votre nom et prénom tels qu'ils apparaîtront publiquement.</p>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }} className="name-inputs-grid">
              <div>
                <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "#334155", marginBottom: "0.5rem" }}>
                  Prénom <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type="text"
                    name="firstName"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Ex: Jérôme"
                    className="profile-input"
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "#334155", marginBottom: "0.5rem" }}>
                  Nom <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type="text"
                    name="lastName"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Ex: AKLIGO"
                    className="profile-input"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Card: Compte & Coordonnées */}
          <div
            style={{
              background: "#fff",
              borderRadius: "20px",
              padding: "2rem",
              boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
              border: "1px solid #e2e8f0",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "1.5rem", paddingBottom: "1rem", borderBottom: "1px solid #f1f5f9" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "#fef3c7", color: "#d97706", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <div>
                <h3 style={{ fontSize: "1.125rem", fontWeight: 700, color: "#0f172a", margin: 0 }}>Coordonnées du Compte</h3>
                <p style={{ fontSize: "0.8125rem", color: "#64748b", margin: 0 }}>Votre adresse électronique associée pour vous connecter en toute sécurité.</p>
              </div>
            </div>

            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                <label style={{ fontSize: "0.8125rem", fontWeight: 600, color: "#334155" }}>Adresse Email Principale</label>
                <span style={{ fontSize: "0.6875rem", background: "#f1f5f9", color: "#64748b", padding: "2px 8px", borderRadius: "4px", fontWeight: 600 }}>
                  🔒 Non modifiable
                </span>
              </div>
              <div style={{ position: "relative" }}>
                <input
                  type="email"
                  name="email"
                  disabled
                  defaultValue={initialData.email}
                  className="profile-input profile-input-disabled"
                />
                <span style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", color: "#16a34a", fontSize: "0.875rem", display: "flex", alignItems: "center", gap: "4px" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </span>
              </div>
              <p style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: "0.375rem" }}>
                Pour modifier cette adresse de connexion, veuillez contacter le support administratif de l'association.
              </p>
            </div>
          </div>

          {/* Card: Assemblée & Engagement */}
          <div
            style={{
              background: "#fff",
              borderRadius: "20px",
              padding: "2rem",
              boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
              border: "1px solid #e2e8f0",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "1.5rem", paddingBottom: "1rem", borderBottom: "1px solid #f1f5f9" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "#f0fdf4", color: "#16a34a", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 21h18M3 7v14M21 7v14M6 7V3h12v4M9 11h6M9 15h6" />
                </svg>
              </div>
              <div>
                <h3 style={{ fontSize: "1.125rem", fontWeight: 700, color: "#0f172a", margin: 0 }}>Communauté & Église</h3>
                <p style={{ fontSize: "0.8125rem", color: "#64748b", margin: 0 }}>Renseignez votre communauté locale ou votre paroisse d'attache.</p>
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "#334155", marginBottom: "0.5rem" }}>
                Église / Assemblée Fréquentée
              </label>
              <input
                type="text"
                name="church"
                value={church}
                onChange={(e) => setChurch(e.target.value)}
                placeholder="Ex: Assemblée de Dieu de Lomé, Église Biblique de la Foi..."
                className="profile-input"
              />
              <p style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: "0.375rem" }}>
                Permet d'encourager la communion fraternelle avec les membres de votre région.
              </p>
            </div>
          </div>

          {/* Card: Biographie & Présentation */}
          <div
            style={{
              background: "#fff",
              borderRadius: "20px",
              padding: "2rem",
              boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
              border: "1px solid #e2e8f0",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "1.5rem", paddingBottom: "1rem", borderBottom: "1px solid #f1f5f9" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "#fdf2f8", color: "#db2777", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                </svg>
              </div>
              <div>
                <h3 style={{ fontSize: "1.125rem", fontWeight: 700, color: "#0f172a", margin: 0 }}>Biographie & Témoignage</h3>
                <p style={{ fontSize: "0.8125rem", color: "#64748b", margin: 0 }}>Présentez-vous en quelques lignes aux membres de la communauté.</p>
              </div>
            </div>

            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                <label style={{ fontSize: "0.8125rem", fontWeight: 600, color: "#334155" }}>Courte présentation</label>
                <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>{bio.length} caractères</span>
              </div>
              <textarea
                name="bio"
                rows={5}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Parlez-nous de vous, de vos talents, de votre passion pour l'évangélisation ou de votre parcours..."
                className="profile-input profile-textarea"
              />
            </div>
          </div>

          {/* Action Bar Sticky / Bottom */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "1rem",
              background: "#fff",
              padding: "1.25rem 1.75rem",
              borderRadius: "16px",
              boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
              border: "1px solid #e2e8f0",
            }}
          >
            <Link
              href="/"
              style={{
                textDecoration: "none",
                fontSize: "0.875rem",
                color: "#64748b",
                fontWeight: 600,
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "0.625rem 1rem",
                borderRadius: "8px",
                transition: "color 0.2s",
              }}
            >
              ← Retour à l'accueil
            </Link>

            <button
              type="submit"
              disabled={isPending}
              className="profile-save-btn"
            >
              {isPending ? (
                <>
                  <span className="upload-spinner" style={{ width: "16px", height: "16px", borderWidth: "2px" }} />
                  Enregistrement en cours...
                </>
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Enregistrer les modifications
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        .profile-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 2rem;
        }
        @media (min-width: 1024px) {
          .profile-grid {
            grid-template-columns: 340px 1fr;
          }
        }
        @media (max-width: 640px) {
          .name-inputs-grid {
            grid-template-columns: 1fr !important;
          }
        }
        .profile-input {
          width: 100%;
          padding: 0.75rem 1rem;
          border: 1.5px solid #e2e8f0;
          border-radius: 12px;
          font-size: 0.9375rem;
          color: #0f172a;
          background: #ffffff;
          outline: none;
          box-sizing: border-box;
          transition: all 0.2s ease;
          font-family: inherit;
        }
        .profile-input:focus {
          border-color: #0ea5e9;
          box-shadow: 0 0 0 4px rgba(14, 165, 233, 0.12);
        }
        .profile-input::placeholder {
          color: #94a3b8;
        }
        .profile-input-disabled {
          background: #f8fafc !important;
          color: #64748b !important;
          border-color: #e2e8f0 !important;
          cursor: not-allowed;
        }
        .profile-textarea {
          resize: vertical;
          min-height: 120px;
          line-height: 1.6;
        }
        .profile-save-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 0.8125rem 2rem;
          background: linear-gradient(135deg, #0EA5E9 0%, #0284C7 100%);
          color: #ffffff;
          border: none;
          border-radius: 50px;
          font-size: 0.9375rem;
          font-weight: 700;
          cursor: pointer;
          box-shadow: 0 4px 16px rgba(14, 165, 233, 0.35);
          transition: all 0.25s ease;
        }
        .profile-save-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(14, 165, 233, 0.45);
        }
        .profile-save-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        .upload-spinner {
          width: 22px;
          height: 22px;
          border: 3px solid rgba(255, 255, 255, 0.3);
          border-top-color: #ffffff;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

