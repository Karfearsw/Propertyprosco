import type { ReactNode } from 'react'
import Footer from '@/components/layout/Footer'
import PublicHeader from '@/components/layout/PublicHeader'
import { cn } from '@/lib/utils'

type MarketingShellProps = {
  children: ReactNode
  className?: string
  mainClassName?: string
}

export default function MarketingShell({
  children,
  className,
  mainClassName,
}: MarketingShellProps) {
  return (
    <div className={cn('flex min-h-dvh flex-col overflow-x-clip bg-white', className)}>
      <PublicHeader />
      <main className={cn('flex-1', mainClassName)}>{children}</main>
      <Footer />
    </div>
  )
}
