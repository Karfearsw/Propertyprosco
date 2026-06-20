import { auth } from '@/auth'
import { db } from '@/lib/db'
import Link from 'next/link'
import { Heart } from 'lucide-react'

export const metadata = { title: 'Saved Pros' }

export default async function SavedProsPage() {
  const session   = await auth()
  const savedPros = await db.savedPro.findMany({
    where: { homeownerId: session!.user.id },
    include: { homeowner: false },
  })

  const proUsers = savedPros.length > 0 ? await db.user.findMany({
    where: { id: { in: savedPros.map(s => s.proId) } },
    include: { proProfile: true },
  }) : []

  return (
    <div className="p-5 lg:p-6">
      <h1 className="text-[22px] font-black text-pp-dark tracking-tight flex items-center gap-2 mb-5"><Heart size={22} className="text-pp-red"/>Saved Pros</h1>
      {proUsers.length === 0 ? (
        <div className="bg-white border border-pp-border rounded-2xl p-10 text-center">
          <Heart size={32} className="text-pp-gray mx-auto mb-3"/>
          <p className="text-[14px] font-bold text-pp-gray mb-2">No saved pros yet.</p>
          <Link href="/homeowner/find-a-pro" className="text-pp-green font-extrabold hover:underline">Find a pro →</Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {proUsers.map(u => (
            <div key={u.id} className="bg-white border border-pp-border rounded-2xl p-5">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-11 h-11 rounded-xl bg-pp-red flex items-center justify-center text-base font-black text-white shrink-0">{(u.name ?? 'PP').slice(0,2).toUpperCase()}</div>
                <div><div className="text-[14px] font-black text-pp-dark">{u.name}</div><div className="text-[12px] font-bold text-pp-gray">{u.proProfile?.businessName}</div></div>
              </div>
              {(u.proProfile?.services?.length ?? 0) > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">{u.proProfile!.services.slice(0,3).map(s => <span key={s} className="text-[10px] font-bold bg-pp-bg px-2 py-0.5 rounded-full text-pp-gray">{s}</span>)}</div>
              )}
              <Link href={`/homeowner/messages?to=${u.id}`} className="block w-full text-center py-2.5 rounded-xl bg-pp-green text-white text-[13px] font-black hover:bg-green-700 transition-all">Message</Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
