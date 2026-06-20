import Link from 'next/link'
import { ArrowRight, MapPin, Sparkles } from 'lucide-react'
import { buildWaitlistContactHref, getMarketSummary, type MarketDefinition, type MarketStatus } from '@/lib/markets'
import { cn } from '@/lib/utils'

type MarketStatusBannerProps = {
  status: MarketStatus
  market: MarketDefinition | null
  location: string
}

export default function MarketStatusBanner({
  location,
  market,
  status,
}: MarketStatusBannerProps) {
  const summary = getMarketSummary(status, market, location)

  return (
    <div
      className={cn(
        'rounded-3xl border px-5 py-4 shadow-sm',
        summary.tone === 'live' && 'border-green-200 bg-pp-green-light',
        summary.tone === 'comingSoon' && 'border-amber-200 bg-pp-gold-light',
        summary.tone === 'unsupported' && 'border-red-200 bg-red-50'
      )}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[1.5px] text-pp-dark">
            {summary.tone === 'live' ? <Sparkles size={12} /> : <MapPin size={12} />}
            Market status
          </div>
          <h2 className="mt-2 text-[20px] font-black tracking-tight text-pp-dark">{summary.title}</h2>
          <p className="mt-2 max-w-3xl text-[14px] leading-relaxed text-pp-dark-3">{summary.body}</p>
        </div>

        {summary.tone !== 'live' && (
          <Link
            href={buildWaitlistContactHref(location || market?.state || '', market)}
            className="inline-flex min-h-11 items-center gap-2 rounded-2xl bg-pp-dark px-4 py-2.5 text-[13px] font-black text-white transition-colors hover:bg-pp-dark-2"
          >
            Request updates
            <ArrowRight size={14} />
          </Link>
        )}
      </div>
    </div>
  )
}
