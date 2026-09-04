import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import ProfileForm from "@/app/(dashboard)/profil/ProfileForm"

export const metadata = {
  title: "Mon Profil – Espace Membre",
}

export default async function MembreProfilPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { roles: true },
  })

  if (!user) redirect("/login")

  return (
    <div style={{ padding: "2rem 1.5rem", maxWidth: "900px", margin: "0 auto" }}>
      {/* Page Header */}
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "#0f172a", margin: 0 }}>Mon Profil</h1>
        <p style={{ color: "#64748b", marginTop: "0.4rem", fontSize: "0.9375rem" }}>
          Gérez vos informations personnelles et votre identité au sein de la communauté.
        </p>
      </div>

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
    </div>
  )
}
