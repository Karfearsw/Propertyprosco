import type { ReactNode } from 'react'

export default function EmptyState({
  title,
  body,
  action,
  accentColor = 'red',
}: {
  title: string
  body: string
  action?: ReactNode
  accentColor?: 'red' | 'green' | 'gold'
}) {
  const accentClasses = {
    red: {
      bg: 'bg-pp-red-light',
      text: 'text-pp-red',
    },
    green: {
      bg: 'bg-pp-green-light',
      text: 'text-pp-green',
    },
    gold: {
      bg: 'bg-pp-gold-light',
      text: 'text-pp-gold',
    },
  }

  const accent = accentClasses[accentColor]

  return (
    <div className="rounded-2xl border border-pp-border bg-white p-10 text-center">
      <div className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl ${accent.bg}`}>
        <svg viewBox="0 0 24 24" className={`h-7 w-7 ${accent.text}`} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M4 6h16v12H4zM8 10h8M8 14h5" />
        </svg>
      </div>
      <h2 className="text-[18px] font-black text-pp-dark">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-[14px] text-pp-gray">{body}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  )
}
