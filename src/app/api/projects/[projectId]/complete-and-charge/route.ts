import { NextResponse } from 'next/server'
import { ProjectStatus, ProjectPaymentStatus, QuoteStatus } from '@prisma/client'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import { requireStripeBillingEnv } from '@/lib/env'
import { getStripeServer } from '@/lib/stripe-server'

type RouteContext = {
  params: Promise<{
    projectId: string
  }>
}

function toCents(amount: number) {
  return Math.round(amount * 100)
}

export async function POST(_: Request, context: RouteContext) {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== 'PRO') {
    return NextResponse.json({ error: 'Only pros can complete and charge a project.' }, { status: 403 })
  }

  try {
    requireStripeBillingEnv()
    const stripe = getStripeServer()

    const { projectId } = await context.params

    const project = await db.project.findUnique({
      where: { id: projectId },
      include: {
        owner: {
          select: {
            id: true,
            homeownerStripeCustomerId: true,
            homeownerStripeDefaultPaymentMethodId: true,
          },
        },
        quotes: {
          where: { status: QuoteStatus.ACCEPTED },
          select: { id: true, proId: true, amount: true },
        },
        payment: {
          select: { id: true, stripePaymentIntentId: true, status: true },
        },
      },
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found.' }, { status: 404 })
    }

    if (project.status !== ProjectStatus.IN_PROGRESS) {
      return NextResponse.json({ error: 'Only in-progress projects can be completed.' }, { status: 409 })
    }

    if (project.payment) {
      return NextResponse.json(
        { error: 'This project already has a payment record.' },
        { status: 409 },
      )
    }

    const accepted = project.quotes[0]
    if (!accepted) {
      return NextResponse.json({ error: 'No accepted quote found for this project.' }, { status: 409 })
    }

    if (accepted.proId !== session.user.id) {
      return NextResponse.json({ error: 'Only the hired pro can complete this project.' }, { status: 403 })
    }

    const customerId = project.owner.homeownerStripeCustomerId
    const paymentMethodId = project.owner.homeownerStripeDefaultPaymentMethodId

    if (!customerId || !paymentMethodId) {
      return NextResponse.json(
        { error: 'Homeowner must add a payment method before the project can be charged.' },
        { status: 409 },
      )
    }

    const jobAmountCents = toCents(accepted.amount)
    const platformFeeCents = Math.round(jobAmountCents * 0.05)
    const totalAmountCents = jobAmountCents + platformFeeCents

    const paymentIntent = await stripe.paymentIntents.create(
      {
        amount: totalAmountCents,
        currency: 'usd',
        customer: customerId,
        payment_method: paymentMethodId,
        off_session: true,
        confirm: true,
        metadata: {
          projectId,
          homeownerId: project.owner.id,
          proId: session.user.id,
          jobAmountCents: String(jobAmountCents),
          platformFeeCents: String(platformFeeCents),
        },
      },
      { idempotencyKey: `project-${projectId}-complete-and-charge` },
    )

    const nextStatus =
      paymentIntent.status === 'succeeded'
        ? ProjectPaymentStatus.SUCCEEDED
        : paymentIntent.status === 'canceled'
          ? ProjectPaymentStatus.CANCELED
          : paymentIntent.status === 'requires_payment_method'
            ? ProjectPaymentStatus.FAILED
            : ProjectPaymentStatus.REQUIRES_ACTION

    const result = await db.$transaction(async (tx) => {
      const payment = await tx.projectPayment.create({
        data: {
          projectId,
          homeownerId: project.owner.id,
          proId: session.user.id,
          jobAmountCents,
          platformFeeCents,
          totalAmountCents,
          currency: 'usd',
          status: nextStatus,
          stripePaymentIntentId: paymentIntent.id,
        },
      })

      await tx.project.update({
        where: { id: projectId },
        data: { status: ProjectStatus.COMPLETED },
      })

      return payment
    })

    return NextResponse.json({
      ok: true,
      paymentId: result.id,
      stripePaymentIntentId: result.stripePaymentIntentId,
      status: result.status,
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Unable to complete and charge this project.' }, { status: 500 })
  }
}

