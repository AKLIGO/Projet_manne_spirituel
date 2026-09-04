import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import Link from "next/link"
import AdminHeader from "../../../components/AdminHeader"
import ProjectForm from "../../components/ProjectForm"

export const metadata = {
  title: "Modifier le Projet – SuperAdmin",
  description: "Modifier les détails, intervenants et objectifs d'un projet.",
}

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  const { id } = await params

  const [project, availableUsers] = await Promise.all([
    prisma.project.findUnique({
      where: { id },
      include: {
        media: {
          where: { type: "IMAGE" },
          take: 1,
        },
        team: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                profileImage: true,
                church: true,
              },
            },
          },
        },
        _count: {
          select: { donations: true },
        },
      },
    }),
    prisma.user.findMany({
      orderBy: { firstName: "asc" },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        profileImage: true,
        church: true,
      },
    }),
  ])

  if (!project) {
    notFound()
  }

  return (
    <div style={{ paddingBottom: "4rem" }}>
      <AdminHeader
        title={`Modifier : ${project.title}`}
        subtitle="Mettez à jour les informations, l'équipe responsable et les objectifs"
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
          <span style={{ color: "#0ea5e9", fontWeight: 600 }}>Éditer ({project.title})</span>
        </nav>

        <ProjectForm
          initialData={{
            id: project.id,
            title: project.title,
            description: project.description,
            targetAmount: project.targetAmount,
            currentAmount: project.currentAmount,
            status: project.status,
            imageUrl: project.media?.[0]?.url || null,
            team: project.team,
          }}
          availableUsers={availableUsers}
        />
      </div>
    </div>
  )
}
