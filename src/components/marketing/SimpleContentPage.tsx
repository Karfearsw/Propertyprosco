import Container from '@/components/layout/Container'
import MarketingShell from '@/components/layout/MarketingShell'
import PageSection from '@/components/layout/PageSection'

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
    <MarketingShell>
      <PageSection surface="dark" className="text-center">
        <Container size="md">
          <p className="text-[11px] font-black uppercase tracking-[2px] text-red-400">{eyebrow}</p>
          <h1 className="mt-4 font-display text-[38px] font-black tracking-tight text-white sm:text-[42px]">{title}</h1>
          <p className="mx-auto mt-4 max-w-2xl text-[15px] leading-relaxed text-gray-400">{description}</p>
        </Container>
      </PageSection>
      <PageSection>
        <Container size="md" className="space-y-6">
          {sections.map((section) => (
            <article key={section.title} className="rounded-3xl border border-pp-border bg-white p-6 shadow-sm sm:p-7">
              <h2 className="text-[22px] font-black text-pp-dark">{section.title}</h2>
              <p className="mt-3 text-[14px] leading-7 text-pp-gray">{section.body}</p>
            </article>
          ))}
        </Container>
      </PageSection>
    </MarketingShell>
  )
}
