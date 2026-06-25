import MarkdownMessage from '../studentDashboard/MarkdownMessage'

export default function TeachingBoard({
  title,
  content,
}) {
  return (
    <div className="w-full rounded-3xl border-[8px] border-amber-700 bg-[#1b4332] p-8 text-white shadow-2xl">

      {/* Board Header */}
      <h2 className="border-b border-white/20 pb-4 text-3xl font-bold">
        {title || 'Welcome to Your Lesson'}
      </h2>

      {/* Board Content */}
      <div className="mt-8 max-h-[500px] overflow-y-auto pr-3">

        {content ? (
          <MarkdownMessage
            content={content}
            variant="board"
          />
        ) : (
          <div className="py-20 text-center text-green-100">
            <p className="text-2xl font-bold">
              Your lesson will appear here
            </p>

            <p className="mt-4 text-base opacity-80">
              Ask your AI teacher to begin a lesson.
            </p>
          </div>
        )}

      </div>

    </div>
  )
}