import { useState } from 'react'
import { Eye, EyeOff, Link as LinkIcon, Lock, Mail, Phone, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import OtpInput, { OtpResendPanel, useOtpCountdown } from '../auth/OtpInput'
import PasswordStrength, { validateStrongPassword } from '../auth/PasswordStrength'
import {
  changePassword,
  sendVerification,
  verifyEmail,
  verifyMobile,
} from '../../services/authService'
import { DashboardCard } from '../studentDashboard/DashboardPrimitives'

function PasswordField({ label, name, value, onChange, show, onToggle, disabled }) {
  return (
    <label className="block">
      <span className="text-sm font-bold text-gray-600">{label}</span>
      <div className="relative mt-2">
        <input
          type={show ? 'text' : 'password'}
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className="w-full rounded-xl border border-green-primary/10 bg-white px-3 py-2.5 pr-11 text-sm outline-none transition focus:border-green-primary focus:ring-2 focus:ring-green-primary/15 disabled:bg-cream"
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
          tabIndex={-1}
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </label>
  )
}

export default function AccountSecurity({ student, onVerified }) {
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [passwordVisibility, setPasswordVisibility] = useState({
    current: false,
    next: false,
    confirm: false,
  })
  const [passwordStatus, setPasswordStatus] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  const [emailOtp, setEmailOtp] = useState('')
  const [mobileOtp, setMobileOtp] = useState('')
  const [emailRequestId, setEmailRequestId] = useState('')
  const [mobileRequestId, setMobileRequestId] = useState('')
  const [emailRequiresOtp, setEmailRequiresOtp] = useState(false)
  const [mobileRequiresOtp, setMobileRequiresOtp] = useState(false)
  const [verificationStatus, setVerificationStatus] = useState('')
  const [verificationError, setVerificationError] = useState('')
  const [isSendingEmail, setIsSendingEmail] = useState(false)
  const [isSendingMobile, setIsSendingMobile] = useState(false)
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false)
  const [isVerifyingMobile, setIsVerifyingMobile] = useState(false)

  const emailCountdown = useOtpCountdown(60)
  const mobileCountdown = useOtpCountdown(60)

  const handlePasswordChange = (event) => {
    const { name, value } = event.target
    setPasswordForm((current) => ({ ...current, [name]: value }))
  }

  const submitPasswordChange = async (event) => {
    event.preventDefault()
    setPasswordError('')
    setPasswordStatus('')

    if (!passwordForm.currentPassword.trim()) {
      setPasswordError('Current password is required.')
      return
    }

    if (!validateStrongPassword(passwordForm.newPassword)) {
      setPasswordError('New password does not meet security requirements.')
      return
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New password and confirmation do not match.')
      return
    }

    setIsChangingPassword(true)

    try {
      const response = await changePassword(passwordForm)
      if (response.requiresOtp) {
        setPasswordError('Additional verification is required. Follow the OTP prompt from the server.')
        return
      }
      setPasswordStatus(response.message || 'Password changed successfully.')
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (error) {
      setPasswordError(error.response?.data?.detail || 'Unable to change password.')
    } finally {
      setIsChangingPassword(false)
    }
  }

  const startEmailVerification = async () => {
    setVerificationError('')
    setVerificationStatus('')
    setIsSendingEmail(true)

    try {
      const response = await sendVerification('email')
      if (response.requiresOtp) {
        setEmailRequiresOtp(true)
        setEmailRequestId(response.requestId)
        emailCountdown.reset()
        setVerificationStatus(response.message || 'Verification code sent to your email.')
      } else {
        setEmailRequiresOtp(false)
        setVerificationStatus(response.message || 'Verification started.')
      }
    } catch (error) {
      setVerificationError(error.response?.data?.detail || 'Unable to send email verification.')
    } finally {
      setIsSendingEmail(false)
    }
  }

  const startMobileVerification = async () => {
    if (!student.phone?.trim()) {
      setVerificationError('Add a mobile number in your profile before verifying.')
      return
    }

    setVerificationError('')
    setVerificationStatus('')
    setIsSendingMobile(true)

    try {
      const response = await sendVerification('mobile')
      if (response.requiresOtp) {
        setMobileRequiresOtp(true)
        setMobileRequestId(response.requestId)
        mobileCountdown.reset()
        setVerificationStatus(response.message || 'Verification code sent to your mobile.')
      } else {
        setMobileRequiresOtp(false)
        setVerificationStatus(response.message || 'Verification started.')
      }
    } catch (error) {
      setVerificationError(error.response?.data?.detail || 'Unable to send mobile verification.')
    } finally {
      setIsSendingMobile(false)
    }
  }

  const submitEmailOtp = async () => {
    if (!emailRequiresOtp) return
    setIsVerifyingEmail(true)
    setVerificationError('')

    try {
      const response = await verifyEmail({ requestId: emailRequestId, otp: emailOtp })
      if (response.requiresOtp) {
        setVerificationError(response.message || 'Invalid OTP.')
        return
      }
      setEmailRequiresOtp(false)
      setEmailOtp('')
      setVerificationStatus(response.message || 'Email verified.')
      onVerified?.({ emailVerified: true })
    } catch (error) {
      setVerificationError(error.response?.data?.detail || 'Email verification failed.')
    } finally {
      setIsVerifyingEmail(false)
    }
  }

  const submitMobileOtp = async () => {
    if (!mobileRequiresOtp) return
    setIsVerifyingMobile(true)
    setVerificationError('')

    try {
      const response = await verifyMobile({ requestId: mobileRequestId, otp: mobileOtp })
      if (response.requiresOtp) {
        setVerificationError(response.message || 'Invalid OTP.')
        return
      }
      setMobileRequiresOtp(false)
      setMobileOtp('')
      setVerificationStatus(response.message || 'Mobile verified.')
      onVerified?.({ phoneVerified: true })
    } catch (error) {
      setVerificationError(error.response?.data?.detail || 'Mobile verification failed.')
    } finally {
      setIsVerifyingMobile(false)
    }
  }

  return (
    <DashboardCard className="p-6">
      <div className="mb-6 flex items-center gap-3">
        <div className="rounded-xl bg-green-primary/10 p-3 text-green-primary">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-gold">Security</p>
          <h2 className="text-xl font-bold text-text">Account Security</h2>
        </div>
      </div>

      <div className="space-y-8">
        <section>
          <div className="mb-4 flex items-center gap-2">
            <Lock className="h-4 w-4 text-green-primary" />
            <h3 className="font-bold text-text">Change password</h3>
          </div>
          <form onSubmit={submitPasswordChange} className="space-y-4">
            <PasswordField
              label="Current password"
              name="currentPassword"
              value={passwordForm.currentPassword}
              onChange={handlePasswordChange}
              show={passwordVisibility.current}
              onToggle={() => setPasswordVisibility((current) => ({ ...current, current: !current.current }))}
              disabled={isChangingPassword}
            />
            <PasswordField
              label="New password"
              name="newPassword"
              value={passwordForm.newPassword}
              onChange={handlePasswordChange}
              show={passwordVisibility.next}
              onToggle={() => setPasswordVisibility((current) => ({ ...current, next: !current.next }))}
              disabled={isChangingPassword}
            />
            <PasswordStrength password={passwordForm.newPassword} />
            <PasswordField
              label="Confirm new password"
              name="confirmPassword"
              value={passwordForm.confirmPassword}
              onChange={handlePasswordChange}
              show={passwordVisibility.confirm}
              onToggle={() => setPasswordVisibility((current) => ({ ...current, confirm: !current.confirm }))}
              disabled={isChangingPassword}
            />
            {passwordError && <p className="text-sm font-semibold text-red-600">{passwordError}</p>}
            {passwordStatus && <p className="text-sm font-semibold text-green-primary">{passwordStatus}</p>}
            <button
              type="submit"
              disabled={isChangingPassword}
              className="rounded-xl bg-green-primary px-4 py-2.5 text-sm font-bold text-white disabled:opacity-60"
            >
              {isChangingPassword ? 'Updating...' : 'Update password'}
            </button>
          </form>
        </section>

        <section className="rounded-2xl border border-green-primary/10 bg-cream/50 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-bold text-text">Forgot your password?</p>
              <p className="text-sm text-gray-500">Reset access with email or mobile OTP verification.</p>
            </div>
            <Link
              to="/forgot-password"
              className="inline-flex items-center gap-2 rounded-xl border border-green-primary/15 bg-white px-4 py-2 text-sm font-bold text-green-primary"
            >
              <LinkIcon className="h-4 w-4" />
              Forgot password
            </Link>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-green-primary/10 p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-green-primary" />
                <h3 className="font-bold text-text">Email verification</h3>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-bold ${student.emailVerified ? 'bg-green-primary/10 text-green-primary' : 'bg-amber-100 text-amber-700'}`}>
                {student.emailVerified ? 'Verified' : 'Pending'}
              </span>
            </div>
            <p className="mb-4 text-sm text-gray-500">{student.email}</p>
            {!student.emailVerified && (
              <>
                <button
                  type="button"
                  onClick={startEmailVerification}
                  disabled={isSendingEmail}
                  className="rounded-xl bg-green-primary px-4 py-2 text-sm font-bold text-white disabled:opacity-60"
                >
                  {isSendingEmail ? 'Sending...' : 'Send verification code'}
                </button>
                {emailRequiresOtp && (
                  <div className="mt-5 space-y-4">
                    <OtpInput value={emailOtp} onChange={setEmailOtp} disabled={isVerifyingEmail} />
                    <OtpResendPanel
                      secondsLeft={emailCountdown.secondsLeft}
                      onResend={startEmailVerification}
                      isResending={isSendingEmail}
                    />
                    <button
                      type="button"
                      onClick={submitEmailOtp}
                      disabled={isVerifyingEmail || emailOtp.length !== 6}
                      className="rounded-xl border border-green-primary/15 px-4 py-2 text-sm font-bold text-green-primary disabled:opacity-60"
                    >
                      {isVerifyingEmail ? 'Verifying...' : 'Verify email'}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="rounded-2xl border border-green-primary/10 p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-green-primary" />
                <h3 className="font-bold text-text">Mobile verification</h3>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-bold ${student.phoneVerified ? 'bg-green-primary/10 text-green-primary' : 'bg-amber-100 text-amber-700'}`}>
                {student.phoneVerified ? 'Verified' : 'Pending'}
              </span>
            </div>
            <p className="mb-4 text-sm text-gray-500">{student.phone || 'Add a mobile number to verify.'}</p>
            {!student.phoneVerified && (
              <>
                <button
                  type="button"
                  onClick={startMobileVerification}
                  disabled={isSendingMobile}
                  className="rounded-xl bg-green-primary px-4 py-2 text-sm font-bold text-white disabled:opacity-60"
                >
                  {isSendingMobile ? 'Sending...' : 'Send verification code'}
                </button>
                {mobileRequiresOtp && (
                  <div className="mt-5 space-y-4">
                    <OtpInput value={mobileOtp} onChange={setMobileOtp} disabled={isVerifyingMobile} />
                    <OtpResendPanel
                      secondsLeft={mobileCountdown.secondsLeft}
                      onResend={startMobileVerification}
                      isResending={isSendingMobile}
                    />
                    <button
                      type="button"
                      onClick={submitMobileOtp}
                      disabled={isVerifyingMobile || mobileOtp.length !== 6}
                      className="rounded-xl border border-green-primary/15 px-4 py-2 text-sm font-bold text-green-primary disabled:opacity-60"
                    >
                      {isVerifyingMobile ? 'Verifying...' : 'Verify mobile'}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </section>

        {(verificationStatus || verificationError) && (
          <div className={`rounded-xl px-4 py-3 text-sm font-semibold ${verificationError ? 'bg-red-50 text-red-600' : 'bg-green-primary/10 text-green-primary'}`}>
            {verificationError || verificationStatus}
          </div>
        )}
      </div>
    </DashboardCard>
  )
}
