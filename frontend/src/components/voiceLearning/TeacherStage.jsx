import AvatarTeacherPlaceholder from './AvatarTeacherPlaceholder'
import TeachingBoard from './TeachingBoard'
import LessonRenderer from './LessonRenderer'

export default function TeacherStage({
  status,
  lessonTitle,
  lessonContent,
  lesson,
}) {
  return (
    <div className="overflow-hidden rounded-3xl border border-green-primary/10 bg-white shadow-sm">

      {/* Header */}
      <div className="border-b border-green-primary/10 px-6 py-4">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-gray-400">
          AI Teacher Classroom
        </p>

        <h2 className="mt-1 text-2xl font-bold text-text">
          {lessonTitle || 'Interactive Learning Session'}
        </h2>
      </div>

      {/* Classroom */}
      <div className="grid items-start grid-cols-[160px_1fr] gap-4 p-4">

        {/* Teacher */}
        <div className="sticky top-4 flex justify-center items-center">
          <AvatarTeacherPlaceholder status={status} />
        </div>

        {/* Board */}
        <TeachingBoard
          title={lessonTitle}
          content={lessonContent}
          status={status}
        >
          {lesson && <LessonRenderer lesson={lesson} />}
        </TeachingBoard>

      </div>

    </div>
  )
}