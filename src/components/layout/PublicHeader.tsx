'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import Logo from '@/components/brand/Logo'
import Container from '@/components/layout/Container'

export default function PublicHeader() {
  const [open, setOpen] = useState(false)

  const navItems = [
    ['Find a Pro', '/find-a-pro'],
    ['How It Works', '/how-it-works'],
    ['Pricing', '/pricing'],
    ['Demo', '/demo/homeowner'],
    ['About', '/about'],
  ] as const

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-pp-dark/95 backdrop-blur">
      <Container className="relative">
        <div className="flex min-h-[72px] items-center justify-between gap-4">
          <Logo />

          <nav className="hidden items-center gap-6 lg:flex">
            {navItems.map(([label, href]) => (
              <Link
                key={href}
                href={href}
                className="inline-flex min-h-10 items-center text-[13px] font-bold text-gray-400 transition-colors hover:text-white"
              >
                {label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-2.5 md:flex">
            <Link
              href="/login"
              className="inline-flex min-h-11 items-center rounded-[12px] border border-white/20 px-5 py-2 text-[13px] font-extrabold text-white transition-all hover:bg-white/8"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="inline-flex min-h-11 items-center rounded-[12px] bg-pp-red px-5 py-2 text-[13px] font-extrabold text-white transition-all hover:bg-pp-red-dark"
            >
              Post a project
            </Link>
          </div>

          <button
            onClick={() => setOpen(!open)}
            aria-expanded={open}
            aria-label={open ? 'Close navigation menu' : 'Open navigation menu'}
            className="inline-flex h-11 w-11 items-center justify-center rounded-[12px] text-gray-400 transition-colors hover:bg-white/8 hover:text-white md:hidden"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {open && (
          <div className="absolute inset-x-0 top-full border-t border-white/10 bg-pp-dark px-4 py-4 shadow-2xl md:hidden">
            <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3">
              {navItems.map(([label, href]) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  className="inline-flex min-h-11 items-center rounded-xl px-3 py-2 text-[14px] font-bold text-gray-300 transition-colors hover:bg-white/6 hover:text-white"
                >
                  {label}
                </Link>
              ))}
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="mt-1 inline-flex min-h-11 items-center justify-center rounded-xl border border-white/20 px-4 py-3 text-center font-extrabold text-white"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                onClick={() => setOpen(false)}
                className="inline-flex min-h-11 items-center justify-center rounded-xl bg-pp-red px-4 py-3 text-center font-extrabold text-white"
              >
                Post a project
              </Link>
            </div>
          </div>
        )}
      </Container>
    </header>
  )
}
