import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import { z } from 'zod'
import { getConversationSummaries, getSafeMessagingPartner, getThreadMessages, markThreadSeen } from '@/lib/messaging'
import { roleSection, type AppRole } from '@/lib/role-routes'

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const partnerId = searchParams.get('partnerId')

  if (partnerId) {
    const partner = await getSafeMessagingPartner(session.user.id, partnerId)
    if (!partner) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
    }

    await markThreadSeen(session.user.id, partnerId)
    const messages = await getThreadMessages(session.user.id, partnerId)

    return NextResponse.json({
      messages,
      partner: {
        id: partner.id,
        name: partner.name,
        image: partner.image,
        role: partner.role,
      },
    })
  }

  const conversations = await getConversationSummaries(session.user.id)

  return NextResponse.json({
    conversations,
    unreadCount: conversations.reduce((count, conversation) => count + conversation.unread, 0),
  })
}

const sendSchema = z.object({
  receiverId: z.string(),
  content: z.string().trim().min(1).max(5000),
})

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    const data = sendSchema.parse(body)
    const receiver = await db.user.findUnique({
      where: { id: data.receiverId },
      select: { id: true, role: true },
    })

    if (!receiver || receiver.id === session.user.id) {
      return NextResponse.json({ error: 'Invalid recipient' }, { status: 422 })
    }

    const message = await db.message.create({
      data: { senderId: session.user.id, receiverId: data.receiverId, content: data.content },
      include: { sender: { select: { id: true, name: true, image: true, role: true } } },
    })

    await db.notification.create({
      data: {
        userId: data.receiverId,
        type:   'new_message',
        title:  `New message from ${message.sender.name ?? 'a user'}`,
        body:   data.content.slice(0, 100),
        link:   `${roleSection(receiver.role as AppRole, 'messages')}?partnerId=${session.user.id}`,
      },
    })

    return NextResponse.json(message, { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.errors[0].message }, { status: 422 })
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
  }
}
