import { useMemo } from 'react'

const STATE_CONFIG = {
  idle: {
    label: '',
    badgeColor: '',
    animate: '',
    showWaves: false,
    showThought: false,
    showWriting: false,
    scale: 'scale-100',
    imgHeight: 'max-h-[260px]',
  },
  loading: {
    label: '⏳ Loading...',
    badgeColor: 'bg-blue-500',
    animate: 'animate-pulse',
    showWaves: false,
    showThought: false,
    showWriting: false,
    scale: 'scale-100',
    imgHeight: 'max-h-[260px]',
  },
  thinking: {
    label: '🤔 Thinking...',
    badgeColor: 'bg-amber-500',
    animate: 'animate-pulse',
    showWaves: false,
    showThought: true,
    showWriting: false,
    scale: 'scale-[1.02]',
    imgHeight: 'max-h-[265px]',
  },
  writing: {
    label: '✍️ Writing...',
    badgeColor: 'bg-indigo-500',
    animate: '',
    showWaves: false,
    showThought: false,
    showWriting: true,
    scale: 'scale-[1.03]',
    imgHeight: 'max-h-[270px]',
  },
  speaking: {
    label: '🎙 Speaking...',
    badgeColor: 'bg-green-600',
    animate: 'animate-pulse',
    showWaves: true,
    showThought: false,
    showWriting: false,
    scale: 'scale-105',
    imgHeight: 'max-h-[280px]',
  },
  listening: {
    label: '👂 Listening...',
    badgeColor: 'bg-purple-500',
    animate: 'animate-pulse',
    showWaves: false,
    showThought: false,
    showWriting: false,
    scale: 'scale-100',
    imgHeight: 'max-h-[260px]',
  },
  answering: {
    label: '💡 Answering...',
    badgeColor: 'bg-green-600',
    animate: '',
    showWaves: true,
    showThought: false,
    showWriting: false,
    scale: 'scale-105',
    imgHeight: 'max-h-[280px]',
  },
  explaining: {
    label: '📖 Explaining...',
    badgeColor: 'bg-green-600',
    animate: '',
    showWaves: true,
    showThought: false,
    showWriting: false,
    scale: 'scale-105',
    imgHeight: 'max-h-[275px]',
  },
  evaluating: {
    label: '📝 Evaluating...',
    badgeColor: 'bg-amber-600',
    animate: 'animate-pulse',
    showWaves: false,
    showThought: true,
    showWriting: false,
    scale: 'scale-100',
    imgHeight: 'max-h-[260px]',
  },
  generating_quiz: {
    label: '📋 Generating Quiz...',
    badgeColor: 'bg-indigo-500',
    animate: 'animate-pulse',
    showWaves: false,
    showThought: true,
    showWriting: true,
    scale: 'scale-[1.02]',
    imgHeight: 'max-h-[265px]',
  },
  planning_lesson: {
    label: '🗺️ Planning...',
    badgeColor: 'bg-indigo-500',
    animate: 'animate-pulse',
    showWaves: false,
    showThought: true,
    showWriting: false,
    scale: 'scale-[1.02]',
    imgHeight: 'max-h-[265px]',
  },
  completed: {
    label: '✅ Done',
    badgeColor: 'bg-green-700',
    animate: '',
    showWaves: false,
    showThought: false,
    showWriting: false,
    scale: 'scale-100',
    imgHeight: 'max-h-[260px]',
  },
  error: {
    label: '❌ Error',
    badgeColor: 'bg-red-600',
    animate: '',
    showWaves: false,
    showThought: false,
    showWriting: false,
    scale: 'scale-95',
    imgHeight: 'max-h-[250px]',
  },
}

export default function AvatarTeacherPlaceholder({ status = 'idle' }) {
  const config = useMemo(() => STATE_CONFIG[status] || STATE_CONFIG.idle, [status])

  return (
    <div className="flex h-full items-end justify-center">
      <div className={`relative transition-all duration-500 ${config.scale}`}>
        {/* Teacher Image */}
        <img
          src="/images/teacher.png"
          alt="AI Teacher"
          className={`w-auto object-contain transition-all duration-500 ${config.imgHeight}`}
        />

        {/* Status Badge */}
        {config.label && (
          <div
            className={`absolute -top-2 right-0 rounded-full px-3 py-1 text-xs font-bold text-white shadow-lg ${config.badgeColor} ${config.animate}`}
          >
            {config.label}
          </div>
        )}

        {/* Thought Bubbles */}
        {config.showThought && (
          <>
            <span className="absolute -top-6 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-amber-300 opacity-60 animate-bounce" />
            <span
              className="absolute -top-10 left-1/2 h-3 w-3 -translate-x-1/2 rounded-full bg-amber-200 opacity-80 animate-bounce"
              style={{ animationDelay: '150ms' }}
            />
            <span
              className="absolute -top-16 left-1/2 h-4 w-4 -translate-x-1/2 rounded-full bg-amber-100 animate-bounce"
              style={{ animationDelay: '300ms' }}
            />
          </>
        )}

        {/* Sound Waves */}
        {config.showWaves && (
          <>
            <span className="absolute left-0 top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-green-400 animate-ping" />
            <span
              className="absolute right-0 top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-green-400 animate-ping"
              style={{ animationDelay: '200ms' }}
            />
          </>
        )}

        {/* Writing Indicator */}
        {config.showWriting && (
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2">
            <div className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-bounce" />
              <span
                className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-bounce"
                style={{ animationDelay: '150ms' }}
              />
              <span
                className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-bounce"
                style={{ animationDelay: '300ms' }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}