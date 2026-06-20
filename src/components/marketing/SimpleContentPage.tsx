import PublicHeader from '@/components/layout/PublicHeader'
import Footer from '@/components/layout/Footer'

interface Section {
  title: string
  body: string
}

interface SimpleContentPageProps {
  eyebrow: string
  title: string
  description: string
  sections: Section[]
}

export default function SimpleContentPage({
  eyebrow,
  title,
  description,
  sections,
}: SimpleContentPageProps) {
  return (
    <>
      <PublicHeader />
      <section className="bg-pp-dark px-6 py-16 text-center">
        <p className="text-[11px] font-black uppercase tracking-[2px] text-red-400">{eyebrow}</p>
        <h1 className="mt-4 font-display text-[42px] font-black tracking-tight text-white">{title}</h1>
        <p className="mx-auto mt-4 max-w-2xl text-[15px] text-gray-400">{description}</p>
      </section>
      <section className="max-w-4xl mx-auto px-6 py-12 space-y-6">
        {sections.map((section) => (
          <article key={section.title} className="rounded-3xl border border-pp-border bg-white p-6 shadow-sm">
            <h2 className="text-[22px] font-black text-pp-dark">{section.title}</h2>
            <p className="mt-3 text-[14px] leading-7 text-pp-gray">{section.body}</p>
          </article>
        ))}
      </section>
      <Footer />
    </>
  )
}
