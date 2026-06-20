'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import Logo from '@/components/brand/Logo'

export default function PublicHeader() {
  const [open, setOpen] = useState(false)
  return (
    <header className="bg-pp-dark sticky top-0 z-50 h-[66px] flex items-center justify-between px-6 lg:px-12">
      <Logo />

      <nav className="hidden md:flex items-center gap-7">
        {[['Find a Pro','/find-a-pro'],['How It Works','/how-it-works'],['Pricing','/pricing'],['Demo','/demo/homeowner'],['About','/about']].map(([label, href]) => (
          <Link key={href} href={href} className="text-[13px] font-bold text-gray-400 hover:text-white transition-colors">{label}</Link>
        ))}
      </nav>

      <div className="hidden md:flex items-center gap-2.5">
        <Link href="/login" className="px-5 py-2 rounded-[10px] text-[13px] font-extrabold text-white border border-white/20 hover:bg-white/8 transition-all">Log in</Link>
        <Link href="/signup" className="px-5 py-2 rounded-[10px] text-[13px] font-extrabold bg-pp-red text-white hover:bg-pp-red-dark transition-all">Post a project</Link>
      </div>

      <button onClick={() => setOpen(!open)} className="md:hidden text-gray-400 hover:text-white transition-colors">
        {open ? <X size={22} /> : <Menu size={22} />}
      </button>

      {open && (
        <div className="absolute top-[66px] left-0 right-0 bg-pp-dark border-t border-white/10 p-4 flex flex-col gap-3 md:hidden">
          {[['Find a Pro','/find-a-pro'],['How It Works','/how-it-works'],['Pricing','/pricing'],['Demo','/demo/homeowner'],['About','/about']].map(([label, href]) => (
            <Link key={href} href={href} onClick={() => setOpen(false)} className="text-[14px] font-bold text-gray-300 py-2">{label}</Link>
          ))}
          <Link href="/login"  onClick={() => setOpen(false)} className="mt-2 text-center py-3 rounded-[10px] font-extrabold text-white border border-white/20">Log in</Link>
          <Link href="/signup" onClick={() => setOpen(false)} className="text-center py-3 rounded-[10px] font-extrabold bg-pp-red text-white">Post a project</Link>
        </div>
      )}
    </header>
  )
}
