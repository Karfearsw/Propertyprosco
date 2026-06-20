import { auth } from '@/auth'
import { db } from '@/lib/db'
import RealtorPostProjectForm from '@/components/realtor/RealtorPostProjectForm'

export const metadata = { title: 'Post Project' }

export default async function RealtorPostProjectPage({
  searchParams,
}: {
  searchParams: Promise<{ clientId?: string }>
}) {
  const session = await auth()
  const sp = await searchParams
  const realtor = await db.realtorProfile.findUnique({ where:{ userId: session!.user.id } })
  const clients = realtor ? await db.realtorClient.findMany({ where:{ realtorId: realtor.id, status:'active' } }) : []
  const initialClientId = clients.some((client) => client.id === sp.clientId) ? sp.clientId : undefined
  const selectedClient = clients.find((client) => client.id === initialClientId)

  return (
    <div className="p-5 lg:p-6 max-w-2xl">
      <h1 className="text-[22px] font-black text-pp-dark tracking-tight mb-6">Post a Project</h1>
      {selectedClient ? (
        <div className="mb-4 rounded-2xl border border-amber-200 bg-pp-gold-light px-4 py-3">
          <p className="text-[11px] font-black uppercase tracking-[1px] text-pp-gold">Client selected</p>
          <p className="mt-1 text-[14px] font-black text-pp-dark">{selectedClient.name}</p>
          <p className="text-[12px] font-bold text-pp-gray">This project will stay linked to the client record after posting.</p>
        </div>
      ) : null}
      <RealtorPostProjectForm clients={clients} initialClientId={initialClientId} />
    </div>
  )
}
