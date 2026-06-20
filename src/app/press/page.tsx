import SimpleContentPage from '@/components/marketing/SimpleContentPage'

export const metadata = {
  title: 'Press',
  description: 'Property Pros company updates, launch news, and media information.',
}

export default function PressPage() {
  return (
    <SimpleContentPage
      eyebrow="Press"
      title="Property Pros in the news"
      description="Media-friendly company information for the Property Pros marketplace launch."
      sections={[
        {
          title: 'Company snapshot',
          body: 'Property Pros is a home-services marketplace connecting homeowners, contractors, and realtors with a flat-fee model for pros and free posting for property owners.',
        },
        {
          title: 'Launch story',
          body: 'The current market rollout is centered on Rhode Island and nearby New England expansion, with a focus on verified pros, transparent pricing, and better coordination for real-estate driven work.',
        },
        {
          title: 'Media contact',
          body: 'Use the contact page for partnership, press, investor, or feature requests while a dedicated newsroom workflow is being finalized.',
        },
      ]}
    />
  )
}
