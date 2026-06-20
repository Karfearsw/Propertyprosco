import { ProjectStatus, QuoteStatus } from '@prisma/client'
import { db } from '@/lib/db'

export const quoteStatusLabel: Record<QuoteStatus, string> = {
  PENDING: 'Pending',
  VIEWED: 'Viewed',
  ACCEPTED: 'Accepted',
  DECLINED: 'Declined',
}

export const quoteStatusClasses: Record<QuoteStatus, string> = {
  PENDING: 'bg-pp-gold-light text-pp-gold',
  VIEWED: 'bg-pp-blue-light text-pp-blue',
  ACCEPTED: 'bg-pp-green-light text-pp-green',
  DECLINED: 'bg-red-100 text-pp-red',
}

export function isQuoteDecisionTransitionAllowed(current: QuoteStatus, next: QuoteStatus) {
  if (current === next) return true

  switch (current) {
    case QuoteStatus.PENDING:
      return next === QuoteStatus.VIEWED || next === QuoteStatus.ACCEPTED || next === QuoteStatus.DECLINED
    case QuoteStatus.VIEWED:
      return next === QuoteStatus.ACCEPTED || next === QuoteStatus.DECLINED
    case QuoteStatus.ACCEPTED:
    case QuoteStatus.DECLINED:
      return false
    default:
      return false
  }
}

export function isHomeownerQuoteDecisionAvailable(status: QuoteStatus) {
  return status === QuoteStatus.PENDING || status === QuoteStatus.VIEWED
}

export async function markQuotesViewedForOwner(ownerId: string, projectId?: string) {
  await db.quote.updateMany({
    where: {
      status: QuoteStatus.PENDING,
      project: {
        ownerId,
        ...(projectId ? { id: projectId } : {}),
      },
    },
    data: {
      status: QuoteStatus.VIEWED,
    },
  })
}

export function getProjectWorkflowLabel(status: ProjectStatus) {
  switch (status) {
    case ProjectStatus.OPEN:
      return 'Collecting quotes'
    case ProjectStatus.IN_PROGRESS:
      return 'Pro hired'
    case ProjectStatus.COMPLETED:
      return 'Completed'
    case ProjectStatus.CANCELLED:
      return 'Cancelled'
    default:
      return String(status).replace('_', ' ')
  }
}
