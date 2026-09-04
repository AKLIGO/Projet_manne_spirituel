"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

// â”€â”€ 1. Enregistrer un don manuel (Hors-ligne / Culte / Virement / Mobile Money) â”€â”€
export async function createManualDonation(formData: FormData) {
  const session = await auth()
  const isAdmin =
    session?.user?.roles?.includes("ADMIN") ||
    session?.user?.roles?.includes("SUPERADMIN")

  if (!isAdmin || !session?.user) {
    return { error: "Action non autorisÃ©e. RÃ´le ADMIN requis." }
  }

  const amountRaw = formData.get("amount") as string
  const paymentMethod = (formData.get("paymentMethod") as string) || "EspÃ¨ces"
  const projectId = (formData.get("projectId") as string) || null
  const donorName = (formData.get("donorName") as string)?.trim()
  const donationDateRaw = formData.get("donationDate") as string
  const status = (formData.get("status") as string) || "COMPLETED"

  if (!amountRaw || parseFloat(amountRaw) <= 0) {
    return { error: "Veuillez renseigner un montant de don valide." }
  }

  const amount = parseFloat(amountRaw)
  const donationDate = donationDateRaw ? new Date(donationDateRaw) : new Date()

  try {
    // 1. CrÃ©er le don
    const donation = await prisma.donation.create({
      data: {
        amount,
        paymentMethod: donorName ? `${paymentMethod} (${donorName})` : paymentMethod,
        donationDate,
        status,
        projectId: projectId && projectId !== "NONE" ? projectId : null,
      },
    })

    // 2. Si rattachÃ© Ã  un projet et complÃ©tÃ©, incrÃ©menter le montant actuel du projet
    if (projectId && projectId !== "NONE" && status === "COMPLETED") {
      await prisma.project.update({
        where: { id: projectId },
        data: {
          currentAmount: {
            increment: amount,
          },
        },
      })
    }

    revalidatePath("/admin")
    revalidatePath("/admin/dons")
    revalidatePath("/admin/projets")
    revalidatePath("/")

    return { success: true, donationId: donation.id }
  } catch (error) {
    console.error("Erreur lors de l'enregistrement du don:", error)
    return { error: "Impossible d'enregistrer le don. Veuillez rÃ©essayer." }
  }
}

// â”€â”€ 2. Supprimer un don â”€â”€
export async function deleteDonation(id: string) {
  const session = await auth()
  const isAdmin =
    session?.user?.roles?.includes("ADMIN") ||
    session?.user?.roles?.includes("SUPERADMIN")

  if (!isAdmin || !session?.user) {
    return { error: "Action non autorisÃ©e. RÃ´le ADMIN requis." }
  }

  try {
    const donation = await prisma.donation.findUnique({
      where: { id },
    })

    if (!donation) {
      return { error: "Don introuvable." }
    }

    // Si rattachÃ© Ã  un projet et complÃ©tÃ©, dÃ©crÃ©menter le montant
    if (donation.projectId && donation.status === "COMPLETED") {
      await prisma.project.update({
        where: { id: donation.projectId },
        data: {
          currentAmount: {
            decrement: donation.amount,
          },
        },
      })
    }

    await prisma.donation.delete({
      where: { id },
    })

    revalidatePath("/admin")
    revalidatePath("/admin/dons")
    revalidatePath("/admin/projets")

    return { success: true }
  } catch (error) {
    console.error("Erreur suppression don:", error)
    return { error: "Impossible de supprimer ce don." }
  }
}

// â”€â”€ 3. Modifier un don â”€â”€
export async function updateManualDonation(id: string, formData: FormData) {
  const session = await auth()
  const isAdmin =
    session?.user?.roles?.includes("ADMIN") ||
    session?.user?.roles?.includes("SUPERADMIN")

  if (!isAdmin || !session?.user) {
    return { error: "Action non autorisÃ©e. RÃ´le ADMIN requis." }
  }

  const amountRaw = formData.get("amount") as string
  const paymentMethod = (formData.get("paymentMethod") as string) || "EspÃ¨ces"
  const projectId = (formData.get("projectId") as string) || null
  const donorName = (formData.get("donorName") as string)?.trim()
  const status = (formData.get("status") as string) || "COMPLETED"

  if (!amountRaw || parseFloat(amountRaw) <= 0) {
    return { error: "Veuillez renseigner un montant de don valide." }
  }

  const newAmount = parseFloat(amountRaw)

  try {
    const oldDonation = await prisma.donation.findUnique({
      where: { id },
    })

    if (!oldDonation) {
      return { error: "Don introuvable." }
    }

    // 1. Annuler l'impact de l'ancien don sur le projet prÃ©cÃ©dent
    if (oldDonation.projectId && oldDonation.status === "COMPLETED") {
      await prisma.project.update({
        where: { id: oldDonation.projectId },
        data: {
          currentAmount: {
            decrement: oldDonation.amount,
          },
        },
      })
    }

    // 2. Mettre Ã  jour le don
    const updatedDonation = await prisma.donation.update({
      where: { id },
      data: {
        amount: newAmount,
        paymentMethod: donorName ? `${paymentMethod} (${donorName})` : paymentMethod,
        status,
        projectId: projectId && projectId !== "NONE" ? projectId : null,
      },
    })

    // 3. Appliquer l'impact du nouveau don sur le nouveau projet
    const targetProjectId = projectId && projectId !== "NONE" ? projectId : null
    if (targetProjectId && status === "COMPLETED") {
      await prisma.project.update({
        where: { id: targetProjectId },
        data: {
          currentAmount: {
            increment: newAmount,
          },
        },
      })
    }

    revalidatePath("/admin")
    revalidatePath("/admin/dons")
    revalidatePath("/admin/projets")
    revalidatePath("/")

    return { success: true }
  } catch (error) {
    console.error("Erreur modification don:", error)
    return { error: "Impossible de modifier ce don." }
  }
}

