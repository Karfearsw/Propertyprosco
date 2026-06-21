'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js'
import type { StripeElementsOptions } from '@stripe/stripe-js'
import { stripeClientPromise } from '@/lib/stripe-client'

type AddPaymentMethodFieldsProps = {
  onSuccess: () => void
}

function AddPaymentMethodFields({ onSuccess }: AddPaymentMethodFieldsProps) {
  const router = useRouter()
  const stripe = useStripe()
  const elements = useElements()
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!stripe || !elements) {
      return
    }

    try {
      setIsSaving(true)
      setError(null)

      const confirmed = await stripe.confirmSetup({
        elements,
        redirect: 'if_required',
      })

      if (confirmed.error) {
        throw new Error(confirmed.error.message ?? 'Unable to save your card.')
      }

      const paymentMethodId =
        typeof confirmed.setupIntent?.payment_method === 'string'
          ? confirmed.setupIntent.payment_method
          : confirmed.setupIntent?.payment_method?.id

      if (!paymentMethodId) {
        throw new Error('Stripe did not return a payment method.')
      }

      const response = await fetch('/api/billing/payment-methods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentMethodId }),
      })
      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(data.error ?? 'Unable to add card.')
      }

      onSuccess()
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to add card.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="rounded-2xl border border-pp-border bg-white p-5">
        <div className="mb-4">
          <h3 className="text-[18px] font-black text-pp-dark">Add payment method</h3>
          <p className="mt-1 text-[12px] font-bold text-pp-gray">
            Your payment information is encrypted by Stripe and never stored on our servers.
          </p>
        </div>
        <PaymentElement />
      </div>

      {error ? <p className="text-[13px] font-bold text-pp-red">{error}</p> : null}

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="submit"
          disabled={!stripe || !elements || isSaving}
          className="rounded-xl bg-pp-dark px-5 py-3 text-[14px] font-black text-white transition-all hover:bg-pp-dark-2 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSaving ? 'Adding card...' : 'Add card'}
        </button>
        <button
          type="button"
          onClick={onSuccess}
          className="rounded-xl border border-pp-border px-5 py-3 text-[14px] font-black text-pp-dark"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}

export default function AddPaymentMethodForm() {
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) {
      return
    }

    let isMounted = true

    async function createSetupIntent() {
      try {
        setError(null)
        const response = await fetch('/api/billing/setup-intent', { method: 'POST' })
        const data = await response.json().catch(() => ({}))

        if (!response.ok) {
          throw new Error(data.error ?? 'Unable to initialize card setup.')
        }

        if (isMounted) {
          setClientSecret(data.clientSecret)
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Unable to initialize card setup.')
        }
      }
    }

    void createSetupIntent()

    return () => {
      isMounted = false
    }
  }, [open])

  const options = useMemo<StripeElementsOptions | undefined>(() => {
    if (!clientSecret) return undefined

    return {
      clientSecret,
      appearance: {
        theme: 'stripe',
      },
    }
  }, [clientSecret])

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-xl border border-pp-border px-4 py-2 text-[13px] font-black text-pp-dark transition-all hover:border-pp-red hover:text-pp-red"
      >
        + Add card
      </button>
    )
  }

  if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
    return <p className="text-[13px] font-bold text-pp-red">Stripe publishable key is not configured for this environment yet.</p>
  }

  if (error) {
    return <p className="text-[13px] font-bold text-pp-red">{error}</p>
  }

  if (!options) {
    return <p className="text-[13px] font-bold text-pp-gray">Preparing secure card form...</p>
  }

  return (
    <Elements stripe={stripeClientPromise} options={options}>
      <AddPaymentMethodFields onSuccess={() => {
        setOpen(false)
        setClientSecret(null)
      }} />
    </Elements>
  )
}
