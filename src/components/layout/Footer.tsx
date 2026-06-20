import Link from 'next/link'
import Logo from '@/components/brand/Logo'

const cols = [
  { title: 'Company',   links: [['About','/about'],['How It Works','/how-it-works'],['Blog','/blog'],['Press','/press'],['Careers','/careers'],['Contact','/contact']] },
  { title: 'For Pros',  links: [['Join as a Pro','/signup/pro'],['Pro Dashboard','/pro/dashboard'],['Pricing','/pricing'],['Quick Jobs','/pro/quick-jobs'],['Contractor Guide','/contractor-guide']] },
  { title: 'Homeowners',links: [['Post a Project','/homeowner/post-project'],['Find a Pro','/find-a-pro'],['How It Works','/how-it-works'],['Saved Pros','/homeowner/saved-pros']] },
  { title: 'Legal',     links: [['Privacy Policy','/privacy'],['Terms of Service','/terms'],['Dispute Resolution','/dispute-resolution'],['Community Fund','/community-fund']] },
]

export default function Footer() {
  return (
    <footer className="bg-pp-dark text-gray-400">
      <div className="max-w-6xl mx-auto px-6 py-16 grid grid-cols-2 md:grid-cols-4 gap-10">
        <div className="col-span-2 md:col-span-1">
          <div className="mb-4">
            <Logo size="sm" />
          </div>
          <p className="text-[13px] leading-relaxed mb-6">America&apos;s trusted home services marketplace. Connecting homeowners with verified local contractors.</p>
          <div className="flex flex-wrap gap-2 mb-6">
            <Link href="/demo/homeowner" className="rounded-full bg-white/8 px-3 py-1.5 text-[11px] font-black uppercase tracking-[1px] text-white hover:bg-white/12">Homeowner Demo</Link>
            <Link href="/demo/pro" className="rounded-full bg-white/8 px-3 py-1.5 text-[11px] font-black uppercase tracking-[1px] text-white hover:bg-white/12">Pro Demo</Link>
            <Link href="/demo/realtor" className="rounded-full bg-white/8 px-3 py-1.5 text-[11px] font-black uppercase tracking-[1px] text-white hover:bg-white/12">Realtor Demo</Link>
          </div>
          <p className="text-[12px] font-bold text-gray-600">© {new Date().getFullYear()} Property Pros Inc.</p>
        </div>
        {cols.map(col => (
          <div key={col.title}>
            <div className="text-[11px] font-black text-white uppercase tracking-[2px] mb-4">{col.title}</div>
            <ul className="space-y-2.5">
              {col.links.map(([label, href]) => (
                <li key={label}><Link href={href} className="text-[13px] font-semibold hover:text-white transition-colors">{label}</Link></li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </footer>
  )
}
