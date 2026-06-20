import MarketingShell from '@/components/layout/MarketingShell'
import DemoOverview from '@/components/demo/DemoOverview'
import { demoHighlights } from '@/lib/demo-data'

export const metadata = {
  title: 'Pro Demo',
  description: 'Preview the service professional workflow for Property Pros.',
}

export default function ProDemoPage() {
  const demo = demoHighlights.pro

  return (
    <MarketingShell>
      <DemoOverview
        accentClass="bg-pro-sidebar"
        badgeLabel="Public Demo"
        heading={`Service Pro Demo: ${demo.name}`}
        intro="Preview how contractors browse leads, send quotes, manage schedules, and respond to homeowners inside Property Pros."
        statLine={demo.statLine}
        cards={demo.cards}
      />
    </MarketingShell>
  )
}
