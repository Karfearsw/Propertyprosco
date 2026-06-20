'use client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function MarkReadButton() {
  const router   = useRouter()
  const [loading, setLoading] = useState(false)
  async function markAll() {
    setLoading(true)
    await fetch('/api/notifications', { method:'PATCH' })
    setLoading(false); router.refresh()
  }
  return (
    <button onClick={markAll} disabled={loading} className="text-[12px] font-extrabold text-pp-red hover:underline disabled:opacity-50">
      {loading ? 'Marking…' : 'Mark all read'}
    </button>
  )
}
