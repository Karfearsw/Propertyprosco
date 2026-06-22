import NextAuth from 'next-auth'
import authConfig from '@/auth.config'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth0 } from '@/lib/auth0'
import { roleHome, type AppRole } from '@/lib/role-routes'

const proRoutes      = ['/pro']
const homeownerRoutes = ['/homeowner']
const realtorRoutes  = ['/realtor']
const authRoutes     = ['/login', '/signup', '/forgot-password', '/reset-password']
const signupBillingRoutes = ['/signup/pro/billing', '/signup/realtor/billing']
const auth0Routes    = [
  '/auth/login',
  '/auth/logout',
  '/auth/callback',
  '/auth/profile',
  '/auth/access-token',
  '/auth/backchannel-logout',
]

const { auth } = NextAuth(authConfig)

function requiresActiveBilling(role?: string, billingStatus?: string | null) {
  return (role === 'PRO' || role === 'REALTOR') && billingStatus !== 'ACTIVE'
}

function redirectIfNeeded(req: NextRequest, destination: string) {
  const url = new URL(destination, req.url)
  if (url.pathname === req.nextUrl.pathname) {
    return NextResponse.next()
  }

  return NextResponse.redirect(url)
}

export default auth(async (req: NextRequest & { auth: { user?: { role?: string; billingStatus?: string | null } } | null }) => {
  const { pathname } = req.nextUrl

  if (auth0Routes.some((route) => pathname.startsWith(route))) {
    return auth0.middleware(req)
  }

  const session      = req.auth
  const role         = session?.user?.role
  const billingStatus = session?.user?.billingStatus

  const isAuthed = !!session
  const isSignupBillingRoute = signupBillingRoutes.some((route) => pathname.startsWith(route))

  if (!isSignupBillingRoute && authRoutes.some(r => pathname.startsWith(r))) {
    if (isAuthed) {
      if (requiresActiveBilling(role, billingStatus)) {
        const billingDest = role === 'PRO' ? '/pro/billing' : '/realtor/billing'
        return redirectIfNeeded(req, billingDest)
      }
      const dest =
        role === 'PRO'      ? '/pro/dashboard' :
        role === 'REALTOR'  ? '/realtor/dashboard' :
                              '/homeowner/dashboard'
      return redirectIfNeeded(req, dest)
    }
    return NextResponse.next()
  }

  if (proRoutes.some(r => pathname.startsWith(r))) {
    if (!isAuthed) return redirectIfNeeded(req, '/login')
    if (role !== 'PRO') return redirectIfNeeded(req, roleHome(role as AppRole))
    if (requiresActiveBilling(role, billingStatus) && !pathname.startsWith('/pro/billing')) {
      return redirectIfNeeded(req, '/pro/billing')
    }
  }

  if (homeownerRoutes.some(r => pathname.startsWith(r))) {
    if (!isAuthed) return redirectIfNeeded(req, '/login')
    if (role !== 'HOMEOWNER') return redirectIfNeeded(req, roleHome(role as AppRole))
  }

  if (realtorRoutes.some(r => pathname.startsWith(r))) {
    if (!isAuthed) return redirectIfNeeded(req, '/login')
    if (role !== 'REALTOR') return redirectIfNeeded(req, roleHome(role as AppRole))
    if (requiresActiveBilling(role, billingStatus) && !pathname.startsWith('/realtor/billing')) {
      return redirectIfNeeded(req, '/realtor/billing')
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
