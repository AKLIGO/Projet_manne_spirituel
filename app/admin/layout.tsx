import { auth } from "@/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import AppSidebar from "@/app/components/layout/AppSidebar"

export const metadata = {
  title: "Administration – La Manne Spirituelle",
  description: "Espace d'administration de La Manne Spirituelle.",
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  const isAdmin =
    session.user.roles?.includes("ADMIN") ||
    session.user.roles?.includes("SUPERADMIN") ||
    session.user.roles?.includes("SECRETAIRE")

  if (!isAdmin) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0f172a", padding: "2rem" }}>
        <div style={{ maxWidth: "480px", width: "100%", background: "#1e293b", borderRadius: "24px", padding: "2.5rem", textAlign: "center", border: "1px solid rgba(255, 255, 255, 0.1)", color: "#fff" }}>
          <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>🔒</div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "0.75rem" }}>Accès Restreint</h2>
          <p style={{ color: "#94a3b8", fontSize: "0.9375rem", marginBottom: "2rem" }}>
            Cette section est réservée à l'équipe de gestion.
          </p>
          <Link href="/membre/profil" style={{ display: "inline-block", padding: "0.8125rem 1.5rem", borderRadius: "50px", background: "linear-gradient(135deg, #0EA5E9, #0284C7)", color: "#fff", textDecoration: "none" }}>
            Retourner à mon Profil
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", display: "flex" }}>
      <AppSidebar
        user={{
          name: session.user.name,
          email: session.user.email,
          roles: session.user.roles,
          image: session.user.image,
        }}
      />
      <div style={{ flex: 1, marginLeft: "260px", minWidth: 0 }} className="admin-main-wrapper">
        {children}
      </div>
      <style>{`
        @media (max-width: 1024px) {
          .admin-main-wrapper { margin-left: 0 !important; }
        }
      `}</style>
    </div>
  )
}
