"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { ProjectStatus } from "@/generated/prisma/enums"

// ── 1. Créer un nouveau projet ──
export async function createProject(formData: FormData) {
  const session = await auth()
  const isAdmin =
    session?.user?.roles?.includes("ADMIN") ||
    session?.user?.roles?.includes("SUPERADMIN")

  if (!isAdmin || !session?.user) {
    return { error: "Action non autorisée. Rôle ADMIN requis." }
  }

  const title = (formData.get("title") as string)?.trim()
  const description = (formData.get("description") as string)?.trim()
  const targetAmountRaw = formData.get("targetAmount") as string
  const currentAmountRaw = formData.get("currentAmount") as string
  const status = (formData.get("status") as ProjectStatus) || ProjectStatus.PLANNING
  const imageUrl = formData.get("imageUrl") as string
  const teamMembersRaw = formData.get("teamMembers") as string

  if (!title || !description) {
    return { error: "Le titre et la description du projet sont obligatoires." }
  }

  const targetAmount = targetAmountRaw ? parseFloat(targetAmountRaw) : null
  const currentAmount = currentAmountRaw ? parseFloat(currentAmountRaw) : 0

  let teamMembers: { userId: string; role: string; notes?: string }[] = []
  if (teamMembersRaw) {
    try {
      teamMembers = JSON.parse(teamMembersRaw)
    } catch (e) {
      console.error("Erreur parsing teamMembers:", e)
    }
  }

  try {
    const project = await prisma.project.create({
      data: {
        title,
        description,
        targetAmount,
        currentAmount,
        status,
        authorId: session.user.id,
        media: imageUrl
          ? {
              create: {
                url: imageUrl,
                type: "IMAGE",
                altText: title,
              },
            }
          : undefined,
        team:
          teamMembers.length > 0
            ? {
                create: teamMembers.map((m) => ({
                  userId: m.userId,
                  role: m.role || "Membre de l'équipe",
                  notes: m.notes || null,
                })),
              }
            : undefined,
      },
    })

    revalidatePath("/admin")
    revalidatePath("/admin/projets")
    revalidatePath("/")

    return { success: true, projectId: project.id }
  } catch (error) {
    console.error("Erreur lors de la création du projet:", error)
    return { error: "Impossible de créer le projet. Vérifiez les informations." }
  }
}

// ── 2. Mettre à jour un projet existant ──
export async function updateProject(id: string, formData: FormData) {
  const session = await auth()
  const isAdmin =
    session?.user?.roles?.includes("ADMIN") ||
    session?.user?.roles?.includes("SUPERADMIN")

  if (!isAdmin || !session?.user) {
    return { error: "Action non autorisée. Rôle ADMIN requis." }
  }

  const title = (formData.get("title") as string)?.trim()
  const description = (formData.get("description") as string)?.trim()
  const targetAmountRaw = formData.get("targetAmount") as string
  const currentAmountRaw = formData.get("currentAmount") as string
  const status = (formData.get("status") as ProjectStatus) || ProjectStatus.PLANNING
  const imageUrl = formData.get("imageUrl") as string
  const teamMembersRaw = formData.get("teamMembers") as string

  if (!title || !description) {
    return { error: "Le titre et la description du projet sont obligatoires." }
  }

  const targetAmount = targetAmountRaw ? parseFloat(targetAmountRaw) : null
  const currentAmount = currentAmountRaw ? parseFloat(currentAmountRaw) : 0

  try {
    await prisma.project.update({
      where: { id },
      data: {
        title,
        description,
        targetAmount,
        currentAmount,
        status,
      },
    })

    // Mettre à jour ou ajouter l'image si fournie
    if (imageUrl) {
      const existingMedia = await prisma.media.findFirst({
        where: { projectId: id, type: "IMAGE" },
      })

      if (existingMedia) {
        await prisma.media.update({
          where: { id: existingMedia.id },
          data: { url: imageUrl, altText: title },
        })
      } else {
        await prisma.media.create({
          data: {
            url: imageUrl,
            type: "IMAGE",
            altText: title,
            projectId: id,
          },
        })
      }
    }

    // Mettre à jour l'équipe si fournie
    if (teamMembersRaw !== null && teamMembersRaw !== undefined) {
      let teamMembers: { userId: string; role: string; notes?: string }[] = []
      try {
        teamMembers = JSON.parse(teamMembersRaw)
      } catch (e) {
        console.error("Erreur parsing teamMembers:", e)
      }

      // Remplacer l'équipe
      await prisma.projectMember.deleteMany({
        where: { projectId: id },
      })

      if (teamMembers.length > 0) {
        await prisma.projectMember.createMany({
          data: teamMembers.map((m) => ({
            projectId: id,
            userId: m.userId,
            role: m.role || "Membre de l'équipe",
            notes: m.notes || null,
          })),
        })
      }
    }

    revalidatePath("/admin")
    revalidatePath("/admin/projets")
    revalidatePath(`/admin/projets/${id}/editer`)
    revalidatePath("/")

    return { success: true }
  } catch (error) {
    console.error("Erreur lors de la mise à jour du projet:", error)
    return { error: "Impossible de mettre à jour le projet." }
  }
}

