/**
 * AnimatedTeacher – Main orchestrator component.
 *
 * Renders the teacher PNG with layered CSS animations that respond to
 * the current teaching state (idle / thinking / speaking / writing / …).
 *
 * Architecture (modular sub-components):
 *   AnimatedTeacher
 *   ├── TeacherBody      – the PNG image with breathing / movement
 *   ├── BlinkOverlay     – eyelid blink simulation
 *   ├── SpeechIndicator  – sound-wave / equalizer overlay
 *   ├── ThoughtOverlay   – floating thought bubbles
 *   ├── PointerGesture   – hand / pointer animation layer
 *   ├── StatusBadge      – state label badge
 *   └── GroundShadow     – shadow under the teacher
 *
 * Each layer can be independently replaced or extended (e.g. swap
 * TeacherBody with a 3D canvas, add a LipSync layer, etc.) without
 * touching the rest of the component tree.
 */

import { useMemo } from 'react'
import './AnimatedTeacher.css'

// ───────────────────────── config ─────────────────────────

const STATE_META = {
  idle: {
    label: '',
    badgeColor: '',
    bodyClass: 'at-breathe at-sway',
    imageClass: 'at-image--idle',
    showBlink: true,
    showSpeech: false,
    showThought: false,
    showPointer: false,
    glowClass: '',
  },
  loading: {
    label: '⏳ Loading…',
    badgeColor: 'bg-green-500',
    bodyClass: 'at-breathe',
    imageClass: 'at-image--loading',
    showBlink: true,
    showSpeech: false,
    showThought: false,
    showPointer: false,
    glowClass: '',
  },
  thinking: {
    label: '🤔 Thinking…',
    badgeColor: 'bg-amber-500',
    bodyClass: 'at-thinking-body',
    imageClass: 'at-image--thinking',
    showBlink: true,
    showSpeech: false,
    showThought: true,
    showPointer: false,
    glowClass: '',
  },
  writing: {
    label: '✍️ Writing…',
    badgeColor: 'bg-indigo-500',
    bodyClass: 'at-breathe',
    imageClass: 'at-image--idle',
    showBlink: true,
    showSpeech: false,
    showThought: false,
    showPointer: true,
    glowClass: '',
  },
  speaking: {
    label: '🎙 Speaking…',
    badgeColor: 'bg-green-600',
    bodyClass: 'at-speaking-body',
    imageClass: 'at-image--speaking',
    showBlink: true,
    showSpeech: true,
    showThought: false,
    showPointer: true,
    glowClass: 'at-glow-speaking',
  },
  listening: {
    label: '👂 Listening…',
    badgeColor: 'bg-purple-500',
    bodyClass: 'at-breathe',
    imageClass: 'at-image--idle',
    showBlink: true,
    showSpeech: false,
    showThought: false,
    showPointer: false,
    glowClass: '',
  },
  answering: {
    label: '💡 Answering…',
    badgeColor: 'bg-green-600',
    bodyClass: 'at-speaking-body',
    imageClass: 'at-image--speaking',
    showBlink: true,
    showSpeech: true,
    showThought: false,
    showPointer: true,
    glowClass: 'at-glow-speaking',
  },
  explaining: {
    label: '📖 Explaining…',
    badgeColor: 'bg-green-600',
    bodyClass: 'at-speaking-body',
    imageClass: 'at-image--speaking',
    showBlink: true,
    showSpeech: true,
    showThought: false,
    showPointer: true,
    glowClass: 'at-glow-speaking',
  },
  evaluating: {
    label: '📝 Evaluating…',
    badgeColor: 'bg-amber-600',
    bodyClass: 'at-thinking-body',
    imageClass: 'at-image--thinking',
    showBlink: true,
    showSpeech: false,
    showThought: true,
    showPointer: false,
    glowClass: '',
  },
  generating_quiz: {
    label: '📋 Generating Quiz…',
    badgeColor: 'bg-indigo-500',
    bodyClass: 'at-thinking-body',
    imageClass: 'at-image--thinking',
    showBlink: true,
    showSpeech: false,
    showThought: true,
    showPointer: true,
    glowClass: '',
  },
  planning_lesson: {
    label: '🗺️ Planning…',
    badgeColor: 'bg-indigo-500',
    bodyClass: 'at-thinking-body',
    imageClass: 'at-image--thinking',
    showBlink: true,
    showSpeech: false,
    showThought: true,
    showPointer: false,
    glowClass: '',
  },
  completed: {
    label: '✅ Done',
    badgeColor: 'bg-green-700',
    bodyClass: 'at-breathe',
    imageClass: 'at-image--idle',
    showBlink: true,
    showSpeech: false,
    showThought: false,
    showPointer: false,
    glowClass: '',
  },
  error: {
    label: '❌ Error',
    badgeColor: 'bg-red-600',
    bodyClass: '',
    imageClass: 'at-image--error',
    showBlink: false,
    showSpeech: false,
    showThought: false,
    showPointer: false,
    glowClass: '',
  },
}

