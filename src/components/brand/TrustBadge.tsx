const badgeConfig = {
  verified: {
    label: 'Verified',
    className: 'bg-pp-green-light text-pp-green',
    path: 'M12 3l7 3v6c0 4.5-2.8 7.7-7 9-4.2-1.3-7-4.5-7-9V6l7-3Zm-1 10 2 2 4-4',
  },
  insured: {
    label: 'Insured',
    className: 'bg-pp-blue-light text-pp-blue',
    path: 'M12 3l7 3v6c0 4.5-2.8 7.7-7 9-4.2-1.3-7-4.5-7-9V6l7-3Zm0 5v4m0 4h.01',
  },
  licensed: {
    label: 'Licensed',
    className: 'bg-pp-gold-light text-pp-gold',
    path: 'M7 4h10v16H7V4Zm3 4h4M10 12h4M10 16h4',
  },
}

export default function TrustBadge({ type }: { type: keyof typeof badgeConfig }) {
  const badge = badgeConfig[type]

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-black ${badge.className}`}>
      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d={badge.path} />
      </svg>
      {badge.label}
    </span>
  )
}
