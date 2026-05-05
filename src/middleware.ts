import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

const PROTECTED_ROUTES = ['/dashboard', '/profile', '/tournaments/create', '/settings']
const AUTH_ROUTES = ['/login', '/register']

export default auth((req) => {
  const { nextUrl, auth: session } = req
  const isLoggedIn = !!session?.user

  const isProtected = PROTECTED_ROUTES.some((route) =>
    nextUrl.pathname.startsWith(route)
  )
  const isAuthRoute = AUTH_ROUTES.some((route) =>
    nextUrl.pathname.startsWith(route)
  )

  // Redirect to login if trying to access protected route while logged out
  if (isProtected && !isLoggedIn) {
    return NextResponse.redirect(new URL('/login', nextUrl))
  }

  // Redirect to dashboard if trying to access login/register while logged in
  if (isAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL('/dashboard', nextUrl))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
