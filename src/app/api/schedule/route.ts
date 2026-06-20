import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import { z } from 'zod'
import { requirePaidApiRole } from '@/lib/api-guards'

const schema = z.object({
  title:    z.string().min(1),
  client:   z.string().optional(),
  address:  z.string().optional(),
  date:     z.string(),
  duration: z.number().optional(),
  notes:    z.string().optional(),
  status:   z.string().default('confirmed'),
})

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'PRO') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const billingResponse = requirePaidApiRole(session.user, 'PRO')
  if (billingResponse) return billingResponse

  try {
    const body = await req.json()
    const data = schema.parse(body)

    const pro = await db.proProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    })
    if (!pro) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

    const entry = await db.scheduleEntry.create({
      data: {
        ...data,
        proId: pro.id,
        date: new Date(data.date),
      },
    })
    return NextResponse.json(entry, { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.errors[0].message }, { status: 422 })
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'PRO') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const billingResponse = requirePaidApiRole(session.user, 'PRO')
  if (billingResponse) return billingResponse

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  const pro = await db.proProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  })
  if (!pro) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

  const deleted = await db.scheduleEntry.deleteMany({
    where: {
      id,
      proId: pro.id,
    },
  })

  if (deleted.count === 0) {
    return NextResponse.json({ error: 'Schedule entry not found' }, { status: 404 })
  }

  return NextResponse.json({ success: true })
}
