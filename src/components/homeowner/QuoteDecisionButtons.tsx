'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { QuoteStatus } from '@prisma/client'

type Decision = 'ACCEPTED' | 'DECLINED'

export default function QuoteDecisionButtons({
  quoteId,
  status,
}: {
  quoteId: string
  status: QuoteStatus
}) {
  const router = useRouter()
  const [loadingDecision, setLoadingDecision] = useState<Decision | null>(null)
  const [error, setError] = useState<string | null>(null)

  const canDecide = status === 'PENDING' || status === 'VIEWED'

  async function updateDecision(decision: Decision) {
    setLoadingDecision(decision)
    setError(null)

    try {
      const response = await fetch(`/api/quotes/${quoteId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ decision }),
      })

      const payload = await response.json().catch(() => null)

      if (!response.ok) {
        setError(payload?.error ?? 'Unable to update quote right now')
        return
      }

      router.refresh()
    } finally {
      setLoadingDecision(null)
    }
  }

  if (!canDecide) return null

  return (
    <div className="mt-3">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => updateDecision('ACCEPTED')}
          disabled={loadingDecision !== null}
          className="rounded-xl bg-pp-green px-3 py-2 text-[12px] font-black text-white transition-all hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loadingDecision === 'ACCEPTED' ? 'Accepting…' : 'Accept Quote'}
        </button>
        <button
          type="button"
          onClick={() => updateDecision('DECLINED')}
          disabled={loadingDecision !== null}
          className="rounded-xl border border-pp-border px-3 py-2 text-[12px] font-black text-pp-dark transition-all hover:border-pp-red hover:text-pp-red disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loadingDecision === 'DECLINED' ? 'Declining…' : 'Decline Quote'}
        </button>
      </div>
      {error ? <p className="mt-2 text-[11px] font-bold text-pp-red">{error}</p> : null}
    </div>
  )
}
