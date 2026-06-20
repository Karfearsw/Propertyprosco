import MarketingShell from '@/components/layout/MarketingShell'
import Link from 'next/link'
import ServiceIcon from '@/components/brand/ServiceIcon'
import { blogPosts } from '@/lib/content'

export const metadata = { title: 'Blog' }

export default function BlogPage() {
  return (
    <MarketingShell>
      <div className="bg-pp-dark py-16 px-6 text-center">
        <h1 className="font-display text-[44px] font-black text-white tracking-tight mb-3">Property Pros Blog</h1>
        <p className="text-[15px] text-gray-400 max-w-xl mx-auto">Tips, guides, and insights for homeowners, service pros, and real estate professionals.</p>
      </div>

      <section className="py-16 px-6 max-w-5xl mx-auto">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogPosts.map(p => (
            <article key={p.slug} className="bg-white border border-pp-border rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
              <div className="bg-pp-bg h-36 flex items-center justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-pp-red-light">
                  <ServiceIcon name={p.icon} className="h-8 w-8 text-pp-red" />
                </div>
              </div>
              <div className="p-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-black bg-pp-red-light text-pp-red px-2 py-0.5 rounded-full">{p.cat}</span>
                  <span className="text-[11px] font-bold text-pp-gray">{p.readTime} read</span>
                </div>
                <h2 className="text-[15px] font-black text-pp-dark leading-snug mb-3">{p.title}</h2>
                <p className="text-[12px] text-pp-gray leading-relaxed mb-3">{p.summary}</p>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-pp-gray">{p.date}</span>
                  <Link href={`/blog/${p.slug}`} className="text-[12px] font-extrabold text-pp-red hover:underline">Read →</Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </MarketingShell>
  )
}
