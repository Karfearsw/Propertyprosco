import Link from 'next/link'
import MarketingShell from '@/components/layout/MarketingShell'
import ServiceIcon from '@/components/brand/ServiceIcon'
import DiscoverySearchForm from '@/components/find-a-pro/DiscoverySearchForm'
import MarketStatusBanner from '@/components/find-a-pro/MarketStatusBanner'
import ProDirectoryCard from '@/components/find-a-pro/ProDirectoryCard'
import Container from '@/components/layout/Container'
import PageSection from '@/components/layout/PageSection'
import { fetchProsForDirectory, getDirectoryRouteFromLanding } from '@/lib/find-a-pro'
import { buildWaitlistContactHref, checkMarketByInput, slugifyLocation } from '@/lib/markets'
import { serviceStructuredData } from '@/lib/structured-data'

function deslugify(value: string) {
  return value
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

export async function generateMetadata({ params }: { params: Promise<{ category: string; location: string }> }) {
  const { category, location } = await params
  const categoryName = deslugify(category)
  const locationName = deslugify(location)
  const marketMatch = checkMarketByInput(locationName)

  return {
    title: `${categoryName} in ${locationName}`,
    description:
      marketMatch.status === 'live'
        ? `Browse ${categoryName.toLowerCase()} pros serving ${locationName} on Property Pros.`
        : `See how Property Pros is expanding ${categoryName.toLowerCase()} coverage for ${locationName}.`,
  }
}

export default async function ServiceLocationPage({ params }: { params: Promise<{ category: string; location: string }> }) {
  const { category, location } = await params
  const { categoryName, locationName, locationQuery, marketMatch, zipQuery } = getDirectoryRouteFromLanding(category, location)
  const { pros } = await fetchProsForDirectory({
    category: categoryName,
    q: undefined,
    zip: zipQuery,
    location: locationQuery,
    sort: 'rating',
    licensed: false,
    insured: false,
    topRated: false,
  })
  const structuredData = serviceStructuredData(categoryName, locationName)

  return (
    <MarketingShell>
      <PageSection surface="dark" className="pb-12 pt-16">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-pp-red/10">
              <ServiceIcon name={categoryName} className="h-8 w-8 text-red-400" />
            </div>
            <p className="text-[11px] font-black uppercase tracking-[2px] text-red-400">Local Service Page</p>
            <h1 className="mt-4 font-display text-[40px] font-black tracking-tight text-white sm:text-[48px]">
              {categoryName} in {locationName}
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-[15px] leading-relaxed text-gray-400">
              Compare trust signals, browse local pros, and move faster on your {categoryName.toLowerCase()} project in {locationName}.
            </p>
          </div>
          <div className="mx-auto mt-8 max-w-4xl">
            <DiscoverySearchForm
              initialCategory={categoryName}
              initialLocation={zipQuery || locationQuery || locationName}
              submitLabel={`Search ${categoryName}`}
            />
          </div>
        </Container>
      </PageSection>

      <PageSection className="pt-8">
        <Container className="space-y-8">
          <MarketStatusBanner
            location={locationName}
            market={marketMatch.market}
            status={marketMatch.status}
          />

          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="space-y-6">
              <div className="rounded-[28px] border border-pp-border bg-white p-5 shadow-sm">
                <p className="text-[11px] font-black uppercase tracking-[1.5px] text-pp-red">Available Pros</p>
                <h2 className="mt-3 text-[28px] font-black tracking-tight text-pp-dark">
                  {pros.length} {categoryName.toLowerCase()} pro{pros.length === 1 ? '' : 's'} found
                </h2>
                <p className="mt-2 text-[14px] leading-relaxed text-pp-gray">
                  {marketMatch.status === 'live'
                    ? `Browse current matches serving ${locationName}, then post your project if you want quotes sent to you.`
                    : `This local page is ready for launch expansion. You can request updates for ${locationName} while coverage rolls out.`}
                </p>
              </div>

              {pros.length === 0 ? (
                <div className="rounded-[28px] border border-pp-border bg-white p-6 shadow-sm">
                  <p className="text-[11px] font-black uppercase tracking-[1.5px] text-pp-red">No direct matches yet</p>
                  <h3 className="mt-3 text-[24px] font-black tracking-tight text-pp-dark">
                    We&apos;re still building this local network
                  </h3>
                  <p className="mt-3 text-[14px] leading-7 text-pp-gray">
                    Try the broader directory for nearby coverage or request a launch/update notice for {locationName}.
                  </p>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <Link
                      href={`/find-a-pro?category=${encodeURIComponent(categoryName)}&location=${encodeURIComponent(locationName)}`}
                      className="inline-flex min-h-11 items-center rounded-2xl bg-pp-red px-5 py-2.5 text-[13px] font-black text-white transition-colors hover:bg-pp-red-dark"
                    >
                      Search the full directory
                    </Link>
                    <Link
                      href={buildWaitlistContactHref(locationName, marketMatch.market)}
                      className="inline-flex min-h-11 items-center rounded-2xl border border-pp-border bg-white px-5 py-2.5 text-[13px] font-black text-pp-dark transition-colors hover:bg-pp-bg"
                    >
                      Request updates
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="grid gap-5 md:grid-cols-2">
                  {pros.map((pro) => (
                    <ProDirectoryCard key={pro.id} pro={pro} />
                  ))}
                </div>
              )}
            </div>

            <aside className="self-start rounded-[28px] border border-pp-border bg-pp-bg p-6 shadow-sm">
              <p className="text-[11px] font-black uppercase tracking-[1.5px] text-pp-red">Keep Browsing</p>
              <div className="mt-4 space-y-3">
                <Link
                  href={`/find-a-pro?category=${encodeURIComponent(categoryName)}`}
                  className="block rounded-2xl border border-white bg-white px-4 py-4 text-[14px] font-black text-pp-dark transition-colors hover:border-pp-red hover:text-pp-red"
                >
                  View all {categoryName.toLowerCase()} pros
                </Link>
                <Link
                  href={`/find-a-pro?location=${encodeURIComponent(locationName)}`}
                  className="block rounded-2xl border border-white bg-white px-4 py-4 text-[14px] font-black text-pp-dark transition-colors hover:border-pp-red hover:text-pp-red"
                >
                  Browse all pros in {locationName}
                </Link>
                {marketMatch.market?.abbr === 'RI' && (
                  <Link
                    href="/rhode-island"
                    className="block rounded-2xl border border-white bg-white px-4 py-4 text-[14px] font-black text-pp-dark transition-colors hover:border-pp-red hover:text-pp-red"
                  >
                    Explore Rhode Island coverage
                  </Link>
                )}
              </div>

              <div className="mt-6 rounded-2xl border border-white bg-white px-4 py-4">
                <p className="text-[13px] font-black text-pp-dark">Nearby category pages</p>
                <div className="mt-3 space-y-2">
                  {['Roofing', 'Electrical', 'Plumbing'].map((relatedCategory) => (
                    <Link
                      key={relatedCategory}
                      href={`/find-a-pro/${slugifyLocation(relatedCategory)}/${location}`}
                      className="block text-[13px] font-bold text-pp-gray transition-colors hover:text-pp-red"
                    >
                      {relatedCategory} in {locationName}
                    </Link>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </Container>
      </PageSection>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
    </MarketingShell>
  )
}
