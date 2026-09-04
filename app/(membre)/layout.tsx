import { auth } from "@/auth"
import { redirect } from "next/navigation"
import AppSidebar from "@/app/components/layout/AppSidebar"

export const metadata = {
  title: "Espace Personnel – La Manne Spirituelle",
  description: "Votre espace personnel : profil, projets, événements et participations.",
}

export default async function MembreLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
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
      <div style={{ flex: 1, marginLeft: "260px", minWidth: 0 }} className="membre-main-wrapper">
        {children}
      </div>
      <style>{`
        @media (max-width: 1024px) {
          .membre-main-wrapper { margin-left: 0 !important; }
        }
      `}</style>
    </div>
  )
}

