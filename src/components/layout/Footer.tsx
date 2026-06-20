import Link from 'next/link'
import Logo from '@/components/brand/Logo'
import Container from '@/components/layout/Container'

const cols = [
  { title: 'Company',   links: [['About','/about'],['How It Works','/how-it-works'],['Blog','/blog'],['Press','/press'],['Careers','/careers'],['Contact','/contact']] },
  { title: 'For Pros',  links: [['Join as a Pro','/signup/pro'],['Pro Dashboard','/pro/dashboard'],['Pricing','/pricing'],['Quick Jobs','/pro/quick-jobs'],['Contractor Guide','/contractor-guide']] },
  { title: 'Homeowners',links: [['Post a Project','/homeowner/post-project'],['Find a Pro','/find-a-pro'],['How It Works','/how-it-works'],['Saved Pros','/homeowner/saved-pros']] },
  { title: 'Legal',     links: [['Privacy Policy','/privacy'],['Terms of Service','/terms'],['Dispute Resolution','/dispute-resolution'],['Community Fund','/community-fund']] },
]

export default function Footer() {
  return (
    <footer className="bg-pp-dark text-gray-400">
      <Container className="py-14 sm:py-16">
        <div className="grid gap-10 border-t border-white/8 pt-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_repeat(4,minmax(0,1fr))]">
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="mb-4">
              <Logo size="sm" />
            </div>
            <p className="max-w-sm text-[13px] leading-relaxed mb-6">America&apos;s trusted home services marketplace. Connecting homeowners with verified local contractors.</p>
            <div className="flex flex-wrap gap-2 mb-6">
              <Link href="/demo/homeowner" className="inline-flex min-h-10 items-center rounded-full bg-white/8 px-3 py-1.5 text-[11px] font-black uppercase tracking-[1px] text-white hover:bg-white/12">Homeowner Demo</Link>
              <Link href="/demo/pro" className="inline-flex min-h-10 items-center rounded-full bg-white/8 px-3 py-1.5 text-[11px] font-black uppercase tracking-[1px] text-white hover:bg-white/12">Pro Demo</Link>
              <Link href="/demo/realtor" className="inline-flex min-h-10 items-center rounded-full bg-white/8 px-3 py-1.5 text-[11px] font-black uppercase tracking-[1px] text-white hover:bg-white/12">Realtor Demo</Link>
            </div>
            <p className="text-[12px] font-bold text-gray-600">© {new Date().getFullYear()} Property Pros Inc.</p>
          </div>
          {cols.map(col => (
            <div key={col.title}>
              <div className="text-[11px] font-black text-white uppercase tracking-[2px] mb-4">{col.title}</div>
              <ul className="space-y-2.5">
                {col.links.map(([label, href]) => (
                  <li key={label}>
                    <Link href={href} className="inline-flex min-h-9 items-center text-[13px] font-semibold leading-relaxed transition-colors hover:text-white">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Container>
    </footer>
  )
}
