import Link from 'next/link'
import { ShieldCheck, Star } from 'lucide-react'
import TrustBadge from '@/components/brand/TrustBadge'
import type { DirectoryPro } from '@/lib/find-a-pro'

type ProDirectoryCardProps = {
  pro: DirectoryPro
}

function initialsFor(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export default function ProDirectoryCard({ pro }: ProDirectoryCardProps) {
  const name = pro.businessName ?? pro.user.name ?? 'Independent Pro'
  const secondaryName = pro.businessName ? pro.user.name : 'Property Pros contractor'
  const isVerified = Boolean(pro.licensed || pro.insured || pro.backgroundCheck)

  return (
    <article className="flex h-full flex-col rounded-[28px] border border-pp-border bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-pp-red text-sm font-black text-white">
          {initialsFor(pro.user.name ?? name)}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-[16px] font-black text-pp-dark">{name}</h3>
            {isVerified && (
              <span className="inline-flex items-center gap-1 rounded-full bg-pp-green-light px-2 py-0.5 text-[10px] font-black uppercase tracking-[1px] text-pp-green">
                <ShieldCheck size={10} />
                Verified
              </span>
            )}
          </div>
          <p className="mt-1 truncate text-[12px] font-bold text-pp-gray">{secondaryName}</p>
          {(pro.serviceArea?.length ?? 0) > 0 && (
            <p className="mt-1 text-[12px] font-bold text-pp-gray">
              Serves {pro.serviceArea.slice(0, 3).join(', ')}
            </p>
          )}
        </div>
      </div>

      <div className="mt-4 flex items-center gap-3 text-[12px] font-bold text-pp-gray">
        <span className="inline-flex items-center gap-1 text-pp-amber">
          <Star size={13} fill="currentColor" />
          {(pro.rating ?? 0).toFixed(1)}
        </span>
        <span>{pro.reviewCount ?? 0} reviews</span>
        {(pro.yearsExp ?? 0) > 0 && <span>{pro.yearsExp} years exp</span>}
      </div>

      {(pro.services?.length ?? 0) > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {pro.services.slice(0, 4).map((service) => (
            <span
              key={service}
              className="rounded-full bg-pp-bg px-2.5 py-1 text-[11px] font-bold text-pp-dark-3"
            >
              {service}
            </span>
          ))}
        </div>
      )}

      {pro.bio && <p className="mt-4 text-[13px] leading-6 text-pp-gray">{pro.bio}</p>}

      <div className="mt-5 flex flex-wrap items-center gap-2">
        {pro.insured && <TrustBadge type="insured" />}
        {pro.licensed && <TrustBadge type="licensed" />}
      </div>

      <div className="mt-6 flex flex-col gap-2 sm:flex-row">
        <Link
          href="/signup/homeowner"
          className="inline-flex min-h-11 flex-1 items-center justify-center rounded-xl bg-pp-red px-4 py-2.5 text-[13px] font-black text-white transition-colors hover:bg-pp-red-dark"
        >
          Contact pro
        </Link>
        <Link
          href="/signup/homeowner"
          className="inline-flex min-h-11 items-center justify-center rounded-xl border border-pp-border px-4 py-2.5 text-[13px] font-black text-pp-dark transition-colors hover:bg-pp-bg"
        >
          Post project
        </Link>
      </div>
    </article>
  )
}
