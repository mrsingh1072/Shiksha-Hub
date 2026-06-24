export default function AvatarTeacherPlaceholder({ status = 'idle' }) {
  const pulse = status === 'speaking' || status === 'thinking'

  return (
    <div className="flex h-full items-end justify-center">
      <div
        className={`relative transition-all duration-500 ${
          pulse ? 'scale-105' : ''
        }`}
      >
        <img
          src="/images/teacher.png"
          alt="AI Teacher"
          className={`w-auto object-contain transition-all duration-500 ${
            status === 'speaking'
              ? 'max-h-[280px]'
              : 'max-h-[260px]'
          }`}
        />

        {/* Speaking Status */}
        {status === 'speaking' && (
          <div className="absolute -top-2 right-0 rounded-full bg-green-600 px-3 py-1 text-xs font-bold text-white shadow-lg animate-pulse">
            🎙 Speaking...
          </div>
        )}

        {/* Thinking Status */}
        {status === 'thinking' && (
          <div className="absolute -top-2 right-0 rounded-full bg-amber-500 px-3 py-1 text-xs font-bold text-white shadow-lg animate-pulse">
            🤔 Thinking...
          </div>
        )}

        {/* Sound Waves */}
        {status === 'speaking' && (
          <>
            <span className="absolute left-0 top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-green-400 animate-ping" />
            <span className="absolute right-0 top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-green-400 animate-ping" />
          </>
        )}
      </div>
    </div>
  )
}

