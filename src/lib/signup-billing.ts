import 'server-only'

import { createHmac, timingSafeEqual } from 'crypto'
import { requireAuthSecret } from '@/lib/env'

export type SignupBillingRole = 'PRO' | 'REALTOR'

type SignupBillingPayload = {
  userId: string
  email: string
  role: SignupBillingRole
  exp: number
  purpose: 'signup-billing'
}

const SIGNUP_BILLING_TTL_MS = 30 * 60 * 1000

function encodeBase64Url(value: string) {
  return Buffer.from(value).toString('base64url')
}

function decodeBase64Url(value: string) {
  return Buffer.from(value, 'base64url').toString('utf8')
}

function sign(encodedPayload: string) {
  return createHmac('sha256', requireAuthSecret()).update(encodedPayload).digest('base64url')
}

export function issueSignupBillingToken(input: {
  userId: string
  email: string
  role: SignupBillingRole
}) {
  const payload: SignupBillingPayload = {
    ...input,
    exp: Date.now() + SIGNUP_BILLING_TTL_MS,
    purpose: 'signup-billing',
  }

  const encodedPayload = encodeBase64Url(JSON.stringify(payload))
  const signature = sign(encodedPayload)
  return `${encodedPayload}.${signature}`
}

export function verifySignupBillingToken(rawToken: string) {
  const token = rawToken.trim()
  if (!token) return null

  const [encodedPayload, signature] = token.split('.')
  if (!encodedPayload || !signature) {
    return null
  }

  const expected = sign(encodedPayload)
  if (expected.length !== signature.length) {
    return null
  }

  const matches = timingSafeEqual(Buffer.from(expected), Buffer.from(signature))
  if (!matches) {
    return null
  }

  try {
    const payload = JSON.parse(decodeBase64Url(encodedPayload)) as SignupBillingPayload
    if (payload.purpose !== 'signup-billing' || payload.exp < Date.now()) {
      return null
    }
    return payload
  } catch {
    return null
  }
}
