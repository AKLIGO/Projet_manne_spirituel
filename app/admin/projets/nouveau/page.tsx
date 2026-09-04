import { auth } from "@/auth"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import AdminHeader from "../../components/AdminHeader"
import ProjectForm from "../components/ProjectForm"

export const metadata = {
  title: "Créer un Projet – SuperAdmin",
  description: "Ajouter une nouvelle campagne caritative ou spirituelle.",
}

export default async function NewProjectPage() {
  const session = await auth()

  const availableUsers = await prisma.user.findMany({
    orderBy: { firstName: "asc" },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      profileImage: true,
      church: true,
    },
  })

  return (
    <div style={{ paddingBottom: "4rem" }}>
      <AdminHeader
        title="Créer un Nouveau Projet"
        subtitle="Définissez les détails, objectifs, photos et assignez l'équipe responsable"
        user={{
          name: session?.user?.name,
          email: session?.user?.email,
          roles: session?.user?.roles,
        }}
      />

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "2rem 1.5rem" }}>
        {/* Breadcrumb */}
        <nav style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.8125rem", color: "#64748b", marginBottom: "1.5rem" }}>
          <Link href="/admin" style={{ color: "inherit", textDecoration: "none" }}>
            Admin
          </Link>
          <span>/</span>
          <Link href="/admin/projets" style={{ color: "inherit", textDecoration: "none" }}>
            Projets
          </Link>
          <span>/</span>
          <span style={{ color: "#0ea5e9", fontWeight: 600 }}>Nouveau</span>
        </nav>

        <ProjectForm availableUsers={availableUsers} />
      </div>
    </div>
  )
}
