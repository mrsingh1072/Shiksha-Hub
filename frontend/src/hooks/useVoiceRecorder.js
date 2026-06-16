import { useCallback, useRef, useState } from 'react'

/**
 * Future-ready voice question capture.
 * Wire to backend STT endpoint when available.
 */
export function useVoiceRecorder() {
  const mediaRecorderRef = useRef(null)
  const chunksRef = useRef([])
  const [isRecording, setIsRecording] = useState(false)
  const [error, setError] = useState('')

  const startRecording = useCallback(async () => {
    setError('')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      chunksRef.current = []

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data)
      }

      recorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorderRef.current = recorder
      recorder.start()
      setIsRecording(true)
    } catch (err) {
      console.error(err)
      setError('Microphone access is required for voice questions.')
    }
  }, [])

  const stopRecording = useCallback(() => {
    return new Promise((resolve) => {
      const recorder = mediaRecorderRef.current
      if (!recorder) {
        resolve(null)
        return
      }

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        setIsRecording(false)
        resolve(blob)
      }

      recorder.stop()
    })
  }, [])

  return {
    isRecording,
    error,
    startRecording,
    stopRecording,
  }
}
