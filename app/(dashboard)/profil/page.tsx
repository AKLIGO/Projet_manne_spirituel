import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import ProfileForm from "./ProfileForm"

export default async function ProfilPage() {
  const session = await auth()
  
  if (!session?.user) {
    redirect("/login")
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id }
  })

  if (!user) {
    return <div>Utilisateur introuvable</div>
  }

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Mon Profil</h1>
      
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Informations Personnelles</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Gérez vos informations publiques.</p>
        </div>

        <ProfileForm 
          initialData={{
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            bio: user.bio || "",
            church: user.church || "",
            profileImage: user.profileImage || "",
          }}
        />
      </div>
    </div>
  )
}
