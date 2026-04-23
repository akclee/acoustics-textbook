'use client'

// components/TableOfContents.tsx
// Sticky right-side table of contents that highlights the current section.
// Usage: <TableOfContents /> inside the chapter page layout — it auto-discovers
// all h2/h3 elements inside <article id="chapter-content">.

import { useEffect, useState } from 'react'

interface Heading {
  id: string
  text: string
  level: number
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

export default function TableOfContents() {
  const [headings, setHeadings] = useState<Heading[]>([])
  const [activeId, setActiveId] = useState<string>('')

  useEffect(() => {
    // Find all h2/h3 inside the article element
    const article = document.getElementById('chapter-content')
    if (!article) return

    const elements = Array.from(article.querySelectorAll('h2, h3'))
    const items: Heading[] = elements.map((el) => {
      // Assign a stable id if one isn't already set
      if (!el.id) {
        el.id = slugify(el.textContent ?? '')
      }
      return {
        id: el.id,
        text: el.textContent ?? '',
        level: parseInt(el.tagName[1]),
      }
    })
    setHeadings(items)

    // IntersectionObserver: track which heading is near the top of the viewport
    const observer = new IntersectionObserver(
      (entries) => {
        // Find the topmost entry that is intersecting
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible.length > 0) {
          setActiveId(visible[0].target.id)
        }
      },
      {
        rootMargin: '-10% 0px -80% 0px',
        threshold: 0,
      }
    )

    elements.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  if (headings.length === 0) return null

  return (
    <aside className="hidden xl:block w-56 shrink-0">
      <div className="sticky top-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">
          On this page
        </p>
        <nav>
          <ul className="space-y-1">
            {headings.map((h) => (
              <li key={h.id}>
                <a
                  href={`#${h.id}`}
                  className={[
                    'block text-sm leading-snug py-0.5 transition-colors',
                    h.level === 3 ? 'pl-3' : '',
                    activeId === h.id
                      ? 'text-blue-600 font-semibold'
                      : 'text-slate-500 hover:text-slate-800',
                  ].join(' ')}
                  onClick={(e) => {
                    e.preventDefault()
                    document.getElementById(h.id)?.scrollIntoView({ behavior: 'smooth' })
                  }}
                >
                  {h.text}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </aside>
  )
}
