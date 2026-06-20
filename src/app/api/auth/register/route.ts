import { NextResponse } from 'next/server'
import { SubscriptionStatus } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { db } from '@/lib/db'
import { normalizeEmail } from '@/lib/auth-flows'
import { calculateProProfileCompletion, sanitizeStringArray } from '@/lib/profile-completion'

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().optional(),
  zipCode: z.string().optional(),
  role: z.enum(['HOMEOWNER', 'PRO', 'REALTOR']),
  businessName: z.string().optional(),
  bio: z.string().optional(),
  services: z.array(z.string()).optional(),
  serviceArea: z.array(z.string()).optional(),
  yearsExp: z.coerce.number().int().min(0).optional(),
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

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const data = schema.parse(body)
    const email = normalizeEmail(data.email)
    const businessName = cleanOptionalString(data.businessName)
    const bio = cleanOptionalString(data.bio)
    const agencyName = cleanOptionalString(data.agencyName)
    const licenseNumber = cleanOptionalString(data.licenseNumber)
    const services = sanitizeStringArray(data.services)
    const serviceArea = sanitizeStringArray(data.serviceArea)
    const normalizedServiceArea = serviceArea.length > 0
      ? serviceArea
      : cleanOptionalString(data.zipCode)
        ? [data.zipCode!.trim()]
        : []

    const existing = await db.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: 'Email already in use' }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(data.password, 12)

    const user = await db.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName,
        name: `${data.firstName} ${data.lastName}`.trim(),
        phone: data.phone,
        zipCode: data.zipCode,
        role: data.role,
      },
    })

    if (data.role === 'PRO') {
      const profileComplete = calculateProProfileCompletion({
        firstName: data.firstName,
        lastName: data.lastName,
        businessName,
        bio,
        services,
        serviceArea: normalizedServiceArea,
        yearsExp: data.yearsExp,
        licenseNumber,
        licensed: data.licensed,
        insured: data.insured,
      })

      await db.proProfile.create({
        data: {
          userId: user.id,
          businessName,
          bio,
          services,
          serviceArea: normalizedServiceArea,
          yearsExp: data.yearsExp,
          licenseNumber,
          licensed: data.licensed ?? false,
          insured: data.insured ?? false,
          backgroundCheck: data.backgroundCheck ?? false,
          profileComplete,
          subscriptionStatus: SubscriptionStatus.CHECKOUT_PENDING,
        },
      })
    }

    if (data.role === 'REALTOR') {
      await db.realtorProfile.create({
        data: {
          userId: user.id,
          agencyName,
          licenseNumber,
          subscriptionStatus: SubscriptionStatus.CHECKOUT_PENDING,
        },
      })
    }

    await db.notification.create({
      data: {
        userId: user.id,
        type: 'welcome',
        title: 'Welcome to Property Pros!',
        body:
          data.role === 'PRO'
            ? 'Your Pro account is ready. Complete billing to unlock leads and messaging.'
            : data.role === 'REALTOR'
              ? 'Your Realtor account is ready. Complete billing to unlock client coordination tools.'
              : 'Your free account is ready. Post your first project to get quotes!',
        link:
          data.role === 'PRO'
            ? '/pro/billing'
            : data.role === 'REALTOR'
              ? '/realtor/billing'
              : '/homeowner/dashboard',
      },
    })

    return NextResponse.json({ success: true, userId: user.id })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 422 })
    }

    console.error(error)
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 })
  }
}
