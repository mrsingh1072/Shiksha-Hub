export default function TeachingBoard({
  title,
  content,
}) {
  return (
    <div className=" w-full min-h-[420px] rounded-3xl border-[8px] border-amber-700 bg-[#1b4332] p-10 text-white shadow-2xl">

      <h2 className="border-b border-white/20 pb-4 text-4xl font-bold">
        {title || 'Welcome to Your Lesson'}
      </h2>

      <div className="mt-8 whitespace-pre-wrap text-lg leading-9 text-green-50">
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