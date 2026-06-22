import { NextResponse } from 'next/server'
import { z } from 'zod'
import { authError, isAuthEmailDeliveryError } from '@/lib/auth-errors'
import { assertAuthEmailDeliveryReady, sendPasswordResetEmail } from '@/lib/auth-mailer'
import {
  issuePasswordResetToken,
  resetPasswordWithToken,
  validatePasswordResetToken,
} from '@/lib/auth-flows'

const requestSchema = z.object({
  email: z.string().email(),
})

const confirmSchema = z.object({
  token: z.string().min(1),
  password: z
    .string()
    .min(8)
    .regex(/[A-Z]/, 'Password must include at least one uppercase letter.')
    .regex(/[0-9]/, 'Password must include at least one number.')
    .regex(/[^A-Za-z0-9]/, 'Password must include at least one special character.'),
})

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const token = searchParams.get('token')

  if (!token) {
    return NextResponse.json(
      authError('password_reset_token_missing', 'Missing reset token.'),
      { status: 400 },
    )
  }

  const state = await validatePasswordResetToken(token)
  if (!state) {
    return NextResponse.json(
      {
        valid: false,
        ...authError('password_reset_token_invalid', 'This password reset link is invalid or has expired.'),
      },
      { status: 400 },
    )
  }

  return NextResponse.json({
    valid: true,
    email: state.email,
    expiresAt: state.expiresAt,
  })
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const origin = new URL(req.url).origin

    if (typeof body?.email === 'string') {
      assertAuthEmailDeliveryReady(origin)

      const { email } = requestSchema.parse(body)
      const result = await issuePasswordResetToken(email)
      const delivery =
        result.issued && result.rawToken
          ? await sendPasswordResetEmail({
              email: result.email,
              fallbackOrigin: origin,
              token: result.rawToken,
            })
          : null

      return NextResponse.json({
        success: true,
        email: result.email,
        expiresAt: result.expiresAt,
        delivery: delivery?.mode ?? null,
      })
    }

    const { token, password } = confirmSchema.parse(body)
    const result = await resetPasswordWithToken(token, password)

    if (!result.ok) {
      return NextResponse.json(
        authError(result.code, result.error),
        { status: 400 },
      )
    }

    return NextResponse.json({ success: true, email: result.email })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        authError('validation_error', error.errors[0].message),
        { status: 422 },
      )
    }

    if (isAuthEmailDeliveryError(error)) {
      return NextResponse.json(
        authError('auth_email_delivery_unavailable', 'Unable to send reset instructions right now.'),
        { status: 503 },
      )
    }

    return NextResponse.json(
      authError('internal_error', 'Unable to process password reset.'),
      { status: 500 },
    )
  }
}
