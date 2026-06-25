import { useState, useCallback, useRef } from 'react'

export const TEACHER_STATES = {
  IDLE: 'idle',
  LOADING: 'loading',
  THINKING: 'thinking',
  WRITING: 'writing',
  SPEAKING: 'speaking',
  LISTENING: 'listening',
  ANSWERING: 'answering',
  EXPLAINING: 'explaining',
  EVALUATING: 'evaluating',
  GENERATING_QUIZ: 'generating_quiz',
  PLANNING_LESSON: 'planning_lesson',
  COMPLETED: 'completed',
  ERROR: 'error',
}

const TRANSITIONS = {
  idle: ['loading', 'thinking', 'listening', 'error'],
  loading: ['thinking', 'idle', 'error'],
  thinking: ['writing', 'speaking', 'answering', 'explaining', 'evaluating', 'generating_quiz', 'planning_lesson', 'idle', 'error'],
  writing: ['speaking', 'idle', 'completed', 'error'],
  speaking: ['idle', 'listening', 'completed', 'error'],
  listening: ['thinking', 'idle', 'error'],
  answering: ['writing', 'speaking', 'idle', 'completed', 'error'],
  explaining: ['writing', 'speaking', 'idle', 'completed', 'error'],
  evaluating: ['idle', 'completed', 'error'],
  generating_quiz: ['idle', 'completed', 'error'],
  planning_lesson: ['idle', 'completed', 'error'],
  completed: ['idle', 'thinking', 'listening'],
  error: ['idle', 'thinking'],
}

export default function useTeacherState() {
  const [status, setStatusRaw] = useState(TEACHER_STATES.IDLE)
  const [stateMessage, setStateMessage] = useState('')
  const [errorMsg, setErrorMsg] = useState(null)
  const prevRef = useRef(TEACHER_STATES.IDLE)

  const transition = useCallback((nextState, message = '') => {
    setStatusRaw((current) => {
      const allowed = TRANSITIONS[current] || []
      if (allowed.includes(nextState) || nextState === current) {
        prevRef.current = current
        setStateMessage(message)
        if (nextState === TEACHER_STATES.ERROR) setErrorMsg(message)
        else setErrorMsg(null)
        return nextState
      }
      // Allow forced transition for recovery
      if (nextState === 'idle' || nextState === 'error') {
        prevRef.current = current
        setStateMessage(message)
        if (nextState === TEACHER_STATES.ERROR) setErrorMsg(message)
        else setErrorMsg(null)
        return nextState
      }
      console.warn(`[TeacherState] Invalid transition: ${current} → ${nextState}`)
      return current
    })
  }, [])

  const setIdle = useCallback(() => transition('idle'), [transition])
  const setThinking = useCallback((msg) => transition('thinking', msg || 'Thinking...'), [transition])
  const setWriting = useCallback((msg) => transition('writing', msg || 'Writing on board...'), [transition])
  const setSpeaking = useCallback((msg) => transition('speaking', msg || 'Speaking...'), [transition])
  const setListening = useCallback(() => transition('listening', 'Listening...'), [transition])
  const setCompleted = useCallback(() => transition('completed', 'Lesson complete'), [transition])
  const setLoading = useCallback(() => transition('loading', 'Loading...'), [transition])
  const setTeacherError = useCallback((msg) => transition('error', msg || 'An error occurred'), [transition])
  const setPaused = useCallback(() => transition('idle'), [transition])

  return {
    status,
    stateMessage,
    error: errorMsg,
    previousStatus: prevRef.current,
    transition,
    setIdle,
    setThinking,
    setWriting,
    setSpeaking,
    setListening,
    setCompleted,
    setLoading,
    setError: setTeacherError,
    setPaused,
    setStatus: transition,
  }
}