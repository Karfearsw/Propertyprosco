import PublicHeader from '@/components/layout/PublicHeader'
import Footer from '@/components/layout/Footer'
import ServiceIcon from '@/components/brand/ServiceIcon'
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

  return {
    title: `${categoryName} in ${locationName}`,
    description: `Browse ${categoryName.toLowerCase()} pros serving ${locationName}.`,
  }
}

export default async function ServiceLocationPage({ params }: { params: Promise<{ category: string; location: string }> }) {
  const { category, location } = await params
  const categoryName = deslugify(category)
  const locationName = deslugify(location)
  const structuredData = serviceStructuredData(categoryName, locationName)

  return (
    <>
      <PublicHeader />
      <section className="bg-pp-dark px-6 py-16 text-center">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-pp-red/10">
          <ServiceIcon name={categoryName} className="h-8 w-8 text-red-400" />
        </div>
        <h1 className="font-display text-[44px] font-black tracking-tight text-white">{categoryName} in {locationName}</h1>
        <p className="mx-auto mt-4 max-w-2xl text-[15px] text-gray-400">
          Explore verified local service professionals, compare quotes, and connect directly through Property Pros.
        </p>
      </section>
      <section className="max-w-3xl mx-auto px-6 py-12">
        <div className="rounded-3xl border border-pp-border bg-white p-8 text-[15px] leading-8 text-pp-dark-3">
          Property Pros is building local landing pages for homeowners searching for {categoryName.toLowerCase()} services in {locationName}. Use the live marketplace to post a project or browse verified pros while this page expands.
        </div>
      </section>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <Footer />
    </>
  )
}
