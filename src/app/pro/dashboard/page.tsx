import { SubscriptionStatus } from '@prisma/client'
import { formatCurrency } from '@/lib/utils'
import Link from 'next/link'
import { Zap, Send, Calendar, User, MessageCircle, Bookmark, Bell } from 'lucide-react'
import { requireRole } from '@/lib/auth-guards'
import { getProSnapshot } from '@/lib/dashboard-data'
import EmptyState from '@/components/brand/EmptyState'
import BillingStatusBanner from '@/components/billing/BillingStatusBanner'
import { getProjectWorkflowLabel, quoteStatusClasses, quoteStatusLabel } from '@/lib/quote-workflow'

export const metadata = { title: 'Dashboard' }

export default async function ProDashboardPage() {
  const user = await requireRole('PRO')
  const {
    pro,
    recentLeads,
    recentQuotes,
    schedule,
    reviews,
    unreadMessages,
    recentMessages,
    notifications,
    unreadNotifications,
    savedLeadsCount,
    quickJobsCount,
  } = await getProSnapshot(user.id)

  const totalQuoted = recentQuotes.reduce((s, q) => s + q.amount, 0)
  const accepted    = recentQuotes.filter(q => q.status === 'ACCEPTED').length
  const billingStatus = pro?.subscriptionStatus ?? SubscriptionStatus.CHECKOUT_PENDING

  const quickActions = [
    { href:'/pro/leads',    icon:<Zap size={18} className="text-pp-red"/>,    bg:'bg-pp-red-light',   label:'Browse Leads',   sub:'New today' },
    { href:'/pro/quotes',   icon:<Send size={18} className="text-pp-blue"/>,  bg:'bg-pp-blue-light',  label:'My Quotes',      sub:`${recentQuotes.length} sent` },
    { href:'/pro/messages', icon:<MessageCircle size={18} className="text-pp-green"/>, bg:'bg-pp-green-light', label:'Messages', sub:'Inbox' },
    { href:'/pro/schedule', icon:<Calendar size={18} className="text-pp-gold"/>, bg:'bg-pp-gold-light', label:'Schedule',    sub:`${schedule.length} upcoming` },
    { href:'/pro/saved-leads', icon:<Bookmark size={18} className="text-pp-dark"/>, bg:'bg-pp-bg', label:'Saved Leads', sub:`${savedLeadsCount} saved` },
    { href:'/pro/profile',  icon:<User size={18} className="text-pp-gray"/>,  bg:'bg-pp-bg',          label:'My Profile',     sub:`${pro?.profileComplete ?? 0}% done` },
  ]

  return (
    <div>
      {/* Welcome strip */}
      <div className="bg-pro-sidebar px-8 py-6 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[2px] text-gray-500 mb-1">Good to see you</p>
          <h1 className="text-[22px] font-black text-white tracking-tight">{pro?.user.name ?? 'Pro'}</h1>
          <p className="text-[13px] text-gray-400 font-bold flex items-center gap-2 mt-1">
            {pro?.businessName ?? 'Your Business'}
            <span className="inline-flex items-center gap-1 bg-pp-green text-white text-[10px] font-black px-2 py-0.5 rounded-full">✓ Verified</span>
          </p>
        </div>
        <div className="flex gap-2.5">
          <Link href="/pro/profile" className="px-4 py-2.5 rounded-[10px] border border-white/15 text-white text-[13px] font-extrabold hover:bg-white/8 transition-all">Edit Profile</Link>
          <Link href="/pro/leads"   className="px-4 py-2.5 rounded-[10px] bg-pp-red text-white text-[13px] font-extrabold hover:bg-pp-red-dark transition-all">⚡ Browse Leads</Link>
        </div>
      </div>

      {/* Stats strip */}
      <div className="bg-white border-b border-pp-border flex overflow-x-auto scrollbar-hide">
        {[
          ['Total Quoted', formatCurrency(totalQuoted)],
          ['Quotes Sent',  recentQuotes.length.toString()],
          ['Accepted',     accepted.toString()],
          ['Quick Jobs',   quickJobsCount.toString()],
          ['Saved Leads',  savedLeadsCount.toString()],
          ['Unread Messages', unreadMessages.toString()],
          ['Unread Alerts', unreadNotifications.toString()],
        ].map(([label, value]) => (
          <div key={label} className="flex-1 min-w-[100px] text-center px-4 py-3.5 border-r border-pp-border last:border-r-0">
            <div className="text-[22px] font-black text-pp-dark tracking-tight">{value}</div>
            <div className="text-[11px] font-bold text-pp-gray mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      <div className="p-5 lg:p-6 space-y-4">
        {billingStatus !== SubscriptionStatus.ACTIVE ? (
          <BillingStatusBanner
            body="Your Pro subscription is not active yet. Complete billing to unlock leads, quotes, and messaging."
            billingHref="/pro/billing"
            accentClassName="bg-pp-gold-light border border-amber-200 rounded-xl p-4 text-pp-gold"
          />
        ) : null}

        {/* Quick actions */}
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5">
          {quickActions.map(a => (
            <Link key={a.href} href={a.href} className="bg-white border border-pp-border rounded-xl p-3.5 flex flex-col items-center gap-2 text-center hover:border-pp-red hover:bg-pp-red-light transition-all group">
              <div className={`w-9 h-9 rounded-[10px] ${a.bg} flex items-center justify-center`}>{a.icon}</div>
              <div className="text-[12px] font-black text-pp-dark">{a.label}</div>
              <div className="text-[11px] font-bold text-pp-gray">{a.sub}</div>
            </Link>
          ))}
        </div>

        <div className="grid lg:grid-cols-[1fr_320px] gap-4">
          <div className="space-y-4">
            {/* Earnings card */}
            <div className="bg-pp-dark rounded-2xl p-5 relative overflow-hidden">
              <div className="absolute -top-8 -right-8 w-36 h-36 rounded-full bg-pp-red/10" />
              <p className="text-[10px] font-black uppercase tracking-[2px] text-gray-600 mb-1.5">Quoted This Month</p>
              <div className="text-[32px] font-black text-white tracking-tight mb-1">{formatCurrency(totalQuoted)}</div>
              <p className="text-[12px] text-gray-400 font-bold mb-4">{recentQuotes.length} quotes sent • {accepted} accepted</p>
              <div className="grid grid-cols-3 gap-2.5">
                {[['Leads',recentLeads.length.toString()],['Quotes',recentQuotes.length.toString()],['Reviews',pro?.reviewCount.toString()??'0']].map(([l,v]) => (
                  <div key={l} className="bg-white/6 rounded-[10px] p-3">
                    <div className="text-[17px] font-black text-white">{v}</div>
                    <div className="text-[10px] font-bold text-gray-500 mt-0.5">{l}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Leads */}
            <div className="bg-white border border-pp-border rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3.5 border-b border-pp-border">
                <h2 className="text-[14px] font-black text-pp-dark">Recent Leads</h2>
                <Link href="/pro/leads" className="text-[12px] font-extrabold text-pp-red hover:underline">See all →</Link>
              </div>
              {recentLeads.length === 0 ? (
                <div className="p-4">
                  <EmptyState
                    title="No leads yet"
                    body="Your lead feed will fill up as homeowners post matching work. Keep your profile complete so you show up for the right jobs."
                    action={<Link href="/pro/leads" className="inline-flex items-center rounded-xl bg-pp-red px-4 py-2.5 text-[13px] font-black text-white hover:bg-pp-red-dark">Browse open projects</Link>}
                  />
                </div>
              ) : recentLeads.map(lead => (
                <div key={lead.id} className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                  <span className="text-2xl shrink-0">🏠</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-black text-pp-dark truncate">{lead.project.title}</div>
                    <div className="text-[11px] font-bold text-pp-gray">{lead.project.category} · {lead.project.owner.zipCode}</div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[13px] font-black text-pp-dark">{lead.project.budget ?? '—'}</span>
                    {lead.status === 'new' && <span className="text-[10px] font-black bg-pp-blue-light text-pp-blue px-2 py-0.5 rounded-full">New</span>}
                    <Link href={`/pro/leads`} className="px-3 py-1.5 rounded-lg bg-pp-red text-white text-[12px] font-extrabold hover:bg-pp-red-dark">Quote</Link>
                  </div>
                </div>
              ))}
            </div>

            {/* Recent Quotes */}
            <div className="bg-white border border-pp-border rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3.5 border-b border-pp-border">
                <h2 className="text-[14px] font-black text-pp-dark">Recent Quotes</h2>
                <Link href="/pro/quotes" className="text-[12px] font-extrabold text-pp-red hover:underline">See all →</Link>
              </div>
              {recentQuotes.length === 0 ? (
                <div className="p-4">
                  <EmptyState
                    title="No quotes sent yet"
                    body="When you quote a project, it shows up here with status updates so you can track what is viewed, accepted, or still pending."
                    action={<Link href="/pro/leads" className="inline-flex items-center rounded-xl border border-pp-border px-4 py-2.5 text-[13px] font-black text-pp-dark hover:border-pp-red hover:text-pp-red">Find a project to quote</Link>}
                  />
                </div>
              ) : recentQuotes.map(q => (
                <div key={q.id} className="flex items-center gap-3 px-4 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-black text-pp-dark truncate">{q.project.title}</div>
                    <div className="text-[11px] font-bold text-pp-gray">{q.project.category} · {getProjectWorkflowLabel(q.project.status)}</div>
                  </div>
                  <span className="text-[13px] font-black text-pp-dark shrink-0">{formatCurrency(q.amount)}</span>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full shrink-0 ${quoteStatusClasses[q.status]}`}>{quoteStatusLabel[q.status]}</span>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-4">
            {/* Profile completion */}
            <div className="bg-white border border-pp-border rounded-2xl p-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-[14px] font-black text-pp-dark">Profile</h2>
                <span className="text-[13px] font-black text-pp-red">{pro?.profileComplete ?? 0}%</span>
              </div>
              <div className="h-1.5 bg-pp-border rounded-full mb-3 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-pp-red to-red-400 rounded-full" style={{width:`${pro?.profileComplete ?? 0}%`}}/>
              </div>
              <div className="space-y-1.5">
                {[['Add profile photo', false],['Complete business info', !!pro?.businessName],['Add your services', (pro?.services?.length ?? 0) > 0],['Set service area', (pro?.serviceArea?.length ?? 0) > 0],['Add license details', !!pro?.licenseNumber]].map(([label, done]) => (
                  <div key={label as string} className={`flex items-center gap-2 text-[12px] font-bold ${done ? 'text-pp-green' : 'text-pp-dark-3'}`}>
                    <span>{done ? '✓' : '○'}</span>{label as string}
                  </div>
                ))}
              </div>
              <Link href="/pro/profile" className="block mt-3 text-center py-2 rounded-xl bg-pp-red text-white text-[12px] font-black hover:bg-pp-red-dark transition-all">Complete Profile</Link>
            </div>

            <div className="bg-white border border-pp-border rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3.5 border-b border-pp-border">
                <h2 className="text-[14px] font-black text-pp-dark">Inbox & Alerts</h2>
                <div className="flex items-center gap-3 text-[12px] font-extrabold">
                  <Link href="/pro/messages" className="text-pp-red hover:underline">Messages</Link>
                  <Link href="/pro/notifications" className="text-pp-red hover:underline">Alerts</Link>
                </div>
              </div>
              <div className="grid divide-y divide-pp-border">
                <div className="px-4 py-3">
                  <div className="mb-2 flex items-center gap-2 text-[11px] font-black uppercase tracking-[1px] text-pp-gray">
                    <MessageCircle size={13} className="text-pp-red" />
                    {unreadMessages} unread message{unreadMessages === 1 ? '' : 's'}
                  </div>
                  {recentMessages.length === 0 ? (
                    <p className="text-[12px] font-bold text-pp-gray">No recent conversations yet.</p>
                  ) : recentMessages.slice(0, 2).map((message) => (
                    <div key={message.id} className="flex items-center gap-3 py-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-pp-red text-[11px] font-black text-white">
                        {message.sender.name?.slice(0, 2).toUpperCase() ?? 'PP'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-[12px] font-black text-pp-dark">{message.sender.name ?? 'Property Pros'}</div>
                        <div className="truncate text-[11px] font-bold text-pp-gray">{message.content}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="px-4 py-3">
                  <div className="mb-2 flex items-center gap-2 text-[11px] font-black uppercase tracking-[1px] text-pp-gray">
                    <Bell size={13} className="text-pp-red" />
                    {unreadNotifications} account alert{unreadNotifications === 1 ? '' : 's'}
                  </div>
                  {notifications.length === 0 ? (
                    <p className="text-[12px] font-bold text-pp-gray">You are caught up on billing, lead, and quote alerts.</p>
                  ) : notifications.slice(0, 2).map((notification) => (
                    <div key={notification.id} className="py-2">
                      <div className="text-[12px] font-black text-pp-dark">{notification.title}</div>
                      <div className="text-[11px] font-bold text-pp-gray">{notification.body}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white border border-pp-border rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3.5 border-b border-pp-border">
                <h2 className="text-[14px] font-black text-pp-dark">Upcoming</h2>
                <Link href="/pro/schedule" className="text-[12px] font-extrabold text-pp-red hover:underline">View all</Link>
              </div>
              {schedule.length === 0 ? (
                <div className="p-4">
                  <EmptyState
                    title="No upcoming jobs"
                    body="Booked visits, estimates, and follow-ups appear here so you can stay ahead of your week."
                    action={<Link href="/pro/leads" className="inline-flex items-center rounded-xl border border-pp-border px-4 py-2.5 text-[13px] font-black text-pp-dark hover:border-pp-red hover:text-pp-red">Book your next project</Link>}
                  />
                </div>
              ) : schedule.map(s => {
                const d = new Date(s.date)
                return (
                  <div key={s.id} className="flex items-center gap-3 px-4 py-3 border-b border-gray-50 last:border-0">
                    <div className="w-11 h-11 rounded-xl bg-pp-red-light flex flex-col items-center justify-center shrink-0">
                      <span className="text-[16px] font-black text-pp-red leading-none">{d.getDate()}</span>
                      <span className="text-[9px] font-black text-pp-red uppercase">{d.toLocaleDateString('en',{month:'short'})}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-black text-pp-dark truncate">{s.title}</div>
                      <div className="text-[11px] font-bold text-pp-gray">{s.client}</div>
                    </div>
                    <div className="text-[12px] font-extrabold text-pp-dark shrink-0">{d.toLocaleTimeString('en',{hour:'numeric',minute:'2-digit'})}</div>
                  </div>
                )
              })}
            </div>

            {/* Recent reviews */}
            <div className="bg-white border border-pp-border rounded-2xl overflow-hidden">
              <div className="px-4 py-3.5 border-b border-pp-border"><h2 className="text-[14px] font-black text-pp-dark">Recent Reviews</h2></div>
              {reviews.length === 0 ? (
                <div className="p-4">
                  <EmptyState
                    title="No reviews yet"
                    body="Reviews appear after completed projects. Keep your profile updated and respond quickly to leads to build momentum."
                  />
                </div>
              ) : reviews.map(r => (
                <div key={r.id} className="px-4 py-3 border-b border-gray-50 last:border-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[13px] font-black text-pp-dark">{r.author.name}</span>
                    <span className="text-amber-400 text-[13px]">{'★'.repeat(r.rating)}</span>
                  </div>
                  {r.comment && <p className="text-[12px] text-pp-gray font-bold leading-snug">{r.comment}</p>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
