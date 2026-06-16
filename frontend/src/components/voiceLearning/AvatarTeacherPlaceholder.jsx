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
    <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-green-primary/10 bg-gradient-to-b from-white to-cream/80 p-6 text-center">
      <div
        className={`relative flex h-44 w-44 items-center justify-center rounded-full border-4 border-green-primary/20 bg-white shadow-lg ${
          pulse ? 'animate-pulse-subtle' : ''
        }`}
      >
        <div className="flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-green-primary to-green-secondary text-5xl font-bold text-white">
          AI
        </div>
        {status === 'speaking' && (
          <span className="absolute -bottom-1 rounded-full bg-green-primary px-3 py-1 text-xs font-bold text-white">
            Speaking
          </span>
        )}
      </div>

      <h3 className="mt-6 text-xl font-bold text-text">AI Teacher</h3>
      <p className="mt-2 text-sm text-gray-500">{statusLabel}</p>
      <p className="mt-4 max-w-xs text-xs leading-5 text-gray-400">
        Avatar placeholder — future support for lip-sync, talking avatar, and interactive gestures.
      </p>
    </div>
  )
}
