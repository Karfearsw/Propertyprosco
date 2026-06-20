import { notFound } from 'next/navigation'
import PublicHeader from '@/components/layout/PublicHeader'
import Footer from '@/components/layout/Footer'
import ServiceIcon from '@/components/brand/ServiceIcon'
import { blogPosts, getBlogPost } from '@/lib/content'

export async function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = getBlogPost(slug)
  if (!post) {
    return { title: 'Article Not Found' }
  }

  return {
    title: post.title,
    description: post.summary,
  }
}

export default async function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = getBlogPost(slug)
  if (!post) notFound()

  return (
    <>
      <PublicHeader />
      <section className="bg-pp-dark px-6 py-16">
        <div className="max-w-3xl mx-auto text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-pp-red/10">
            <ServiceIcon name={post.icon} className="h-8 w-8 text-red-400" />
          </div>
          <p className="text-[11px] font-black uppercase tracking-[2px] text-red-400">{post.cat}</p>
          <h1 className="mt-4 font-display text-[44px] font-black tracking-tight text-white">{post.title}</h1>
          <p className="mt-4 text-[14px] font-bold text-gray-400">{post.date} · {post.readTime} read</p>
          <p className="mt-5 text-[15px] text-gray-300">{post.summary}</p>
        </div>
      </section>

      <article className="max-w-3xl mx-auto px-6 py-12">
        <div className="rounded-3xl border border-pp-border bg-white p-8">
          {post.body.map((paragraph) => (
            <p key={paragraph} className="mb-5 text-[15px] leading-8 text-pp-dark-3 last:mb-0">
              {paragraph}
            </p>
          ))}
        </div>
      </article>
      <Footer />
    </>
  )
}