// ───────────────────── sub-components ─────────────────────

/** Eye-blink overlay – two small skin-coloured ellipses positioned over the eyes. */
function BlinkOverlay() {
  return (
    <>
      <span
        className="at-blink-left"
        style={{ top: '17.5%', left: '37%', width: 9, height: 5 }}
      />
      <span
        className="at-blink-right"
        style={{ top: '17.5%', left: '52%', width: 9, height: 5 }}
      />
    </>
  )
}

/** Sound-wave rings + mini equalizer bars beside the head. */
function SpeechIndicator() {
  return (
    <>
      {/* Rings on left */}
      <div style={{ position: 'absolute', top: '25%', left: '-12px' }}>
        <span className="at-speech-ring" />
        <span className="at-speech-ring" />
        <span className="at-speech-ring" />
      </div>

      {/* Rings on right */}
      <div style={{ position: 'absolute', top: '25%', right: '-12px' }}>
        <span className="at-speech-ring" />
        <span className="at-speech-ring" />
        <span className="at-speech-ring" />
      </div>

      {/* Mini equalizer below chin */}
      <div
        className="flex items-end gap-[2px]"
        style={{ position: 'absolute', top: '30%', left: '44%' }}
      >
        {[10, 16, 8, 14, 6].map((h, i) => (
          <span
            key={i}
            className="at-speech-bar"
            style={{
              '--bar-max': `${h}px`,
              animationDelay: `${i * 0.12}s`,
              height: 4,
            }}
          />
        ))}
      </div>
    </>
  )
}

/** Floating thought bubbles during thinking states. */
function ThoughtOverlay() {
  const bubbles = [
    { size: 8, left: '40%', delay: '0s', bg: 'rgba(251, 191, 36, 0.5)' },
    { size: 12, left: '48%', delay: '0.6s', bg: 'rgba(251, 191, 36, 0.4)' },
    { size: 16, left: '44%', delay: '1.2s', bg: 'rgba(251, 191, 36, 0.3)' },
    { size: 10, left: '52%', delay: '1.8s', bg: 'rgba(217, 119, 6, 0.35)' },
  ]

  return (
    <>
      {bubbles.map((b, i) => (
        <span
          key={i}
          className="at-thought-bubble"
          style={{
            width: b.size,
            height: b.size,
            left: b.left,
            top: '5%',
            background: b.bg,
            animationDelay: b.delay,
          }}
        />
      ))}
    </>
  )
}

/** Subtle pointer/hand animation – an invisible transform layer over the arm area. */
function PointerGesture() {
  return (
    <div
      className="at-pointer-gesture"
      style={{
        position: 'absolute',
        top: '15%',
        right: '-5%',
        width: '50%',
        height: '35%',
      }}
    />
  )
}

/** Animated status badge with entrance animation. */
function StatusBadge({ label, badgeColor }) {
  if (!label) return null
  return (
    <div
      className={`at-badge absolute -top-2 right-0 z-20 rounded-full px-3 py-1 text-[10px] font-bold text-white shadow-lg ${badgeColor}`}
      key={label}
    >
      {label}
    </div>
  )
}

/** Ground shadow under the teacher. */
function GroundShadow() {
  return <div className="at-shadow" />
}

// ───────────────────── main component ─────────────────────

/**
 * AnimatedTeacher
 *
 * @param {object}  props
 * @param {string}  props.status – current teacher state from useTeacherState
 * @param {string}  [props.imageSrc] – override the teacher image path
 *
 * Adding new states:
 *   1. Add an entry in STATE_META above.
 *   2. Optionally add a CSS animation class in AnimatedTeacher.css.
 *   That's it – no other code changes needed.
 *
 * Adding new animation layers (e.g. lip-sync):
 *   1. Create a sub-component (e.g. LipSyncOverlay).
 *   2. Render it inside <div className="at-overlays"> conditionally.
 */
export default function AnimatedTeacher({
  status = 'idle',
  imageSrc = '/images/teacher.png',
}) {
  const meta = useMemo(
    () => STATE_META[status] || STATE_META.idle,
    [status],
  )

  return (
    <div className="at-wrapper">
      <div className={`at-body ${meta.bodyClass} ${meta.glowClass}`}>

        {/* Teacher image */}
        <img
          src={imageSrc}
          alt="AI Teacher"
          className={`at-image ${meta.imageClass}`}
          draggable={false}
        />

        {/* Animation overlays */}
        <div className="at-overlays">
          {meta.showBlink && <BlinkOverlay />}
          {meta.showSpeech && <SpeechIndicator />}
          {meta.showThought && <ThoughtOverlay />}
          {meta.showPointer && <PointerGesture />}
        </div>

        {/* Status badge */}
        <StatusBadge label={meta.label} badgeColor={meta.badgeColor} />

        {/* Ground shadow */}
        <GroundShadow />
      </div>
    </div>
  )
}
