import type { NextAuthConfig } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

// Cette configuration ne contient PAS Prisma.
// Elle est compatible avec le Edge Runtime utilisé par le middleware.
export const authConfig: NextAuthConfig = {
  providers: [
    // Le provider Credentials est listé ici mais la validation réelle
    // (accès à la base de données) est faite dans auth.ts côté serveur.
    CredentialsProvider({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" }
      },
      async authorize() {
        return null // La logique réelle est dans auth.ts
      }
    })
  ],
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.role = token.role as any
        session.user.id = token.id as string
      }
      return session
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const protectedPaths = ['/profil', '/dashboard']
      const isProtected = protectedPaths.some(path => nextUrl.pathname.startsWith(path))

      if (isProtected && !isLoggedIn) {
        const redirectUrl = new URL('/login', nextUrl.origin)
        return Response.redirect(redirectUrl)
      }
      return true
    }
  },
  session: { strategy: "jwt" },
  secret: process.env.AUTH_SECRET || "une_cle_secrete_très_longue_et_aleatoire_pour_le_dev",
}
