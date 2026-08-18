import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import NextAuth from "next-auth"
import { authConfig } from "./auth.config"

const { auth } = NextAuth(authConfig)

const protectedRoutes = ["/profil", "/dashboard"]
const authRoutes = ["/login", "/register"]

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const session = await auth()
  const isLoggedIn = !!session?.user

  // Rediriger vers /login si route protégée et non connecté
  if (!isLoggedIn && protectedRoutes.some(r => pathname.startsWith(r))) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // Rediriger vers /profil si déjà connecté et on accède à login/register
  if (isLoggedIn && authRoutes.some(r => pathname.startsWith(r))) {
    return NextResponse.redirect(new URL("/profil", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)'],
}
