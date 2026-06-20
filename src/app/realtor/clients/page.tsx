import { auth } from '@/auth'
import { db } from '@/lib/db'
import AddClientButton from '@/components/realtor/AddClientButton'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'

export const metadata = { title: 'My Clients' }

export default async function RealtorClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ clientId?: string }>
}) {
  const session = await auth()
  const sp = await searchParams
  const realtor = await db.realtorProfile.findUnique({ where:{ userId: session!.user.id } })
  const clients = realtor ? await db.realtorClient.findMany({
    where:{ realtorId: realtor.id },
    orderBy:{ createdAt:'desc' },
    include: {
      _count: { select: { projects: true } },
      projects: {
        orderBy: { createdAt: 'desc' },
        take: 2,
        select: {
          id: true,
          title: true,
          status: true,
          createdAt: true,
        },
      },
    },
  }) : []

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
            <div
              key={c.id}
              className={`bg-white border rounded-2xl p-5 hover:shadow-sm transition-shadow ${sp.clientId === c.id ? 'border-pp-gold shadow-sm ring-1 ring-amber-200' : 'border-pp-border'}`}
            >
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
                  <div className="mt-3 rounded-xl bg-pp-bg px-3.5 py-3">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[12px] font-black text-pp-dark">Linked projects</span>
                      <span className="text-[12px] font-black text-pp-gold">{c._count.projects}</span>
                    </div>
                    {c.projects.length === 0 ? (
                      <p className="mt-2 text-[12px] font-bold text-pp-gray">No projects linked yet. Post the first job for this client to keep follow-up connected.</p>
                    ) : (
                      <div className="mt-2 space-y-1.5">
                        {c.projects.map((project) => (
                          <div key={project.id} className="text-[12px] font-bold text-pp-gray">
                            <span className="text-pp-dark">{project.title}</span>
                            {` · ${project.status.toLowerCase()} · ${formatDate(project.createdAt)}`}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Link href={`/realtor/post-project?clientId=${c.id}`} className="rounded-xl bg-pp-gold px-4 py-2.5 text-[12px] font-black text-white hover:bg-amber-800 transition-all">
                      Post Project For Client
                    </Link>
                    {sp.clientId === c.id ? (
                      <span className="rounded-xl border border-amber-200 bg-pp-gold-light px-3 py-2.5 text-[12px] font-black text-pp-gold">
                        Current workflow focus
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
