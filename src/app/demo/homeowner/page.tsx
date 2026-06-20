import PublicHeader from '@/components/layout/PublicHeader'
import Footer from '@/components/layout/Footer'
import DemoOverview from '@/components/demo/DemoOverview'
import { demoHighlights } from '@/lib/demo-data'

export const metadata = {
  title: 'Homeowner Demo',
  description: 'Preview the homeowner workflow for Property Pros.',
}

export default function HomeownerDemoPage() {
  const demo = demoHighlights.homeowner

  return (
    <>
      <PublicHeader />
      <DemoOverview
        accentClass="bg-ho-sidebar"
        badgeLabel="Public Demo"
        heading={`Homeowner Demo: ${demo.name}`}
        intro="Preview how homeowners post projects, compare quotes, save pros, and manage messages before logging into the full app."
        statLine={demo.statLine}
        cards={demo.cards}
      />
      <Footer />
    </>
  )
}
