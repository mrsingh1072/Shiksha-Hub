export default function TeachingBoard({
  title,
  content,
}) {
  return (
    <div className="rounded-2xl border border-green-primary/10 bg-slate-900 p-6 shadow-sm text-white min-h-[500px]">
      
      <h2 className="text-2xl font-bold border-b border-white/20 pb-3">
        {title || 'Teaching Board'}
      </h2>

      <div className="mt-5 whitespace-pre-wrap leading-8">
        {content || 'Lesson content will appear here...'}
      </div>
    </div>
  )
}