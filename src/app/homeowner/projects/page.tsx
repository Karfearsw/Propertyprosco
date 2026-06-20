import { db } from '@/lib/db'
import Link from 'next/link'
import { formatDate, formatCurrency } from '@/lib/utils'
import { PlusCircle } from 'lucide-react'
import QuoteDecisionButtons from '@/components/homeowner/QuoteDecisionButtons'
import { requireRole } from '@/lib/auth-guards'
import {
  getProjectWorkflowLabel,
  markQuotesViewedForOwner,
  quoteStatusClasses,
  quoteStatusLabel,
} from '@/lib/quote-workflow'

export const metadata = { title: 'My Projects' }

export default async function HomeownerProjectsPage() {
  const user = await requireRole('HOMEOWNER')

  await markQuotesViewedForOwner(user.id)

  const projects = await db.project.findMany({
    where: { ownerId: user.id },
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { quotes: true } },
      quotes: {
        orderBy: { createdAt: 'desc' },
        include: {
          pro: { select: { id: true, name: true, image: true } },
        },
      },
    },
  })

  const statusColor: Record<string, string> = {
    OPEN: 'bg-pp-blue-light text-pp-blue',
    IN_PROGRESS: 'bg-pp-gold-light text-pp-gold',
    COMPLETED: 'bg-pp-green-light text-pp-green',
    CANCELLED: 'bg-red-100 text-pp-red',
  }

  return (
    <div className="p-5 lg:p-6">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-[22px] font-black text-pp-dark tracking-tight">My Projects</h1>
        <Link href="/homeowner/post-project" className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-pp-green text-white text-[13px] font-black hover:bg-green-700 transition-all"><PlusCircle size={15}/>Post Project</Link>
      </div>

      {projects.length === 0 ? (
        <div className="bg-white border border-pp-border rounded-2xl p-12 text-center">
          <p className="text-[15px] font-bold text-pp-gray mb-4">You haven&apos;t posted any projects yet.</p>
          <Link href="/homeowner/post-project" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-pp-green text-white text-[14px] font-black hover:bg-green-700"><PlusCircle size={16}/>Post Your First Project</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {projects.map((project) => {
            const acceptedQuote = project.quotes.find((quote) => quote.status === 'ACCEPTED')

            return (
              <div key={project.id} className="bg-white border border-pp-border rounded-2xl overflow-hidden">
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <h2 className="text-[16px] font-black text-pp-dark mb-1">{project.title}</h2>
                      <p className="text-[12px] font-bold text-pp-gray">
                        {project.category} · Posted {formatDate(project.createdAt)}
                        {project.zipCode ? ` · ${project.zipCode}` : ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {project.budget ? <span className="text-[14px] font-black text-pp-dark">{project.budget}</span> : null}
                      <span className={`text-[10px] font-black px-2 py-1 rounded-full ${statusColor[project.status]}`}>
                        {project.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                  {project.description ? (
                    <p className="text-[13px] text-pp-dark-3 font-semibold leading-relaxed mb-3">{project.description}</p>
                  ) : null}
                  <div className="flex flex-wrap items-center gap-4 text-[12px] font-black">
                    <span className="text-pp-dark">
                      {project._count.quotes} quote{project._count.quotes !== 1 ? 's' : ''} received
                    </span>
                    <span className="text-pp-gray">{getProjectWorkflowLabel(project.status)}</span>
                    {project.urgent ? <span className="text-pp-red">Urgent</span> : null}
                  </div>
                </div>

                {acceptedQuote ? (
                  <div className="border-t border-pp-border bg-pp-green-light/40 px-5 py-3">
                    <p className="text-[11px] font-black uppercase tracking-[1px] text-pp-green mb-1">Hired Pro</p>
                    <p className="text-[13px] font-black text-pp-dark">
                      {acceptedQuote.pro.name ?? 'Selected pro'} accepted for {formatCurrency(acceptedQuote.amount)}
                    </p>
                    <p className="text-[11px] font-bold text-pp-gray mt-1">
                      The project moved into progress when this quote was accepted.
                    </p>
                  </div>
                ) : null}

                {project.quotes.length > 0 ? (
                  <div className="border-t border-pp-border bg-pp-bg/50 px-5 py-4">
                    <p className="text-[11px] font-black uppercase tracking-[1px] text-pp-gray mb-3">Project Quotes</p>
                    <div className="space-y-3">
                      {project.quotes.map((quote) => (
                        <div key={quote.id} className="rounded-2xl border border-pp-border bg-white p-4">
                          <div className="flex flex-wrap items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-pp-red flex items-center justify-center text-[10px] font-black text-white shrink-0">
                              {quote.pro.name?.slice(0, 2).toUpperCase() ?? 'PP'}
                            </div>
                            <div className="flex-1 min-w-[180px]">
                              <div className="text-[13px] font-black text-pp-dark">{quote.pro.name ?? 'Property Pro'}</div>
                              <div className="text-[11px] font-bold text-pp-gray">Sent {formatDate(quote.createdAt)}</div>
                            </div>
                            <span className="text-[14px] font-black text-pp-dark">{formatCurrency(quote.amount)}</span>
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${quoteStatusClasses[quote.status]}`}>
                              {quoteStatusLabel[quote.status]}
                            </span>
                          </div>
                          {quote.message ? (
                            <p className="mt-3 text-[12px] font-semibold leading-relaxed text-pp-dark-3">{quote.message}</p>
                          ) : null}
                          <QuoteDecisionButtons quoteId={quote.id} status={quote.status} />
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
