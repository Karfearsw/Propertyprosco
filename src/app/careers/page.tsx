import SimpleContentPage from '@/components/marketing/SimpleContentPage'

export const metadata = {
  title: 'Careers',
  description: 'Careers at Property Pros.',
}

export default function CareersPage() {
  return (
    <SimpleContentPage
      eyebrow="Careers"
      title="Build the future of local property services"
      description="Property Pros is growing a marketplace designed to work for homeowners, service pros, and realtors."
      sections={[
        {
          title: 'What we care about',
          body: 'We prioritize trust, speed, and clear operations in the home-services space. Product, growth, operations, and support roles all help shape that experience.',
        },
        {
          title: 'Who we hire',
          body: 'We are especially interested in product-minded builders, growth operators, marketplace strategists, and customer success teammates who can thrive in an early-stage environment.',
        },
        {
          title: 'How to apply',
          body: 'Use the contact page for now and mention the type of role you are interested in. A dedicated hiring pipeline can be layered in later.',
        },
      ]}
    />
  )
}
