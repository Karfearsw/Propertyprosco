'use client'

import Link from 'next/link'
import { demoCredentials } from '@/lib/demo-data'

interface DemoCard {
  title: string
  meta: string
  status: string
}

interface DemoOverviewProps {
  accentClass: string
  badgeLabel: string
  heading: string
  intro: string
  statLine: string
  cards: DemoCard[]
}

export default function DemoOverview({
  accentClass,
  badgeLabel,
  heading,
  intro,
  statLine,
  cards,
}: DemoOverviewProps) {
  return (
    <div className="min-h-screen bg-pp-bg">
      <div className={`px-6 py-16 ${accentClass}`}>
        <div className="max-w-5xl mx-auto">
          <span className="inline-flex px-3 py-1 rounded-full bg-white/10 text-white text-[11px] font-black uppercase tracking-[2px]">
            {badgeLabel}
          </span>
          <h1 className="mt-5 text-[40px] font-black tracking-tight text-white">{heading}</h1>
          <p className="mt-3 max-w-2xl text-[15px] font-medium text-white/80">{intro}</p>
          <p className="mt-4 text-[13px] font-black text-white/90">{statLine}</p>
        </div>
      </div>

      <section className="max-w-5xl mx-auto px-6 py-12">
        <div className="grid gap-4 md:grid-cols-2 mb-10">
          {cards.map((card) => (
            <article key={card.title} className="rounded-2xl border border-pp-border bg-white p-5 shadow-sm">
              <h2 className="text-[18px] font-black text-pp-dark">{card.title}</h2>
              <p className="mt-2 text-[13px] font-bold text-pp-gray">{card.meta}</p>
              <p className="mt-4 inline-flex rounded-full bg-pp-bg px-3 py-1 text-[11px] font-black uppercase tracking-[1px] text-pp-dark">
                {card.status}
              </p>
            </article>
          ))}
        </div>

        <div className="rounded-3xl border border-pp-border bg-white p-6">
          <h2 className="text-[20px] font-black text-pp-dark">Demo credentials</h2>
          <p className="mt-2 text-[14px] text-pp-gray">
            Use these seeded accounts to log in against the real PostgreSQL-backed app.
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {demoCredentials.map((item) => (
              <div key={item.email} className="rounded-2xl bg-pp-bg p-4">
                <div className="text-[12px] font-black uppercase tracking-[1px] text-pp-gray">{item.role}</div>
                <div className="mt-3 text-[13px] font-black text-pp-dark">{item.email}</div>
                <div className="mt-1 text-[12px] font-bold text-pp-gray">{item.password}</div>
                <Link href={item.href} className="mt-4 inline-flex text-[12px] font-extrabold text-pp-red hover:underline">
                  Open login
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
