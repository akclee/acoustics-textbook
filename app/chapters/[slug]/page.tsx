// app/chapters/[slug]/page.tsx
// Reads an MDX file from content/chapters/{slug}.mdx and renders it.
// Requires: npm install next-mdx-remote gray-matter

import { readFileSync, existsSync } from 'fs'
import { join } from 'path'
import { notFound } from 'next/navigation'
import matter from 'gray-matter'
import { MDXRemote } from 'next-mdx-remote/rsc'

// Custom components available inside MDX files
const components = {
  // Callout box for key concepts
  Callout: ({ children, type = 'info' }: { children: React.ReactNode; type?: string }) => {
    const styles: Record<string, string> = {
      info:    'bg-blue-50 border-blue-400 text-blue-900',
      key:     'bg-amber-50 border-amber-400 text-amber-900',
      warning: 'bg-red-50 border-red-400 text-red-900',
      tip:     'bg-green-50 border-green-400 text-green-900',
    }
    const labels: Record<string, string> = {
      info: 'Note', key: 'Key Concept', warning: 'Watch Out', tip: 'Tip',
    }
    return (
      <div className={`border-l-4 rounded-r-lg p-4 my-6 ${styles[type] ?? styles.info}`}>
        <p className="font-semibold text-xs uppercase tracking-wide mb-1 opacity-70">
          {labels[type] ?? 'Note'}
        </p>
        <div>{children}</div>
      </div>
    )
  },

  // Equation display box
  Equation: ({ children, label }: { children: React.ReactNode; label?: string }) => (
    <div className="bg-slate-50 border border-slate-200 rounded-xl px-6 py-4 my-6 text-center font-mono text-lg">
      {children}
      {label && <p className="text-xs text-slate-400 mt-2">{label}</p>}
    </div>
  ),

  // Section divider with label
  Section: ({ title }: { title: string }) => (
    <div className="flex items-center gap-4 my-10">
      <div className="flex-1 h-px bg-slate-200" />
      <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">{title}</span>
      <div className="flex-1 h-px bg-slate-200" />
    </div>
  ),
}

export default async function ChapterPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const filePath = join(process.cwd(), 'content', 'chapters', `${slug}.mdx`)

  if (!existsSync(filePath)) {
    notFound()
  }

  const source = readFileSync(filePath, 'utf-8')
  const { content, data } = matter(source)

  return (
    <div className="max-w-3xl mx-auto px-8 py-12">
      {/* Chapter header */}
      <div className="mb-10">
        <p className="text-xs font-semibold uppercase tracking-widest text-blue-600 mb-2">
          Chapter {data.number ?? ''}
        </p>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">{data.title ?? slug}</h1>
        {data.description && (
          <p className="text-xl text-gray-500 leading-relaxed">{data.description}</p>
        )}
      </div>

      {/* Chapter content */}
      <div className="prose prose-slate prose-lg max-w-none
        prose-headings:font-bold prose-headings:text-gray-900
        prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-4
        prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
        prose-p:text-gray-700 prose-p:leading-relaxed
        prose-li:text-gray-700
        prose-strong:text-gray-900
        prose-code:bg-slate-100 prose-code:px-1 prose-code:rounded prose-code:text-sm
        prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline">
        <MDXRemote source={content} components={components} />
      </div>
    </div>
  )
}
