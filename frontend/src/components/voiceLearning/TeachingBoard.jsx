export default function TeachingBoard({
  title,
  content,
}) {
  return (
    <div className="w-full rounded-3xl border-[8px] border-amber-700 bg-[#1b4332] p-8 text-white shadow-2xl">

      <h2 className="border-b border-white/20 pb-4 text-3xl font-bold">
        {title || 'Welcome to Your Lesson'}
      </h2>

      <div className="mt-8 max-h-[350px] overflow-y-auto pr-2 whitespace-pre-wrap text-lg leading-9 text-green-50">
        {content || `
Today's lesson will appear here.

The AI teacher will explain concepts,
show examples,
demonstrate solutions,
and guide you step by step.
`}
      </div>

    </div>
  )
}