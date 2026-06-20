export function organizationStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Property Pros',
    url: 'https://www.propertyprosco.com',
    description: 'Trusted home services marketplace connecting homeowners, contractors, and realtors.',
  }
}

export function serviceStructuredData(service: string, area: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    serviceType: service,
    areaServed: area,
    provider: {
      '@type': 'Organization',
      name: 'Property Pros',
    },
  }
}
