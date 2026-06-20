import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import { getBillingPlan, isBillingRole } from '@/lib/billing-config'
import { env, requireStripeBillingEnv } from '@/lib/env'
import { getStripeServer } from '@/lib/stripe-server'

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user || !isBillingRole(session.user.role)) {
    return NextResponse.json({ error: 'Only paid roles can manage billing.' }, { status: 403 })
  }

  requireStripeBillingEnv()
  const stripe = getStripeServer()
  const plan = getBillingPlan(session.user.role)
  const profile =
    session.user.role === 'PRO'
      ? await db.proProfile.findUnique({ where: { userId: session.user.id } })
      : await db.realtorProfile.findUnique({ where: { userId: session.user.id } })

  if (!profile?.stripeCustomerId) {
    return NextResponse.json({ error: 'No Stripe billing profile is on file yet.' }, { status: 400 })
  }

  const origin = new URL(req.url).origin
  const portalSession = await stripe.billingPortal.sessions.create({
    customer: profile.stripeCustomerId,
    return_url: env.stripeBillingPortalReturnUrl ?? `${origin}${plan.billingPath}`,
  })

  return NextResponse.json({ url: portalSession.url })
}
