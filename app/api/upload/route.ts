import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ message: 'Non autorisé' }, { status: 401 })
  }

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ message: 'Aucun fichier reçu.' }, { status: 400 })
    }

    // Vérifier le type de fichier
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!validTypes.includes(file.type)) {
      return NextResponse.json({ message: 'Format de fichier non supporté. Utilisez JPG, PNG ou WebP.' }, { status: 400 })
    }

    // Vérifier la taille (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ message: 'La photo ne doit pas dépasser 5MB.' }, { status: 400 })
    }

    // Créer le dossier si inexistant
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'profiles')
    await mkdir(uploadDir, { recursive: true })

    // Générer un nom de fichier unique
    const ext = file.name.split('.').pop()
    const filename = `profile-${session.user.id}-${Date.now()}.${ext}`
    const filepath = path.join(uploadDir, filename)

    // Écrire le fichier
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filepath, buffer)

    // URL publique
    const imageUrl = `/uploads/profiles/${filename}`

    // Mettre à jour en base de données
    await prisma.user.update({
      where: { id: session.user.id },
      data: { profileImage: imageUrl }
    })

    return NextResponse.json({ imageUrl }, { status: 200 })
  } catch (error) {
    console.error('Erreur upload:', error)
    return NextResponse.json({ message: 'Erreur lors de l\'upload.' }, { status: 500 })
  }
}
