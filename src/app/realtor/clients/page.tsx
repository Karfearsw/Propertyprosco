import { auth } from '@/auth'
import { db } from '@/lib/db'
import AddClientButton from '@/components/realtor/AddClientButton'

export const metadata = { title: 'My Clients' }

export default async function RealtorClientsPage() {
  const session = await auth()
  const realtor = await db.realtorProfile.findUnique({ where:{ userId: session!.user.id } })
  const clients = realtor ? await db.realtorClient.findMany({ where:{ realtorId: realtor.id }, orderBy:{ createdAt:'desc' } }) : []

  const statusColor: Record<string,string> = { active:'bg-pp-green-light text-pp-green', pending:'bg-pp-gold-light text-pp-gold', closed:'bg-pp-bg text-pp-gray' }

  return (
    <div className="p-5 lg:p-6">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-[22px] font-black text-pp-dark tracking-tight">My Clients</h1>
        {realtor && <AddClientButton realtorId={realtor.id} />}
      </div>

      {clients.length === 0 ? (
        <div className="bg-white border border-pp-border rounded-2xl p-10 text-center">
          <p className="text-[14px] font-bold text-pp-gray mb-3">No clients yet. Add your first client to get started.</p>
          {realtor && <AddClientButton realtorId={realtor.id} />}
        </div>
      ) : (
        <div className="space-y-3">
          {clients.map(c => (
            <div key={c.id} className="bg-white border border-pp-border rounded-2xl p-5 hover:shadow-sm transition-shadow">
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-full bg-pp-gold flex items-center justify-center text-base font-black text-white shrink-0">{c.name.slice(0,2).toUpperCase()}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-[15px] font-black text-pp-dark">{c.name}</h3>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${statusColor[c.status] ?? 'bg-pp-bg text-pp-gray'}`}>{c.status}</span>
                  </div>
                  {c.address && <p className="text-[12px] font-bold text-pp-gray">📍 {c.address}</p>}
                  {c.email   && <p className="text-[12px] font-bold text-pp-gray">✉️ {c.email}</p>}
                  {c.phone   && <p className="text-[12px] font-bold text-pp-gray">📞 {c.phone}</p>}
                  {c.notes   && <p className="text-[12px] font-semibold text-pp-dark-3 mt-2">{c.notes}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
