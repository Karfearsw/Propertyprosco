import { SubscriptionStatus } from '@prisma/client'
import Link from 'next/link'
import { Users, PlusCircle, MessageCircle, Gift, Bell, ClipboardList } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import EmptyState from '@/components/brand/EmptyState'
import BillingStatusBanner from '@/components/billing/BillingStatusBanner'
import { requireRole } from '@/lib/auth-guards'
import { getRealtorSnapshot } from '@/lib/dashboard-data'

export const metadata = { title: 'Dashboard' }

export default async function RealtorDashboardPage() {
  const user = await requireRole('REALTOR')
  const {
    realtor,
    clients,
    projects,
    notifications,
    unreadMessages,
    recentMessages,
    unreadNotifications,
    activeClientsCount,
    totalQuotes,
    referralCode,
  } = await getRealtorSnapshot(user.id)
  const billingStatus = realtor?.subscriptionStatus ?? SubscriptionStatus.CHECKOUT_PENDING
  const profileReady = Boolean(realtor?.agencyName && realtor?.licenseNumber)
  const attentionItems = [
    ...clients.filter((client) => client.status !== 'closed').slice(0, 2).map((client) => ({
      title: client.name,
      detail: client.address ?? client.email ?? 'Client record needs coordination',
      action: 'Open clients',
      href: '/realtor/clients',
    })),
    ...notifications.slice(0, 2).map((notification) => ({
      title: notification.title,
      detail: notification.body,
      action: 'Review alert',
      href: notification.link ?? '/realtor/notifications',
    })),
  ].slice(0, 4)

  return (
    <div>
      <div className="bg-re-sidebar px-8 py-6 flex items-center justify-between flex-wrap gap-4">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[2px] text-gray-500 mb-1">Welcome back</p>
          <h1 className="text-[22px] font-black text-white tracking-tight">{user.name ?? 'Realtor'}</h1>
          <p className="text-[13px] text-gray-400 font-bold mt-1">{realtor?.agencyName ?? 'Your Agency'} · {clients.length} client{clients.length!==1?'s':''}</p>
        </div>
        <div className="flex gap-2.5">
          <Link href="/realtor/clients" className="px-4 py-2.5 rounded-[10px] border border-white/15 text-white text-[13px] font-extrabold hover:bg-white/8 transition-all">My Clients</Link>
          <Link href="/realtor/post-project" className="px-4 py-2.5 rounded-[10px] bg-pp-gold text-white text-[13px] font-extrabold hover:bg-amber-800 transition-all">+ Post Project</Link>
        </div>
      </div>

      <div className="bg-white border-b border-pp-border flex overflow-x-auto scrollbar-hide">
        {[
          ['Active Clients', activeClientsCount],
          ['Projects Posted', projects.length],
          ['Quotes Received', totalQuotes],
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
        {billingStatus !== SubscriptionStatus.ACTIVE ? (
          <BillingStatusBanner
            body="Your Realtor subscription is not active yet. Complete billing to unlock clients, messaging, and referral tools."
            billingHref="/realtor/billing"
            accentClassName="bg-pp-gold-light border border-amber-200 rounded-xl p-4 text-pp-gold"
          />
        ) : null}
        {!profileReady && (
          <div className="rounded-xl border border-pp-border bg-white p-4">
            <p className="text-[13px] font-extrabold text-pp-dark">Complete your realtor profile to help clients recognize your brokerage and licensing details.</p>
            <Link href="/realtor/settings" className="mt-3 inline-flex rounded-xl bg-pp-gold px-4 py-2.5 text-[13px] font-black text-white hover:bg-amber-800">Finish profile setup</Link>
          </div>
        )}

        <div className="grid sm:grid-cols-3 gap-3">
          {[
            { href:'/realtor/clients',      icon:<Users size={20} className="text-pp-gold"/>,         bg:'bg-pp-gold-light',  label:'My Clients',   sub:`${clients.length} total` },
            { href:'/realtor/post-project', icon:<PlusCircle size={20} className="text-pp-green"/>,   bg:'bg-pp-green-light', label:'Post Project',  sub:'Free' },
            { href:'/realtor/messages',     icon:<MessageCircle size={20} className="text-pp-blue"/>, bg:'bg-pp-blue-light',  label:'Messages',      sub:`${unreadMessages} unread` },
            { href:'/realtor/referrals',    icon:<Gift size={20} className="text-pp-red"/>,          bg:'bg-pp-red-light',   label:'Referrals',     sub:'Share your link' },
          ].map(a => (
            <Link key={a.href} href={a.href} className="bg-white border border-pp-border rounded-2xl p-4 flex flex-col items-center gap-2 text-center hover:border-pp-gold hover:bg-pp-gold-light/20 transition-all">
              <div className={`w-10 h-10 rounded-xl ${a.bg} flex items-center justify-center`}>{a.icon}</div>
              <div className="text-[13px] font-black text-pp-dark">{a.label}</div>
              <div className="text-[11px] font-bold text-pp-gray">{a.sub}</div>
            </Link>
          ))}
        </div>

        <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-4">
          <div className="space-y-4">
            <div className="bg-white border border-pp-border rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3.5 border-b border-pp-border">
                <h2 className="text-[14px] font-black text-pp-dark">Needs Your Attention</h2>
                <Link href="/realtor/notifications" className="text-[12px] font-extrabold text-pp-gold hover:underline">Open alerts</Link>
              </div>
              {attentionItems.length === 0 ? (
                <div className="p-4">
                  <EmptyState
                    title="No urgent follow-ups"
                    body="Client deadlines, quote responses, and account alerts will appear here when something needs action."
                    accentColor="gold"
                    action={<Link href="/realtor/clients" className="inline-flex items-center gap-1.5 rounded-xl border border-pp-border px-4 py-2.5 text-[13px] font-black text-pp-dark hover:border-pp-gold hover:text-pp-gold"><Users size={15}/>Review clients</Link>}
                  />
                </div>
              ) : attentionItems.map((item) => (
                <div key={`${item.title}-${item.detail}`} className="flex items-start gap-3 px-4 py-3 border-b border-gray-50 last:border-0">
                  <div className="rounded-xl bg-pp-gold-light p-2 text-pp-gold">
                    <ClipboardList size={15} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[13px] font-black text-pp-dark">{item.title}</div>
                    <div className="text-[11px] font-bold text-pp-gray line-clamp-2">{item.detail}</div>
                  </div>
                  <Link href={item.href} className="shrink-0 text-[11px] font-extrabold text-pp-gold hover:underline">{item.action}</Link>
                </div>
              ))}
            </div>

            <div className="bg-white border border-pp-border rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3.5 border-b border-pp-border">
                <h2 className="text-[14px] font-black text-pp-dark">Recent Clients</h2>
                <Link href="/realtor/clients" className="text-[12px] font-extrabold text-pp-gold hover:underline">See all →</Link>
              </div>
              {clients.length === 0 ? (
                <div className="p-4">
                  <EmptyState
                    title="No clients yet"
                    body="Start by adding a client to track referrals, jobs, and project communication from one workspace."
                    accentColor="gold"
                    action={<Link href="/realtor/clients" className="inline-flex items-center rounded-xl bg-pp-gold px-4 py-2.5 text-[13px] font-black text-white hover:bg-amber-800">Add your first client</Link>}
                  />
                </div>
              ) : clients.map(c => {
                const statusColor: Record<string,string> = { active:'bg-pp-green-light text-pp-green', pending:'bg-pp-gold-light text-pp-gold', closed:'bg-pp-bg text-pp-gray' }
                return (
                  <div key={c.id} className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                    <div className="w-9 h-9 rounded-full bg-pp-gold flex items-center justify-center text-[11px] font-black text-white shrink-0">{c.name.slice(0,2).toUpperCase()}</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-black text-pp-dark">{c.name}</div>
                      <div className="text-[11px] font-bold text-pp-gray truncate">{c.address ?? c.email ?? '—'}</div>
                    </div>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${statusColor[c.status] ?? 'bg-pp-bg text-pp-gray'}`}>{c.status}</span>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white border border-pp-border rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3.5 border-b border-pp-border">
                <h2 className="text-[14px] font-black text-pp-dark">Referral Toolkit</h2>
                <Link href="/realtor/referrals" className="text-[12px] font-extrabold text-pp-gold hover:underline">Open page</Link>
              </div>
              <div className="p-4 space-y-3">
                <div className="rounded-2xl bg-pp-gold-light p-4">
                  <div className="text-[11px] font-black uppercase tracking-[1px] text-pp-gold mb-1">Your code</div>
                  <div className="text-[18px] font-black text-pp-dark tracking-wide">{referralCode}</div>
                  <div className="mt-2 text-[12px] font-bold text-pp-gray">Share it after every closing so new agents and clients land in the right workspace.</div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-pp-border p-3">
                    <div className="text-[18px] font-black text-pp-dark">{clients.length}</div>
                    <div className="text-[11px] font-bold text-pp-gray">Clients in system</div>
                  </div>
                  <div className="rounded-xl border border-pp-border p-3">
                    <div className="text-[18px] font-black text-pp-dark">{projects.length}</div>
                    <div className="text-[11px] font-bold text-pp-gray">Projects coordinated</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-pp-border rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3.5 border-b border-pp-border">
                <h2 className="text-[14px] font-black text-pp-dark">Messages & Alerts</h2>
                <div className="flex items-center gap-3 text-[12px] font-extrabold">
                  <Link href="/realtor/messages" className="text-pp-gold hover:underline">Messages</Link>
                  <Link href="/realtor/notifications" className="text-pp-gold hover:underline">Alerts</Link>
                </div>
              </div>
              <div className="divide-y divide-pp-border">
                <div className="px-4 py-3">
                  <div className="mb-2 flex items-center gap-2 text-[11px] font-black uppercase tracking-[1px] text-pp-gray">
                    <MessageCircle size={13} className="text-pp-gold" />
                    {unreadMessages} unread message{unreadMessages === 1 ? '' : 's'}
                  </div>
                  {recentMessages.length === 0 ? (
                    <p className="text-[12px] font-bold text-pp-gray">No recent messages yet.</p>
                  ) : recentMessages.slice(0, 2).map((message) => (
                    <div key={message.id} className="flex items-center gap-3 py-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-pp-gold text-[11px] font-black text-white">
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
                    <Bell size={13} className="text-pp-gold" />
                    {unreadNotifications} active alert{unreadNotifications === 1 ? '' : 's'}
                  </div>
                  {notifications.length === 0 ? (
                    <p className="text-[12px] font-bold text-pp-gray">No new coordination alerts.</p>
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
              <h2 className="text-[14px] font-black text-pp-dark">My Projects</h2>
              <Link href="/realtor/post-project" className="text-[12px] font-extrabold text-pp-gold hover:underline">+ New</Link>
            </div>
            {projects.length === 0 ? (
              <div className="p-4">
                <EmptyState
                  title="No projects posted yet"
                  body="When you coordinate work for a listing or buyer, those projects show here with quote activity and timelines."
                  accentColor="gold"
                  action={<Link href="/realtor/post-project" className="inline-flex items-center rounded-xl border border-pp-border px-4 py-2.5 text-[13px] font-black text-pp-dark hover:border-pp-gold hover:text-pp-gold">Post a project</Link>}
                />
              </div>
            ) : projects.map(p => (
              <div key={p.id} className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-black text-pp-dark truncate">{p.title}</div>
                  <div className="text-[11px] font-bold text-pp-gray">{p.category} · {formatDate(p.createdAt)}</div>
                </div>
                <span className="text-[12px] font-black text-pp-gold shrink-0">{p._count.quotes} quote{p._count.quotes!==1?'s':''}</span>
              </div>
            ))}
          </div>
          </div>
        </div>
      </div>
    </div>
  )
}
