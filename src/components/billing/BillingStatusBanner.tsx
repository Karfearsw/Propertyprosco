import Link from 'next/link'

type BillingStatusBannerProps = {
  body: string
  billingHref: string
  accentClassName: string
}

export default function BillingStatusBanner({
  body,
  billingHref,
  accentClassName,
}: BillingStatusBannerProps) {
  return (
    <div className={accentClassName}>
      <p className="text-[13px] font-extrabold">
        {body}{' '}
        <Link href={billingHref} className="underline">
          Open billing
        </Link>
      </p>
    </div>
  )
}
