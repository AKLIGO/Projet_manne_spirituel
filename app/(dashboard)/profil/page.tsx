import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import Header from "@/app/components/layout/Header"
import Footer from "@/app/components/layout/Footer"
import ProfileForm from "./ProfileForm"

export const metadata = {
  title: "Mon Profil – La Manne Spirituelle",
  description: "Gérez vos informations personnelles et vos préférences sur La Manne Spirituelle.",
}

export default async function ProfilPage() {
  const session = await auth()
  
  if (!session?.user) {
    redirect("/login")
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { roles: true },
  })

  if (!user) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc", padding: "2rem" }}>
        <div style={{ textAlign: "center", padding: "2.5rem", background: "#fff", borderRadius: "16px", boxShadow: "0 10px 30px rgba(0,0,0,0.06)", maxWidth: "420px", width: "100%" }}>
          <p style={{ fontSize: "1.25rem", fontWeight: 700, color: "#1e293b", marginBottom: "0.5rem" }}>Utilisateur introuvable</p>
          <p style={{ color: "#64748b", fontSize: "0.9375rem", marginBottom: "1.5rem" }}>Votre session a expiré ou le compte n'existe plus.</p>
          <Link
            href="/login"
            style={{
              display: "inline-block",
              padding: "0.75rem 1.75rem",
              borderRadius: "50px",
              background: "linear-gradient(135deg, #0EA5E9, #0284C7)",
              color: "#fff",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            Se reconnecter
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "#f8fafc" }}>
      <Header />

      {/* Hero Header Banner */}
      <section
        style={{
          position: "relative",
          paddingTop: "120px",
          paddingBottom: "80px",
          background: "linear-gradient(135deg, #0c1445 0%, #0369A1 50%, #0EA5E9 100%)",
          color: "#fff",
          overflow: "hidden",
        }}
      >
        {/* Glow & Decorative elements */}
        <div
          style={{
            position: "absolute",
            top: "-40px",
            right: "-40px",
            width: "320px",
            height: "320px",
            borderRadius: "50%",
            background: "rgba(56, 189, 248, 0.2)",
            filter: "blur(60px)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-60px",
            left: "10%",
            width: "280px",
            height: "280px",
            borderRadius: "50%",
            background: "rgba(212, 168, 67, 0.15)",
            filter: "blur(50px)",
            pointerEvents: "none",
          }}
        />

        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 1.5rem", position: "relative", zIndex: 1 }}>
          {/* Breadcrumb */}
          <nav style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.875rem", opacity: 0.85, marginBottom: "1rem" }}>
            <Link href="/" style={{ color: "#fff", textDecoration: "none", transition: "opacity 0.2s" }}>
              Accueil
            </Link>
            <span>/</span>
            <span style={{ color: "#7dd3fc", fontWeight: 600 }}>Espace Membre</span>
            <span>/</span>
            <span style={{ color: "#fff", fontWeight: 600 }}>Mon Profil</span>
          </nav>

          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "1rem" }}>
            <div>
              <h1 style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)", fontWeight: 800, letterSpacing: "-0.5px", margin: 0, lineHeight: 1.2 }}>
                Mon Espace Personnel
              </h1>
              <p style={{ marginTop: "0.5rem", fontSize: "1rem", color: "rgba(255, 255, 255, 0.85)", maxWidth: "550px" }}>
                Gérez vos informations de compte, votre identité publique et vos engagements spirituels.
              </p>
            </div>

            {/* Quick Badge */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 18px",
                borderRadius: "50px",
                background: "rgba(255, 255, 255, 0.12)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255, 255, 255, 0.25)",
                fontSize: "0.875rem",
                fontWeight: 600,
              }}
            >
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#4ade80", boxShadow: "0 0 8px #4ade80" }}></span>
              Compte Actif
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main style={{ flex: 1, maxWidth: "1200px", width: "100%", margin: "-45px auto 60px", padding: "0 1.5rem", position: "relative", zIndex: 2 }}>
        <ProfileForm 
          initialData={{
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            bio: user.bio || "",
            church: user.church || "",
            profileImage: user.profileImage || "",
            roles: user.roles ? user.roles.map((r) => r.name) : [],
            createdAt: user.createdAt,
          }}
        />
      </main>

      <Footer />
    </div>
  )
}
