import { useCallback, useEffect, useRef, useState } from 'react'
import { Pause, Play, Square, Volume2, VolumeX } from 'lucide-react'
import { createTutorVoice, fetchVoiceAudio } from '../../services/avatarService'

const STATUS_LABELS = {
  idle: 'Idle',
  loading: 'Loading',
  playing: 'Playing',
  paused: 'Paused',
  stopped: 'Stopped',
}

const SPEEDS = [1, 1.25, 1.5, 2]

function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export default function VoiceTeacher({
  text = '',
  voiceText = '',
  label = 'Voice Teacher',
  onStatusChange,
  autoPlay = false,
}) {
  const audioRef = useRef(null)
  const blobUrlRef = useRef('')
  const [status, setStatus] = useState('idle')
  const [muted, setMuted] = useState(false)
  const [speed, setSpeed] = useState(1)
  const [error, setError] = useState('')
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [ready, setReady] = useState(false)
  const autoPlayTriggeredRef = useRef('')

  const speechSource = voiceText || text

  const setVoiceStatus = useCallback(
    (next) => {
      setStatus(next)
      onStatusChange?.(next)
    },
    [onStatusChange]
  )

  const cleanupBlob = useCallback(() => {
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current)
      blobUrlRef.current = ''
    }
    setReady(false)
    setCurrentTime(0)
    setDuration(0)
  }, [])

  useEffect(() => {
    cleanupBlob()
    setVoiceStatus('idle')
    setError('')
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.removeAttribute('src')
      audioRef.current.load()
    }
  }, [speechSource, cleanupBlob, setVoiceStatus])

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = muted
      audioRef.current.playbackRate = speed
    }
  }, [muted, speed])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return undefined

    const onLoadedMetadata = () => setDuration(audio.duration || 0)
    const onTimeUpdate = () => setCurrentTime(audio.currentTime || 0)
    const onPlay = () => setVoiceStatus('playing')
    const onPause = () => {
      if (audio.ended || audio.currentTime === 0) {
        setVoiceStatus(audio.ended ? 'stopped' : 'idle')
      } else {
        setVoiceStatus('paused')
      }
    }
    const onEnded = () => {
      setVoiceStatus('stopped')
      setCurrentTime(0)
    }

    audio.addEventListener('loadedmetadata', onLoadedMetadata)
    audio.addEventListener('timeupdate', onTimeUpdate)
    audio.addEventListener('play', onPlay)
    audio.addEventListener('pause', onPause)
    audio.addEventListener('ended', onEnded)

    return () => {
      audio.removeEventListener('loadedmetadata', onLoadedMetadata)
      audio.removeEventListener('timeupdate', onTimeUpdate)
      audio.removeEventListener('play', onPlay)
      audio.removeEventListener('pause', onPause)
      audio.removeEventListener('ended', onEnded)
    }
  }, [ready, setVoiceStatus])

  useEffect(() => () => cleanupBlob(), [cleanupBlob])

  const prepareAudio = async () => {
    if (!speechSource?.trim()) throw new Error('No lesson content to read aloud.')

    setVoiceStatus('loading')
    setError('')

    const voiceResponse = await createTutorVoice(speechSource)
    const blob = await fetchVoiceAudio(voiceResponse.file)
    cleanupBlob()

    const objectUrl = URL.createObjectURL(blob)
    blobUrlRef.current = objectUrl

    const audio = audioRef.current
    if (!audio) return

    audio.src = objectUrl
    audio.playbackRate = speed
    audio.load()
    setReady(true)

    await new Promise((resolve, reject) => {
      const onCanPlay = () => {
        audio.removeEventListener('canplay', onCanPlay)
        audio.removeEventListener('error', onError)
        resolve()
      }
      const onError = () => {
        audio.removeEventListener('canplay', onCanPlay)
        audio.removeEventListener('error', onError)
        reject(new Error('Audio failed to load'))
      }
      audio.addEventListener('canplay', onCanPlay)
      audio.addEventListener('error', onError)
    })
  }

  const handlePlay = useCallback(async () => {
    try {
      const audio = audioRef.current
      if (!audio) return
      if (!ready) await prepareAudio()
      await audio.play()
    } catch (err) {
      console.error(err)
      setError(err.message || 'Unable to play voice.')
      setVoiceStatus('idle')
    }
  }, [ready, speechSource, speed, cleanupBlob, setVoiceStatus])

  // Auto-play when autoPlay is true and speech source changes
  useEffect(() => {
    if (autoPlay && speechSource?.trim() && autoPlayTriggeredRef.current !== speechSource) {
      autoPlayTriggeredRef.current = speechSource
      // Small delay to let UI settle after content update
      const timer = setTimeout(() => {
        handlePlay()
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [autoPlay, speechSource, handlePlay])

  const handlePause = () => audioRef.current?.pause()

  const handleStop = () => {
    const audio = audioRef.current
    if (!audio) return
    audio.pause()
    audio.currentTime = 0
    setCurrentTime(0)
    setVoiceStatus('stopped')
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0
  const disabled = !speechSource?.trim() || status === 'loading'

  return (
    <div className="rounded-2xl border border-green-primary/10 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-gray-400">{label}</p>
          <div className="mt-1 flex items-center gap-2">
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                status === 'playing'
                  ? 'bg-green-primary/10 text-green-primary'
                  : status === 'loading'
                    ? 'bg-blue-100 text-blue-700'
                    : status === 'paused'
                      ? 'bg-gold/15 text-amber-700'
                      : 'bg-gray-100 text-gray-600'
              }`}
            >
              {STATUS_LABELS[status]}
            </span>
            <span className="text-xs text-gray-500">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>
        </div>

        <button
          onClick={() => setMuted((value) => !value)}
          className="inline-flex items-center gap-2 rounded-xl border border-green-primary/15 px-3 py-2 text-sm font-bold text-green-primary"
          type="button"
        >
          {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          {muted ? 'Unmute' : 'Mute'}
        </button>
      </div>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-cream">
        <div
          className="h-full rounded-full bg-green-primary transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          onClick={handlePlay}
          disabled={disabled}
          className="inline-flex items-center gap-2 rounded-xl bg-green-primary px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
          type="button"
        >
          <Play className="h-4 w-4" />
          {status === 'loading' ? 'Loading...' : ready && status === 'paused' ? 'Resume' : 'Play'}
        </button>
        <button
          onClick={handlePause}
          disabled={!ready || status === 'loading'}
          className="inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-bold disabled:opacity-50"
          type="button"
        >
          <Pause className="h-4 w-4" />
          Pause
        </button>
        <button
          onClick={handleStop}
          disabled={!ready || status === 'loading'}
          className="inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-bold disabled:opacity-50"
          type="button"
        >
          <Square className="h-4 w-4" />
          Stop
        </button>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {SPEEDS.map((value) => (
          <button
            key={value}
            onClick={() => setSpeed(value)}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold ${
              speed === value
                ? 'bg-green-primary text-white'
                : 'border border-green-primary/15 text-green-primary'
            }`}
            type="button"
          >
            {value}x
          </button>
        ))}
      </div>

      {error && <p className="mt-3 text-sm font-semibold text-red-600">{error}</p>}
      <audio ref={audioRef} className="hidden" preload="none" />
    </div>
  )
}
