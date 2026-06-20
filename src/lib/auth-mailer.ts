import 'server-only'
import nodemailer from 'nodemailer'
import { buildAppUrl, requiresConfiguredEmailDelivery } from '@/lib/app-url'
import { env, hasPartialSmtpMailerConfig, hasSmtpMailer, requireSmtpMailerEnv } from '@/lib/env'

export type AuthEmailDeliveryMode = 'smtp' | 'console'

type SendAuthEmailInput = {
  fallbackOrigin?: string
  html: string
  subject: string
  text: string
  to: string
}

let cachedTransporter: nodemailer.Transporter | null = null

function getTransporter() {
  if (cachedTransporter) return cachedTransporter

  const config = requireSmtpMailerEnv()
  cachedTransporter = nodemailer.createTransport({
    host: config.smtpHost,
    port: config.smtpPort,
    secure: config.smtpSecure,
    auth:
      config.smtpUser && config.smtpPass
        ? {
            user: config.smtpUser,
            pass: config.smtpPass,
          }
        : undefined,
  })

  return cachedTransporter
}

export function assertAuthEmailDeliveryReady(fallbackOrigin?: string) {
  if (hasSmtpMailer()) return

  if (hasPartialSmtpMailerConfig()) {
    throw new Error(
      'SMTP mailer configuration is incomplete. Complete the SMTP settings before sending auth emails.',
    )
  }

  if (requiresConfiguredEmailDelivery(fallbackOrigin)) {
    throw new Error(
      'SMTP mailer configuration is required to send verification and password reset emails for this environment.',
    )
  }
}

async function sendAuthEmail({
  fallbackOrigin,
  html,
  subject,
  text,
  to,
}: SendAuthEmailInput) {
  if (hasSmtpMailer()) {
    await getTransporter().sendMail({
      from: env.smtpFrom,
      to,
      subject,
      text,
      html,
    })

    return { mode: 'smtp' as const }
  }

  assertAuthEmailDeliveryReady(fallbackOrigin)

  console.info(`[auth-email:${subject}] ${to}\n${text}`)
  return { mode: 'console' as const }
}

function wrapEmail(title: string, intro: string, actionLabel: string, actionUrl: string, outro: string) {
  return `
    <div style="font-family:Arial,Helvetica,sans-serif;background:#f6f7fb;padding:32px;color:#121826;">
      <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:20px;padding:32px;">
        <div style="font-size:12px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#ef4444;margin-bottom:12px;">
          Property Pros
        </div>
        <h1 style="font-size:28px;line-height:1.2;margin:0 0 16px;font-weight:800;color:#111827;">
          ${title}
        </h1>
        <p style="font-size:15px;line-height:1.7;color:#4b5563;margin:0 0 24px;">
          ${intro}
        </p>
        <a
          href="${actionUrl}"
          style="display:inline-block;background:#121826;color:#ffffff;text-decoration:none;font-weight:700;padding:14px 20px;border-radius:12px;"
        >
          ${actionLabel}
        </a>
        <p style="font-size:14px;line-height:1.7;color:#4b5563;margin:24px 0 0;">
          ${outro}
        </p>
      </div>
    </div>
  `
}

export async function sendVerificationEmail({
  email,
  fallbackOrigin,
  token,
}: {
  email: string
  fallbackOrigin?: string
  token: string
}) {
  const verifyUrl = buildAppUrl(`/verify-email?token=${encodeURIComponent(token)}`, fallbackOrigin)
  const subject = 'Verify your Property Pros email'
  const text = [
    'Welcome to Property Pros.',
    `Verify your email address by opening: ${verifyUrl}`,
    'This verification link expires in 24 hours.',
  ].join('\n')

  const html = wrapEmail(
    'Verify your email address',
    'Confirm your Property Pros account to unlock credentials login and continue into the right workspace.',
    'Verify Email',
    verifyUrl,
    'This verification link expires in 24 hours. If you did not create this account, you can ignore this message.',
  )

  return sendAuthEmail({
    fallbackOrigin,
    html,
    subject,
    text,
    to: email,
  })
}

export async function sendPasswordResetEmail({
  email,
  fallbackOrigin,
  token,
}: {
  email: string
  fallbackOrigin?: string
  token: string
}) {
  const resetUrl = buildAppUrl(`/reset-password?token=${encodeURIComponent(token)}`, fallbackOrigin)
  const subject = 'Reset your Property Pros password'
  const text = [
    'We received a request to reset your Property Pros password.',
    `Reset your password by opening: ${resetUrl}`,
    'This password reset link expires in 1 hour.',
    'If you did not request a reset, you can ignore this message.',
  ].join('\n')

  const html = wrapEmail(
    'Reset your password',
    'Use the secure link below to choose a new password for your Property Pros account.',
    'Reset Password',
    resetUrl,
    'This password reset link expires in 1 hour. If you did not request a reset, no further action is needed.',
  )

  return sendAuthEmail({
    fallbackOrigin,
    html,
    subject,
    text,
    to: email,
  })
}
