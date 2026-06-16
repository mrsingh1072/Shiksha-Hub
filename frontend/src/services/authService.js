import api from './api'

const read = (request) => request.then((response) => response.data)

export async function forgotPassword({ email, phone }) {
  return read(api.post('/auth/forgot-password', { email: email || null, phone: phone || null }))
}

export async function verifyOtp({ requestId, otp, purpose = 'reset_password' }) {
  return read(api.post('/auth/verify-otp', { requestId, otp, purpose }))
}

export async function resetPassword({ resetToken, newPassword, confirmPassword }) {
  return read(api.post('/auth/reset-password', { resetToken, newPassword, confirmPassword }))
}

export async function changePassword({ currentPassword, newPassword, confirmPassword }) {
  return read(api.post('/auth/change-password', { currentPassword, newPassword, confirmPassword }))
}

export async function sendVerification(channel) {
  return read(api.post('/auth/send-verification', { channel }))
}

export async function verifyEmail({ requestId, otp }) {
  return read(api.post('/auth/verify-email', { requestId, otp }))
}

export async function verifyMobile({ requestId, otp }) {
  return read(api.post('/auth/verify-mobile', { requestId, otp }))
}
