import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import { z } from 'zod'
import { roleSection, type AppRole } from '@/lib/role-routes'

const createSchema = z.object({
  title:       z.string().min(3),
  description: z.string().optional(),
  category:    z.string().min(1),
  budget:      z.string().optional(),
  zipCode:     z.string().optional(),
  address:     z.string().optional(),
  urgent:      z.boolean().optional(),
})

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const status  = searchParams.get('status')
  const zipCode = searchParams.get('zipCode')
  const page    = parseInt(searchParams.get('page') ?? '1')
  const limit   = 20

  const where: Record<string, unknown> = {}
  if (session.user.role === 'HOMEOWNER') where.ownerId = session.user.id
  if (status)  where.status  = status
  if (zipCode) where.zipCode = zipCode

  const [projects, total] = await Promise.all([
    db.project.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip:  (page - 1) * limit,
      take:  limit,
      include: {
        owner:  { select: { id: true, name: true, image: true } },
        _count: { select: { quotes: true } },
      },
    }),
    db.project.count({ where }),
  ])

  return NextResponse.json({ projects, total, page, pages: Math.ceil(total / limit) })
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (session.user.role !== 'HOMEOWNER' && session.user.role !== 'REALTOR') {
    return NextResponse.json({ error: 'Only homeowners and realtors can post projects' }, { status: 403 })
  }

  try {
    const body = await req.json()
    const data = createSchema.parse(body)

    const project = await db.project.create({
      data: { ...data, ownerId: session.user.id },
    })

    await db.notification.create({
      data: {
        userId: session.user.id,
        type:   'project_created',
        title:  'Project Posted!',
        body:   `Your project "${project.title}" is now live and accepting quotes.`,
        link:   roleSection(session.user.role as AppRole, 'projects'),
      },
    })

    return NextResponse.json(project, { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 422 })
    }
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 })
  }
}
