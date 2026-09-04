import { prisma } from "../lib/prisma"

const defaultRoles = [
  { name: "SUPERADMIN", description: "Super Administrateur avec accès complet et gestion globale" },
  { name: "ADMIN", description: "Administrateur de la plateforme et des projets" },
  { name: "PASTEUR", description: "Leader spirituel et encadrant pastoral" },
  { name: "SECRETAIRE", description: "Secrétariat, gestion des participants et des activités" },
  { name: "TRESORIER", description: "Gestion financière, comptabilité et suivi des dons" },
  { name: "MEMBRE", description: "Membre engagé de la communauté" },
  { name: "VISITEUR", description: "Visiteur ou nouvel inscrit" },
]

async function main() {
  console.log("🌱 Initialisation des rôles par défaut...")

  for (const role of defaultRoles) {
    const created = await prisma.role.upsert({
      where: { name: role.name },
      update: { description: role.description },
      create: {
        name: role.name,
        description: role.description,
      },
    })
    console.log(`✅ Rôle vérifié/créé : ${created.name}`)
  }

  // Assigner SUPERADMIN & ADMIN aux utilisateurs existants pour qu'ils ne perdent pas leurs accès
  const users = await prisma.user.findMany()
  for (const user of users) {
    console.log(`👤 Attribution des rôles SUPERADMIN et ADMIN à l'utilisateur : ${user.email}`)
    await prisma.user.update({
      where: { id: user.id },
      data: {
        roles: {
          connect: [
            { name: "SUPERADMIN" },
            { name: "ADMIN" },
            { name: "MEMBRE" },
          ],
        },
      },
    })
  }

  console.log("🎉 Migration et attribution des rôles terminées avec succès !")
}

main()
  .catch((e) => {
    console.error("❌ Erreur seed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
