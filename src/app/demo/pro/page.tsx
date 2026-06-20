import PublicHeader from '@/components/layout/PublicHeader'
import Footer from '@/components/layout/Footer'
import DemoOverview from '@/components/demo/DemoOverview'
import { demoHighlights } from '@/lib/demo-data'

export const metadata = {
  title: 'Pro Demo',
  description: 'Preview the service professional workflow for Property Pros.',
}

export default function ProDemoPage() {
  const demo = demoHighlights.pro

  return (
    <>
      <PublicHeader />
      <DemoOverview
        accentClass="bg-pro-sidebar"
        badgeLabel="Public Demo"
        heading={`Service Pro Demo: ${demo.name}`}
        intro="Preview how contractors browse leads, send quotes, manage schedules, and respond to homeowners inside Property Pros."
        statLine={demo.statLine}
        cards={demo.cards}
      />
      <Footer />
    </>
  )
}
