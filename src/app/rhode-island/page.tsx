import MarketingShell from '@/components/layout/MarketingShell'
import Link from 'next/link'
import DiscoverySearchForm from '@/components/find-a-pro/DiscoverySearchForm'
import MarketStatusBanner from '@/components/find-a-pro/MarketStatusBanner'
import Container from '@/components/layout/Container'
import PageSection from '@/components/layout/PageSection'
import { PP_MARKETS, slugifyLocation } from '@/lib/markets'

export const metadata = {
  title: 'Rhode Island Contractors',
  description: 'Find verified Rhode Island contractors and local home-service pros on Property Pros.',
}

const rhodeIsland = PP_MARKETS.find((market) => market.abbr === 'RI')!
const featuredCities = ['Providence', 'Cranston', 'Warwick', 'Pawtucket', 'East Providence', 'Newport']
const featuredCategories = ['Roofing', 'Electrical', 'Plumbing', 'Painting', 'Landscaping', 'Remodeling']

export default function RhodeIslandPage() {
  return (
    <MarketingShell>
      <PageSection surface="dark" className="pb-12 pt-16">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-[11px] font-black uppercase tracking-[2px] text-red-400">Live Market</p>
            <h1 className="mt-4 font-display text-[40px] font-black tracking-tight text-white sm:text-[48px]">
              Rhode Island contractors, ready to search
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-[15px] leading-relaxed text-gray-400">
              Property Pros is live in Rhode Island first. Search local service pros by trade, city, or ZIP and connect with trusted contractors across the state.
            </p>
          </div>
          <div className="mx-auto mt-8 max-w-4xl">
            <DiscoverySearchForm initialLocation="Rhode Island" submitLabel="Search Rhode Island pros" />
          </div>
        </Container>
      </PageSection>

      <PageSection className="pt-8">
        <Container className="space-y-8">
          <MarketStatusBanner location="Rhode Island" market={rhodeIsland} status="live" />

          <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-[28px] border border-pp-border bg-white p-6 shadow-sm">
              <p className="text-[11px] font-black uppercase tracking-[1.5px] text-pp-red">Where We Operate</p>
              <h2 className="mt-3 text-[30px] font-black tracking-tight text-pp-dark">
                Rhode Island is live. New England is next.
              </h2>
              <p className="mt-3 text-[15px] leading-7 text-pp-gray">
                We&apos;re building the most trusted contractor marketplace in Rhode Island first, with Massachusetts and Connecticut planned next. Search by city, category, or ZIP to find coverage near you.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                {PP_MARKETS.map((market) => (
                  <div
                    key={market.abbr}
                    className={`min-w-[132px] rounded-2xl border px-4 py-3 ${
                      market.status === 'live'
                        ? 'border-green-200 bg-pp-green-light'
                        : 'border-amber-200 bg-pp-gold-light'
                    }`}
                  >
                    <div className="text-[15px] font-black text-pp-dark">{market.state}</div>
                    <div className="mt-1 text-[11px] font-black uppercase tracking-[1.1px] text-pp-gray">
                      {market.status === 'live' ? 'Live now' : 'Coming soon'}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[28px] border border-pp-border bg-pp-bg p-6 shadow-sm">
              <p className="text-[11px] font-black uppercase tracking-[1.5px] text-pp-red">Popular Rhode Island Cities</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {featuredCities.map((city) => (
                  <Link
                    key={city}
                    href={`/find-a-pro?location=${encodeURIComponent(city)}`}
                    className="rounded-2xl border border-white bg-white px-4 py-4 text-[14px] font-black text-pp-dark transition-colors hover:border-pp-red hover:text-pp-red"
                  >
                    {city}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </PageSection>

      <PageSection surface="muted">
        <Container>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[1.5px] text-pp-red">Browse By Category</p>
              <h2 className="mt-3 font-display text-[34px] font-black tracking-tight text-pp-dark">
                Start with the job you need done
              </h2>
            </div>
            <Link
              href="/find-a-pro?location=Rhode%20Island"
              className="inline-flex min-h-11 items-center rounded-2xl bg-pp-dark px-5 py-2.5 text-[13px] font-black text-white transition-colors hover:bg-pp-dark-2"
            >
              View full Rhode Island directory
            </Link>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {featuredCategories.map((category) => (
              <Link
                key={category}
                href={`/find-a-pro/${slugifyLocation(category)}/rhode-island`}
                className="rounded-[28px] border border-pp-border bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="text-[22px] font-black text-pp-dark">{category}</div>
                <p className="mt-3 text-[14px] leading-7 text-pp-gray">
                  Explore Rhode Island {category.toLowerCase()} pros, compare trust signals, and move faster on your project.
                </p>
                <div className="mt-5 text-[13px] font-black text-pp-red">Explore this category</div>
              </Link>
            ))}
          </div>
        </Container>
      </PageSection>
    </MarketingShell>
  )
}
