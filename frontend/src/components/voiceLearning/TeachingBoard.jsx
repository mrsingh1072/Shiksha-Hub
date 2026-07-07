import { useEffect, useRef } from 'react'
import MarkdownMessage from '../studentDashboard/MarkdownMessage'

export default function TeachingBoard({
  title,
  content,
  status,
  children,
}) {
  const scrollRef = useRef(null)

  // Scroll to top when content changes
  useEffect(() => {
    if (scrollRef.current && content) {
      scrollRef.current.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [content])

  const isWriting = status === 'writing'

  return (
    <div className="w-full rounded-3xl border-[8px] border-amber-700 bg-[#1b4332] p-8 text-white shadow-2xl relative overflow-hidden">
      {/* Writing Overlay */}
      {isWriting && (
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#1b4332]/60 pointer-events-none z-10">
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 backdrop-blur-sm">
            <span className="text-xs font-bold text-green-200">✍️ Writing on board...</span>
            <span className="flex gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-green-300 animate-bounce" />
              <span
                className="h-1.5 w-1.5 rounded-full bg-green-300 animate-bounce"
                style={{ animationDelay: '100ms' }}
              />
              <span
                className="h-1.5 w-1.5 rounded-full bg-green-300 animate-bounce"
                style={{ animationDelay: '200ms' }}
              />
            </span>
          </div>
        </div>
      )}

      {/* Board Header */}
      <h2 className="border-b border-white/20 pb-4 text-3xl font-bold">
        {title || 'Welcome to Your Lesson'}
      </h2>

      {/* Board Content */}
      <div ref={scrollRef} className="mt-8 max-h-[500px] overflow-y-auto pr-3 scrollbar-thin">
        {children || (content ? (
          <div
            className={`transition-opacity duration-500 ${isWriting ? 'opacity-90' : 'opacity-100'}`}
          >
            <MarkdownMessage content={content} variant="board" />
          </div>
        ) : (
          <div className="py-20 text-center text-green-100">
            <p className="text-2xl font-bold">Your lesson will appear here</p>
            <p className="mt-4 text-base opacity-80">
              Ask your AI teacher to begin a lesson.
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}