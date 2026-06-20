import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/db'

export async function GET() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const [notifications, unreadCount] = await Promise.all([
    db.notification.findMany({
      where:   { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take:    50,
    }),
    db.notification.count({ where: { userId: session.user.id, read: false } }),
  ])

  return NextResponse.json({ notifications, unreadCount })
}

export async function PATCH(req: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')

  if (id) {
    await db.notification.updateMany({
      where: { id, userId: session.user.id, read: false },
      data: { read: true },
    })
  } else {
    await db.notification.updateMany({ where: { userId: session.user.id, read: false }, data: { read: true } })
  }

  return NextResponse.json({ success: true })
}
