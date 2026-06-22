import Link from 'next/link'

export const metadata = { title: 'Billing Update' }

export default function HomeownerAddCardPage() {
  return (
    <div className="max-w-2xl p-5 lg:p-6">
      <h1 className="mb-2 text-[22px] font-black tracking-tight text-pp-dark">Billing update</h1>
      <p className="mb-6 text-[13px] font-bold text-pp-gray">
        Homeowner accounts stay free, and card setup is temporarily unavailable while we finish a
        billing upgrade.
      </p>
      <div className="rounded-2xl border border-pp-border bg-white p-5">
        <p className="text-[13px] font-bold leading-relaxed text-pp-gray">
          You can still post projects, review quotes, and hire pros. If you need billing help for
          an active project, contact support before marking work complete.
        </p>
        <Link
          href="/homeowner/dashboard"
          className="mt-4 inline-flex items-center justify-center rounded-xl bg-pp-dark px-5 py-3 text-[14px] font-black text-white transition-all hover:bg-pp-dark-2"
        >
          Back to dashboard
        </Link>
      </div>
    </div>
  )
}
