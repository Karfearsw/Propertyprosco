'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js'
import type { StripeElementsOptions } from '@stripe/stripe-js'
import type { BillingPlan } from '@/lib/billing-config'
import { getSignupBillingErrorMessage } from '@/lib/auth-errors'
import { stripeClientPromise } from '@/lib/stripe-client'

type PaymentMethodFormProps = {
  plan: BillingPlan
  setupIntentPath?: string
  setupIntentBody?: Record<string, unknown>
  submitPath?: string
  submitBody?: Record<string, unknown>
  submitButtonLabel?: string
  submitPendingLabel?: string
}

type BillingErrorResponse = {
  code?: string
  error?: string
}

function isSignupBillingPath(path: string) {
  return path.startsWith('/api/signup/billing/')
}

function resolveBillingErrorMessage(
  path: string,
  data: BillingErrorResponse | null | undefined,
  fallback: string,
) {
  if (isSignupBillingPath(path)) {
    return getSignupBillingErrorMessage(data?.code, data?.error ?? fallback)
  }

  return data?.error ?? fallback
}

function isTerminalSignupBillingSetupError(code?: string) {
  return code === 'signup_billing_token_missing' ||
    code === 'signup_billing_token_invalid' ||
    code === 'signup_billing_session_invalid' ||
    code === 'billing_configuration_error'
}

function PaymentMethodFields({
  plan,
  submitPath = '/api/billing/checkout',
  submitBody,
  submitButtonLabel = 'Save payment method and continue',
  submitPendingLabel = 'Saving payment method...',
}: PaymentMethodFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!stripe || !elements) return

    try {
      setIsSaving(true)
      setError(null)

      const confirmed = await stripe.confirmSetup({
        elements,
        redirect: 'if_required',
      })

      if (confirmed.error) {
        throw new Error(confirmed.error.message ?? 'Unable to save payment method.')
      }

      const paymentMethodId =
        typeof confirmed.setupIntent?.payment_method === 'string'
          ? confirmed.setupIntent.payment_method
          : confirmed.setupIntent?.payment_method?.id

      if (!paymentMethodId) {
        throw new Error('Stripe did not return a payment method.')
      }

      const response = await fetch(submitPath, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentMethodId, ...(submitBody ?? {}) }),
      })
      const data = await response.json() as BillingErrorResponse & { redirectTo?: string }

      if (!response.ok) {
        throw new Error(
          resolveBillingErrorMessage(submitPath, data, 'Unable to start your subscription.'),
        )
      }

      window.location.href = data.redirectTo ?? plan.billingPath
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to start your subscription.')
      setIsSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="rounded-2xl border border-pp-border bg-white p-5">
        <div className="mb-4">
          <h2 className="text-[18px] font-black text-pp-dark">{plan.planName}</h2>
          <p className="text-[13px] font-bold text-pp-gray">{plan.amountLabel}</p>
          <p className="mt-2 text-[12px] font-bold text-pp-gray">
            Your billing starts as soon as Stripe confirms your payment method and creates
            your subscription.
          </p>
        </div>

        <PaymentElement />
      </div>

      {error ? <p className="text-[13px] font-bold text-pp-red">{error}</p> : null}

      <button
        type="submit"
        disabled={!stripe || !elements || isSaving}
        className="w-full rounded-xl bg-pp-dark py-3.5 text-[15px] font-black text-white hover:bg-pp-dark-2 transition-all disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSaving ? submitPendingLabel : submitButtonLabel}
      </button>
    </form>
  )
}

export default function PaymentMethodForm(props: PaymentMethodFormProps) {
  const { setupIntentPath = '/api/billing/setup-intent', setupIntentBody } = props
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const lastInitializedRequestKey = useRef<string | null>(null)
  const pendingRequestKey = useRef<string | null>(null)
  const terminalSetupErrorRequestKey = useRef<string | null>(null)

  const setupIntentBodyKey = useMemo(() => JSON.stringify(setupIntentBody ?? null), [setupIntentBody])
  const requestKey = useMemo(
    () => `${setupIntentPath}:${setupIntentBodyKey}`,
    [setupIntentBodyKey, setupIntentPath],
  )
  const requestBody = useMemo(
    () => (setupIntentBodyKey === 'null' ? undefined : setupIntentBodyKey),
    [setupIntentBodyKey],
  )

  useEffect(() => {
    let isMounted = true

    if (
      lastInitializedRequestKey.current === requestKey ||
      pendingRequestKey.current === requestKey ||
      terminalSetupErrorRequestKey.current === requestKey
    ) {
      return () => {
        isMounted = false
      }
    }

    pendingRequestKey.current = requestKey
    setClientSecret(null)
    setError(null)

    async function createSetupIntent() {
      try {
        const response = await fetch(setupIntentPath, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: requestBody,
        })
        const data = await response.json() as BillingErrorResponse & { clientSecret?: string | null }

        if (!response.ok) {
          if (isTerminalSignupBillingSetupError(data.code)) {
            terminalSetupErrorRequestKey.current = requestKey
          }

          throw new Error(
            resolveBillingErrorMessage(setupIntentPath, data, 'Unable to initialize billing.'),
          )
        }

        if (isMounted) {
          terminalSetupErrorRequestKey.current = null
          lastInitializedRequestKey.current = requestKey
          setClientSecret(data.clientSecret ?? null)
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Unable to initialize billing.')
        }
      } finally {
        if (pendingRequestKey.current === requestKey) {
          pendingRequestKey.current = null
        }
      }
    }

    void createSetupIntent()

    return () => {
      isMounted = false
    }
  }, [requestBody, requestKey, setupIntentPath])

  const options = useMemo<StripeElementsOptions | undefined>(() => {
    if (!clientSecret) return undefined

    return {
      clientSecret,
      appearance: {
        theme: 'stripe',
      },
    }
  }, [clientSecret])

  if (error) {
    return <p className="text-[13px] font-bold text-pp-red">{error}</p>
  }

  if (!options) {
    return <p className="text-[13px] font-bold text-pp-gray">Preparing secure billing form...</p>
  }

  if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
    return <p className="text-[13px] font-bold text-pp-red">Stripe publishable key is not configured for this environment yet.</p>
  }

  return (
    <Elements stripe={stripeClientPromise} options={options}>
      <PaymentMethodFields {...props} />
    </Elements>
  )
}
