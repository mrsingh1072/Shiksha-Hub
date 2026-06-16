import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import FormInput from './FormInput'
import AuthLayout from './AuthLayout'
import {validatePassword } from '../../utils/validation'
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
  const [loginRole, setLoginRole] = useState('student') // student, teacher, admin

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
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const handleSubmit = async (e) => {
e.preventDefault()

if (!validateForm()) return

setIsLoading(true)

try {
  await login(formData.identifier, formData.password, loginRole)
  navigate(loginRole === 'student' ? '/student/dashboard' : '/', { replace: true })

} catch (error) {

  console.log("LOGIN FAILED")
  console.log(error)

  setErrors({
    submit:
      error.message ||
      'Login Failed'
  })

} finally {
  setIsLoading(false)
}
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  }

  return (
    <AuthLayout>
      <motion.div
        className="w-full max-w-md"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-green-primary mb-2">
            Welcome Back
          </h1>
          <p className="text-gray-600">Sign in to your EduVerse AI account</p>
        </motion.div>

        {/* Role Selector */}
        <motion.div
          variants={itemVariants}
          className="flex gap-3 mb-8 bg-white/50 backdrop-blur-sm p-1 rounded-lg border border-white/80"
        >
          {[
            { id: 'student', label: 'Student' },
            { id: 'teacher', label: 'Teacher' },
            { id: 'admin', label: 'Admin' },
          ].map(role => (
            <button
              key={role.id}
              onClick={() => setLoginRole(role.id)}
              className={`flex-1 py-2 px-4 rounded-md font-semibold transition-all duration-300 ${
                loginRole === role.id
                  ? 'bg-green-primary text-white shadow-glow'
                  : 'text-gray-600 hover:bg-white/50'
              }`}
            >
              {role.label}
            </button>
          ))}
        </motion.div>

        {/* Form */}
        <motion.form
          onSubmit={handleSubmit}
          className="space-y-4"
          variants={containerVariants}
        >
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

          <motion.div variants={itemVariants}>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                disabled={isLoading}
                placeholder="Enter your password"
                className={`w-full px-4 py-3 rounded-lg border-2 transition-all duration-300 bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-green-primary/50 ${
                  errors.password
                    ? 'border-red-500'
                    : 'border-white/80 hover:border-green-primary/30'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-green-primary transition-colors"
                disabled={isLoading}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">{errors.password}</p>
            )}
          </motion.div>

          {/* Forgot Password */}
          <motion.div variants={itemVariants} className="flex justify-end">
            <Link
              to="/forgot-password"
              className="text-sm text-green-primary hover:text-green-secondary transition-colors font-semibold"
            >
              Forgot Password?
            </Link>
          </motion.div>

          {/* Submit Error */}
          {errors.submit && (
            <motion.div
              variants={itemVariants}
              className="p-3 bg-red-50 border border-red-200 rounded-lg"
            >
              <p className="text-red-700 text-sm font-semibold">{errors.submit}</p>
            </motion.div>
          )}

          {/* Submit Button */}
          <motion.button
            variants={itemVariants}
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full flex items-center justify-center gap-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </motion.button>
        </motion.form>

        {/* Divider */}
        <motion.div variants={itemVariants} className="my-6 flex items-center gap-4">
          <div className="flex-1 h-px bg-gradient-to-r from-green-primary/20 to-transparent" />
          <span className="text-gray-600 text-sm font-semibold">OR</span>
          <div className="flex-1 h-px bg-gradient-to-l from-green-primary/20 to-transparent" />
        </motion.div>

        {/* Sign Up Link */}
        <motion.div variants={itemVariants} className="text-center">
          <p className="text-gray-600">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="text-green-primary hover:text-green-secondary font-semibold transition-colors"
            >
              Sign up
            </Link>
          </p>
        </motion.div>
      </motion.div>
    </AuthLayout>
  )
}
