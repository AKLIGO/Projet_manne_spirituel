"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

// â”€â”€ 1. CrÃ©er une nouvelle activitÃ© â”€â”€
export async function createActivity(formData: FormData) {
  const session = await auth()
  const hasAccess =
    session?.user?.roles?.includes("ADMIN") ||
    session?.user?.roles?.includes("SUPERADMIN") ||
    session?.user?.roles?.includes("SECRETAIRE")

  if (!hasAccess || !session?.user) {
    return { error: "Action non autorisÃ©e. RÃ´le ADMIN ou SECRETAIRE requis." }
  }

  const title = (formData.get("title") as string)?.trim()
  const description = (formData.get("description") as string)?.trim()
  const startDateRaw = formData.get("startDate") as string
  const location = (formData.get("location") as string)?.trim()
  const maxParticipantsRaw = formData.get("maxParticipants") as string

  if (!title || !description || !startDateRaw || !location) {
    return { error: "Le titre, la description, la date et le lieu sont obligatoires." }
  }

  const startDate = new Date(startDateRaw)
  const maxParticipants = maxParticipantsRaw ? parseInt(maxParticipantsRaw, 10) : null

  try {
    const activity = await prisma.activity.create({
      data: {
        title,
        description,
        startDate,
        location,
        maxParticipants,
      },
    })

    revalidatePath("/admin/activites")
    revalidatePath("/admin")
    revalidatePath("/")

    return { success: true, activityId: activity.id }
  } catch (error) {
    console.error("Erreur crÃ©ation activitÃ©:", error)
    return { error: "Impossible de crÃ©er l'Ã©vÃ©nement. Veuillez vÃ©rifier les donnÃ©es." }
  }
}

// â”€â”€ 2. Mettre Ã  jour une activitÃ© â”€â”€
export async function updateActivity(id: string, formData: FormData) {
  const session = await auth()
  const isAdmin =
    session?.user?.roles?.includes("ADMIN") ||
    session?.user?.roles?.includes("SUPERADMIN")

  if (!isAdmin || !session?.user) {
    return { error: "Action non autorisÃ©e. RÃ´le ADMIN requis." }
  }

  const title = (formData.get("title") as string)?.trim()
  const description = (formData.get("description") as string)?.trim()
  const startDateRaw = formData.get("startDate") as string
  const location = (formData.get("location") as string)?.trim()
  const maxParticipantsRaw = formData.get("maxParticipants") as string

  if (!title || !description || !startDateRaw || !location) {
    return { error: "Le titre, la description, la date et le lieu sont obligatoires." }
  }

  const startDate = new Date(startDateRaw)
  const maxParticipants = maxParticipantsRaw ? parseInt(maxParticipantsRaw, 10) : null

  try {
    await prisma.activity.update({
      where: { id },
      data: {
        title,
        description,
        startDate,
        location,
        maxParticipants,
      },
    })

    revalidatePath("/admin/activites")
    revalidatePath("/admin")
    revalidatePath("/")

    return { success: true }
  } catch (error) {
    console.error("Erreur mise Ã  jour activitÃ©:", error)
    return { error: "Impossible de mettre Ã  jour l'Ã©vÃ©nement." }
  }
}

// â”€â”€ 3. Supprimer une activitÃ© â”€â”€
export async function deleteActivity(id: string) {
  const session = await auth()
  const isAdmin =
    session?.user?.roles?.includes("ADMIN") ||
    session?.user?.roles?.includes("SUPERADMIN")

  if (!isAdmin || !session?.user) {
    return { error: "Action non autorisÃ©e. RÃ´le ADMIN requis." }
  }

  try {
    await prisma.activity.delete({
      where: { id },
    })

    revalidatePath("/admin/activites")
    revalidatePath("/admin")
    revalidatePath("/")

    return { success: true }
  } catch (error) {
    console.error("Erreur suppression activitÃ©:", error)
    return { error: "Impossible de supprimer cette activitÃ©." }
  }
}

