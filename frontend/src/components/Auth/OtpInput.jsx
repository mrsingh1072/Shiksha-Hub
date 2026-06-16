import { useEffect, useMemo, useRef, useState } from 'react'

export default function OtpInput({ value, onChange, disabled = false }) {
  const inputsRef = useRef([])
  const digits = useMemo(() => {
    const chars = (value || '').slice(0, 6).split('')
    while (chars.length < 6) chars.push('')
    return chars
  }, [value])

  useEffect(() => {
    inputsRef.current[0]?.focus()
  }, [])

  const updateDigit = (index, nextChar) => {
    const cleaned = nextChar.replace(/\D/g, '').slice(-1)
    const next = digits.map((digit, digitIndex) => (digitIndex === index ? cleaned : digit))
    onChange(next.join(''))
    if (cleaned && index < 5) {
      inputsRef.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index, event) => {
    if (event.key === 'Backspace' && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus()
    }
  }

  const handlePaste = (event) => {
    event.preventDefault()
    const pasted = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    onChange(pasted)
    inputsRef.current[Math.min(pasted.length, 5)]?.focus()
  }

  return (
    <div className="flex justify-center gap-2 sm:gap-3">
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(element) => {
            inputsRef.current[index] = element
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          disabled={disabled}
          onChange={(event) => updateDigit(index, event.target.value)}
          onKeyDown={(event) => handleKeyDown(index, event)}
          onPaste={handlePaste}
          className="h-12 w-10 rounded-xl border border-green-primary/15 bg-white text-center text-lg font-bold text-text outline-none transition focus:border-green-primary focus:ring-2 focus:ring-green-primary/20 sm:h-14 sm:w-12"
        />
      ))}
    </div>
  )
}

export function OtpResendPanel({ secondsLeft, onResend, isResending }) {
  return (
    <div className="mt-4 flex items-center justify-center gap-3 text-sm">
      {secondsLeft > 0 ? (
        <span className="text-gray-500">Resend code in {secondsLeft}s</span>
      ) : (
        <button
          type="button"
          onClick={onResend}
          disabled={isResending}
          className="font-bold text-green-primary transition hover:text-green-secondary disabled:opacity-60"
        >
          {isResending ? 'Sending...' : 'Resend OTP'}
        </button>
      )}
    </div>
  )
}

export function useOtpCountdown(initialSeconds = 60) {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds)

  useEffect(() => {
    if (secondsLeft <= 0) return undefined
    const timer = window.setInterval(() => {
      setSecondsLeft((current) => Math.max(0, current - 1))
    }, 1000)
    return () => window.clearInterval(timer)
  }, [secondsLeft])

  const reset = () => setSecondsLeft(initialSeconds)

  return { secondsLeft, reset }
}
