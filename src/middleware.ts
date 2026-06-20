import NextAuth from 'next-auth'
import authConfig from '@/auth.config'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { roleHome, type AppRole } from '@/lib/role-routes'

const proRoutes      = ['/pro']
const homeownerRoutes = ['/homeowner']
const realtorRoutes  = ['/realtor']
const authRoutes     = ['/login', '/signup', '/forgot-password', '/reset-password']

const { auth } = NextAuth(authConfig)

function requiresActiveBilling(role?: string, billingStatus?: string | null) {
  return (role === 'PRO' || role === 'REALTOR') && billingStatus !== 'ACTIVE'
}

export default auth(async (req: NextRequest & { auth: { user?: { role?: string; billingStatus?: string | null } } | null }) => {
  const { pathname } = req.nextUrl
  const session      = req.auth
  const role         = session?.user?.role
  const billingStatus = session?.user?.billingStatus

  const isAuthed = !!session

  if (authRoutes.some(r => pathname.startsWith(r))) {
    if (isAuthed) {
      if (requiresActiveBilling(role, billingStatus)) {
        const billingDest = role === 'PRO' ? '/pro/billing' : '/realtor/billing'
        return NextResponse.redirect(new URL(billingDest, req.url))
      }
      const dest =
        role === 'PRO'      ? '/pro/dashboard' :
        role === 'REALTOR'  ? '/realtor/dashboard' :
                              '/homeowner/dashboard'
      return NextResponse.redirect(new URL(dest, req.url))
    }
    return NextResponse.next()
  }

  if (proRoutes.some(r => pathname.startsWith(r))) {
    if (!isAuthed) return NextResponse.redirect(new URL('/login', req.url))
    if (role !== 'PRO') return NextResponse.redirect(new URL(roleHome(role as AppRole), req.url))
    if (requiresActiveBilling(role, billingStatus) && !pathname.startsWith('/pro/billing')) {
      return NextResponse.redirect(new URL('/pro/billing', req.url))
    }
  }

  if (homeownerRoutes.some(r => pathname.startsWith(r))) {
    if (!isAuthed) return NextResponse.redirect(new URL('/login', req.url))
    if (role !== 'HOMEOWNER') return NextResponse.redirect(new URL(roleHome(role as AppRole), req.url))
  }

  if (realtorRoutes.some(r => pathname.startsWith(r))) {
    if (!isAuthed) return NextResponse.redirect(new URL('/login', req.url))
    if (role !== 'REALTOR') return NextResponse.redirect(new URL(roleHome(role as AppRole), req.url))
    if (requiresActiveBilling(role, billingStatus) && !pathname.startsWith('/realtor/billing')) {
      return NextResponse.redirect(new URL('/realtor/billing', req.url))
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
