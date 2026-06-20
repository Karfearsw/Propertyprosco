import { SubscriptionStatus } from '@prisma/client'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import { Gift } from 'lucide-react'
import Link from 'next/link'
import ReferralShareCard from '@/components/realtor/ReferralShareCard'
import { getBillingStatusLabel } from '@/lib/billing-state'

export const metadata = { title: 'Referrals' }

export default async function RealtorReferralsPage() {
  const session = await auth()
  const userId = session!.user.id
  const code = `REALTOR-${userId.slice(-6).toUpperCase()}`
  const shareUrl = `https://propertypros.com/ref/${code.toLowerCase()}`
  const emailHref = `mailto:?subject=${encodeURIComponent('Join me on Property Pros')}&body=${encodeURIComponent(`Use my Property Pros referral link to join: ${shareUrl}`)}`
  const smsHref = `sms:?&body=${encodeURIComponent(`Join me on Property Pros: ${shareUrl}`)}`
  const [realtor, clientsCount, projectsCount] = await Promise.all([
    db.realtorProfile.findUnique({ where: { userId } }),
    db.realtorClient.count({ where: { realtor: { userId } } }),
    db.project.count({ where: { ownerId: userId } }),
  ])
  const effectiveStatus = realtor?.subscriptionStatus ?? SubscriptionStatus.CHECKOUT_PENDING

  return (
    <div className="p-5 lg:p-6 max-w-4xl">
      <h1 className="text-[22px] font-black text-pp-dark tracking-tight flex items-center gap-2 mb-6"><Gift size={22} className="text-pp-gold"/>Referral Program</h1>

      <ReferralShareCard code={code} shareUrl={shareUrl} emailHref={emailHref} smsHref={smsHref} />

      <div className="grid md:grid-cols-3 gap-3 mb-4">
        {[
          ['0', 'Referred realtors'],
          ['0', 'Rewards unlocked'],
          [getBillingStatusLabel(effectiveStatus), 'Current plan'],
        ].map(([value, label]) => (
          <div key={label} className="rounded-2xl border border-pp-border bg-white p-4 text-center">
            <div className="text-[22px] font-black text-pp-dark">{value}</div>
            <div className="mt-1 text-[11px] font-bold text-pp-gray">{label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-4">
        <div className="bg-pp-gold-light border border-amber-200 rounded-2xl p-5">
          <h3 className="text-[14px] font-black text-pp-dark mb-2">How it works</h3>
          <div className="space-y-2.5">
            {['Share your referral link with another realtor','They sign up using your link or code','Rewards begin tracking as soon as the referred account activates','There is no limit on how many agents you can invite'].map((s,i) => (
              <div key={i} className="flex items-start gap-2.5 text-[13px] font-bold text-pp-dark-3">
                <span className="w-5 h-5 rounded-full bg-pp-gold text-white text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">{i+1}</span>{s}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-pp-border rounded-2xl p-5">
          <h3 className="text-[14px] font-black text-pp-dark mb-3">Workspace readiness</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-xl bg-pp-bg px-4 py-3">
              <span className="text-[12px] font-bold text-pp-gray">Clients managed</span>
              <span className="text-[16px] font-black text-pp-dark">{clientsCount}</span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-pp-bg px-4 py-3">
              <span className="text-[12px] font-bold text-pp-gray">Projects coordinated</span>
              <span className="text-[16px] font-black text-pp-dark">{projectsCount}</span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-pp-bg px-4 py-3">
              <span className="text-[12px] font-bold text-pp-gray">Billing status</span>
              <span className="text-[16px] font-black text-pp-dark">{getBillingStatusLabel(effectiveStatus)}</span>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/realtor/billing" className="rounded-xl bg-pp-gold px-4 py-2.5 text-[13px] font-black text-white hover:bg-amber-800 transition-all">
              Open Billing
            </Link>
            <Link href="/realtor/clients" className="rounded-xl border border-pp-border px-4 py-2.5 text-[13px] font-black text-pp-dark hover:border-pp-gold hover:text-pp-gold transition-all">
              Manage Clients
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
