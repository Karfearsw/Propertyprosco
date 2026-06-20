import { NextResponse } from 'next/server'
import { z } from 'zod'
import { assertAuthEmailDeliveryReady, sendVerificationEmail } from '@/lib/auth-mailer'
import {
  issueEmailVerificationToken,
  normalizeEmail,
  verifyEmailWithToken,
} from '@/lib/auth-flows'

const resendSchema = z.object({
  email: z.string().email(),
})

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const token = searchParams.get('token')

  if (!token) {
    return NextResponse.json({ error: 'Missing verification token.' }, { status: 400 })
  }

  const result = await verifyEmailWithToken(token)
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 })
  }

  return NextResponse.json({
    success: true,
    email: result.email,
    alreadyVerified: result.alreadyVerified,
  })
}

export async function POST(req: Request) {
  try {
    const origin = new URL(req.url).origin
    assertAuthEmailDeliveryReady(origin)

    const body = await req.json()
    const { email } = resendSchema.parse(body)
    const normalizedEmail = normalizeEmail(email)
    const result = await issueEmailVerificationToken(normalizedEmail)

    if (result.issued && result.rawToken) {
      const delivery = await sendVerificationEmail({
        email: normalizedEmail,
        fallbackOrigin: origin,
        token: result.rawToken,
      })

      return NextResponse.json({
        success: true,
        email: normalizedEmail,
        delivery: delivery.mode,
        alreadyVerified: false,
      })
    }

    return NextResponse.json({
      success: true,
      email: normalizedEmail,
      alreadyVerified: result.alreadyVerified,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 422 })
    }

    return NextResponse.json(
      { error: 'Unable to send the verification email right now.' },
      { status: 500 },
    )
  }
}
