import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(req: Request) {
  try {
    const { firstName, lastName, email, password, church } = await req.json()

    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json({ message: 'Tous les champs obligatoires sont requis.' }, { status: 400 })
    }

    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json({ message: 'Cet email est déjà utilisé.' }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        passwordHash: hashedPassword,
        church: church || null,
        roles: {
          connectOrCreate: {
            where: { name: "VISITEUR" },
            create: {
              name: "VISITEUR",
              description: "Visiteur ou nouvel inscrit sur la plateforme",
            },
          },
        },
      },
    })

    return NextResponse.json({ message: 'Compte créé avec succès', userId: user.id }, { status: 201 })
  } catch (error) {
    console.error('Erreur inscription:', error)
    return NextResponse.json({ message: 'Erreur interne du serveur' }, { status: 500 })
  }
}
