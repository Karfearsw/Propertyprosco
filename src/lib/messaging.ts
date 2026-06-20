import 'server-only'

import type { UserRole } from '@prisma/client'
import { db } from '@/lib/db'

type MessageParticipant = {
  id: string
  name: string | null
  image: string | null
  role: UserRole
}

export type ConversationSummary = {
  partnerId: string
  name: string | null
  image: string | null
  role: UserRole
  lastMessage: string
  lastAt: string
  unread: number
}

export type ConversationMessage = {
  id: string
  senderId: string
  receiverId: string
  content: string
  createdAt: string
  read: boolean
  sender: {
    id: string
    name: string | null
    image: string | null
    role: UserRole
  }
}

function isConversationRolePairAllowed(userRole: UserRole, partnerRole: UserRole) {
  if (userRole === 'HOMEOWNER') return partnerRole === 'PRO'
  if (userRole === 'PRO') return partnerRole === 'HOMEOWNER' || partnerRole === 'REALTOR'
  if (userRole === 'REALTOR') return partnerRole === 'PRO'
  return false
}

async function hasExistingThread(userId: string, partnerId: string) {
  const thread = await db.message.findFirst({
    where: {
      OR: [
        { senderId: userId, receiverId: partnerId },
        { senderId: partnerId, receiverId: userId },
      ],
    },
    select: { id: true },
  })

  return Boolean(thread)
}

async function hasQuotedProjectRelationship(ownerId: string, proId: string) {
  const quote = await db.quote.findFirst({
    where: {
      proId,
      project: {
        ownerId,
      },
    },
    select: { id: true },
  })

  return Boolean(quote)
}

async function hasMessagingRelationship(
  user: Pick<MessageParticipant, 'id' | 'role'>,
  partner: Pick<MessageParticipant, 'id' | 'role'>,
) {
  if (!isConversationRolePairAllowed(user.role, partner.role)) {
    return false
  }

  if (user.role === 'HOMEOWNER' && partner.role === 'PRO') {
    return true
  }

  if (user.role === 'PRO' && partner.role === 'HOMEOWNER') {
    const [existingThread, quotedProject] = await Promise.all([
      hasExistingThread(user.id, partner.id),
      hasQuotedProjectRelationship(partner.id, user.id),
    ])

    return existingThread || quotedProject
  }

  if (user.role === 'PRO' && partner.role === 'REALTOR') {
    const [existingThread, quotedProject] = await Promise.all([
      hasExistingThread(user.id, partner.id),
      hasQuotedProjectRelationship(partner.id, user.id),
    ])

    return existingThread || quotedProject
  }

  if (user.role === 'REALTOR' && partner.role === 'PRO') {
    const [existingThread, quotedProject] = await Promise.all([
      hasExistingThread(user.id, partner.id),
      hasQuotedProjectRelationship(user.id, partner.id),
    ])

    return existingThread || quotedProject
  }

  return false
}

function toConversationMessage(message: {
  id: string
  senderId: string
  receiverId: string
  content: string
  createdAt: Date
  read: boolean
  sender: MessageParticipant
}): ConversationMessage {
  return {
    id: message.id,
    senderId: message.senderId,
    receiverId: message.receiverId,
    content: message.content,
    createdAt: message.createdAt.toISOString(),
    read: message.read,
    sender: {
      id: message.sender.id,
      name: message.sender.name,
      image: message.sender.image,
      role: message.sender.role,
    },
  }
}

