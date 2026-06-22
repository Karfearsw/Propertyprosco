'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { LayoutDashboard, FolderOpen, MessageCircle, Bell, CreditCard, Settings, Search, PlusCircle, Heart, LogOut, Menu, X } from 'lucide-react'

const navSections = [
  { label: 'Main', items: [
    { href:'/homeowner/dashboard',   icon:<LayoutDashboard size={15}/>, label:'Dashboard' },
    { href:'/homeowner/projects',    icon:<FolderOpen size={15}/>,      label:'My Projects' },
    { href:'/homeowner/find-a-pro',  icon:<Search size={15}/>,          label:'Find a Pro' },
    { href:'/homeowner/post-project',icon:<PlusCircle size={15}/>,      label:'Post Project' },
    { href:'/homeowner/saved-pros',  icon:<Heart size={15}/>,           label:'Saved Pros' },
    { href:'/homeowner/messages',    icon:<MessageCircle size={15}/>,   label:'Messages' },
  ]},
  { label: 'Account', items: [
    { href:'/homeowner/billing',       icon:<CreditCard size={15}/>, label:'Billing' },
    { href:'/homeowner/notifications', icon:<Bell size={15}/>,       label:'Notifications' },
    { href:'/homeowner/settings',      icon:<Settings size={15}/>,   label:'Settings' },
  ]},
]

interface Props { children: React.ReactNode; user?: { name?: string|null } }

export default function HomeownerLayout({ children, user }: Props) {
  const pathname = usePathname()
  const router = useRouter()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const initials = user?.name?.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2) ?? 'HO'

  useEffect(() => {
    let isMounted = true

    async function enforceCardOnFile() {
      if (pathname === '/homeowner/billing/add-card') return

      try {
        const response = await fetch('/api/homeowner/billing/status')
        if (!response.ok) return

        const data = (await response.json()) as { hasPaymentMethod?: boolean }
        if (isMounted && data.hasPaymentMethod === false) {
          router.replace('/homeowner/billing/add-card')
        }
      } catch {
        return
      }
    }

    void enforceCardOnFile()

    return () => {
      isMounted = false
    }
  }, [pathname, router])

  const NavItems = ({ onNav }: { onNav?: ()=>void }) => (
    <>
      {navSections.map(sec => (
        <div key={sec.label} className="mb-5">
          <div className="text-[9px] font-black uppercase tracking-[2px] text-green-500 px-2.5 py-1 mb-1">{sec.label}</div>
          {sec.items.map(item => {
            const active = pathname === item.href
            return (
              <Link key={item.href} href={item.href} onClick={onNav}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-[9px] text-[13px] font-bold mb-0.5 transition-all ${active ? 'bg-pp-green text-white' : 'text-white/65 hover:bg-white/8 hover:text-white'}`}>
                {item.icon}<span>{item.label}</span>
              </Link>
            )
          })}
        </div>
      ))}
    </>
  )

  return (
    <div className="min-h-dvh overflow-x-clip bg-pp-bg font-body">
      <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-white/6 bg-ho-sidebar px-4 sm:px-5">
        <Link href="/homeowner/dashboard" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-[9px] bg-pp-green flex items-center justify-center font-black text-[12px] text-white">PP</div>
          <span className="text-[17px] font-black text-white"><span className="text-green-400">Property</span> Pros</span>
        </Link>
        <div className="flex items-center gap-1.5">
          <Link href="/homeowner/notifications" className="relative w-9 h-9 rounded-[9px] flex items-center justify-center text-gray-400 hover:bg-white/8 hover:text-white transition-all">
            <Bell size={18}/><div className="absolute top-1.5 right-1.5 w-2 h-2 bg-pp-red rounded-full border border-white"/>
          </Link>
          <div className="w-8 h-8 rounded-full bg-pp-green flex items-center justify-center text-[12px] font-black text-white border-2 border-white/15">{initials}</div>
          <button onClick={()=>setDrawerOpen(!drawerOpen)} className="ml-1 w-9 h-9 rounded-[9px] flex items-center justify-center text-gray-400 hover:bg-white/8 transition-all lg:hidden">{drawerOpen?<X size={20}/>:<Menu size={20}/>}</button>
        </div>
      </header>

      {drawerOpen && <div onClick={()=>setDrawerOpen(false)} className="fixed inset-0 top-16 bg-black/40 z-40 lg:hidden"/>}
      <div className={`fixed bottom-0 right-0 top-16 z-50 flex w-72 flex-col overflow-y-auto border-l border-white/7 bg-ho-sidebar p-3 shadow-2xl transition-transform duration-200 lg:hidden ${drawerOpen ? 'translate-x-0' : 'translate-x-full pointer-events-none'}`}>
        <NavItems onNav={()=>setDrawerOpen(false)}/>
        <div className="mt-auto pt-3 border-t border-white/7">
          <button onClick={()=>signOut({callbackUrl:'/login'})} className="flex items-center gap-2.5 px-3 py-2.5 rounded-[9px] text-[13px] font-extrabold text-red-400 hover:bg-pp-red/10 transition-all w-full"><LogOut size={15}/>Log out</button>
        </div>
      </div>

      <div className="flex">
        <aside className="sticky top-16 hidden h-[calc(100dvh-4rem)] w-[220px] shrink-0 overflow-y-auto bg-ho-sidebar p-2.5 lg:flex">
          <div className="flex-1"><NavItems/></div>
          <div className="border-t border-white/7 pt-2.5">
            <div className="flex items-center gap-2 px-2.5 py-2 mb-1">
              <div className="w-8 h-8 rounded-full bg-pp-green flex items-center justify-center text-[11px] font-black text-white shrink-0">{initials}</div>
              <div className="min-w-0"><div className="text-[12px] font-black text-white truncate">{user?.name ?? 'Homeowner'}</div><div className="text-[11px] text-gray-500">Property Owner</div></div>
            </div>
            <button onClick={()=>signOut({callbackUrl:'/login'})} className="flex items-center gap-2 px-2.5 py-2 rounded-[9px] text-[12px] font-extrabold text-red-400 hover:bg-pp-red/10 transition-all w-full"><LogOut size={13}/>Log out</button>
          </div>
        </aside>
        <main className="app-shell-main flex-1">{children}</main>
      </div>
    </div>
  )
}
