import SimpleContentPage from '@/components/marketing/SimpleContentPage'

export const metadata = {
  title: 'Contractor Guide',
  description: 'A practical guide for service pros using Property Pros.',
}

export default function ContractorGuidePage() {
  return (
    <SimpleContentPage
      eyebrow="For Pros"
      title="Contractor guide"
      description="A starter guide for contractors and service pros using Property Pros to win more jobs."
      sections={[
        {
          title: 'Set up your profile',
          body: 'Complete your business details, service list, ZIP coverage, licensing, insurance, and years of experience so homeowners can evaluate you quickly.',
        },
        {
          title: 'Respond fast',
          body: 'Speed matters. The strongest conversion path in the current product is fast follow-up through quotes, clear scope summaries, and direct messaging.',
        },
        {
          title: 'Win on trust',
          body: 'Use verified profile data, past reviews, and well-written quote messages to stand out from generic lead marketplace behavior.',
        },
      ]}
    />
  )
}
