import HomeownerLayout from '@/components/layout/HomeownerLayout'
import { requireRole } from '@/lib/auth-guards'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function HomeownerRootLayout({ children }: { children: React.ReactNode }) {
  const user = await requireRole('HOMEOWNER')
  return <HomeownerLayout user={user}>{children}</HomeownerLayout>
}
