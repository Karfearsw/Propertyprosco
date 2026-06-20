import SimpleContentPage from '@/components/marketing/SimpleContentPage'

export const metadata = {
  title: 'Community Fund',
  description: 'How Property Pros supports local communities and trusted home improvement outcomes.',
}

export default function CommunityFundPage() {
  return (
    <SimpleContentPage
      eyebrow="Community"
      title="Community fund"
      description="Property Pros is designed to support trusted local service ecosystems, starting market by market."
      sections={[
        {
          title: 'Local-first mission',
          body: 'The marketplace aims to strengthen local contractor relationships and homeowner confidence by reducing lead waste and improving visibility into trust signals.',
        },
        {
          title: 'How support is allocated',
          body: 'As community initiatives expand, funds and local support efforts can be directed toward neighborhood revitalization, homeowner education, and skilled-trade visibility.',
        },
        {
          title: 'Future participation',
          body: 'The current page establishes the program surface so future campaigns, local sponsorships, and market-launch initiatives have a destination inside the product ecosystem.',
        },
      ]}
    />
  )
}
