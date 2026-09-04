"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

// ── 1. Mettre à jour les rôles d'un utilisateur ──
export async function updateUserRoles(userId: string, roleNames: string[]) {
  const session = await auth()
  const isAdmin =
    session?.user?.roles?.includes("ADMIN") ||
    session?.user?.roles?.includes("SUPERADMIN")

  if (!isAdmin || !session?.user) {
    return { error: "Action non autorisée. Rôle SuperAdmin requis." }
  }

  if (!userId) {
    return { error: "Identifiant utilisateur manquant." }
  }

  try {
    // S'assurer que le rôle VISITEUR ou MEMBRE reste présent s'il n'y a plus aucun rôle coché
    const targetRoles = roleNames.length > 0 ? roleNames : ["VISITEUR"]

    await prisma.user.update({
      where: { id: userId },
      data: {
        roles: {
          set: targetRoles.map((name) => ({ name })),
        },
      },
    })

    revalidatePath("/admin/membres")
    revalidatePath("/admin")
    revalidatePath("/profil")

    return { success: true }
  } catch (error) {
    console.error("Erreur mise à jour des rôles:", error)
    return { error: "Impossible de mettre à jour les rôles de l'utilisateur." }
  }
}

// ── 2. Supprimer un utilisateur ──
export async function deleteUser(userId: string) {
  const session = await auth()
  const isSuperAdmin = session?.user?.roles?.includes("SUPERADMIN")

  if (!isSuperAdmin || !session?.user) {
    return { error: "Action non autorisée. Privilèges SUPERADMIN requis." }
  }

  if (session.user.id === userId) {
    return { error: "Vous ne pouvez pas supprimer votre propre compte administrateur." }
  }

  try {
    await prisma.user.delete({
      where: { id: userId },
    })

    revalidatePath("/admin/membres")
    revalidatePath("/admin")

    return { success: true }
  } catch (error) {
    console.error("Erreur suppression utilisateur:", error)
    return { error: "Impossible de supprimer ce compte (des dons ou projets y sont peut-être rattachés)." }
  }
}
