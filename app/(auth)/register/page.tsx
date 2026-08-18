"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    church: "",
  })
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (formData.password !== formData.confirmPassword) {
      setError("Les mots de passe ne correspondent pas.")
      return
    }
    if (formData.password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.")
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
          church: formData.church,
        }),
      })
      if (res.ok) {
        router.push("/login?registered=true")
      } else {
        const data = await res.json()
        setError(data.message || "Une erreur est survenue lors de l'inscription.")
      }
    } catch {
      setError("Erreur réseau.")
    } finally {
      setIsLoading(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "0.75rem 1rem",
    border: "1.5px solid #E5E7EB",
    borderRadius: "10px",
    fontSize: "0.9375rem",
    outline: "none",
    background: "#fff",
    color: "#111827",
    transition: "border-color 0.2s, box-shadow 0.2s",
    boxSizing: "border-box",
  }

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = "#0EA5E9"
    e.target.style.boxShadow = "0 0 0 3px rgba(14,165,233,0.1)"
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = "#E5E7EB"
    e.target.style.boxShadow = "none"
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", fontFamily: "var(--font-inter, sans-serif)" }}>

      {/* ── Panneau gauche ── */}
      <div
        className="auth-left-panel"
        style={{
          flex: 1,
          background: "linear-gradient(145deg, #0c1445 0%, #1a237e 40%, #0EA5E9 100%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "3rem",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Cercles décoratifs */}
        <div style={{ position: "absolute", top: "-80px", left: "-80px", width: "300px", height: "300px", borderRadius: "50%", background: "rgba(14,165,233,0.15)", filter: "blur(40px)" }} />
        <div style={{ position: "absolute", bottom: "-60px", right: "-60px", width: "250px", height: "250px", borderRadius: "50%", background: "rgba(56,189,248,0.2)", filter: "blur(50px)" }} />
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: "400px", height: "400px", borderRadius: "50%", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }} />

        {/* Contenu */}
        <div style={{ position: "relative", zIndex: 1, textAlign: "center", color: "#fff" }}>
          <div style={{ width: "80px", height: "80px", borderRadius: "50%", background: "rgba(255,255,255,0.15)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem", fontSize: "2rem" }}>
            ✝
          </div>
          <h1 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: "1rem", lineHeight: 1.2 }}>
            La Manne<br />Spirituelle
          </h1>
          <p style={{ fontSize: "1rem", opacity: 0.8, maxWidth: "280px", lineHeight: 1.7 }}>
            Rejoignez notre communauté de foi et participez à nos activités et projets.
          </p>
          <div style={{ marginTop: "2.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
            {["🙏 Communauté bienveillante", "📖 Enseignements spirituels", "💖 Projets d'entraide"].map((item) => (
              <div key={item} style={{ background: "rgba(255,255,255,0.08)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "12px", padding: "0.75rem 1rem", fontSize: "0.875rem", fontWeight: 500 }}>
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Panneau droit ── */}
      <div style={{ flex: 1, maxWidth: "520px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "3rem 2.5rem", background: "#fafafa", overflowY: "auto" }}>
        <div style={{ width: "100%", maxWidth: "400px" }}>
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", textDecoration: "none", color: "#6B7280", fontSize: "0.875rem", marginBottom: "2rem" }}>
            ← Retour à l'accueil
          </Link>

          <h2 style={{ fontSize: "1.875rem", fontWeight: 800, color: "#111827", marginBottom: "0.5rem" }}>
            Créer un compte
          </h2>
          <p style={{ color: "#6B7280", fontSize: "0.9375rem", marginBottom: "2rem" }}>
            Rejoignez la communauté Manne Spirituelle
          </p>

          {error && (
            <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", color: "#DC2626", padding: "0.875rem 1rem", borderRadius: "12px", fontSize: "0.875rem", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "#374151", marginBottom: "0.375rem" }}>Prénom</label>
                <input name="firstName" type="text" required placeholder="Jean" value={formData.firstName} onChange={handleChange} style={inputStyle} onFocus={handleFocus} onBlur={handleBlur} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "#374151", marginBottom: "0.375rem" }}>Nom</label>
                <input name="lastName" type="text" required placeholder="Dupont" value={formData.lastName} onChange={handleChange} style={inputStyle} onFocus={handleFocus} onBlur={handleBlur} />
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "#374151", marginBottom: "0.375rem" }}>Adresse Email</label>
              <input name="email" type="email" required placeholder="jean.dupont@exemple.com" value={formData.email} onChange={handleChange} style={inputStyle} onFocus={handleFocus} onBlur={handleBlur} />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "#374151", marginBottom: "0.375rem" }}>Mot de passe</label>
              <input name="password" type="password" required placeholder="Minimum 8 caractères" value={formData.password} onChange={handleChange} style={inputStyle} onFocus={handleFocus} onBlur={handleBlur} />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "#374151", marginBottom: "0.375rem" }}>Confirmer le mot de passe</label>
              <input name="confirmPassword" type="password" required placeholder="Retapez votre mot de passe" value={formData.confirmPassword} onChange={handleChange} style={{
                ...inputStyle,
                borderColor: formData.confirmPassword && formData.confirmPassword !== formData.password ? "#EF4444" : "#E5E7EB",
              }} onFocus={handleFocus} onBlur={handleBlur} />
              {formData.confirmPassword && formData.confirmPassword !== formData.password && (
                <p style={{ color: "#EF4444", fontSize: "0.75rem", marginTop: "0.25rem" }}>⚠ Les mots de passe ne correspondent pas</p>
              )}
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "#374151", marginBottom: "0.375rem" }}>Église / Assemblée <span style={{ fontWeight: 400, color: "#9CA3AF" }}>(optionnel)</span></label>
              <input name="church" type="text" placeholder="Ex: Église Évangélique de la Grâce" value={formData.church} onChange={handleChange} style={inputStyle} onFocus={handleFocus} onBlur={handleBlur} />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              style={{ width: "100%", padding: "0.875rem", background: isLoading ? "#93C5FD" : "linear-gradient(135deg, #0EA5E9, #0284C7)", color: "#fff", border: "none", borderRadius: "10px", fontSize: "0.9375rem", fontWeight: 700, cursor: isLoading ? "not-allowed" : "pointer", marginTop: "0.5rem", boxShadow: "0 4px 14px rgba(14,165,233,0.4)", transition: "all 0.2s ease", letterSpacing: "0.3px" }}
              onMouseEnter={(e) => { if (!isLoading) (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)" }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = "translateY(0)" }}
            >
              {isLoading ? "Inscription en cours..." : "Créer mon compte →"}
            </button>
          </form>

          <p style={{ textAlign: "center", marginTop: "1.5rem", fontSize: "0.875rem", color: "#6B7280" }}>
            Déjà membre ?{" "}
            <Link href="/login" style={{ color: "#0EA5E9", fontWeight: 600, textDecoration: "none" }}>
              Se connecter
            </Link>
          </p>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .auth-left-panel { display: none !important; }
        }
      `}</style>
    </div>
  )
}
