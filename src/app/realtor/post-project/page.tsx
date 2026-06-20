import { auth } from '@/auth'
import { db } from '@/lib/db'
import RealtorPostProjectForm from '@/components/realtor/RealtorPostProjectForm'

export const metadata = { title: 'Post Project' }

export default async function RealtorPostProjectPage() {
  const session = await auth()
  const realtor = await db.realtorProfile.findUnique({ where:{ userId: session!.user.id } })
  const clients = realtor ? await db.realtorClient.findMany({ where:{ realtorId: realtor.id, status:'active' } }) : []

  return (
    <div className="p-5 lg:p-6 max-w-2xl">
      <h1 className="text-[22px] font-black text-pp-dark tracking-tight mb-6">Post a Project</h1>
      <RealtorPostProjectForm clients={clients} />
    </div>
  )
}
