const iconMap: Record<string, string> = {
  Roofing: 'M12 4L3 11h2v9h5v-5h4v5h5v-9h2L12 4Z',
  Plumbing: 'M9 4v4l-2 2v2h10v-2l-2-2V4h-2v4h-2V4H9Z M8 14v2a4 4 0 0 0 8 0v-2H8Z',
  Electrical: 'M13 2 5 13h5l-1 9 8-11h-5l1-9Z',
  Painting: 'M4 14c0 3 2 6 6 6 2 0 3-1 3-2 0-1-1-2-1-3 0-1 1-2 2-2 3 0 6-2 6-5 0-4-4-8-10-8C8 0 4 4 4 8c0 2 1 3 2 4-1 0-2 1-2 2Z',
  Landscaping: 'M12 3c4 2 6 5 6 9 0 5-3 9-6 9s-6-4-6-9c0-4 2-7 6-9Zm0 2c-2 2-3 4-3 7 0 3 1 5 3 7 2-2 3-4 3-7 0-3-1-5-3-7Z',
  Remodeling: 'M3 17 9 11l4 4L7 21H3v-4Zm10-10 2-2 4 4-2 2-4-4Z',
  HVAC: 'M12 3v5M12 16v5M3 12h5M16 12h5M5.6 5.6l3.5 3.5M14.9 14.9l3.5 3.5M18.4 5.6l-3.5 3.5M9.1 14.9l-3.5 3.5',
  Windows: 'M4 4h16v16H4V4Zm8 0v16M4 12h16',
}

export default function ServiceIcon({
  name,
  className = 'text-pp-red',
}: {
  name: string
  className?: string
}) {
  const d = iconMap[name] ?? 'M4 12h16M12 4v16'

  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={d} />
    </svg>
  )
}
