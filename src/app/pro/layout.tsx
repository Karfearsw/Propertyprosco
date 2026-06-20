import ProLayout from '@/components/layout/ProLayout'
import { requireRole } from '@/lib/auth-guards'

export default async function ProRootLayout({ children }: { children: React.ReactNode }) {
  const user = await requireRole('PRO')
  return <ProLayout user={user}>{children}</ProLayout>
}
