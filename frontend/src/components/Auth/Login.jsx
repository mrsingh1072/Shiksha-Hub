import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import FormInput from './FormInput'
import AuthLayout from './AuthLayout'
import { validatePassword } from '../../utils/validation'
import { useAuth } from '../../contexts/AuthContext'

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [formData, setFormData] = useState({
    identifier: '',
    password: '',
  })

  const [errors, setErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [loginRole, setLoginRole] = useState('student')

  const validateForm = () => {
    const newErrors = {}

    if (!formData.identifier.trim()) {
      newErrors.identifier = 'Email or User ID is required'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (!validatePassword(formData.password)) {
      newErrors.password = 'Password must be at least 8 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e) => {
    const { name, value } = e.target

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsLoading(true)

    try {
      const result = await login(
        formData.identifier,
        formData.password,
        loginRole
      )

      const redirectMap = {
        student: '/student/dashboard',
        teacher: '/teacher/dashboard',
        admin: '/admin/dashboard',
      }

      navigate(redirectMap[result.role] || '/', {
        replace: true,
      })
    } catch (error) {
      console.log('LOGIN FAILED')
      console.log(error)

      setErrors({
        submit: error.message || 'Login Failed',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthLayout>
      <div className="w-full max-w-md">
        {/* Header — fixed height so it never reflows */}
        <div className="text-center mb-6">
          <h1 className="!text-4xl md:!text-5xl font-bold text-green-primary mb-3 leading-tight">
            Welcome To
            <br />
            EduVerse AI
          </h1>

          <p className="text-gray-600 text-lg leading-normal">
            Please enter your credentials to sign in
          </p>
        </div>

        {/* Role Selector — fixed height tabs */}
        <div className="flex gap-3 mb-6 bg-white/50 backdrop-blur-sm p-1 rounded-lg border border-white/80">
          {[
            { id: 'student', label: 'Student' },
            { id: 'teacher', label: 'Teacher' },
            { id: 'admin', label: 'Admin' },
          ].map((role) => (
            <button
              key={role.id}
              type="button"
              onClick={() => setLoginRole(role.id)}
              className={`flex-1 py-2 px-4 rounded-md font-semibold ${
                loginRole === role.id
                  ? 'bg-green-primary text-white shadow-glow'
                  : 'text-gray-600 hover:bg-white/50'
              }`}
            >
              {role.label}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-1">
          <FormInput
            label="Email Address / User ID"
            type="text"
            name="identifier"
            value={formData.identifier}
            onChange={handleChange}
            error={errors.identifier}
            placeholder="Enter Email or User ID"
            disabled={isLoading}
          />

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Password
            </label>

            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                autoComplete="current-password"
                value={formData.password}
                onChange={handleChange}
                disabled={isLoading}
                placeholder="Enter your password"
                className={`w-full px-4 py-3 rounded-lg border-2 bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-green-primary/50 ${
                  errors.password
                    ? 'border-red-500'
                    : 'border-white/80 hover:border-green-primary/30'
                }`}
              />
              

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-green-primary transition-colors"
              >
                {showPassword ? (
                  <EyeOff size={20} />
                ) : (
                  <Eye size={20} />
                )}
              </button>
            </div>

            {/* Fixed-height error slot */}
            <div className="h-5 mt-1">
              {errors.password && (
                <p className="text-red-500 text-xs font-semibold">
                  {errors.password}
                </p>
              )}
            </div>
          </div>

          {/* Forgot Password */}
          <div className="flex justify-end">
            <Link
              to="/forgot-password"
              className="text-sm text-green-primary hover:text-green-secondary transition-colors font-semibold"
            >
              Forgot Password?
            </Link>
          </div>

          {/* Error Message — fixed-height slot so it never pushes content */}
          <div className="h-12">
            {errors.submit && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm font-semibold">
                  {errors.submit}
                </p>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="my-5 flex items-center gap-4">
          <div className="flex-1 h-px bg-gradient-to-r from-green-primary/20 to-transparent" />
          <span className="text-gray-600 text-sm font-semibold">OR</span>
          <div className="flex-1 h-px bg-gradient-to-l from-green-primary/20 to-transparent" />
        </div>

        {/* Register Link */}
        <div className="text-center">
          <p className="text-gray-600">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="text-green-primary hover:text-green-secondary font-semibold transition-colors"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  )
}