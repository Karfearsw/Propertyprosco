import { ProjectStatus, QuoteStatus } from '@prisma/client'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getApiSessionUser, jsonForbidden } from '@/lib/api-guards'
import { db } from '@/lib/db'
import { isQuoteDecisionTransitionAllowed } from '@/lib/quote-workflow'

const decisionSchema = z.object({
  decision: z.enum([QuoteStatus.ACCEPTED, QuoteStatus.DECLINED]),
})

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ quoteId: string }> },
) {
  const { user, response } = await getApiSessionUser()
  if (response) return response
  if (user.role !== 'HOMEOWNER') {
    return jsonForbidden('Only homeowners can decide on quotes')
  }

  try {
    const { quoteId } = await params
    const { decision } = decisionSchema.parse(await req.json())

    const quote = await db.quote.findUnique({
      where: { id: quoteId },
      include: {
        project: {
          select: {
            id: true,
            ownerId: true,
            title: true,
            status: true,
          },
        },
        pro: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    if (!quote) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 })
    }

    if (quote.project.ownerId !== user.id) {
      return jsonForbidden('You do not have access to this quote')
    }

    if (quote.status === decision) {
      return NextResponse.json({ quote })
    }

    if (!isQuoteDecisionTransitionAllowed(quote.status, decision)) {
      return NextResponse.json(
        { error: `Cannot change quote from ${quote.status} to ${decision}` },
        { status: 409 },
      )
    }

    if (decision === QuoteStatus.ACCEPTED && quote.project.status !== ProjectStatus.OPEN) {
      return NextResponse.json(
        { error: 'Only open projects can move into a hired state' },
        { status: 409 },
      )
    }

    if (decision === QuoteStatus.ACCEPTED) {
      const homeowner = await db.user.findUnique({
        where: { id: user.id },
        select: { homeownerStripeDefaultPaymentMethodId: true },
      })

      if (!homeowner?.homeownerStripeDefaultPaymentMethodId) {
        return NextResponse.json(
          {
            error:
              'Add a payment method before accepting a quote so we can charge for completed work and platform fees.',
            redirectTo: '/homeowner/billing/add-card',
          },
          { status: 409 },
        )
      }
    }

    const updatedQuote = await db.$transaction(async (tx) => {
      if (decision === QuoteStatus.ACCEPTED) {
        const existingAcceptedQuote = await tx.quote.findFirst({
          where: {
            projectId: quote.project.id,
            status: QuoteStatus.ACCEPTED,
          },
          select: { id: true },
        })

        if (existingAcceptedQuote) {
          throw new Error('PROJECT_ALREADY_HAS_ACCEPTED_QUOTE')
        }

        const otherOpenQuotes = await tx.quote.findMany({
          where: {
            projectId: quote.project.id,
            id: { not: quote.id },
            status: {
              in: [QuoteStatus.PENDING, QuoteStatus.VIEWED],
            },
          },
          select: {
            id: true,
            proId: true,
          },
        })

        const acceptedQuote = await tx.quote.update({
          where: { id: quote.id },
          data: { status: QuoteStatus.ACCEPTED },
          include: {
            project: {
              select: {
                id: true,
                title: true,
                status: true,
              },
            },
            pro: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        })

        await tx.quote.updateMany({
          where: {
            id: {
              in: otherOpenQuotes.map((otherQuote) => otherQuote.id),
            },
          },
          data: {
            status: QuoteStatus.DECLINED,
          },
        })

        await tx.project.update({
          where: { id: quote.project.id },
          data: { status: ProjectStatus.IN_PROGRESS },
        })

        await tx.notification.create({
          data: {
            userId: quote.pro.id,
            type: 'quote_accepted',
            title: 'Quote Accepted',
            body: `Your quote for "${quote.project.title}" was accepted. The project is now in progress.`,
            link: '/pro/quotes',
          },
        })

        if (otherOpenQuotes.length > 0) {
          await tx.notification.createMany({
            data: otherOpenQuotes.map((otherQuote) => ({
              userId: otherQuote.proId,
              type: 'quote_declined',
              title: 'Quote Closed',
              body: `Another pro was hired for "${quote.project.title}". This quote is now closed.`,
              link: '/pro/quotes',
            })),
          })
        }

        return {
          ...acceptedQuote,
          project: {
            ...acceptedQuote.project,
            status: ProjectStatus.IN_PROGRESS,
          },
        }
      }

      const declinedQuote = await tx.quote.update({
        where: { id: quote.id },
        data: { status: QuoteStatus.DECLINED },
        include: {
          project: {
            select: {
              id: true,
              title: true,
              status: true,
            },
          },
          pro: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      })

      await tx.notification.create({
        data: {
          userId: quote.pro.id,
          type: 'quote_declined',
          title: 'Quote Declined',
          body: `The homeowner declined your quote for "${quote.project.title}".`,
          link: '/pro/quotes',
        },
      })

      return declinedQuote
    })

    return NextResponse.json({ quote: updatedQuote })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 422 })
    }

    if (error instanceof Error && error.message === 'PROJECT_ALREADY_HAS_ACCEPTED_QUOTE') {
      return NextResponse.json(
        { error: 'This project already has an accepted quote' },
        { status: 409 },
      )
    }

    return NextResponse.json({ error: 'Failed to update quote decision' }, { status: 500 })
  }
}
