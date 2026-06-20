import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/db'

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'PRO') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const saved  = searchParams.get('saved') === 'true'
  const status = searchParams.get('status')
  const page   = parseInt(searchParams.get('page') ?? '1')
  const limit  = 20

  const pro = await db.proProfile.findUnique({ where: { userId: session.user.id } })
  if (!pro) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

  const where: Record<string, unknown> = { proId: pro.id }
  if (saved)  where.saved  = true
  if (status) where.status = status

  const [leads, total] = await Promise.all([
    db.proLead.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        project: {
          include: { owner: { select: { name: true, zipCode: true } }, _count: { select: { quotes: true } } },
        },
      },
    }),
    db.proLead.count({ where }),
  ])

  return NextResponse.json({ leads, total, page, pages: Math.ceil(total / limit) })
}
