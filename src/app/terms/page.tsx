import MarketingShell from '@/components/layout/MarketingShell'

export const metadata = { title: 'Terms of Service' }

export default function TermsPage() {
  return (
    <MarketingShell>
      <div className="max-w-3xl mx-auto px-6 py-20">
        <h1 className="font-display text-[36px] font-black text-pp-dark mb-2">Terms of Service</h1>
        <p className="text-[13px] font-bold text-pp-gray mb-10">Last updated: January 1, 2025</p>
        {[
          ['1. Acceptance of Terms', 'By accessing or using Property Pros, you agree to be bound by these Terms of Service. If you disagree with any part of these terms, you may not access our service.'],
          ['2. Use of Service', 'Property Pros provides a marketplace connecting homeowners with service professionals. We are not a contractor and do not perform home services. All service agreements are solely between homeowners and service professionals.'],
          ['3. User Accounts', 'You are responsible for safeguarding your account credentials and for all activity that occurs under your account. Notify us immediately of any unauthorized access.'],
          ['4. Payments', 'Pro and Realtor subscriptions are billed monthly. All fees are non-refundable except as required by law. We reserve the right to modify pricing with 30 days notice.'],
          ['5. Prohibited Conduct', 'You may not use Property Pros to post false information, spam users, circumvent our platform to avoid fees, or engage in any illegal activity.'],
          ['6. Dispute Resolution', 'Any disputes between homeowners and service professionals are solely between those parties. Property Pros may, at its discretion, assist in mediation but is not responsible for the outcome.'],
          ['7. Limitation of Liability', 'Property Pros shall not be liable for any indirect, incidental, or consequential damages arising from your use of the service.'],
          ['8. Changes to Terms', 'We reserve the right to modify these terms at any time. Continued use of the service after changes constitutes acceptance of the new terms.'],
        ].map(([title, body]) => (
          <div key={title} className="mb-8">
            <h2 className="text-[18px] font-black text-pp-dark mb-3">{title}</h2>
            <p className="text-[14px] text-pp-gray leading-relaxed font-semibold">{body}</p>
          </div>
        ))}
      </div>
    </MarketingShell>
  )
}
