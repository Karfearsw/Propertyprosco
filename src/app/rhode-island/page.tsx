import PublicHeader from '@/components/layout/PublicHeader'
import Footer from '@/components/layout/Footer'

export const metadata = {
  title: 'Rhode Island Contractors',
  description: 'Find verified Rhode Island contractors and local home-service pros on Property Pros.',
}

export default function RhodeIslandPage() {
  return (
    <>
      <PublicHeader />
      <section className="bg-pp-dark px-6 py-16 text-center">
        <p className="text-[11px] font-black uppercase tracking-[2px] text-red-400">Rhode Island</p>
        <h1 className="mt-4 font-display text-[44px] font-black tracking-tight text-white">Find verified Rhode Island contractors</h1>
        <p className="mx-auto mt-4 max-w-2xl text-[15px] text-gray-400">
          Property Pros is launching Rhode Island first with a focus on trusted local pros, faster quote turnaround, and better homeowner coordination.
        </p>
      </section>
      <section className="max-w-4xl mx-auto px-6 py-12 grid gap-5 md:grid-cols-2">
        {['Providence', 'Cranston', 'Warwick', 'Pawtucket'].map((city) => (
          <div key={city} className="rounded-3xl border border-pp-border bg-white p-6">
            <h2 className="text-[22px] font-black text-pp-dark">{city}</h2>
            <p className="mt-3 text-[14px] leading-7 text-pp-gray">
              Browse local roofing, electrical, remodeling, painting, and landscaping pros serving {city}, Rhode Island.
            </p>
          </div>
        ))}
      </section>
      <Footer />
    </>
  )
}
