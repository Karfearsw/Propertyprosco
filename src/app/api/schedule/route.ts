import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import { z } from 'zod'

const schema = z.object({
  proId:    z.string(),
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
  try {
    const body = await req.json()
    const data = schema.parse(body)
    const entry = await db.scheduleEntry.create({ data: { ...data, date: new Date(data.date) } })
    return NextResponse.json(entry, { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.errors[0].message }, { status: 422 })
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  await db.scheduleEntry.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
