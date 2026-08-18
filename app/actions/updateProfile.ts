"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function updateProfile(formData: FormData) {
  const session = await auth()
  
  if (!session?.user) {
    return { error: "Non autorisé" }
  }

  const bio = formData.get("bio") as string
  const church = formData.get("church") as string
  const firstName = formData.get("firstName") as string
  const lastName = formData.get("lastName") as string

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        bio,
        church,
        firstName,
        lastName,
      }
    })
    
    revalidatePath("/profil")
    return { success: true }
  } catch (error) {
    console.error("Failed to update profile", error)
    return { error: "Erreur lors de la mise à jour du profil" }
  }
}
