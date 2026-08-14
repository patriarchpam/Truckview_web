import { Helmet } from 'react-helmet-async'

interface SEOProps {
  title: string
  description?: string
  canonicalUrl?: string
  type?: 'website' | 'article'
  image?: string
  schema?: Record<string, any>
}

export function SEO({
  title,
  description = 'Truck-View Global Ent. — Professional mechanic workshop in Abuja. Book vehicle servicing, inspections, diagnostics, and more for cars, SUVs, trucks, vans, and commercial vehicles.',
  canonicalUrl,
  type = 'website',
  image = 'https://truckview.com.ng/logo.png', // Replace with real domain later
  schema,
}: SEOProps) {
  const fullTitle = `${title} | Truck-View`
  const currentUrl = canonicalUrl || typeof window !== 'undefined' ? window.location.href : ''

  // Base Local Business Schema
  const baseSchema = {
    '@context': 'https://schema.org',
    '@type': 'AutoRepair',
    name: 'Truck-View Global Ent.',
    image: image,
    '@id': 'https://truckview.com.ng',
    url: 'https://truckview.com.ng',
    telephone: '08036798700',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Behind Games Village, Deck One Apartments',
      addressLocality: 'Karu District',
      addressRegion: 'Abuja',
      addressCountry: 'NG',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 9.0765, // Adjust to exact coords later
      longitude: 7.3986,
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '08:00',
        closes: '17:00',
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Saturday', 'Sunday'],
        opens: '09:00',
        closes: '14:00',
      },
    ],
    priceRange: '$$',
  }

  const finalSchema = schema ? { ...baseSchema, ...schema } : baseSchema

  return (
    <Helmet>
      {/* Basic HTML Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content="Truck-View Global Ent." />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={currentUrl} />
      <meta property="twitter:title" content={fullTitle} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={image} />

      {/* JSON-LD Structured Data */}
      <script type="application/ld+json">{JSON.stringify(finalSchema)}</script>
    </Helmet>
  )
}
