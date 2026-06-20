import type { Metadata } from 'next'
import './globals.css'
import { SessionProvider } from 'next-auth/react'
import { auth } from '@/auth'
import { getAppBaseUrl } from '@/lib/app-url'
import { buildDescription } from '@/lib/seo'

export const metadata: Metadata = {
  metadataBase: new URL(getAppBaseUrl()),
  title: { default: 'Property Pros | Find Trusted Local Contractors', template: '%s | Property Pros' },
  description: buildDescription("America's trusted home services marketplace. Find verified local contractors, post projects free, and get quotes fast."),
  keywords: ['home services marketplace', 'verified contractors', 'rhode island contractors', 'home improvement', 'property pros'],
  icons: { icon: '/favicon.svg' },
  openGraph: {
    title: 'Property Pros',
    description: "America's trusted home services marketplace.",
    images: ['/brand/logo-mark.svg'],
  },
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  return (
    <html lang="en">
      <body className="min-h-dvh bg-white text-pp-dark antialiased">
        <SessionProvider session={session}>
          {children}
        </SessionProvider>
      </body>
    </html>
  )
}
