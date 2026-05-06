import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

const PROTECTED_ROUTES = ['/dashboard', '/profile', '/tournaments/create', '/settings']
const AUTH_ROUTES = ['/login', '/register']

export async function middleware(req: NextRequest) {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  })

  const { pathname } = req.nextUrl
  const isLoggedIn = !!token

  const isProtected = PROTECTED_ROUTES.some(route => pathname.startsWith(route))
  const isAuthRoute = AUTH_ROUTES.some(route => pathname.startsWith(route))

  if (isProtected && !isLoggedIn) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  if (isAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}