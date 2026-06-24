import AvatarTeacherPlaceholder from './AvatarTeacherPlaceholder'
import TeachingBoard from './TeachingBoard'

export default function TeacherStage({
  status,
  lessonTitle,
  lessonContent,
}) {
  return (
    <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
      <div className="rounded-2xl border border-green-primary/10 bg-white p-5 shadow-sm">
        <AvatarTeacherPlaceholder status={status} />
      </div>

      <TeachingBoard
        title={lessonTitle}
        content={lessonContent}
      />
    </div>
  )
}