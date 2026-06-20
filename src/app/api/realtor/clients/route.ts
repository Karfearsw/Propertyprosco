import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import { z } from 'zod'

const schema = z.object({
  name:      z.string().min(1),
  email:     z.string().email().optional().or(z.literal('')),
  phone:     z.string().optional(),
  address:   z.string().optional(),
  notes:     z.string().optional(),
  status:    z.string().default('active'),
})

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'REALTOR') return NextResponse.json({ error:'Unauthorized' }, { status:401 })
  try {
    const body = await req.json()
    const data = schema.parse(body)
    const realtor = await db.realtorProfile.findUnique({ where: { userId: session.user.id } })
    if (!realtor) return NextResponse.json({ error: 'Realtor profile not found' }, { status: 404 })

    const client = await db.realtorClient.create({
      data: {
        realtorId: realtor.id,
        ...data,
        email: data.email || undefined,
      },
    })
    return NextResponse.json(client, { status:201 })
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.errors[0].message }, { status:422 })
    return NextResponse.json({ error:'Failed' }, { status:500 })
  }
}

export async function GET() {
  const session = await auth()
  if (!session?.user || session.user.role !== 'REALTOR') return NextResponse.json({ error:'Unauthorized' }, { status:401 })
  const realtor = await db.realtorProfile.findUnique({ where:{ userId: session.user.id } })
  if (!realtor) return NextResponse.json({ clients:[] })
  const clients = await db.realtorClient.findMany({ where:{ realtorId: realtor.id }, orderBy:{ createdAt:'desc' } })
  return NextResponse.json({ clients })
}
