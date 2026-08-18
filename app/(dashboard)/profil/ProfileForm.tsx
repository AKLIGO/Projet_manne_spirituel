"use client"

import { useState, useRef } from "react"
import Image from "next/image"
import { updateProfile } from "@/app/actions/updateProfile"

interface ProfileFormProps {
  initialData: {
    firstName: string
    lastName: string
    email: string
    bio: string
    church: string
    profileImage: string
  }
}

export default function ProfileForm({ initialData }: ProfileFormProps) {
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

    // Prévisualisation instantanée
    const localUrl = URL.createObjectURL(file)
    setPreviewImage(localUrl)

    // Upload vers l'API
    setIsUploading(true)
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
        setMessage({ type: "success", text: "Photo de profil mise à jour !" })
      } else {
        setMessage({ type: "error", text: data.message || "Erreur lors de l'upload." })
        setPreviewImage(initialData.profileImage) // Revenir à l'ancienne photo
      }
    } catch {
      setMessage({ type: "error", text: "Erreur réseau lors de l'upload." })
    } finally {
      setIsUploading(false)
    }
  }

  const handleSubmit = async (formData: FormData) => {
    setIsPending(true)
    setMessage(null)
    const result = await updateProfile(formData)
    if (result.error) {
      setMessage({ type: "error", text: result.error })
    } else if (result.success) {
      setMessage({ type: "success", text: "Profil mis à jour avec succès." })
    }
    setIsPending(false)
  }

  const initials = `${initialData.firstName[0] || ""}${initialData.lastName[0] || ""}`.toUpperCase()

  return (
    <div>
      {/* ── Photo de Profil ── */}
      <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", marginBottom: "2rem", paddingBottom: "2rem", borderBottom: "1px solid #F3F4F6" }}>
        <div style={{ position: "relative" }}>
          {previewImage ? (
            <div style={{ width: "90px", height: "90px", borderRadius: "50%", overflow: "hidden", border: "3px solid #E5E7EB" }}>
              <Image
                src={previewImage}
                alt="Photo de profil"
                width={90}
                height={90}
                style={{ objectFit: "cover", width: "100%", height: "100%" }}
              />
            </div>
          ) : (
            <div style={{ width: "90px", height: "90px", borderRadius: "50%", background: "linear-gradient(135deg, #0EA5E9, #0284C7)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.75rem", fontWeight: 700, color: "#fff", border: "3px solid #E5E7EB" }}>
              {initials || "👤"}
            </div>
          )}

          {/* Bouton overlay modifier */}
          <button
            type="button"
            onClick={handlePhotoClick}
            disabled={isUploading}
            style={{ position: "absolute", bottom: 0, right: 0, width: "28px", height: "28px", borderRadius: "50%", background: "#0EA5E9", border: "2px solid #fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: "0.75rem" }}
          >
            {isUploading ? "⏳" : "✏️"}
          </button>

          {/* Input fichier caché */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            style={{ display: "none" }}
            onChange={handleFileChange}
          />
        </div>

        <div>
          <p style={{ fontWeight: 600, color: "#111827", fontSize: "0.9375rem" }}>
            {initialData.firstName} {initialData.lastName}
          </p>
          <button
            type="button"
            onClick={handlePhotoClick}
            disabled={isUploading}
            style={{ marginTop: "0.375rem", fontSize: "0.8125rem", color: "#0EA5E9", fontWeight: 500, background: "none", border: "none", cursor: "pointer", padding: 0 }}
          >
            {isUploading ? "Upload en cours..." : "Changer la photo"}
          </button>
          <p style={{ fontSize: "0.75rem", color: "#9CA3AF", marginTop: "0.25rem" }}>JPG, PNG ou WebP — max 5MB</p>
        </div>
      </div>

      {/* ── Message Feedback ── */}
      {message && (
        <div style={{ padding: "0.875rem 1rem", borderRadius: "10px", marginBottom: "1.5rem", fontSize: "0.875rem", display: "flex", alignItems: "center", gap: "0.5rem", background: message.type === "success" ? "#F0FDF4" : "#FEF2F2", color: message.type === "success" ? "#16A34A" : "#DC2626", border: `1px solid ${message.type === "success" ? "#BBF7D0" : "#FECACA"}` }}>
          {message.type === "success" ? "✅" : "⚠️"} {message.text}
        </div>
      )}

      {/* ── Formulaire Infos ── */}
      <form action={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "#374151", marginBottom: "0.375rem" }}>Prénom</label>
            <input type="text" name="firstName" defaultValue={initialData.firstName} style={{ width: "100%", padding: "0.6875rem 0.875rem", border: "1.5px solid #E5E7EB", borderRadius: "8px", fontSize: "0.9rem", outline: "none", boxSizing: "border-box" }} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "#374151", marginBottom: "0.375rem" }}>Nom</label>
            <input type="text" name="lastName" defaultValue={initialData.lastName} style={{ width: "100%", padding: "0.6875rem 0.875rem", border: "1.5px solid #E5E7EB", borderRadius: "8px", fontSize: "0.9rem", outline: "none", boxSizing: "border-box" }} />
          </div>
        </div>

        <div>
          <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "#374151", marginBottom: "0.375rem" }}>Adresse Email</label>
          <input type="email" name="email" disabled defaultValue={initialData.email} style={{ width: "100%", padding: "0.6875rem 0.875rem", border: "1.5px solid #E5E7EB", borderRadius: "8px", fontSize: "0.9rem", outline: "none", background: "#F9FAFB", color: "#9CA3AF", cursor: "not-allowed", boxSizing: "border-box" }} />
          <p style={{ fontSize: "0.75rem", color: "#9CA3AF", marginTop: "0.25rem" }}>L'email ne peut pas être modifié.</p>
        </div>

        <div>
          <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "#374151", marginBottom: "0.375rem" }}>Église / Assemblée</label>
          <input type="text" name="church" defaultValue={initialData.church} placeholder="Votre église ou assemblée" style={{ width: "100%", padding: "0.6875rem 0.875rem", border: "1.5px solid #E5E7EB", borderRadius: "8px", fontSize: "0.9rem", outline: "none", boxSizing: "border-box" }} />
        </div>

        <div>
          <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "#374151", marginBottom: "0.375rem" }}>Biographie</label>
          <textarea
            name="bio"
            rows={4}
            defaultValue={initialData.bio}
            placeholder="Présentez-vous en quelques mots..."
            style={{ width: "100%", padding: "0.6875rem 0.875rem", border: "1.5px solid #E5E7EB", borderRadius: "8px", fontSize: "0.9rem", outline: "none", resize: "vertical", boxSizing: "border-box" }}
          />
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: "0.5rem", borderTop: "1px solid #F3F4F6" }}>
          <button
            type="submit"
            disabled={isPending}
            style={{ padding: "0.75rem 1.75rem", background: isPending ? "#93C5FD" : "linear-gradient(135deg, #0EA5E9, #0284C7)", color: "#fff", border: "none", borderRadius: "8px", fontSize: "0.9rem", fontWeight: 600, cursor: isPending ? "not-allowed" : "pointer", boxShadow: "0 4px 12px rgba(14,165,233,0.3)", transition: "all 0.2s" }}
          >
            {isPending ? "Enregistrement..." : "Enregistrer les modifications"}
          </button>
        </div>
      </form>
    </div>
  )
}
