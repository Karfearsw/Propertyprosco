import Link from 'next/link'
import { ArrowRight, SlidersHorizontal } from 'lucide-react'
import EmptyState from '@/components/brand/EmptyState'
import DiscoverySearchForm from '@/components/find-a-pro/DiscoverySearchForm'
import MarketStatusBanner from '@/components/find-a-pro/MarketStatusBanner'
import ProDirectoryCard from '@/components/find-a-pro/ProDirectoryCard'
import Container from '@/components/layout/Container'
import MarketingShell from '@/components/layout/MarketingShell'
import PageSection from '@/components/layout/PageSection'
import { fetchProsForDirectory, parseDirectoryFilters, type DirectorySearchParams } from '@/lib/find-a-pro'
import { PP_MARKETS } from '@/lib/markets'

export const metadata = { title: 'Find a Pro' }

const popularServices = [
  'Roofing',
  'Plumbing',
  'Electrical',
  'Painting',
  'Landscaping',
  'Remodeling',
  'Masonry',
  'HVAC',
]

export default async function PublicFindAProPage({
  searchParams,
}: {
  searchParams: Promise<DirectorySearchParams>
}) {
  const rawParams = await searchParams
  const filters = parseDirectoryFilters(rawParams)
  const { marketMatch, pros } = await fetchProsForDirectory(filters)
  const userLocation = filters.zip || filters.location || marketMatch.market?.state || ''
  const showMarketBanner = Boolean(userLocation)

  return (
    <MarketingShell>
      <PageSection surface="dark" className="pb-12 pt-16">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-[11px] font-black uppercase tracking-[2px] text-red-400">Pro Directory</p>
            <h1 className="mt-4 font-display text-[40px] font-black tracking-tight text-white sm:text-[48px]">
              Find the right pro for any job
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-[15px] leading-relaxed text-gray-400">
              Browse verified local contractors by trade, rating, and location. Search Rhode Island now and preview the markets coming next.
            </p>
          </div>

          <div className="mx-auto mt-8 max-w-4xl">
            <DiscoverySearchForm
              initialCategory={filters.category}
              initialLocation={filters.zip || filters.location}
              initialQuery={filters.q}
              submitLabel="Search pros"
            />
          </div>

          <div className="mx-auto mt-6 flex max-w-4xl flex-wrap justify-center gap-2">
            {popularServices.map((service) => (
              <Link
                key={service}
                href={`/find-a-pro?category=${encodeURIComponent(service)}`}
                className="rounded-full border border-white/12 px-3.5 py-1.5 text-[12px] font-bold text-gray-300 transition-colors hover:border-white/30 hover:text-white"
              >
                {service}
              </Link>
            ))}
          </div>
        </Container>
      </PageSection>

      <PageSection className="pt-8">
        <Container className="space-y-8">
          {showMarketBanner && (
            <MarketStatusBanner
              location={userLocation}
              market={marketMatch.market}
              status={marketMatch.status}
            />
          )}

          <div className="grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)]">
            <aside className="self-start rounded-[28px] border border-pp-border bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2 text-[13px] font-black uppercase tracking-[1.4px] text-pp-dark">
                <SlidersHorizontal size={15} />
                Search filters
              </div>

              <form className="mt-5 space-y-5">
                <input type="hidden" name="q" value={filters.q ?? ''} />
                <input type="hidden" name="category" value={filters.category ?? ''} />
                <input type="hidden" name="zip" value={filters.zip ?? ''} />
                <input type="hidden" name="location" value={filters.location ?? ''} />

                <div>
                  <label className="mb-1.5 block text-[11px] font-black uppercase tracking-[0.8px] text-pp-dark-2">
                    Sort by
                  </label>
                  <select
                    name="sort"
                    defaultValue={filters.sort}
                    className="w-full rounded-xl border border-pp-border bg-white px-3.5 py-3 text-[14px] outline-none focus:border-pp-red"
                  >
                    <option value="rating">Highest rated</option>
                    <option value="reviews">Most reviewed</option>
                    <option value="experience">Most experience</option>
                    <option value="name">Name A-Z</option>
                  </select>
                </div>

                <div className="space-y-3">
                  <p className="text-[11px] font-black uppercase tracking-[0.8px] text-pp-dark-2">Trust signals</p>
                  {([
                    ['licensed', 'Licensed pros only', filters.licensed],
                    ['insured', 'Insured pros only', filters.insured],
                    ['topRated', '4.7+ rating', filters.topRated],
                  ] as const).map(([name, label, checked]) => (
                    <label key={name} className="flex items-center gap-2 text-[13px] font-bold text-pp-dark">
                      <input
                        type="checkbox"
                        name={name}
                        value="1"
                        defaultChecked={Boolean(checked)}
                        className="h-4 w-4 rounded border-pp-border text-pp-red focus:ring-pp-red"
                      />
                      {label}
                    </label>
                  ))}
                </div>

                <button
                  type="submit"
                  className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-pp-dark px-4 py-2.5 text-[13px] font-black text-white transition-colors hover:bg-pp-dark-2"
                >
                  Update results
                </button>
              </form>

              <div className="mt-5 rounded-2xl bg-pp-bg px-4 py-3 text-[12px] leading-relaxed text-pp-gray">
                Live now: {PP_MARKETS.filter((market) => market.status === 'live').map((market) => market.state).join(', ')}.
                Coming next: {PP_MARKETS.filter((market) => market.status === 'comingSoon').map((market) => market.state).join(', ')}.
              </div>
            </aside>

            <div className="space-y-6">
              <div className="flex flex-col gap-3 rounded-[28px] border border-pp-border bg-white p-5 shadow-sm sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-[12px] font-black uppercase tracking-[1.3px] text-pp-red">Search results</p>
                  <h2 className="mt-2 text-[26px] font-black tracking-tight text-pp-dark">
                    {pros.length} pro{pros.length === 1 ? '' : 's'} found
                  </h2>
                  <p className="mt-2 text-[14px] leading-relaxed text-pp-gray">
                    {userLocation
                      ? `Showing results for ${userLocation}${filters.category ? ` in ${filters.category}` : ''}.`
                      : 'Search by trade, city, or ZIP to narrow verified local pros.'}
                  </p>
                </div>

                <Link
                  href="/signup/homeowner"
                  className="inline-flex min-h-11 items-center gap-2 rounded-2xl bg-pp-red px-4 py-2.5 text-[13px] font-black text-white transition-colors hover:bg-pp-red-dark"
                >
                  Post a project instead
                  <ArrowRight size={14} />
                </Link>
              </div>

              {pros.length === 0 ? (
                <EmptyState
                  title={
                    marketMatch.status === 'live'
                      ? 'No pros matched that search yet'
                      : 'That market is not available yet'
                  }
                  body={
                    marketMatch.status === 'live'
                      ? 'Try a broader service, another Rhode Island ZIP, or fewer filters to widen your results.'
                      : 'Property Pros is expanding market by market. You can request updates for your area or post a project to tell us what you need.'
                  }
                />
              ) : (
                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {pros.map((pro) => (
                    <ProDirectoryCard key={pro.id} pro={pro} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </Container>
      </PageSection>

      <PageSection surface="muted">
        <Container className="text-center">
          <h2 className="font-display text-[30px] font-black tracking-tight text-pp-dark sm:text-[34px]">
            Can&apos;t find the right pro yet?
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-[15px] leading-relaxed text-pp-gray">
            Post your project for free and let verified contractors come to you with competitive quotes and availability.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/signup/homeowner"
              className="inline-flex min-h-12 items-center rounded-2xl bg-pp-red px-6 py-3 text-[14px] font-black text-white transition-colors hover:bg-pp-red-dark"
            >
              Post a free project
            </Link>
            <Link
              href="/rhode-island"
              className="inline-flex min-h-12 items-center rounded-2xl border border-pp-border bg-white px-6 py-3 text-[14px] font-black text-pp-dark transition-colors hover:bg-pp-bg"
            >
              Explore Rhode Island coverage
            </Link>
          </div>
        </Container>
      </PageSection>
    </MarketingShell>
  )
}
