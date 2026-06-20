import Link from 'next/link'
import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import {
  ensureRoleOnboardingState,
  getAuthFlowUser,
  inferUserRole,
  needsSocialRoleSelection,
  parseDesiredRole,
  roleLabel,
} from '@/lib/auth-flows'
import { getBillingPlan } from '@/lib/billing-config'
import { roleHome } from '@/lib/role-routes'

const proPlan = getBillingPlan('PRO')
const realtorPlan = getBillingPlan('REALTOR')

const roleCards = [
  {
    role: 'HOMEOWNER' as const,
    eyebrow: 'Free account',
    title: 'I need help with my property',
    description: 'Post projects, collect quotes, and message trusted pros at no cost.',
    accentClass: 'border-green-200 bg-pp-green-light text-green-800',
    buttonClass: 'bg-pp-green hover:bg-green-700',
  },
  {
    role: 'PRO' as const,
    eyebrow: proPlan.amountLabel.replace(' / ', '/'),
    title: 'I offer home services',
    description: 'Get matched leads, manage quotes, and keep all client messages in one dashboard.',
    accentClass: 'border-red-200 bg-red-50 text-red-700',
    buttonClass: 'bg-pp-red hover:bg-pp-red-dark',
  },
  {
    role: 'REALTOR' as const,
    eyebrow: realtorPlan.amountLabel.replace(' / ', '/'),
    title: 'I coordinate projects for clients',
    description: 'Manage clients, projects, referrals, and communication from one workspace.',
    accentClass: 'border-amber-200 bg-amber-50 text-amber-800',
    buttonClass: 'bg-pp-gold hover:bg-amber-800',
  },
]

interface ContinuePageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

export default async function ContinuePage({ searchParams }: ContinuePageProps) {
  const session = await auth()
  if (!session?.user?.id) {
    redirect('/login')
  }

  const params = (await searchParams) ?? {}
  const desiredRole = parseDesiredRole(
    Array.isArray(params.desiredRole) ? params.desiredRole[0] : params.desiredRole,
  )

  const user = await getAuthFlowUser(session.user.id)
  if (!user) {
    redirect('/login')
  }

  const currentRole = inferUserRole(user)

  if (desiredRole) {
    const isEstablishedAccount =
      Boolean(user.password) ||
      Boolean(user.phone) ||
      Boolean(user.zipCode) ||
      Boolean(user.proProfile) ||
      Boolean(user.realtorProfile) ||
      user.accounts.length > 1

    if (isEstablishedAccount && currentRole !== desiredRole) {
      redirect(roleHome(currentRole))
    }

    const destination = await ensureRoleOnboardingState(user.id, desiredRole)
    redirect(destination)
  }

  if (currentRole === 'PRO' && !user.proProfile) {
    redirect(await ensureRoleOnboardingState(user.id, 'PRO'))
  }

  if (currentRole === 'REALTOR' && !user.realtorProfile) {
    redirect(await ensureRoleOnboardingState(user.id, 'REALTOR'))
  }

  if (!needsSocialRoleSelection(user)) {
    redirect(roleHome(currentRole))
  }

  return (
    <div className="min-h-screen bg-pp-bg px-6 py-10">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-5xl items-center">
        <div className="grid w-full gap-8 rounded-[32px] border border-pp-border bg-white p-8 shadow-sm lg:grid-cols-[0.92fr_1.08fr] lg:p-10">
          <div className="rounded-[28px] bg-pp-dark p-8 text-white">
            <p className="mb-4 text-[11px] font-black uppercase tracking-[2px] text-red-400">
              Social sign-in complete
            </p>
            <h1 className="mb-4 text-[34px] font-black tracking-tight">
              Finish choosing your workspace.
            </h1>
            <p className="mb-8 max-w-md text-[15px] leading-relaxed text-slate-300">
              We found your account and signed you in. Pick the experience that matches how
              you use Property Pros so we can take you to the right dashboard.
            </p>

            <div className="space-y-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-[11px] font-black uppercase tracking-[1px] text-slate-400">
                  Signed in as
                </div>
                <div className="mt-1 text-[16px] font-black">{user.email}</div>
                <div className="mt-2 text-[13px] font-bold text-slate-300">
                  Current routing profile: {roleLabel(currentRole)}
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-[13px] font-bold leading-relaxed text-slate-300">
                Homeowner accounts stay free. Pro and realtor accounts go straight to
                subscription billing before their paid tools unlock.
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-center">
            <div className="mb-6">
              <h2 className="text-[28px] font-black tracking-tight text-pp-dark">
                How will you use Property Pros?
              </h2>
              <p className="mt-2 text-[14px] leading-relaxed text-pp-gray">
                Choose once and we&apos;ll create the minimum safe account setup for that role.
                Paid roles go to billing first so the correct subscription is active before
                workspace access opens up.
              </p>
            </div>

            <div className="space-y-4">
              {roleCards.map((card) => (
                <div
                  key={card.role}
                  className="rounded-[24px] border border-pp-border p-5 transition-all hover:border-pp-dark-3"
                >
                  <div className="mb-3">
                    <div
                      className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-black uppercase tracking-[1px] ${card.accentClass}`}
                    >
                      {card.eyebrow}
                    </div>
                  </div>
                  <h3 className="text-[18px] font-black text-pp-dark">{card.title}</h3>
                  <p className="mt-2 text-[14px] leading-relaxed text-pp-gray">
                    {card.description}
                  </p>
                  <Link
                    href={`/auth/continue?desiredRole=${card.role}`}
                    className={`mt-5 inline-flex rounded-xl px-5 py-3 text-[14px] font-black text-white transition-all ${card.buttonClass}`}
                  >
                    Continue as {roleLabel(card.role)}
                  </Link>
                </div>
              ))}
            </div>

            <p className="mt-6 text-[12px] font-bold text-pp-gray">
              Signed in with the wrong account?{' '}
              <Link href="/login" className="text-pp-red hover:underline">
                Go back to login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
