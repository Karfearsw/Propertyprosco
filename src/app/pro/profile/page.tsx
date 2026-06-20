import { auth } from '@/auth'
import { db } from '@/lib/db'
import ProProfileForm from '@/components/pro/ProProfileForm'

export const metadata = { title: 'My Profile' }

export default async function ProProfilePage() {
  const session = await auth()
  const pro     = await db.proProfile.findUnique({ where:{ userId: session!.user.id }, include:{ user:true } })

  return (
    <div className="p-5 lg:p-6 max-w-2xl">
      <h1 className="text-[22px] font-black text-pp-dark tracking-tight mb-6">My Profile</h1>
      <ProProfileForm pro={pro} />
    </div>
  )
}
