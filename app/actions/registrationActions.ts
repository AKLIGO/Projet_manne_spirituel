"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

// â”€â”€ 1. Inscription manuelle d'un membre Ã  une activitÃ© â”€â”€
export async function createManualRegistration(formData: FormData) {
  const session = await auth()
  const hasAccess =
    session?.user?.roles?.includes("ADMIN") ||
    session?.user?.roles?.includes("SUPERADMIN") ||
    session?.user?.roles?.includes("SECRETAIRE")

  if (!hasAccess || !session?.user) {
    return { error: "Action non autorisÃ©e. RÃ´le ADMIN ou SECRETAIRE requis." }
  }

  const userId = formData.get("userId") as string
  const activityId = formData.get("activityId") as string
  const status = (formData.get("status") as string) || "CONFIRMED"

  if (!userId || !activityId) {
    return { error: "Veuillez sÃ©lectionner un membre et une activitÃ©." }
  }

  try {
    // VÃ©rifier si l'utilisateur est dÃ©jÃ  inscrit
    const existing = await prisma.registration.findUnique({
      where: {
        userId_activityId: {
          userId,
          activityId,
        },
      },
    })

    if (existing) {
      return { error: "Ce membre est dÃ©jÃ  inscrit Ã  cette activitÃ©." }
    }

    // VÃ©rifier la jauge de places max si applicable
    const activity = await prisma.activity.findUnique({
      where: { id: activityId },
      include: {
        _count: {
          select: { registrations: true },
        },
      },
    })

    if (!activity) {
      return { error: "ActivitÃ© introuvable." }
    }

    if (activity.maxParticipants && activity._count.registrations >= activity.maxParticipants) {
      return { error: `La limite maximale de participants (${activity.maxParticipants}) est dÃ©jÃ  atteinte pour cet Ã©vÃ©nement.` }
    }

    const registration = await prisma.registration.create({
      data: {
        userId,
        activityId,
        status,
      },
    })

    revalidatePath("/admin/participants")
    revalidatePath("/admin/activites")
    revalidatePath("/admin")
    revalidatePath("/")

    return { success: true, registrationId: registration.id }
  } catch (error) {
    console.error("Erreur inscription manuelle:", error)
    return { error: "Impossible d'inscrire le participant. Veuillez rÃ©essayer." }
  }
}

// â”€â”€ 2. Mettre Ã  jour le statut d'une inscription â”€â”€
export async function updateRegistrationStatus(registrationId: string, status: string) {
  const session = await auth()
  const isAdmin =
    session?.user?.roles?.includes("ADMIN") ||
    session?.user?.roles?.includes("SUPERADMIN")

  if (!isAdmin || !session?.user) {
    return { error: "Action non autorisÃ©e. RÃ´le ADMIN requis." }
  }

  try {
    await prisma.registration.update({
      where: { id: registrationId },
      data: { status },
    })

    revalidatePath("/admin/participants")
    revalidatePath("/admin/activites")
    revalidatePath("/admin")

    return { success: true }
  } catch (error) {
    console.error("Erreur mise Ã  jour statut inscription:", error)
    return { error: "Erreur lors de la mise Ã  jour du statut." }
  }
}

// â”€â”€ 3. Supprimer une inscription (DÃ©sinscrire) â”€â”€
export async function deleteRegistration(registrationId: string) {
  const session = await auth()
  const isAdmin =
    session?.user?.roles?.includes("ADMIN") ||
    session?.user?.roles?.includes("SUPERADMIN")

  if (!isAdmin || !session?.user) {
    return { error: "Action non autorisÃ©e. RÃ´le ADMIN requis." }
  }

  try {
    await prisma.registration.delete({
      where: { id: registrationId },
    })

    revalidatePath("/admin/participants")
    revalidatePath("/admin/activites")
    revalidatePath("/admin")

    return { success: true }
  } catch (error) {
    console.error("Erreur suppression inscription:", error)
    return { error: "Impossible de supprimer cette inscription." }
  }
}

// â”€â”€ 4. Modifier complÃ¨tement une inscription (ActivitÃ© / Membre / Statut) â”€â”€
export async function updateFullRegistration(registrationId: string, formData: FormData) {
  const session = await auth()
  const isAdmin =
    session?.user?.roles?.includes("ADMIN") ||
    session?.user?.roles?.includes("SUPERADMIN")

  if (!isAdmin || !session?.user) {
    return { error: "Action non autorisÃ©e. RÃ´le ADMIN requis." }
  }

  const userId = formData.get("userId") as string
  const activityId = formData.get("activityId") as string
  const status = (formData.get("status") as string) || "CONFIRMED"

  if (!userId || !activityId) {
    return { error: "Veuillez sÃ©lectionner un membre et une activitÃ©." }
  }

  try {
    // VÃ©rifier si la combinaison existe dÃ©jÃ  pour une autre inscription
    const existing = await prisma.registration.findUnique({
      where: {
        userId_activityId: {
          userId,
          activityId,
        },
      },
    })

    if (existing && existing.id !== registrationId) {
      return { error: "Ce membre est dÃ©jÃ  inscrit Ã  cette activitÃ©." }
    }

    await prisma.registration.update({
      where: { id: registrationId },
      data: {
        userId,
        activityId,
        status,
      },
    })

    revalidatePath("/admin/participants")
    revalidatePath("/admin/activites")
    revalidatePath("/admin")

    return { success: true }
  } catch (error) {
    console.error("Erreur modification inscription:", error)
    return { error: "Impossible de modifier l'inscription." }
  }
}

// â”€â”€ 5. Auto-inscription d'un membre (statut EN_ATTENTE) â”€â”€
export async function selfRegister(activityId: string) {
  const session = await auth()

  if (!session?.user?.id) {
    return { error: "Vous devez Ãªtre connectÃ© pour vous inscrire." }
  }

  const userId = session.user.id

  try {
    // VÃ©rifier si dÃ©jÃ  inscrit
    const existing = await prisma.registration.findUnique({
      where: { userId_activityId: { userId, activityId } },
    })

    if (existing) {
      return { error: "Vous Ãªtes dÃ©jÃ  inscrit Ã  cet Ã©vÃ©nement." }
    }

    // VÃ©rifier la jauge de places max
    const activity = await prisma.activity.findUnique({
      where: { id: activityId },
      include: { _count: { select: { registrations: true } } },
    })

    if (!activity) {
      return { error: "Ã‰vÃ©nement introuvable." }
    }

    if (
      activity.maxParticipants &&
      activity._count.registrations >= activity.maxParticipants
    ) {
      return {
        error: `Cet Ã©vÃ©nement est complet (${activity.maxParticipants} places maximum).`,
      }
    }

    await prisma.registration.create({
      data: { userId, activityId, status: "EN_ATTENTE" },
    })

    revalidatePath("/membre/evenements")
    revalidatePath("/membre/participations")
    revalidatePath("/admin/participants")

    return { success: true }
  } catch (error) {
    console.error("Erreur auto-inscription:", error)
    return { error: "Impossible de vous inscrire. Veuillez rÃ©essayer." }
  }
}

