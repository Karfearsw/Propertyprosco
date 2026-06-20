import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import { z } from 'zod'
import { getApiSessionUser, jsonForbidden, requirePaidApiRole } from '@/lib/api-guards'
import { markQuotesViewedForOwner } from '@/lib/quote-workflow'

const createSchema = z.object({
  projectId: z.string(),
  amount:    z.number().positive(),
  message:   z.string().optional(),
})

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const projectId = searchParams.get('projectId')

  let where: Record<string, unknown>

  if (session.user.role === 'PRO') {
    const billingResponse = requirePaidApiRole(session.user, 'PRO')
    if (billingResponse) return billingResponse

    where = { proId: session.user.id }
  } else if (session.user.role === 'HOMEOWNER' || session.user.role === 'REALTOR') {
    if (session.user.role === 'REALTOR') {
      const billingResponse = requirePaidApiRole(session.user, 'REALTOR')
      if (billingResponse) return billingResponse
    }

    where = {
      project: {
        ownerId: session.user.id,
      },
    }
  } else {
    return jsonForbidden('Forbidden')
  }

  if (projectId) {
    where.projectId = projectId
  }

  if (session.user.role === 'HOMEOWNER') {
    await markQuotesViewedForOwner(session.user.id, projectId ?? undefined)
  }

  const quotes = await db.quote.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      project: { select: { id: true, title: true, category: true, status: true } },
      pro:     { select: { id: true, name: true, image: true } },
    },
  })

  return NextResponse.json({ quotes })
}

export async function POST(req: Request) {
  const { user, response } = await getApiSessionUser()
  if (response) return response
  if (user.role !== 'PRO') return NextResponse.json({ error: 'Only pros can send quotes' }, { status: 403 })

  const billingResponse = requirePaidApiRole(user, 'PRO')
  if (billingResponse) return billingResponse

  try {
    const body = await req.json()
    const data = createSchema.parse(body)

    const project = await db.project.findUnique({
      where: { id: data.projectId },
      select: { id: true, ownerId: true, title: true, status: true },
    })

    if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    if (project.ownerId === user.id) {
      return NextResponse.json({ error: 'You cannot quote your own project' }, { status: 403 })
    }
    if (project.status !== 'OPEN') {
      return NextResponse.json({ error: 'Quotes can only be sent on open projects' }, { status: 403 })
    }

    const existing = await db.quote.findFirst({
      where: { projectId: data.projectId, proId: user.id },
    })
    if (existing) return NextResponse.json({ error: 'Quote already sent' }, { status: 400 })

    const quote = await db.quote.create({
      data: { ...data, proId: user.id },
      include: { project: { select: { ownerId: true, title: true } } },
    })

    await db.notification.create({
      data: {
        userId: quote.project.ownerId,
        type:   'new_quote',
        title:  'New Quote Received',
        body:   `A pro sent a quote of $${data.amount} for "${quote.project.title}"`,
        link:   '/homeowner/projects',
      },
    })

    return NextResponse.json(quote, { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.errors[0].message }, { status: 422 })
    return NextResponse.json({ error: 'Failed to create quote' }, { status: 500 })
  }
}
