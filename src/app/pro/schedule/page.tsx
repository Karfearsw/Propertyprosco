import { auth } from '@/auth'
import { db } from '@/lib/db'
import AddScheduleButton from '@/components/pro/AddScheduleButton'
import { formatDate } from '@/lib/utils'

export const metadata = { title: 'Schedule' }

export default async function ProSchedulePage() {
  const session = await auth()
  const pro = await db.proProfile.findUnique({ where:{ userId: session!.user.id } })
  const entries = pro ? await db.scheduleEntry.findMany({ where:{ proId: pro.id }, orderBy:{ date:'asc' } }) : []

  return (
    <div className="p-5 lg:p-6">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-[22px] font-black text-pp-dark tracking-tight">Schedule</h1>
        {pro && <AddScheduleButton proId={pro.id} />}
      </div>

      {entries.length === 0 ? (
        <div className="bg-white border border-pp-border rounded-2xl p-10 text-center">
          <p className="text-[14px] font-bold text-pp-gray mb-3">No scheduled jobs yet.</p>
          <p className="text-[13px] text-pp-gray">Add a job to keep your schedule organized.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {entries.map(e => {
            const d = new Date(e.date)
            const statusColors: Record<string,string> = { confirmed:'bg-pp-green-light text-pp-green', pending:'bg-pp-gold-light text-pp-gold', cancelled:'bg-red-100 text-pp-red' }
            return (
              <div key={e.id} className="bg-white border border-pp-border rounded-2xl p-4 flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-pp-red-light flex flex-col items-center justify-center shrink-0">
                  <span className="text-[20px] font-black text-pp-red leading-none">{d.getDate()}</span>
                  <span className="text-[10px] font-black text-pp-red uppercase">{d.toLocaleDateString('en',{month:'short'})}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-[14px] font-black text-pp-dark">{e.title}</h3>
                  {e.client && <p className="text-[12px] font-bold text-pp-gray">Client: {e.client}</p>}
                  {e.address && <p className="text-[12px] font-bold text-pp-gray">{e.address}</p>}
                  {e.notes && <p className="text-[12px] text-pp-dark-3 font-semibold mt-1">{e.notes}</p>}
                </div>
                <div className="text-right shrink-0">
                  <div className="text-[13px] font-black text-pp-dark mb-1">{d.toLocaleTimeString('en',{hour:'numeric',minute:'2-digit'})}</div>
                  {e.duration && <div className="text-[11px] font-bold text-pp-gray">{e.duration} min</div>}
                  <span className={`inline-block mt-1 text-[10px] font-black px-2 py-0.5 rounded-full ${statusColors[e.status] ?? 'bg-pp-bg text-pp-gray'}`}>{e.status}</span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
