export default async function ChapterPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  return (
    <div className="max-w-3xl mx-auto px-8 py-12">
      <p className="text-xs font-semibold uppercase tracking-widest text-blue-600 mb-2">
        Chapter
      </p>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        {slug.replace(/^\d+-/, '').replace(/-/g, ' ')}
      </h1>
      <p className="text-gray-500">
        Content for this chapter is coming soon.
      </p>
    </div>
  )
}