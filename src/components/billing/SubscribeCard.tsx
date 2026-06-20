import Link from 'next/link'
import type { ReactNode } from 'react'
import { SubscriptionStatus } from '@prisma/client'
import BillingPortalButton from '@/components/billing/BillingPortalButton'

type SubscribeCardProps = {
  title: string
  amountLabel: string
  description: string
  features: string[]
  status: SubscriptionStatus
  subscribeHref: string
  manageEnabled: boolean
  manageLabel?: string
  accentButtonClassName: string
  manageButtonClassName?: string
  icon: ReactNode
}

export default function SubscribeCard({
  title,
  amountLabel,
  description,
  features,
  status,
  subscribeHref,
  manageEnabled,
  manageLabel,
  accentButtonClassName,
  manageButtonClassName,
  icon,
}: SubscribeCardProps) {
  const actionLabel =
    status === SubscriptionStatus.ACTIVE
      ? 'Subscription active'
      : status === SubscriptionStatus.CHECKOUT_PENDING
        ? 'Start subscription'
        : 'Update billing'

  return (
    <div className="bg-white border border-pp-border rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-12 h-12 rounded-2xl bg-pp-bg flex items-center justify-center">{icon}</div>
        <div>
          <div className="text-[20px] font-black text-pp-dark">{title}</div>
          <div className="text-[14px] font-bold text-pp-gray">{amountLabel}</div>
        </div>
      </div>

      <p className="text-[13px] font-bold text-pp-gray mb-5">{description}</p>

      <div className="space-y-2.5 mb-5">
        {features.map((feature) => (
          <div key={feature} className="text-[13px] font-bold text-pp-dark-3">
            {feature}
          </div>
        ))}
      </div>

      <div className="space-y-3">
        {status !== SubscriptionStatus.ACTIVE ? (
          <Link
            href={subscribeHref}
            className={`block w-full rounded-xl py-3.5 text-center text-[15px] font-black text-white transition-all ${accentButtonClassName}`}
          >
            {actionLabel}
          </Link>
        ) : null}

        {manageEnabled ? (
          <BillingPortalButton
            label={manageLabel}
            className={
              manageButtonClassName ??
              'w-full rounded-xl border border-pp-border px-5 py-3 text-[14px] font-black text-pp-dark hover:border-pp-red hover:text-pp-red transition-all'
            }
          />
        ) : null}
      </div>
    </div>
  )
}
