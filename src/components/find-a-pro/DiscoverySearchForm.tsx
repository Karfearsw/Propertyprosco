'use client'

import { useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { LocateFixed, MapPin, Search } from 'lucide-react'
import { buildWaitlistContactHref, checkMarketByInput, nearestMarketFromCoords, type MarketDefinition } from '@/lib/markets'
import { cn } from '@/lib/utils'

type DiscoverySearchFormProps = {
  initialQuery?: string
  initialLocation?: string
  initialCategory?: string
  action?: string
  className?: string
  theme?: 'dark' | 'light'
  submitLabel?: string
  compact?: boolean
}

function submitParams({
  action,
  category,
  location,
  q,
}: {
  action: string
  q: string
  location: string
  category?: string
}) {
  const params = new URLSearchParams()

  if (q.trim()) params.set('q', q.trim())
  if (category?.trim()) params.set('category', category.trim())

  const marketMatch = checkMarketByInput(location)
  if (marketMatch.zip) {
    params.set('zip', marketMatch.zip)
  } else if (location.trim()) {
    params.set('location', location.trim())
  }

  return `${action}?${params.toString()}`
}

export default function DiscoverySearchForm({
  action = '/find-a-pro',
  className,
  compact = false,
  initialCategory = '',
  initialLocation = '',
  initialQuery = '',
  submitLabel = 'Find pros',
  theme = 'dark',
}: DiscoverySearchFormProps) {
  const router = useRouter()
  const [q, setQ] = useState(initialQuery)
  const [location, setLocation] = useState(initialLocation)
  const [message, setMessage] = useState('')
  const [messageTone, setMessageTone] = useState<'live' | 'comingSoon' | 'unsupported'>('live')
  const [locationHref, setLocationHref] = useState('')
  const [isPending, startTransition] = useTransition()

  const styles = useMemo(
    () =>
      theme === 'dark'
        ? {
            shell: 'border-white/12 bg-white/8',
            input: 'text-white placeholder:text-gray-500',
            divider: 'bg-white/10',
            locationButton: 'text-gray-400 hover:text-white',
            actionButton: 'bg-pp-red text-white hover:bg-pp-red-dark',
          }
        : {
            shell: 'border-pp-border bg-white',
            input: 'text-pp-dark placeholder:text-pp-gray',
            divider: 'bg-pp-border',
            locationButton: 'text-pp-gray hover:text-pp-dark',
            actionButton: 'bg-pp-dark text-white hover:bg-pp-dark-2',
          },
    [theme]
  )

  function goToDirectory(nextLocation: string, nextQuery = q) {
    const href = submitParams({
      action,
      category: initialCategory,
      location: nextLocation,
      q: nextQuery,
    })
    router.push(href)
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    goToDirectory(location, q)
  }

  function updateLocationMessage({
    market,
    label,
    tone,
  }: {
    label: string
    market: MarketDefinition | null
    tone: 'live' | 'comingSoon' | 'unsupported'
  }) {
    if (tone === 'comingSoon' && market) {
      setMessage(`${market.state} is coming soon. You can still request launch updates for ${label || market.state}.`)
      setLocationHref(buildWaitlistContactHref(label || market.state, market))
      setMessageTone('comingSoon')
      return
    }

    if (tone === 'unsupported') {
      setMessage('That area is not live yet. Property Pros is live in Rhode Island first, with more markets coming next.')
      setLocationHref(buildWaitlistContactHref(label))
      setMessageTone('unsupported')
      return
    }

    setMessage(label ? `Using ${label} for your search.` : '')
    setLocationHref('')
    setMessageTone('live')
  }

  function useMyLocation() {
    if (!navigator.geolocation) {
      updateLocationMessage({ label: location, market: null, tone: 'unsupported' })
      return
    }

    setMessage('Checking your device location…')
    setLocationHref('')

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const nearestMarket = nearestMarketFromCoords(position.coords.latitude, position.coords.longitude)
        const label = nearestMarket.state
        setLocation(label)

        if (nearestMarket.status === 'live') {
          updateLocationMessage({ label, market: nearestMarket, tone: 'live' })
          startTransition(() => {
            goToDirectory(label, q)
          })
          return
        }

        updateLocationMessage({ label, market: nearestMarket, tone: 'comingSoon' })
      },
      () => {
        updateLocationMessage({ label: location, market: null, tone: 'unsupported' })
      },
      { enableHighAccuracy: false, maximumAge: 60000, timeout: 7000 }
    )
  }

  return (
    <div className={className}>
      <form
        onSubmit={onSubmit}
        className={cn(
          'rounded-2xl border p-1.5 shadow-sm',
          compact
            ? 'flex flex-col gap-1.5 sm:flex-row sm:flex-wrap'
            : 'flex flex-col gap-1.5 md:flex-row md:items-center',
          styles.shell
        )}
      >
        <div className="flex min-w-0 flex-1 items-center gap-2 px-3 py-2.5">
          <Search size={16} className={theme === 'dark' ? 'text-gray-500' : 'text-pp-gray'} />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className={cn('min-w-0 flex-1 bg-transparent text-sm outline-none', styles.input)}
            placeholder="What do you need done?"
            aria-label="Service or trade"
          />
        </div>

        <div className={cn('hidden h-8 w-px md:block', styles.divider)} />

        <div className="flex min-w-0 items-center gap-2 px-3 py-2.5 md:w-[220px]">
          <MapPin size={15} className={theme === 'dark' ? 'text-gray-500' : 'text-pp-gray'} />
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className={cn('min-w-0 flex-1 bg-transparent text-sm outline-none', styles.input)}
            placeholder="ZIP code or city"
            aria-label="ZIP code or city"
          />
        </div>

        <button
          type="submit"
          className={cn(
            'inline-flex min-h-11 items-center justify-center rounded-xl px-5 py-2.5 text-sm font-extrabold transition-all whitespace-nowrap',
            styles.actionButton
          )}
        >
          {submitLabel}
        </button>
      </form>

      <div className={cn('mt-3 flex flex-wrap items-center gap-3', compact && 'mt-2')}>
        <button
          type="button"
          onClick={useMyLocation}
          disabled={isPending}
          className={cn(
            'inline-flex min-h-10 items-center gap-1.5 rounded-full px-1 text-[13px] font-bold transition-colors disabled:opacity-60',
            styles.locationButton
          )}
        >
          <LocateFixed size={14} />
          {isPending ? 'Locating…' : 'Use my location'}
        </button>

        {message && (
          <div
            className={cn(
              'rounded-2xl px-3.5 py-2 text-[12px] font-bold leading-relaxed',
              messageTone === 'live' && 'bg-pp-green-light text-pp-green',
              messageTone === 'comingSoon' && 'bg-pp-gold-light text-amber-800',
              messageTone === 'unsupported' && 'bg-red-50 text-red-700'
            )}
          >
            {message}
            {locationHref && (
              <>
                {' '}
                <a href={locationHref} className="underline underline-offset-2">
                  Request launch updates
                </a>
                .
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
