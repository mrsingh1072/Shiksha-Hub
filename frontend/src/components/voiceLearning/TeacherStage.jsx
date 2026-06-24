import AvatarTeacherPlaceholder from './AvatarTeacherPlaceholder'
import TeachingBoard from './TeachingBoard'

export default function TeacherStage({
  status,
  lessonTitle,
  lessonContent,
}) {
  return (
    <div className="overflow-hidden rounded-3xl border border-green-primary/10 bg-white shadow-sm">

      {/* Header */}
      <div className="border-b border-green-primary/10 px-6 py-4">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-gray-400">
          AI Teacher Classroom
        </p>

        <h2 className="mt-1 text-2xl font-bold text-text">
          Interactive Learning Session
        </h2>
      </div>

      {/* Classroom */}
      <div className="grid min-h-[550px] lg:grid-cols-[280px_1fr]">

        {/* Teacher Side */}
        <div className="flex items-end justify-center bg-gradient-to-b from-cream/40 to-white p-6">
          <AvatarTeacherPlaceholder status={status} />
        </div>

        {/* Blackboard Side */}
        <div className="bg-[#0f172a] p-6">
          <TeachingBoard
            title={lessonTitle}
            content={lessonContent}
          />
        </div>

      </div>

    </div>
  )
}