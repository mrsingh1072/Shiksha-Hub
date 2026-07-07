import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Eye, EyeOff } from 'lucide-react'
import AuthLayout from '../../components/Auth/AuthLayout'
import OtpInput, { OtpResendPanel, useOtpCountdown } from '../../components/Auth/OtpInput'
import PasswordStrength, { validateStrongPassword } from '../../components/Auth/PasswordStrength'
import { forgotPassword, resetPassword, verifyOtp } from '../../services/authService'
import { validateEmail, validatePhone } from '../../utils/validation'

const STEPS = {
  IDENTIFIER: 'identifier',
  OTP: 'otp',
  RESET: 'reset',
  DONE: 'done',
}

export default function ForgotPassword() {
  const navigate = useNavigate()
  const [step, setStep] = useState(STEPS.IDENTIFIER)
  const [mode, setMode] = useState('email')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [requestId, setRequestId] = useState('')
  const [resetToken, setResetToken] = useState('')
  const [passwords, setPasswords] = useState({ newPassword: '', confirmPassword: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { secondsLeft, reset: resetCountdown } = useOtpCountdown(60)

  const submitIdentifier = async (event) => {
    event.preventDefault()
    setError('')
    setMessage('')

    if (mode === 'email' && !validateEmail(email)) {
      setError('Enter a valid registered email address.')
      return
    }

    if (mode === 'phone' && !validatePhone(phone)) {
      setError('Enter a valid registered mobile number.')
      return
    }

    setIsLoading(true)

    try {
      const response = await forgotPassword({
        email: mode === 'email' ? email : null,
        phone: mode === 'phone' ? phone : null,
      })

      setMessage(response.message || 'Request submitted.')

      if (response.requiresOtp) {
        setRequestId(response.requestId)
        resetCountdown()
        setStep(STEPS.OTP)
      } else {
        setStep(STEPS.IDENTIFIER)
      }
    } catch (requestError) {
      setError(requestError.response?.data?.detail || 'Unable to start password reset.')
    } finally {
      setIsLoading(false)
    }
  }

  const submitOtp = async (event) => {
    event.preventDefault()
    setError('')
    setMessage('')

    if (otp.length !== 6) {
      setError('Enter the 6-digit verification code.')
      return
    }

    setIsLoading(true)

    try {
      const response = await verifyOtp({ requestId, otp, purpose: 'reset_password' })

      if (response.requiresOtp) {
        setError(response.message || 'Invalid verification code.')
        return
      }

      if (!response.resetToken) {
        setError('Reset token was not issued. Please try again.')
        return
      }

      setResetToken(response.resetToken)
      setMessage(response.message || 'OTP verified. Set your new password.')
      setStep(STEPS.RESET)
    } catch (requestError) {
      setError(requestError.response?.data?.detail || 'OTP verification failed.')
    } finally {
      setIsLoading(false)
    }
  }

  const submitReset = async (event) => {
    event.preventDefault()
    setError('')
    setMessage('')

    if (!validateStrongPassword(passwords.newPassword)) {
      setError('Password does not meet security requirements.')
      return
    }

    if (passwords.newPassword !== passwords.confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setIsLoading(true)

    try {
      const response = await resetPassword({
        resetToken,
        newPassword: passwords.newPassword,
        confirmPassword: passwords.confirmPassword,
      })

      if (response.requiresOtp) {
        setError('Additional verification is required.')
        setStep(STEPS.OTP)
        return
      }

      setMessage(response.message || 'Password reset successfully.')
      setStep(STEPS.DONE)
    } catch (requestError) {
      setError(requestError.response?.data?.detail || requestError.response?.data?.message || 'Unable to reset password.')
    } finally {
      setIsLoading(false)
    }
  }

  const resendOtp = async () => {
    setError('')
    setIsLoading(true)

    try {
      const response = await forgotPassword({
        email: mode === 'email' ? email : null,
        phone: mode === 'phone' ? phone : null,
      })

      if (response.requiresOtp) {
        setRequestId(response.requestId)
        resetCountdown()
        setMessage(response.message || 'A new verification code was sent.')
      } else {
        setMessage(response.message || 'If an account exists, a code will be sent.')
      }
    } catch (requestError) {
      setError(requestError.response?.data?.detail || 'Unable to resend code.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthLayout>
      <div className="mx-auto w-full max-w-lg rounded-3xl border border-white/70 bg-white/80 p-6 shadow-2xl shadow-green-primary/10 backdrop-blur sm:p-8">
        <Link to="/login" className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-green-primary">
          <ArrowLeft className="h-4 w-4" />
          Back to login
        </Link>

        <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold">Account recovery</p>
        <h1 className="mt-2 text-3xl font-bold text-text">Reset your password</h1>
        <p className="mt-2 text-sm text-gray-500">
          {step === STEPS.IDENTIFIER && 'Enter your registered email or mobile number.'}
          {step === STEPS.OTP && 'Enter the verification code sent by Shiksha Hub.'}
          {step === STEPS.RESET && 'Create a strong new password for your account.'}
          {step === STEPS.DONE && 'Your password has been updated.'}
        </p>

        {step === STEPS.IDENTIFIER && (
          <form onSubmit={submitIdentifier} className="mt-8 space-y-5">
            <div className="grid grid-cols-2 gap-2 rounded-xl bg-cream p-1">
              {['email', 'phone'].map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setMode(option)}
                  className={`rounded-lg py-2 text-sm font-bold capitalize ${mode === option ? 'bg-green-primary text-white' : 'text-gray-500'}`}
                >
                  {option}
                </button>
              ))}
            </div>

            {mode === 'email' ? (
              <label className="block">
                <span className="text-sm font-bold text-gray-600">Registered email</span>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-green-primary/10 px-4 py-3 outline-none focus:border-green-primary focus:ring-2 focus:ring-green-primary/15"
                  placeholder="you@school.edu"
                />
              </label>
            ) : (
              <label className="block">
                <span className="text-sm font-bold text-gray-600">Registered mobile number</span>
                <input
                  type="tel"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-green-primary/10 px-4 py-3 outline-none focus:border-green-primary focus:ring-2 focus:ring-green-primary/15"
                  placeholder="+91XXXXXXXXXX"
                />
              </label>
            )}

            <button type="submit" disabled={isLoading} className="btn-primary w-full disabled:opacity-60">
              {isLoading ? 'Sending...' : 'Continue'}
            </button>
          </form>
        )}

        {step === STEPS.OTP && (
          <form onSubmit={submitOtp} className="mt-8 space-y-5">
            <OtpInput value={otp} onChange={setOtp} disabled={isLoading} />
            <OtpResendPanel secondsLeft={secondsLeft} onResend={resendOtp} isResending={isLoading} />
            <button type="submit" disabled={isLoading || otp.length !== 6} className="btn-primary w-full disabled:opacity-60">
              {isLoading ? 'Verifying...' : 'Verify code'}
            </button>
          </form>
        )}

        {step === STEPS.RESET && (
          <form onSubmit={submitReset} className="mt-8 space-y-5">
            <label className="block">
              <span className="text-sm font-bold text-gray-600">New password</span>
              <div className="relative mt-2">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={passwords.newPassword}
                  onChange={(event) => setPasswords((current) => ({ ...current, newPassword: event.target.value }))}
                  className="w-full rounded-xl border border-green-primary/10 px-4 py-3 pr-11 outline-none focus:border-green-primary focus:ring-2 focus:ring-green-primary/15"
                />
                <button type="button" onClick={() => setShowPassword((current) => !current)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </label>
            <PasswordStrength password={passwords.newPassword} />
            <label className="block">
              <span className="text-sm font-bold text-gray-600">Confirm password</span>
              <input
                type={showPassword ? 'text' : 'password'}
                value={passwords.confirmPassword}
                onChange={(event) => setPasswords((current) => ({ ...current, confirmPassword: event.target.value }))}
                className="mt-2 w-full rounded-xl border border-green-primary/10 px-4 py-3 outline-none focus:border-green-primary focus:ring-2 focus:ring-green-primary/15"
              />
            </label>
            <button type="submit" disabled={isLoading} className="btn-primary w-full disabled:opacity-60">
              {isLoading ? 'Saving...' : 'Reset password'}
            </button>
          </form>
        )}

        {step === STEPS.DONE && (
          <div className="mt-8 space-y-4">
            <div className="rounded-xl bg-green-primary/10 px-4 py-3 text-sm font-semibold text-green-primary">
              {message}
            </div>
            <button type="button" onClick={() => navigate('/login')} className="btn-primary w-full">
              Return to login
            </button>
          </div>
        )}

        {error && <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">{error}</p>}
        {message && step !== STEPS.DONE && (
          <p className="mt-4 rounded-xl bg-green-primary/10 px-4 py-3 text-sm font-semibold text-green-primary">{message}</p>
        )}
      </div>
    </AuthLayout>
  )
}