// ── 3. Changer le statut d'un projet rapidement ──
export async function toggleProjectStatus(id: string, status: ProjectStatus) {
  const session = await auth()
  const isAdmin =
    session?.user?.roles?.includes("ADMIN") ||
    session?.user?.roles?.includes("SUPERADMIN")

  if (!isAdmin || !session?.user) {
    return { error: "Action non autorisée." }
  }

  try {
    await prisma.project.update({
      where: { id },
      data: { status },
    })

    revalidatePath("/admin")
    revalidatePath("/admin/projets")
    revalidatePath("/")

    return { success: true }
  } catch (error) {
    console.error("Erreur lors du changement de statut:", error)
    return { error: "Erreur lors du changement de statut." }
  }
}

// ── 4. Supprimer un projet ──
export async function deleteProject(id: string) {
  const session = await auth()
  const isAdmin =
    session?.user?.roles?.includes("ADMIN") ||
    session?.user?.roles?.includes("SUPERADMIN")

  if (!isAdmin || !session?.user) {
    return { error: "Action non autorisée. Rôle ADMIN requis." }
  }

  try {
    await prisma.project.delete({
      where: { id },
    })

    revalidatePath("/admin")
    revalidatePath("/admin/projets")
    revalidatePath("/")

    return { success: true }
  } catch (error) {
    console.error("Erreur lors de la suppression du projet:", error)
    return { error: "Impossible de supprimer ce projet (il contient peut-être des dons liés)." }
  }
}

// ── 5. Assigner / Ajouter un membre à un projet ──
export async function addProjectMember(projectId: string, userId: string, role: string, notes?: string) {
  const session = await auth()
  const isAdmin =
    session?.user?.roles?.includes("ADMIN") ||
    session?.user?.roles?.includes("SUPERADMIN")

  if (!isAdmin || !session?.user) {
    return { error: "Action non autorisée. Rôle ADMIN requis." }
  }

  if (!projectId || !userId) {
    return { error: "Projet et membre requis." }
  }

  try {
    const existing = await prisma.projectMember.findUnique({
      where: {
        userId_projectId: {
          userId,
          projectId,
        },
      },
    })

    if (existing) {
      return { error: "Cet intervenant fait déjà partie de l'équipe du projet." }
    }

    await prisma.projectMember.create({
      data: {
        projectId,
        userId,
        role: role || "Membre de l'équipe",
        notes: notes || null,
      },
    })

    revalidatePath("/admin")
    revalidatePath("/admin/projets")
    revalidatePath(`/admin/projets/${projectId}/editer`)
    revalidatePath("/")

    return { success: true }
  } catch (error) {
    console.error("Erreur assignation membre projet:", error)
    return { error: "Impossible d'assigner ce membre." }
  }
}

// ── 6. Mettre à jour un intervenant (rôle / description) ──
export async function updateProjectMember(assignmentId: string, role: string, notes?: string) {
  const session = await auth()
  const isAdmin =
    session?.user?.roles?.includes("ADMIN") ||
    session?.user?.roles?.includes("SUPERADMIN")

  if (!isAdmin || !session?.user) {
    return { error: "Action non autorisée. Rôle ADMIN requis." }
  }

  try {
    const updated = await prisma.projectMember.update({
      where: { id: assignmentId },
      data: {
        role: role || "Membre de l'équipe",
        notes: notes || null,
      },
    })

    revalidatePath("/admin")
    revalidatePath("/admin/projets")
    revalidatePath(`/admin/projets/${updated.projectId}/editer`)
    revalidatePath("/")

    return { success: true }
  } catch (error) {
    console.error("Erreur modification intervenant:", error)
    return { error: "Impossible de modifier cet intervenant." }
  }
}

// ── 7. Retirer un intervenant du projet ──
export async function removeProjectMember(assignmentId: string) {
  const session = await auth()
  const isAdmin =
    session?.user?.roles?.includes("ADMIN") ||
    session?.user?.roles?.includes("SUPERADMIN")

  if (!isAdmin || !session?.user) {
    return { error: "Action non autorisée. Rôle ADMIN requis." }
  }

  try {
    const deleted = await prisma.projectMember.delete({
      where: { id: assignmentId },
    })

    revalidatePath("/admin")
    revalidatePath("/admin/projets")
    revalidatePath(`/admin/projets/${deleted.projectId}/editer`)
    revalidatePath("/")

    return { success: true }
  } catch (error) {
    console.error("Erreur retrait intervenant:", error)
    return { error: "Impossible de retirer cet intervenant." }
  }
}
