export type MarketStatus = 'live' | 'comingSoon' | 'unknown'

export type MarketDefinition = {
  state: string
  abbr: string
  slug: string
  status: Exclude<MarketStatus, 'unknown'>
  zips: string[]
  center: {
    lat: number
    lng: number
  }
  cities: string[]
}

export const PP_MARKETS: MarketDefinition[] = [
  {
    state: 'Rhode Island',
    abbr: 'RI',
    slug: 'rhode-island',
    status: 'live',
    zips: ['028', '029'],
    center: { lat: 41.82, lng: -71.41 },
    cities: [
      'Providence',
      'Cranston',
      'Warwick',
      'Pawtucket',
      'East Providence',
      'North Providence',
      'Johnston',
      'Lincoln',
      'Cumberland',
      'Woonsocket',
      'West Warwick',
      'Newport',
      'Bristol',
      'Smithfield',
      'Coventry',
    ],
  },
  {
    state: 'Massachusetts',
    abbr: 'MA',
    slug: 'massachusetts',
    status: 'comingSoon',
    zips: [
      '010', '011', '012', '013', '014', '015', '016', '017', '018', '019', '020',
      '021', '022', '023', '024', '025', '026', '027', '055',
    ],
    center: { lat: 42.36, lng: -71.06 },
    cities: ['Boston', 'Worcester', 'Fall River', 'New Bedford', 'Brockton'],
  },
  {
    state: 'Connecticut',
    abbr: 'CT',
    slug: 'connecticut',
    status: 'comingSoon',
    zips: ['060', '061', '062', '063', '064', '065', '066', '067', '068', '069'],
    center: { lat: 41.77, lng: -72.67 },
    cities: ['Hartford', 'New Haven', 'Bridgeport', 'Stamford', 'Waterbury'],
  },
]

export type MarketMatch = {
  status: MarketStatus
  market: MarketDefinition | null
  zip: string
  locationLabel: string
}

export function slugifyLocation(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

export function deslugifyLocation(value: string) {
  return value
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

export function normalizeZip(value: string) {
  return value.replace(/\D/g, '').slice(0, 5)
}

export function normalizeLocation(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, ' ')
}

export function getMarketByState(value: string) {
  const normalized = normalizeLocation(value)
  return PP_MARKETS.find(
    (market) =>
      normalizeLocation(market.state) === normalized ||
      normalizeLocation(market.abbr) === normalized ||
      normalizeLocation(market.slug) === normalized
  ) ?? null
}

export function getMarketByCity(value: string) {
  const normalized = normalizeLocation(value)
  return (
    PP_MARKETS.find((market) =>
      market.cities.some((city) => normalizeLocation(city) === normalized)
    ) ?? null
  )
}

export function checkMarketByInput(rawValue: string): MarketMatch {
  const trimmed = rawValue.trim()
  const zip = normalizeZip(trimmed)

  if (zip.length >= 3) {
    const market = PP_MARKETS.find((candidate) => candidate.zips.includes(zip.slice(0, 3))) ?? null
    if (!market) {
      return {
        status: 'unknown',
        market: null,
        zip,
        locationLabel: zip,
      }
    }

    return {
      status: market.status,
      market,
      zip,
      locationLabel: zip,
    }
  }

  const stateMatch = getMarketByState(trimmed)
  if (stateMatch) {
    return {
      status: stateMatch.status,
      market: stateMatch,
      zip: '',
      locationLabel: stateMatch.state,
    }
  }

  const cityMatch = getMarketByCity(trimmed)
  if (cityMatch) {
    return {
      status: cityMatch.status,
      market: cityMatch,
      zip: '',
      locationLabel: trimmed,
    }
  }

  return {
    status: trimmed ? 'unknown' : 'live',
    market: null,
    zip,
    locationLabel: trimmed,
  }
}

export function nearestMarketFromCoords(latitude: number, longitude: number) {
  let best = PP_MARKETS[0]
  let bestDistance = Number.POSITIVE_INFINITY

  for (const market of PP_MARKETS) {
    const distance = Math.hypot(market.center.lat - latitude, market.center.lng - longitude)
    if (distance < bestDistance) {
      bestDistance = distance
      best = market
    }
  }

  return best
}

export function buildWaitlistContactHref(location: string, market?: MarketDefinition | null) {
  const params = new URLSearchParams({
    subject: 'Market waitlist request',
    message: `Please notify me when Property Pros launches in ${location || market?.state || 'my area'}.`,
  })

  if (market?.abbr) params.set('market', market.abbr)

  return `/contact?${params.toString()}`
}

export function getMarketSummary(status: MarketStatus, market: MarketDefinition | null, location: string) {
  if (status === 'comingSoon' && market) {
    return {
      tone: 'comingSoon' as const,
      title: `${market.state} is coming soon`,
      body: `Property Pros is preparing to launch in ${market.state}. You can still explore the experience and request launch updates for ${location || market.state}.`,
    }
  }

  if (status === 'unknown') {
    return {
      tone: 'unsupported' as const,
      title: 'That service area is not live yet',
      body: 'Property Pros is live in Rhode Island first, with more markets coming next. You can still request updates for your area.',
    }
  }

  return {
    tone: 'live' as const,
    title: market ? `${market.state} is live on Property Pros` : 'Find verified local pros',
    body: market
      ? `Browse verified contractors, compare credentials, and connect with local pros serving ${location || market.state}.`
      : 'Search by trade, location, and trust signals to find the right local professional.',
  }
}
