import Link from 'next/link'
import Logo from '@/components/brand/Logo'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-pp-dark flex items-center justify-center p-6 text-center">
      <div className="max-w-lg">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>
        <div className="text-[80px] font-black text-pp-red leading-none mb-4">404</div>
        <h1 className="text-[28px] font-black text-white mb-3">Page not found</h1>
        <p className="text-[15px] text-gray-400 mb-8">The page you&apos;re looking for doesn&apos;t exist or has been moved.</p>
        <Link href="/" className="px-8 py-4 rounded-2xl bg-pp-red text-white font-extrabold hover:bg-pp-red-dark transition-all">Go home</Link>
      </div>
    </div>
  )
}
