import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

type PageSectionProps = HTMLAttributes<HTMLElement> & {
  surface?: 'default' | 'muted' | 'dark'
}

const surfaceClassName: Record<NonNullable<PageSectionProps['surface']>, string> = {
  default: 'bg-transparent',
  muted: 'bg-pp-bg',
  dark: 'bg-pp-dark text-white',
}

export default function PageSection({
  className,
  surface = 'default',
  ...props
}: PageSectionProps) {
  return (
    <section
      className={cn(
        'py-14 sm:py-16 lg:py-20',
        surfaceClassName[surface],
        className
      )}
      {...props}
    />
  )
}
