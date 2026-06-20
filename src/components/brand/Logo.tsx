import Image from 'next/image'
import Link from 'next/link'

interface LogoProps {
  href?: string
  size?: 'sm' | 'md'
  accent?: 'red' | 'green' | 'gold' | 'light'
  textClassName?: string
}

const accentMap = {
  red: 'text-red-400',
  green: 'text-green-400',
  gold: 'text-yellow-400',
  light: 'text-white',
}

export default function Logo({
  href = '/',
  size = 'md',
  accent = 'red',
  textClassName = 'text-white',
}: LogoProps) {
  const isSmall = size === 'sm'
  const imageSize = isSmall ? 32 : 36
  const textSize = isSmall ? 'text-[18px]' : 'text-[22px]'
  const accentClassName = accentMap[accent]

  return (
    <Link href={href} className="flex items-center gap-3">
      <Image
        src="/brand/logo-mark.svg"
        alt="Property Pros"
        width={imageSize}
        height={imageSize}
        priority
      />
      <span className={`${textSize} font-black tracking-tight ${textClassName}`}>
        <span className={accentClassName}>Property</span> Pros
      </span>
    </Link>
  )
}
