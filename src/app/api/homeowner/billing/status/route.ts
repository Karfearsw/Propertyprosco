import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/db'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== 'HOMEOWNER') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      homeownerStripeCustomerId: true,
      homeownerStripeDefaultPaymentMethodId: true,
    },
  })

  const hasPaymentMethod = Boolean(user?.homeownerStripeDefaultPaymentMethodId)

  return NextResponse.json({
    hasPaymentMethod,
    hasCustomer: Boolean(user?.homeownerStripeCustomerId),
  })
}

