import PublicHeader from '@/components/layout/PublicHeader'
import Footer from '@/components/layout/Footer'
import DemoOverview from '@/components/demo/DemoOverview'
import { demoHighlights } from '@/lib/demo-data'

export const metadata = {
  title: 'Realtor Demo',
  description: 'Preview the realtor workflow for Property Pros.',
}

export default function RealtorDemoPage() {
  const demo = demoHighlights.realtor

  return (
    <>
      <PublicHeader />
      <DemoOverview
        accentClass="bg-re-sidebar"
        badgeLabel="Public Demo"
        heading={`Realtor Demo: ${demo.name}`}
        intro="Preview how realtors coordinate clients, post work orders, track inspection repairs, and manage referrals on Property Pros."
        statLine={demo.statLine}
        cards={demo.cards}
      />
      <Footer />
    </>
  )
}
