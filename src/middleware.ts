import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const isOnDashboard = req.nextUrl.pathname.startsWith('/dashboard')
  const isOnAdmin = req.nextUrl.pathname.startsWith('/admin')
  const isOnApi = req.nextUrl.pathname.startsWith('/api') && 
                  !req.nextUrl.pathname.startsWith('/api/auth')
  const isOnLogin = req.nextUrl.pathname === '/login'

  // Redirect logged-in users away from login page
  if (isLoggedIn && isOnLogin) {
    return NextResponse.redirect(new URL('/dashboard', req.nextUrl))
  }

  // Protect dashboard, admin, and API routes
  if (!isLoggedIn && (isOnDashboard || isOnAdmin || isOnApi)) {
    return NextResponse.redirect(new URL('/login', req.nextUrl))
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
    '/api/:path*',
    '/login',
  ]
}
