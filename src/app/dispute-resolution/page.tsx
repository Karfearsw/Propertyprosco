import SimpleContentPage from '@/components/marketing/SimpleContentPage'

export const metadata = {
  title: 'Dispute Resolution',
  description: 'How Property Pros handles disputes and issue resolution.',
}

export default function DisputeResolutionPage() {
  return (
    <SimpleContentPage
      eyebrow="Legal"
      title="Dispute resolution"
      description="Property Pros supports transparent communication, documented activity, and role-based accountability when issues arise."
      sections={[
        {
          title: 'Direct resolution first',
          body: 'Homeowners, pros, and realtors should first attempt to resolve issues directly through documented in-platform communication and project records.',
        },
        {
          title: 'Platform support',
          body: 'Property Pros can assist with timeline reconstruction, account review, and moderation actions based on available messages, quotes, notifications, and profile data.',
        },
        {
          title: 'Scope of responsibility',
          body: 'The platform can support communication and trust workflows, but final contract, payment, licensing, and workmanship disputes remain between the parties involved unless a separate agreement applies.',
        },
      ]}
    />
  )
}
