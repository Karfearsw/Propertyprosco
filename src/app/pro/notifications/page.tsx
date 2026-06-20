import { auth } from '@/auth'
import { db } from '@/lib/db'
import { formatRelative } from '@/lib/utils'
import MarkReadButton from '@/components/MarkReadButton'
import Link from 'next/link'

export const metadata = { title: 'Notifications' }

export default async function ProNotificationsPage() {
  const session       = await auth()
  const notifications = await db.notification.findMany({ where:{ userId: session!.user.id }, orderBy:{ createdAt:'desc' }, take:50 })

  return (
    <div className="p-5 lg:p-6 max-w-2xl">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-[22px] font-black text-pp-dark tracking-tight">Notifications</h1>
        <MarkReadButton />
      </div>

      <div className="bg-white border border-pp-border rounded-2xl overflow-hidden">
        {notifications.length === 0 ? (
          <div className="p-10 text-center text-[14px] font-bold text-pp-gray">All caught up! No notifications yet.</div>
        ) : notifications.map(n => (
          <div key={n.id} className={`flex items-start gap-3 px-4 py-4 border-b border-gray-50 last:border-0 ${!n.read?'bg-pp-red-light/30':''}`}>
            <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${n.read?'bg-transparent':'bg-pp-red'}`}/>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-black text-pp-dark">{n.title}</div>
              <div className="text-[12px] font-bold text-pp-gray mt-0.5 leading-relaxed">{n.body}</div>
              <div className="text-[11px] font-bold text-pp-gray/60 mt-1">{formatRelative(n.createdAt)}</div>
              {n.link ? <Link href={n.link} className="mt-2 inline-flex text-[11px] font-extrabold text-pp-red hover:underline">Open related page</Link> : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
