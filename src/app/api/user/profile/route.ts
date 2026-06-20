import { NextResponse } from 'next/server'
import { SubscriptionStatus } from '@prisma/client'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import { z } from 'zod'
import { calculateProProfileCompletion, sanitizeStringArray } from '@/lib/profile-completion'

export async function GET() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    include: {
      proProfile:     true,
      realtorProfile: true,
    },
  })

  return NextResponse.json(user)
}

const updateSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phone: z.string().optional(),
  zipCode: z.string().optional(),
  emailNotifications: z.boolean().optional(),
  smsNotifications: z.boolean().optional(),
  marketingEmails: z.boolean().optional(),
  businessName: z.string().optional(),
  bio: z.string().optional(),
  services: z.array(z.string()).optional(),
  serviceArea: z.array(z.string()).optional(),
  yearsExp: z.number().optional(),
  licenseNumber: z.string().optional(),
  licensed: z.boolean().optional(),
  insured: z.boolean().optional(),
  backgroundCheck: z.boolean().optional(),
  agencyName: z.string().optional(),
})

function cleanOptionalString(value?: string) {
  const trimmed = value?.trim()
  return trimmed ? trimmed : undefined
}

export async function PATCH(req: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    const data = updateSchema.parse(body)

    const {
      firstName,
      lastName,
      phone,
      zipCode,
      emailNotifications,
      smsNotifications,
      marketingEmails,
      businessName,
      bio,
      services,
      serviceArea,
      yearsExp,
      licenseNumber,
      licensed,
      insured,
      backgroundCheck,
      agencyName,
    } = data

    const existingUser = await db.user.findUnique({ where: { id: session.user.id } })
    const nextFirstName = firstName ?? existingUser?.firstName ?? ''
    const nextLastName = lastName ?? existingUser?.lastName ?? ''
    const normalizedBusinessName = cleanOptionalString(businessName)
    const normalizedBio = cleanOptionalString(bio)
    const normalizedAgencyName = cleanOptionalString(agencyName)
    const normalizedLicenseNumber = cleanOptionalString(licenseNumber)
    const normalizedServices = services !== undefined ? sanitizeStringArray(services) : undefined
    const normalizedServiceArea = serviceArea !== undefined ? sanitizeStringArray(serviceArea) : undefined

    const user = await db.user.update({
      where: { id: session.user.id },
      data: {
        ...(firstName !== undefined && { firstName }),
        ...(lastName !== undefined && { lastName }),
        ...(phone !== undefined && { phone }),
        ...(zipCode !== undefined && { zipCode }),
        ...(emailNotifications !== undefined && { emailNotifications }),
        ...(smsNotifications !== undefined && { smsNotifications }),
        ...(marketingEmails !== undefined && { marketingEmails }),
        ...((firstName !== undefined || lastName !== undefined) && {
          name: `${nextFirstName} ${nextLastName}`.trim(),
        }),
      },
    })

    if (session.user.role === 'PRO') {
      const currentProfile = await db.proProfile.findUnique({
        where: { userId: session.user.id },
      })

      const nextServiceArea =
        normalizedServiceArea ??
        currentProfile?.serviceArea ??
        (zipCode !== undefined && zipCode.trim() ? [zipCode.trim()] : [])

      const nextProfileComplete = calculateProProfileCompletion({
        firstName: nextFirstName,
        lastName: nextLastName,
        businessName: normalizedBusinessName ?? currentProfile?.businessName,
        bio: normalizedBio ?? currentProfile?.bio,
        services: normalizedServices ?? currentProfile?.services,
        serviceArea: nextServiceArea,
        yearsExp: yearsExp ?? currentProfile?.yearsExp,
        licenseNumber: normalizedLicenseNumber ?? currentProfile?.licenseNumber,
        licensed: licensed ?? currentProfile?.licensed,
        insured: insured ?? currentProfile?.insured,
      })

      await db.proProfile.upsert({
        where: { userId: session.user.id },
        update: {
          ...(businessName !== undefined && { businessName: normalizedBusinessName }),
          ...(bio !== undefined && { bio: normalizedBio }),
          ...(services !== undefined && { services: normalizedServices ?? [] }),
          ...(serviceArea !== undefined && { serviceArea: nextServiceArea }),
          ...(yearsExp !== undefined && { yearsExp }),
          ...(licenseNumber !== undefined && { licenseNumber: normalizedLicenseNumber }),
          ...(licensed !== undefined && { licensed }),
          ...(insured !== undefined && { insured }),
          ...(backgroundCheck !== undefined && { backgroundCheck }),
          profileComplete: nextProfileComplete,
        },
        create: {
          userId: session.user.id,
          businessName: normalizedBusinessName,
          bio: normalizedBio,
          services: normalizedServices ?? [],
          serviceArea: nextServiceArea,
          yearsExp,
          licenseNumber: normalizedLicenseNumber,
          licensed: licensed ?? false,
          insured: insured ?? false,
          backgroundCheck: backgroundCheck ?? false,
          profileComplete: nextProfileComplete,
          subscriptionStatus: SubscriptionStatus.CHECKOUT_PENDING,
        },
      })
    }

    if (session.user.role === 'REALTOR') {
      await db.realtorProfile.upsert({
        where: { userId: session.user.id },
        update: {
          ...(agencyName !== undefined && { agencyName: normalizedAgencyName }),
          ...(licenseNumber !== undefined && { licenseNumber: normalizedLicenseNumber }),
        },
        create: {
          userId: session.user.id,
          agencyName: normalizedAgencyName,
          licenseNumber: normalizedLicenseNumber,
          subscriptionStatus: SubscriptionStatus.CHECKOUT_PENDING,
        },
      })
    }

    return NextResponse.json(user)
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 422 })
    }
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
  }
}
