'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type BillingMutationButtonProps = {
  endpoint: string
  label: string
  pendingLabel?: string
  body?: Record<string, unknown>
  className: string
  confirmMessage?: string
  method?: 'POST' | 'PATCH' | 'DELETE'
}

export default function BillingMutationButton({
  endpoint,
  label,
  pendingLabel = 'Saving...',
  body,
  className,
  confirmMessage,
  method = 'POST',
}: BillingMutationButtonProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleClick() {
    if (confirmMessage && !window.confirm(confirmMessage)) {
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: method === 'DELETE' ? undefined : JSON.stringify(body ?? {}),
      })
      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(data.error ?? 'Unable to update billing.')
      }

      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update billing.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-2">
      <button type="button" onClick={handleClick} disabled={isLoading} className={className}>
        {isLoading ? pendingLabel : label}
      </button>
      {error ? <p className="text-[12px] font-bold text-pp-red">{error}</p> : null}
    </div>
  )
}