export async function getConversationSummaries(userId: string) {
  const currentUser = await db.user.findUnique({
    where: { id: userId },
    select: { role: true },
  })

  if (!currentUser) {
    return []
  }

  const recentMessages = await db.message.findMany({
    where: {
      OR: [{ senderId: userId }, { receiverId: userId }],
    },
    orderBy: { createdAt: 'desc' },
    include: {
      sender: { select: { id: true, name: true, image: true, role: true } },
      receiver: { select: { id: true, name: true, image: true, role: true } },
    },
    take: 200,
  })

  const unreadByPartner = new Map<string, number>()
  const conversations = new Map<string, ConversationSummary>()

  for (const message of recentMessages) {
    const partner = message.senderId === userId ? message.receiver : message.sender

    if (!isConversationRolePairAllowed(currentUser.role, partner.role)) {
      continue
    }

    if (message.senderId === partner.id && message.receiverId === userId && !message.read) {
      unreadByPartner.set(partner.id, (unreadByPartner.get(partner.id) ?? 0) + 1)
    }

    if (!conversations.has(partner.id)) {
      conversations.set(partner.id, {
        partnerId: partner.id,
        name: partner.name,
        image: partner.image,
        role: partner.role,
        lastMessage: message.content,
        lastAt: message.createdAt.toISOString(),
        unread: 0,
      })
    }
  }

  return Array.from(conversations.values()).map((conversation) => ({
    ...conversation,
    unread: unreadByPartner.get(conversation.partnerId) ?? 0,
  }))
}

export async function getThreadMessages(userId: string, partnerId: string) {
  const messages = await db.message.findMany({
    where: {
      OR: [
        { senderId: userId, receiverId: partnerId },
        { senderId: partnerId, receiverId: userId },
      ],
    },
    orderBy: { createdAt: 'asc' },
    include: {
      sender: { select: { id: true, name: true, image: true, role: true } },
    },
  })

  return messages.map(toConversationMessage)
}

export async function markThreadSeen(userId: string, partnerId: string) {
  await Promise.all([
    db.message.updateMany({
      where: {
        senderId: partnerId,
        receiverId: userId,
        read: false,
      },
      data: { read: true },
    }),
    db.notification.updateMany({
      where: {
        userId,
        type: 'new_message',
        read: false,
        link: { contains: `partnerId=${partnerId}` },
      },
      data: { read: true },
    }),
  ])
}

export async function getSafeMessagingPartner(userId: string, partnerId?: string | null) {
  if (!partnerId || partnerId === userId) {
    return null
  }

  const users = await db.user.findMany({
    where: {
      id: {
        in: [userId, partnerId],
      },
    },
    select: { id: true, name: true, image: true, role: true },
  })

  const currentUser = users.find((user) => user.id === userId)
  const partner = users.find((user) => user.id === partnerId)

  if (!currentUser || !partner) {
    return null
  }

  const allowed = await hasMessagingRelationship(currentUser, partner)
  return allowed ? partner : null
}

export async function getMessagingPageData(userId: string, preselectedPartnerId?: string | null) {
  let conversations = await getConversationSummaries(userId)
  const safePartner = await getSafeMessagingPartner(userId, preselectedPartnerId)

  if (safePartner && !conversations.some((conversation) => conversation.partnerId === safePartner.id)) {
    conversations = [
      {
        partnerId: safePartner.id,
        name: safePartner.name,
        image: safePartner.image,
        role: safePartner.role,
        lastMessage: '',
        lastAt: new Date(0).toISOString(),
        unread: 0,
      },
      ...conversations,
    ]
  }

  const selectedPartnerId = safePartner?.id ?? conversations[0]?.partnerId ?? null

  let messages: ConversationMessage[] = []
  if (selectedPartnerId) {
    await markThreadSeen(userId, selectedPartnerId)
    messages = await getThreadMessages(userId, selectedPartnerId)
    conversations = await getConversationSummaries(userId)

    if (safePartner && !conversations.some((conversation) => conversation.partnerId === safePartner.id)) {
      conversations = [
        {
          partnerId: safePartner.id,
          name: safePartner.name,
          image: safePartner.image,
          role: safePartner.role,
          lastMessage: '',
          lastAt: new Date(0).toISOString(),
          unread: 0,
        },
        ...conversations,
      ]
    }
  }

  return {
    conversations,
    selectedPartnerId,
    messages,
  }
}
