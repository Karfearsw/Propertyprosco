import Link from 'next/link'
import { PlusCircle, Search, MessageCircle, FolderOpen, Heart, Bell, ReceiptText } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import EmptyState from '@/components/brand/EmptyState'
import { requireRole } from '@/lib/auth-guards'
import { getHomeownerSnapshot } from '@/lib/dashboard-data'

export const metadata = { title: 'Dashboard' }

export default async function HomeownerDashboardPage() {
  const user = await requireRole('HOMEOWNER')
  const {
    projects,
    recentMessages,
    recentQuotes,
    notifications,
    savedProsCount,
    unreadMessages,
    unreadNotifications,
    totalQuotes,
  } = await getHomeownerSnapshot(user.id)
  const activeProjects = projects.filter((project) => project.status === 'OPEN' || project.status === 'IN_PROGRESS').length

  const quickActions = [
    { href:'/homeowner/post-project', icon:<PlusCircle size={20} className="text-pp-green"/>, bg:'bg-pp-green-light', label:'Post Project', sub:'Free, fast' },
    { href:'/homeowner/find-a-pro',   icon:<Search size={20} className="text-pp-blue"/>,      bg:'bg-pp-blue-light',  label:'Find a Pro',  sub:'Browse pros' },
    { href:'/homeowner/projects',     icon:<FolderOpen size={20} className="text-pp-gold"/>,  bg:'bg-pp-gold-light',  label:'My Projects', sub:`${activeProjects} active` },
    { href:'/homeowner/saved-pros',   icon:<Heart size={20} className="text-pp-red"/>,        bg:'bg-pp-red-light',   label:'Saved Pros',  sub:`${savedProsCount} saved` },
    { href:'/homeowner/messages',     icon:<MessageCircle size={20} className="text-pp-dark"/>,bg:'bg-pp-bg',         label:'Messages',    sub:`${unreadMessages} unread` },
  ]

  return (
    <div>
      <div className="bg-ho-sidebar px-8 py-6 flex items-center justify-between flex-wrap gap-4">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[2px] text-gray-500 mb-1">Welcome back</p>
          <h1 className="text-[22px] font-black text-white tracking-tight">{user.name ?? 'Homeowner'}</h1>
          <p className="text-[13px] text-gray-400 font-bold mt-1">
            {activeProjects} active project{activeProjects !== 1 ? 's' : ''} · {totalQuotes} quote{totalQuotes !== 1 ? 's' : ''} received
          </p>
        </div>
        <div className="flex gap-2.5">
          <Link href="/homeowner/find-a-pro"   className="px-4 py-2.5 rounded-[10px] border border-white/15 text-white text-[13px] font-extrabold hover:bg-white/8 transition-all">Find a Pro</Link>
          <Link href="/homeowner/post-project" className="px-4 py-2.5 rounded-[10px] bg-pp-green text-white text-[13px] font-extrabold hover:bg-green-700 transition-all">+ Post Project</Link>
        </div>
      </div>

      <div className="bg-white border-b border-pp-border flex overflow-x-auto scrollbar-hide">
        {[
          ['Projects Posted', projects.length],
          ['Active Projects', activeProjects],
          ['Quotes Received', totalQuotes],
          ['Saved Pros', savedProsCount],
          ['Unread Messages', unreadMessages],
          ['Unread Alerts', unreadNotifications],
        ].map(([l,v]) => (
          <div key={l as string} className="flex-1 min-w-[110px] text-center px-4 py-3.5 border-r border-pp-border last:border-r-0">
            <div className="text-[22px] font-black text-pp-dark">{v}</div>
            <div className="text-[11px] font-bold text-pp-gray mt-0.5">{l}</div>
          </div>
        ))}
      </div>

      <div className="p-5 lg:p-6 space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {quickActions.map(a => (
            <Link key={a.href} href={a.href} className="bg-white border border-pp-border rounded-2xl p-4 flex flex-col items-center gap-2 text-center hover:border-pp-green hover:bg-pp-green-light/30 transition-all">
              <div className={`w-10 h-10 rounded-xl ${a.bg} flex items-center justify-center`}>{a.icon}</div>
              <div className="text-[13px] font-black text-pp-dark">{a.label}</div>
              <div className="text-[11px] font-bold text-pp-gray">{a.sub}</div>
            </Link>
          ))}
        </div>

        <div className="grid lg:grid-cols-[1fr_300px] gap-4">
          <div className="bg-white border border-pp-border rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-pp-border">
              <h2 className="text-[14px] font-black text-pp-dark">My Projects</h2>
              <Link href="/homeowner/projects" className="text-[12px] font-extrabold text-pp-green hover:underline">See all →</Link>
            </div>
            {projects.length === 0 ? (
              <div className="p-4">
                <EmptyState
                  title="No projects yet"
                  body="Post your first project to start receiving quotes from local pros. You can add photos, timing, and budget details later."
                  accentColor="green"
                  action={<Link href="/homeowner/post-project" className="inline-flex items-center gap-1.5 rounded-xl bg-pp-green px-4 py-2.5 text-[13px] font-black text-white hover:bg-green-700"><PlusCircle size={15}/>Post your first project</Link>}
                />
              </div>
            ) : projects.map(p => {
              const statusColor: Record<string,string> = { OPEN:'bg-pp-blue-light text-pp-blue', IN_PROGRESS:'bg-pp-gold-light text-pp-gold', COMPLETED:'bg-pp-green-light text-pp-green', CANCELLED:'bg-red-100 text-pp-red' }
              return (
                <div key={p.id} className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-black text-pp-dark truncate">{p.title}</div>
                    <div className="text-[11px] font-bold text-pp-gray">{p.category} · {formatDate(p.createdAt)}</div>
                  </div>
                  <span className="text-[12px] font-black text-pp-green shrink-0">{p._count.quotes} quote{p._count.quotes!==1?'s':''}</span>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full shrink-0 ${statusColor[p.status]}`}>{p.status.replace('_',' ')}</span>
                </div>
              )
            })}
            {projects.length > 0 && (
              <div className="px-4 py-3 border-t border-pp-border">
                <Link href="/homeowner/post-project" className="inline-flex items-center gap-1.5 text-[13px] font-extrabold text-pp-green hover:underline"><PlusCircle size={14}/>Post another project</Link>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="bg-white border border-pp-border rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3.5 border-b border-pp-border">
                <h2 className="text-[14px] font-black text-pp-dark">Messages</h2>
                <Link href="/homeowner/messages" className="text-[12px] font-extrabold text-pp-green hover:underline">View all</Link>
              </div>
              {recentMessages.length === 0 ? (
                <div className="p-4">
                  <EmptyState
                    title="No new messages"
                    body="Questions from pros and project replies will appear here once conversations start."
                    accentColor="green"
                    action={<Link href="/homeowner/find-a-pro" className="inline-flex items-center rounded-xl border border-pp-border px-4 py-2.5 text-[13px] font-black text-pp-dark hover:border-pp-green hover:text-pp-green">Browse pros</Link>}
                  />
                </div>
              ) : recentMessages.map(m => (
                <div key={m.id} className="flex items-center gap-3 px-4 py-3 border-b border-gray-50 last:border-0">
                  <div className="w-8 h-8 rounded-full bg-pp-green flex items-center justify-center text-[11px] font-black text-white shrink-0">
                    {m.sender.name?.slice(0,2).toUpperCase() ?? 'PP'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-black text-pp-dark">{m.sender.name}</div>
                    <div className="text-[11px] font-bold text-pp-gray truncate">{m.content}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white border border-pp-border rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3.5 border-b border-pp-border">
                <h2 className="text-[14px] font-black text-pp-dark">Recent Quotes</h2>
                <Link href="/homeowner/projects" className="text-[12px] font-extrabold text-pp-green hover:underline">Open projects</Link>
              </div>
              {recentQuotes.length === 0 ? (
                <div className="p-4">
                  <EmptyState
                    title="No quote activity yet"
                    body="Once pros respond to your projects, their pricing and notes will show here so you can compare them quickly."
                    accentColor="green"
                    action={<Link href="/homeowner/post-project" className="inline-flex items-center gap-1.5 rounded-xl border border-pp-border px-4 py-2.5 text-[13px] font-black text-pp-dark hover:border-pp-green hover:text-pp-green"><PlusCircle size={15}/>Post a project</Link>}
                  />
                </div>
              ) : recentQuotes.map((quote) => (
                <div key={quote.id} className="px-4 py-3 border-b border-gray-50 last:border-0">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-[13px] font-black text-pp-dark truncate">{quote.project.title}</div>
                      <div className="text-[11px] font-bold text-pp-gray">{quote.pro.name ?? 'Property Pro'} · {quote.project.category}</div>
                    </div>
                    <span className="text-[13px] font-black text-pp-dark shrink-0">{formatCurrency(quote.amount)}</span>
                  </div>
                  <div className="mt-2 flex items-center gap-2 text-[10px] font-black">
                    <span className={`rounded-full px-2 py-0.5 ${quote.status === 'ACCEPTED' ? 'bg-pp-green-light text-pp-green' : quote.status === 'VIEWED' ? 'bg-pp-blue-light text-pp-blue' : 'bg-pp-gold-light text-pp-gold'}`}>
                      {quote.status.charAt(0) + quote.status.slice(1).toLowerCase()}
                    </span>
                    <span className="text-pp-gray">Received {formatDate(quote.createdAt)}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white border border-pp-border rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3.5 border-b border-pp-border">
                <h2 className="text-[14px] font-black text-pp-dark">Alerts</h2>
                <Link href="/homeowner/notifications" className="text-[12px] font-extrabold text-pp-green hover:underline">View all</Link>
              </div>
              {notifications.length === 0 ? (
                <div className="p-4">
                  <EmptyState
                    title="All caught up"
                    body="We will drop reminders here when quotes arrive, messages come in, or a project needs your attention."
                    accentColor="green"
                  />
                </div>
              ) : notifications.slice(0,3).map(n => (
                <div key={n.id} className="px-4 py-3 border-b border-gray-50 last:border-0">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 rounded-xl bg-pp-green-light p-2 text-pp-green">
                      {n.type === 'new_quote' ? <ReceiptText size={14} /> : <Bell size={14} />}
                    </div>
                    <div className="min-w-0">
                      <div className="text-[12px] font-black text-pp-dark">{n.title}</div>
                      <div className="text-[11px] font-bold text-pp-gray mt-0.5 line-clamp-2">{n.body}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
