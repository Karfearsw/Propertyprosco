import bcrypt from 'bcryptjs'
import { PrismaClient, SubscriptionStatus, UserRole } from '@prisma/client'
import { demoUsers, riServices } from './seed-data'

const prisma = new PrismaClient()

async function upsertUser(input: {
  email: string
  firstName: string
  lastName: string
  name: string
  phone: string
  zipCode: string
  password: string
  role: UserRole
}) {
  const hashedPassword = await bcrypt.hash(input.password, 10)

  return prisma.user.upsert({
    where: { email: input.email },
    update: {
      firstName: input.firstName,
      lastName: input.lastName,
      name: input.name,
      phone: input.phone,
      zipCode: input.zipCode,
      password: hashedPassword,
      role: input.role,
    },
    create: {
      email: input.email,
      firstName: input.firstName,
      lastName: input.lastName,
      name: input.name,
      phone: input.phone,
      zipCode: input.zipCode,
      password: hashedPassword,
      role: input.role,
    },
  })
}

async function main() {
  const homeowner = await upsertUser({ ...demoUsers.homeowner, role: 'HOMEOWNER' })
  const pro = await upsertUser({ ...demoUsers.pro, role: 'PRO' })
  const realtor = await upsertUser({ ...demoUsers.realtor, role: 'REALTOR' })
  const billingActivatedAt = new Date()

  const proProfile = await prisma.proProfile.upsert({
    where: { userId: pro.id },
    update: {
      businessName: 'Harris Home Services',
      bio: 'Roofing, repairs, and exterior upgrades across Rhode Island.',
      services: riServices,
      serviceArea: ['Providence', 'Cranston', 'Warwick', 'Pawtucket'],
      yearsExp: 12,
      licenseNumber: 'RI-PRO-1001',
      insured: true,
      licensed: true,
      backgroundCheck: true,
      rating: 4.9,
      reviewCount: 18,
      profileComplete: 92,
      subscriptionStatus: SubscriptionStatus.ACTIVE,
      billingActivatedAt,
    },
    create: {
      userId: pro.id,
      businessName: 'Harris Home Services',
      bio: 'Roofing, repairs, and exterior upgrades across Rhode Island.',
      services: riServices,
      serviceArea: ['Providence', 'Cranston', 'Warwick', 'Pawtucket'],
      yearsExp: 12,
      licenseNumber: 'RI-PRO-1001',
      insured: true,
      licensed: true,
      backgroundCheck: true,
      rating: 4.9,
      reviewCount: 18,
      profileComplete: 92,
      subscriptionStatus: SubscriptionStatus.ACTIVE,
      billingActivatedAt,
    },
  })

  const realtorProfile = await prisma.realtorProfile.upsert({
    where: { userId: realtor.id },
    update: {
      agencyName: 'Ocean State Realty Group',
      licenseNumber: 'RI-REA-2201',
      subscriptionStatus: SubscriptionStatus.ACTIVE,
      billingActivatedAt,
    },
    create: {
      userId: realtor.id,
      agencyName: 'Ocean State Realty Group',
      licenseNumber: 'RI-REA-2201',
      subscriptionStatus: SubscriptionStatus.ACTIVE,
      billingActivatedAt,
    },
  })

  await prisma.quote.deleteMany({ where: { OR: [{ proId: pro.id }, { project: { ownerId: homeowner.id } }, { project: { ownerId: realtor.id } }] } })
  await prisma.proLead.deleteMany({ where: { proId: proProfile.id } })
  await prisma.message.deleteMany({
    where: {
      OR: [
        { senderId: homeowner.id },
        { receiverId: homeowner.id },
        { senderId: pro.id },
        { receiverId: pro.id },
        { senderId: realtor.id },
        { receiverId: realtor.id },
      ],
    },
  })
  await prisma.notification.deleteMany({ where: { userId: { in: [homeowner.id, pro.id, realtor.id] } } })
  await prisma.savedPro.deleteMany({ where: { homeownerId: homeowner.id } })
  await prisma.review.deleteMany({ where: { OR: [{ authorId: homeowner.id }, { authorId: realtor.id }, { subjectId: pro.id }] } })
  await prisma.scheduleEntry.deleteMany({ where: { proId: proProfile.id } })
  await prisma.realtorClient.deleteMany({ where: { realtorId: realtorProfile.id } })
  await prisma.project.deleteMany({ where: { ownerId: { in: [homeowner.id, realtor.id] } } })

  const homeownerProject = await prisma.project.create({
    data: {
      ownerId: homeowner.id,
      title: 'Replace roof shingles on 3-bedroom home',
      description: 'Need full tear-off and replacement before the fall season.',
      category: 'Roofing',
      budget: '$8,000-$12,000',
      zipCode: '02903',
      address: '14 Westminster St, Providence, RI',
      status: 'OPEN',
      urgent: true,
    },
  })

  const realtorProject = await prisma.project.create({
    data: {
      ownerId: realtor.id,
      title: 'Pre-listing electrical fixes for Elmwood property',
      description: 'Need quick turnaround on light fixtures, outlets, and panel labeling.',
      category: 'Electrical',
      budget: '$1,500-$2,500',
      zipCode: '02907',
      address: '250 Elmwood Ave, Providence, RI',
      status: 'IN_PROGRESS',
    },
  })

  const homeownerQuote = await prisma.quote.create({
    data: {
      projectId: homeownerProject.id,
      proId: pro.id,
      amount: 9800,
      message: 'Licensed and insured. We can start next week and finish in three days.',
      status: 'VIEWED',
    },
  })

  const realtorQuote = await prisma.quote.create({
    data: {
      projectId: realtorProject.id,
      proId: pro.id,
      amount: 1850,
      message: 'Can complete the electrical punch list before the open house.',
      status: 'ACCEPTED',
    },
  })

  await prisma.proLead.createMany({
    data: [
      { proId: proProfile.id, projectId: homeownerProject.id, status: 'new' },
      { proId: proProfile.id, projectId: realtorProject.id, status: 'quoted', viewedAt: new Date() },
    ],
  })

  await prisma.scheduleEntry.createMany({
    data: [
      {
        proId: proProfile.id,
        title: 'Roof inspection visit',
        client: homeowner.name ?? 'Maria Santos',
        address: '14 Westminster St, Providence, RI',
        date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        duration: 90,
      },
      {
        proId: proProfile.id,
        title: 'Electrical punch list',
        client: realtor.name ?? 'Amy Lee',
        address: '250 Elmwood Ave, Providence, RI',
        date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
        duration: 180,
      },
    ],
  })

  await prisma.realtorClient.createMany({
    data: [
      {
        realtorId: realtorProfile.id,
        name: 'Jordan Walker',
        email: 'jordan.walker@example.com',
        phone: '401-555-0131',
        address: '78 Benefit St, Providence, RI',
        status: 'active',
        notes: 'Needs contractor coordination before closing.',
      },
      {
        realtorId: realtorProfile.id,
        name: 'Lena Brooks',
        email: 'lena.brooks@example.com',
        phone: '401-555-0132',
        address: '45 Main St, Warwick, RI',
        status: 'pending',
        notes: 'Waiting for inspection repair quote.',
      },
    ],
  })

  await prisma.message.createMany({
    data: [
      {
        senderId: homeowner.id,
        receiverId: pro.id,
        content: 'Can you confirm whether permits are included in your quote?',
      },
      {
        senderId: pro.id,
        receiverId: homeowner.id,
        content: 'Yes, we handle permits and cleanup as part of the proposal.',
        read: true,
      },
      {
        senderId: realtor.id,
        receiverId: pro.id,
        content: 'We need the electrical work wrapped before next Thursday.',
      },
    ],
  })

  await prisma.notification.createMany({
    data: [
      {
        userId: homeowner.id,
        type: 'new_quote',
        title: 'New roofing quote received',
        body: `Kevin Harris sent a quote for ${homeownerProject.title}.`,
        link: '/homeowner/projects',
      },
      {
        userId: pro.id,
        type: 'new_lead',
        title: 'New lead in Providence',
        body: `A homeowner posted ${homeownerProject.title}.`,
        link: '/pro/leads',
      },
      {
        userId: realtor.id,
        type: 'project_update',
        title: 'Electrical quote accepted',
        body: `The quote for ${realtorProject.title} is marked accepted.`,
        link: '/realtor/dashboard',
      },
    ],
  })

  await prisma.review.create({
    data: {
      authorId: homeowner.id,
      subjectId: pro.id,
      projectId: homeownerProject.id,
      rating: 5,
      comment: 'Fast response, clear quote, and very professional communication.',
    },
  })

  await prisma.savedPro.create({
    data: {
      homeownerId: homeowner.id,
      proId: pro.id,
    },
  })

  console.log('Seed complete:')
  console.log(`- Homeowner: ${demoUsers.homeowner.email} / ${demoUsers.homeowner.password}`)
  console.log(`- Pro: ${demoUsers.pro.email} / ${demoUsers.pro.password}`)
  console.log(`- Realtor: ${demoUsers.realtor.email} / ${demoUsers.realtor.password}`)
  console.log(`- Quotes seeded: ${homeownerQuote.id}, ${realtorQuote.id}`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
