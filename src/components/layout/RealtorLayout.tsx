'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { LayoutDashboard, Users, MessageCircle, Bell, CreditCard, Settings, PlusCircle, Gift, LogOut, Menu, X } from 'lucide-react'

const navSections = [
  { label: 'Main', items: [
    { href:'/realtor/dashboard',    icon:<LayoutDashboard size={15}/>, label:'Dashboard' },
    { href:'/realtor/clients',      icon:<Users size={15}/>,           label:'My Clients' },
    { href:'/realtor/post-project', icon:<PlusCircle size={15}/>,      label:'Post Project' },
    { href:'/realtor/messages',     icon:<MessageCircle size={15}/>,   label:'Messages' },
    { href:'/realtor/referrals',    icon:<Gift size={15}/>,            label:'Referrals' },
  ]},
  { label: 'Account', items: [
    { href:'/realtor/billing',       icon:<CreditCard size={15}/>, label:'Billing' },
    { href:'/realtor/notifications', icon:<Bell size={15}/>,       label:'Notifications' },
    { href:'/realtor/settings',      icon:<Settings size={15}/>,   label:'Settings' },
  ]},
]

interface Props { children: React.ReactNode; user?: { name?: string|null } }

export default function RealtorLayout({ children, user }: Props) {
  const pathname = usePathname()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const initials = user?.name?.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2) ?? 'RE'

  const NavItems = ({ onNav }: { onNav?: ()=>void }) => (
    <>
      {navSections.map(sec => (
        <div key={sec.label} className="mb-5">
          <div className="text-[9px] font-black uppercase tracking-[2px] text-yellow-500 px-2.5 py-1 mb-1">{sec.label}</div>
          {sec.items.map(item => {
            const active = pathname === item.href
            return (
              <Link key={item.href} href={item.href} onClick={onNav}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-[9px] text-[13px] font-bold mb-0.5 transition-all ${active ? 'bg-pp-gold text-white' : 'text-white/65 hover:bg-white/8 hover:text-white'}`}>
                {item.icon}<span>{item.label}</span>
              </Link>
            )
          })}
        </div>
      ))}
    </>
  )

  return (
    <div className="min-h-screen bg-pp-bg font-body">
      <header className="bg-re-sidebar h-[60px] flex items-center justify-between px-5 sticky top-0 z-50 border-b border-white/6">
        <Link href="/realtor/dashboard" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-[9px] bg-pp-gold flex items-center justify-center font-black text-[12px] text-white">PP</div>
          <span className="text-[17px] font-black text-white"><span className="text-yellow-400">Property</span> Pros</span>
        </Link>
        <div className="flex items-center gap-1.5">
          <Link href="/realtor/notifications" className="relative w-9 h-9 rounded-[9px] flex items-center justify-center text-gray-400 hover:bg-white/8 hover:text-white transition-all">
            <Bell size={18}/><div className="absolute top-1.5 right-1.5 w-2 h-2 bg-pp-red rounded-full border border-white"/>
          </Link>
          <div className="w-8 h-8 rounded-full bg-pp-gold flex items-center justify-center text-[12px] font-black text-white border-2 border-white/15">{initials}</div>
          <button onClick={()=>setDrawerOpen(!drawerOpen)} className="ml-1 w-9 h-9 rounded-[9px] flex items-center justify-center text-gray-400 hover:bg-white/8 transition-all lg:hidden">{drawerOpen?<X size={20}/>:<Menu size={20}/>}</button>
        </div>
      </header>

      {drawerOpen && <div onClick={()=>setDrawerOpen(false)} className="fixed inset-0 top-[60px] bg-black/40 z-40 lg:hidden"/>}
      <div className={`fixed top-[60px] right-0 bottom-0 w-72 bg-re-sidebar border-l border-white/7 z-50 flex-col p-3 overflow-y-auto shadow-2xl ${drawerOpen ? 'flex' : 'hidden'}`}>
        <NavItems onNav={()=>setDrawerOpen(false)}/>
        <div className="mt-auto pt-3 border-t border-white/7">
          <button onClick={()=>signOut({callbackUrl:'/login'})} className="flex items-center gap-2.5 px-3 py-2.5 rounded-[9px] text-[13px] font-extrabold text-red-400 hover:bg-pp-red/10 w-full"><LogOut size={15}/>Log out</button>
        </div>
      </div>

      <div className="flex">
        <aside className="hidden lg:flex w-[220px] bg-re-sidebar flex-col p-2.5 sticky top-[60px] h-[calc(100vh-60px)] overflow-y-auto shrink-0">
          <div className="flex-1"><NavItems/></div>
          <div className="border-t border-white/7 pt-2.5">
            <div className="flex items-center gap-2 px-2.5 py-2 mb-1">
              <div className="w-8 h-8 rounded-full bg-pp-gold flex items-center justify-center text-[11px] font-black text-white shrink-0">{initials}</div>
              <div className="min-w-0"><div className="text-[12px] font-black text-white truncate">{user?.name ?? 'Realtor'}</div><div className="text-[11px] text-gray-500">Realtor</div></div>
            </div>
            <button onClick={()=>signOut({callbackUrl:'/login'})} className="flex items-center gap-2 px-2.5 py-2 rounded-[9px] text-[12px] font-extrabold text-red-400 hover:bg-pp-red/10 w-full"><LogOut size={13}/>Log out</button>
          </div>
        </aside>
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  )
}
