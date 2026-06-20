import 'server-only'
import { db } from '@/lib/db'
import { checkMarketByInput, deslugifyLocation, getMarketByState, normalizeLocation, normalizeZip } from '@/lib/markets'

export type DirectorySort = 'rating' | 'reviews' | 'experience' | 'name'

export type DirectorySearchParams = {
  category?: string
  q?: string
  zip?: string
  location?: string
  sort?: string
  licensed?: string
  insured?: string
  topRated?: string
}

export type DirectoryFilters = {
  category?: string
  q?: string
  zip?: string
  location?: string
  sort: DirectorySort
  licensed: boolean
  insured: boolean
  topRated: boolean
}

export type DirectoryPro = Awaited<ReturnType<typeof fetchProsForDirectory>>['pros'][number]

function truthy(value?: string) {
  return value === '1' || value === 'true' || value === 'on'
}

export function parseDirectoryFilters(params: DirectorySearchParams): DirectoryFilters {
  const zip = normalizeZip(params.zip ?? params.location ?? '')
  const rawLocation = zip ? '' : (params.location ?? '').trim()

  return {
    category: params.category?.trim() || undefined,
    q: params.q?.trim() || undefined,
    zip: zip || undefined,
    location: rawLocation || undefined,
    sort: (['rating', 'reviews', 'experience', 'name'].includes(params.sort ?? '')
      ? params.sort
      : 'rating') as DirectorySort,
    licensed: truthy(params.licensed),
    insured: truthy(params.insured),
    topRated: truthy(params.topRated),
  }
}

function matchesLocation({
  location,
  zip,
  serviceArea,
  userZip,
}: {
  location?: string
  zip?: string
  serviceArea: string[]
  userZip?: string | null
}) {
  if (!location && !zip) return true

  if (zip) {
    const normalizedUserZip = normalizeZip(userZip ?? '')
    if (normalizedUserZip.startsWith(zip.slice(0, 3))) return true
    return serviceArea.some((entry) => normalizeZip(entry).startsWith(zip.slice(0, 3)))
  }

  const normalized = normalizeLocation(location ?? '')
  if (!normalized) return true

  const stateMarket = getMarketByState(location ?? '')
  if (stateMarket) {
    const normalizedUserZip = normalizeZip(userZip ?? '')
    if (normalizedUserZip && stateMarket.zips.includes(normalizedUserZip.slice(0, 3))) {
      return true
    }
  }

  return serviceArea.some((entry) => normalizeLocation(entry).includes(normalized))
}

function matchesQuery(q: string | undefined, pro: {
  businessName: string | null
  bio: string | null
  services: string[]
  serviceArea: string[]
  user: { name: string | null }
}) {
  if (!q) return true
  const normalized = normalizeLocation(q)
  const haystack = [
    pro.businessName ?? '',
    pro.bio ?? '',
    pro.user.name ?? '',
    ...pro.services,
    ...pro.serviceArea,
  ]
    .join(' ')
    .toLowerCase()

  return haystack.includes(normalized)
}

export async function fetchProsForDirectory(filters: DirectoryFilters) {
  const baseWhere = {
    ...(filters.category ? { services: { has: filters.category } } : {}),
    ...(filters.licensed ? { licensed: true } : {}),
    ...(filters.insured ? { insured: true } : {}),
  }

  const basePros = await db.proProfile.findMany({
    where: baseWhere,
    include: { user: true },
    take: 120,
  })

  const filtered = basePros
    .filter((pro) => matchesQuery(filters.q, pro))
    .filter((pro) =>
      matchesLocation({
        location: filters.location,
        zip: filters.zip,
        serviceArea: pro.serviceArea ?? [],
        userZip: pro.user.zipCode,
      })
    )
    .filter((pro) => (filters.topRated ? (pro.rating ?? 0) >= 4.7 : true))

  const sorted = filtered.sort((a, b) => {
    if (filters.sort === 'reviews') return (b.reviewCount ?? 0) - (a.reviewCount ?? 0)
    if (filters.sort === 'experience') return (b.yearsExp ?? 0) - (a.yearsExp ?? 0)
    if (filters.sort === 'name') return (a.businessName ?? a.user.name ?? '').localeCompare(b.businessName ?? b.user.name ?? '')
    return (b.rating ?? 0) - (a.rating ?? 0) || (b.reviewCount ?? 0) - (a.reviewCount ?? 0)
  })

  const marketMatch = checkMarketByInput(filters.zip || filters.location || '')

  return {
    filters,
    pros: sorted,
    marketMatch,
  }
}

export function getDirectoryRouteFromLanding(category: string, location: string) {
  const categoryName = deslugifyLocation(category)
  const locationName = deslugifyLocation(location)
  const marketMatch = checkMarketByInput(locationName)

  return {
    categoryName,
    locationName,
    locationQuery: marketMatch.zip ? undefined : locationName,
    zipQuery: marketMatch.zip || undefined,
    marketMatch,
  }
}
