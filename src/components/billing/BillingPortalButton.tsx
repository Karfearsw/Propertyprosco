'use client'

import { useState } from 'react'

type BillingPortalButtonProps = {
  label?: string
  className?: string
}

export default function BillingPortalButton({
  label = 'Manage Billing',
  className,
}: BillingPortalButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleClick() {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch('/api/billing/portal', {
        method: 'POST',
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error ?? 'Unable to open billing portal.')
      }

      window.location.href = data.url
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to open billing portal.')
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={isLoading}
        className={className}
      >
        {isLoading ? 'Opening portal...' : label}
      </button>
      {error ? <p className="text-[12px] font-bold text-pp-red">{error}</p> : null}
    </div>
  )
}
