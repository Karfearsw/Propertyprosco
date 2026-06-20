import RealtorLayout from '@/components/layout/RealtorLayout'
import { requireRole } from '@/lib/auth-guards'

export default async function RealtorRootLayout({ children }: { children: React.ReactNode }) {
  const user = await requireRole('REALTOR')
  return <RealtorLayout user={user}>{children}</RealtorLayout>
}
