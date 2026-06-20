import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import { z } from 'zod'
import { roleSection, type AppRole } from '@/lib/role-routes'
import { jsonForbidden, requirePaidApiRole } from '@/lib/api-guards'

const createSchema = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
  category: z.string().min(1),
  budget: z.string().optional(),
  zipCode: z.string().optional(),
  address: z.string().optional(),
  urgent: z.boolean().optional(),
  realtorClientId: z.preprocess(
    (value) => (typeof value === 'string' && value.trim() === '' ? undefined : value),
    z.string().cuid().optional(),
  ),
})

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const status  = searchParams.get('status')
  const zipCode = searchParams.get('zipCode')
  const page    = parseInt(searchParams.get('page') ?? '1')
  const limit   = 20

  if (session.user.role !== 'HOMEOWNER' && session.user.role !== 'REALTOR') {
    return jsonForbidden('Forbidden')
  }

  if (session.user.role === 'REALTOR') {
    const billingResponse = requirePaidApiRole(session.user, 'REALTOR')
    if (billingResponse) return billingResponse
  }

  const where: Record<string, unknown> = { ownerId: session.user.id }
  if (status)  where.status  = status
  if (zipCode) where.zipCode = zipCode

  const [projects, total] = await Promise.all([
    db.project.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip:  (page - 1) * limit,
      take:  limit,
      include: {
        owner: { select: { id: true, name: true, image: true } },
        realtorClient: { select: { id: true, name: true, status: true } },
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

  if (session.user.role === 'REALTOR') {
    const billingResponse = requirePaidApiRole(session.user, 'REALTOR')
    if (billingResponse) return billingResponse
  }

  try {
    const body = await req.json()
    const data = createSchema.parse(body)
    const { realtorClientId, ...projectData } = data
    let linkedClientName: string | undefined

    if (session.user.role === 'HOMEOWNER' && realtorClientId) {
      return NextResponse.json({ error: 'Homeowners cannot post on behalf of a Realtor client' }, { status: 403 })
    }

    if (session.user.role === 'REALTOR') {
      const realtor = await db.realtorProfile.findUnique({ where: { userId: session.user.id } })
      if (!realtor) {
        return NextResponse.json({ error: 'Realtor profile not found' }, { status: 404 })
      }

      if (realtorClientId) {
        const client = await db.realtorClient.findFirst({
          where: {
            id: realtorClientId,
            realtorId: realtor.id,
          },
          select: {
            id: true,
            name: true,
          },
        })

        if (!client) {
          return NextResponse.json({ error: 'Selected client was not found for this Realtor account' }, { status: 404 })
        }

        linkedClientName = client.name
      }
    }

    const project = await db.project.create({
      data: {
        ...projectData,
        ownerId: session.user.id,
        realtorClientId,
      },
      include: {
        realtorClient: { select: { id: true, name: true, status: true } },
      },
    })

    await db.notification.create({
      data: {
        userId: session.user.id,
        type:   'project_created',
        title:  session.user.role === 'REALTOR' && linkedClientName ? 'Client Project Posted!' : 'Project Posted!',
        body:   session.user.role === 'REALTOR' && linkedClientName
          ? `Your project "${project.title}" is now live for ${linkedClientName}.`
          : `Your project "${project.title}" is now live and accepting quotes.`,
        link: project.realtorClientId
          ? `${roleSection(session.user.role as AppRole, 'clients')}?clientId=${project.realtorClientId}`
          : roleSection(session.user.role as AppRole, 'projects'),
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
