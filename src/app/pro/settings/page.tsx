import { auth } from '@/auth'
import { db } from '@/lib/db'
import SettingsForm from '@/components/SettingsForm'

export const metadata = { title: 'Settings' }

export default async function ProSettingsPage() {
  const session = await auth()
  const [user, proProfile] = await Promise.all([
    db.user.findUnique({ where: { id: session!.user.id } }),
    db.proProfile.findUnique({ where: { userId: session!.user.id } }),
  ])
  return (
    <div className="p-5 lg:p-6 max-w-2xl">
      <h1 className="text-[22px] font-black text-pp-dark tracking-tight mb-6">Settings</h1>
      <SettingsForm user={user} role="PRO" proProfile={proProfile} accentColor="red" />
    </div>
  )
}
