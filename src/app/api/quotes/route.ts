import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import { z } from 'zod'

const createSchema = z.object({
  projectId: z.string(),
  amount:    z.number().positive(),
  message:   z.string().optional(),
})

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const where: Record<string, unknown> =
    session.user.role === 'PRO'
      ? { proId: session.user.id }
      : {}

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
  const session = await auth()
  if (!session?.user || session.user.role !== 'PRO') {
    return NextResponse.json({ error: 'Only pros can send quotes' }, { status: 403 })
  }

  try {
    const body = await req.json()
    const data = createSchema.parse(body)

    const existing = await db.quote.findFirst({
      where: { projectId: data.projectId, proId: session.user.id },
    })
    if (existing) return NextResponse.json({ error: 'Quote already sent' }, { status: 400 })

    const quote = await db.quote.create({
      data: { ...data, proId: session.user.id },
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
