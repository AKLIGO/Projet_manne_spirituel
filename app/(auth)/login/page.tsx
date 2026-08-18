"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      })

      if (res?.error) {
        setError("Identifiants incorrects. Veuillez réessayer.")
      } else {
        router.push("/profil")
        router.refresh()
      }
    } catch (err) {
      setError("Une erreur est survenue.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", fontFamily: "var(--font-inter, sans-serif)" }}>
      {/* Panneau gauche - Visuel */}
      <div style={{
        flex: 1,
        background: "linear-gradient(145deg, #0c1445 0%, #1a237e 40%, #0EA5E9 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "3rem",
        position: "relative",
        overflow: "hidden",
      }} className="auth-left-panel">
        <div style={{ position: "absolute", top: "-80px", left: "-80px", width: "300px", height: "300px", borderRadius: "50%", background: "rgba(14,165,233,0.15)", filter: "blur(40px)" }} />
        <div style={{ position: "absolute", bottom: "-60px", right: "-60px", width: "250px", height: "250px", borderRadius: "50%", background: "rgba(56,189,248,0.2)", filter: "blur(50px)" }} />
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "400px", height: "400px", borderRadius: "50%", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }} />

        <div style={{ position: "relative", zIndex: 1, textAlign: "center", color: "#fff" }}>
          <div style={{ width: "80px", height: "80px", borderRadius: "50%", background: "rgba(255,255,255,0.15)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem", fontSize: "2rem" }}>✝</div>
          <h1 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: "1rem", lineHeight: 1.2 }}>
            La Manne<br />Spirituelle
          </h1>
          <p style={{ fontSize: "1rem", opacity: 0.8, maxWidth: "280px", lineHeight: 1.7 }}>
            Heureux de vous revoir ! Accédez à votre espace communautaire.
          </p>
          <div style={{ marginTop: "2.5rem", background: "rgba(255,255,255,0.08)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "16px", padding: "1.5rem", textAlign: "left" }}>
            <p style={{ fontSize: "0.9rem", opacity: 0.7, marginBottom: "0.75rem", fontStyle: "italic" }}>
              "Car là où deux ou trois sont réunis en mon nom, je suis au milieu d'eux."
            </p>
            <p style={{ fontSize: "0.8rem", opacity: 0.5 }}>— Matthieu 18:20</p>
          </div>
        </div>
      </div>

      {/* Panneau droit - Formulaire */}
      <div style={{ flex: 1, maxWidth: "520px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "3rem 2.5rem", background: "#fafafa", overflowY: "auto" }}>
        <div style={{ width: "100%", maxWidth: "400px" }}>
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", textDecoration: "none", color: "#6B7280", fontSize: "0.875rem", marginBottom: "2rem" }}>
            ← Retour à l'accueil
          </Link>

          <h2 style={{ fontSize: "1.875rem", fontWeight: 800, color: "#111827", marginBottom: "0.5rem" }}>Connexion</h2>
          <p style={{ color: "#6B7280", fontSize: "0.9375rem", marginBottom: "2rem" }}>
            Accédez à votre espace Manne Spirituelle
          </p>

          {error && (
            <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", color: "#DC2626", padding: "0.875rem 1rem", borderRadius: "12px", fontSize: "0.875rem", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "#374151", marginBottom: "0.375rem" }}>
                Adresse Email
              </label>
              <input
                type="email"
                required
                placeholder="jean.dupont@exemple.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ width: "100%", padding: "0.75rem 1rem", border: "1.5px solid #E5E7EB", borderRadius: "10px", fontSize: "0.9375rem", outline: "none", background: "#fff", color: "#111827", transition: "border-color 0.2s, box-shadow 0.2s", boxSizing: "border-box" }}
                onFocus={(e) => { e.target.style.borderColor = "#0EA5E9"; e.target.style.boxShadow = "0 0 0 3px rgba(14,165,233,0.1)"; }}
                onBlur={(e) => { e.target.style.borderColor = "#E5E7EB"; e.target.style.boxShadow = "none"; }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "#374151", marginBottom: "0.375rem" }}>
                Mot de passe
              </label>
              <input
                type="password"
                required
                placeholder="Votre mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ width: "100%", padding: "0.75rem 1rem", border: "1.5px solid #E5E7EB", borderRadius: "10px", fontSize: "0.9375rem", outline: "none", background: "#fff", color: "#111827", transition: "border-color 0.2s, box-shadow 0.2s", boxSizing: "border-box" }}
                onFocus={(e) => { e.target.style.borderColor = "#0EA5E9"; e.target.style.boxShadow = "0 0 0 3px rgba(14,165,233,0.1)"; }}
                onBlur={(e) => { e.target.style.borderColor = "#E5E7EB"; e.target.style.boxShadow = "none"; }}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              style={{ width: "100%", padding: "0.875rem", background: isLoading ? "#93C5FD" : "linear-gradient(135deg, #0EA5E9, #0284C7)", color: "#fff", border: "none", borderRadius: "10px", fontSize: "0.9375rem", fontWeight: 700, cursor: isLoading ? "not-allowed" : "pointer", marginTop: "0.5rem", boxShadow: "0 4px 14px rgba(14,165,233,0.4)", transition: "all 0.2s ease", letterSpacing: "0.3px" }}
              onMouseEnter={(e) => { if (!isLoading) (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; }}
            >
              {isLoading ? "Connexion en cours..." : "Se connecter →"}
            </button>
          </form>

          <p style={{ textAlign: "center", marginTop: "1.5rem", fontSize: "0.875rem", color: "#6B7280" }}>
            Pas encore de compte ?{" "}
            <Link href="/register" style={{ color: "#0EA5E9", fontWeight: 600, textDecoration: "none" }}>
              S'inscrire gratuitement
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
