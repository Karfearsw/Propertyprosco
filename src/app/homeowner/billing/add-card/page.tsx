import HomeownerCardForm from '@/components/billing/HomeownerCardForm'

export const metadata = { title: 'Add Payment Method' }

export default function HomeownerAddCardPage() {
  return (
    <div className="max-w-2xl p-5 lg:p-6">
      <h1 className="mb-2 text-[22px] font-black tracking-tight text-pp-dark">Add a card</h1>
      <p className="mb-6 text-[13px] font-bold text-pp-gray">
        Your homeowner account stays free. Add a card so we can securely charge you for completed
        work and platform fees.
      </p>

      <HomeownerCardForm redirectTo="/homeowner/dashboard" />
    </div>
  )
}

