export default function TeachingBoard({
  title,
  content,
}) {
  return (
    <div className="h-full rounded-2xl border-4 border-amber-700 bg-[#1b4332] p-8 text-white shadow-inner">

      <h2 className="border-b border-white/20 pb-4 text-3xl font-bold">
        {title || 'Welcome to Your Lesson'}
      </h2>

      <div className="mt-6 whitespace-pre-wrap text-lg leading-9 text-green-50">
        {content || `
Today's lesson will appear here.

The AI teacher will explain concepts,
show examples,
and guide you step by step.
`}
      </div>

    </div>
  )
}