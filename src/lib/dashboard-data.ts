import { db } from '@/lib/db'

export async function getHomeownerSnapshot(userId: string) {
  const [user, projects, recentQuotes, savedProsCount, unreadMessages, recentMessages, notifications] = await Promise.all([
    db.user.findUnique({ where: { id: userId } }),
    db.project.findMany({ where: { ownerId: userId }, orderBy: { createdAt: 'desc' }, take: 5, include: { _count: { select: { quotes: true } } } }),
    db.quote.findMany({
      where: { project: { ownerId: userId } },
      orderBy: { createdAt: 'desc' },
      take: 4,
      include: {
        project: { select: { id: true, title: true, category: true } },
        pro: { select: { id: true, name: true } },
      },
    }),
    db.savedPro.count({ where: { homeownerId: userId } }),
    db.message.count({ where: { receiverId: userId, read: false } }),
    db.message.findMany({
      where: { receiverId: userId },
      orderBy: { createdAt: 'desc' },
      take: 4,
      include: { sender: { select: { id: true, name: true } } },
    }),
    db.notification.findMany({ where: { userId, read: false }, orderBy: { createdAt: 'desc' }, take: 5 }),
  ])

  return {
    user,
    projects,
    recentQuotes,
    savedProsCount,
    unreadMessages,
    recentMessages,
    notifications,
    unreadNotifications: notifications.length,
    totalQuotes: projects.reduce((sum, project) => sum + project._count.quotes, 0),
  }
}

export async function getProSnapshot(userId: string) {
  const pro = await db.proProfile.findUnique({ where: { userId }, include: { user: true } })
  const proProfileId = pro?.id ?? ''

  const [recentLeads, recentQuotes, schedule, reviews, unreadMessages, recentMessages, notifications, savedLeadsCount, quickJobsCount] = await Promise.all([
    db.proLead.findMany({ where: { proId: proProfileId }, take: 5, orderBy: { createdAt: 'desc' }, include: { project: { include: { owner: { select: { name: true, zipCode: true } }, _count: { select: { quotes: true } } } } } }),
    db.quote.findMany({ where: { proId: userId }, take: 5, orderBy: { createdAt: 'desc' }, include: { project: { select: { title: true, category: true } } } }),
    db.scheduleEntry.findMany({ where: { proId: proProfileId }, take: 4, orderBy: { date: 'asc' } }),
    db.review.findMany({ where: { subjectId: userId }, take: 3, orderBy: { createdAt: 'desc' }, include: { author: { select: { name: true } } } }),
    db.message.count({ where: { receiverId: userId, read: false } }),
    db.message.findMany({
      where: { receiverId: userId },
      orderBy: { createdAt: 'desc' },
      take: 4,
      include: { sender: { select: { id: true, name: true } } },
    }),
    db.notification.findMany({ where: { userId, read: false }, take: 5, orderBy: { createdAt: 'desc' } }),
    db.proLead.count({ where: { proId: proProfileId, saved: true } }),
    db.project.count({ where: { status: 'OPEN', urgent: true } }),
  ])

  return {
    pro,
    recentLeads,
    recentQuotes,
    schedule,
    reviews,
    unreadMessages,
    recentMessages,
    notifications,
    unreadNotifications: notifications.length,
    savedLeadsCount,
    quickJobsCount,
  }
}

export async function getRealtorSnapshot(userId: string) {
  const [user, realtor, clients, projects, notifications, unreadMessages, recentMessages] = await Promise.all([
    db.user.findUnique({ where: { id: userId } }),
    db.realtorProfile.findUnique({ where: { userId } }),
    db.realtorClient.findMany({ where: { realtor: { userId } }, orderBy: { createdAt: 'desc' }, take: 5 }),
    db.project.findMany({ where: { ownerId: userId }, orderBy: { createdAt: 'desc' }, take: 5, include: { _count: { select: { quotes: true } } } }),
    db.notification.findMany({ where: { userId, read: false }, take: 5, orderBy: { createdAt: 'desc' } }),
    db.message.count({ where: { receiverId: userId, read: false } }),
    db.message.findMany({
      where: { receiverId: userId },
      orderBy: { createdAt: 'desc' },
      take: 4,
      include: { sender: { select: { id: true, name: true } } },
    }),
  ])

  return {
    user,
    realtor,
    clients,
    projects,
    notifications,
    unreadMessages,
    recentMessages,
    unreadNotifications: notifications.length,
    activeClientsCount: clients.filter((client) => client.status === 'active').length,
    totalQuotes: projects.reduce((sum, project) => sum + project._count.quotes, 0),
    referralCode: `REALTOR-${userId.slice(-6).toUpperCase()}`,
  }
}
