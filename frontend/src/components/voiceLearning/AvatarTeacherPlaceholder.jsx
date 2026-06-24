/**
 * Future-ready avatar shell for lip-sync / video / bitmoji integration.
 * Replace `renderAvatar` when real avatar SDK is connected.
 */
export default function AvatarTeacherPlaceholder({ status = 'idle' }) {
  const statusLabel = {
    idle: 'Ready to teach',
    thinking: 'Thinking',
    speaking: 'Speaking',
    listening: 'Listening',
    loading: 'Preparing lesson',
  }[status] || 'Ready'

  const pulse = status === 'speaking' || status === 'thinking'

  return (
  <div className="flex h-full flex-col justify-end items-center">

    <div
      className={`relative transition-all duration-500 ${
        pulse ? 'scale-105' : ''
      }`}
    >
      <img
        src="/images/teacher.png"
        alt="AI Teacher"
        className="max-h-[220px] w-auto object-contain"
      />

      {status === 'speaking' && (
        <div className="absolute top-6 right-0 rounded-full bg-green-primary px-3 py-1 text-sm font-bold text-white shadow">
          Speaking
        </div>
      )}

      {status === 'thinking' && (
        <div className="absolute top-6 right-0 rounded-full bg-yellow-500 px-3 py-1 text-sm font-bold text-white shadow">
          Thinking
        </div>
      )}
    </div>

  </div>
)
}
