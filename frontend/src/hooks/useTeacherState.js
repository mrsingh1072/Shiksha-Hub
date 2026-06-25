import { useState, useCallback } from 'react'

const INITIAL_STATE = 'idle'

export default function useTeacherState() {
  const [status, setStatus] = useState(INITIAL_STATE)

  const setIdle = useCallback(() => {
    setStatus('idle')
  }, [])

  const setThinking = useCallback(() => {
    setStatus('thinking')
  }, [])

  const setSpeaking = useCallback(() => {
    setStatus('speaking')
  }, [])

  const setWriting = useCallback(() => {
    setStatus('writing')
  }, [])

  const setListening = useCallback(() => {
    setStatus('listening')
  }, [])

  const setPaused = useCallback(() => {
    setStatus('paused')
  }, [])

  const setCompleted = useCallback(() => {
    setStatus('completed')
  }, [])

  return {
    status,

    setStatus,

    setIdle,
    setThinking,
    setSpeaking,
    setWriting,
    setListening,
    setPaused,
    setCompleted,
  }
}