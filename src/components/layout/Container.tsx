import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

type ContainerProps = HTMLAttributes<HTMLDivElement> & {
  size?: 'md' | 'lg' | 'xl'
}

const sizeClassName: Record<NonNullable<ContainerProps['size']>, string> = {
  md: 'max-w-4xl',
  lg: 'max-w-5xl',
  xl: 'max-w-6xl',
}

export default function Container({
  className,
  size = 'xl',
  ...props
}: ContainerProps) {
  return (
    <div
      className={cn('mx-auto w-full px-4 sm:px-6 lg:px-8', sizeClassName[size], className)}
      {...props}
    />
  )
}
