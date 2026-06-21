import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import FormInput from '../FormInput'
import { validateEmail, validatePassword } from '../../../utils/validation'
import api from '../../../services/api'
import { useNavigate } from 'react-router-dom'

export default function TeacherRegistration({ onBack }) {

  const navigate = useNavigate()
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    subject: '',
    qualification: '',
    experience: '',
  })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [successData, setSuccessData] = useState(null)

  const validateForm = () => {
    const newErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (!validatePassword(formData.password)) {
      newErrors.password = 'Password must be at least 8 characters'
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required'
    } else if (!/^[0-9+\-\s()]{10,}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number'
    }

    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required'
    }

    if (!formData.qualification.trim()) {
      newErrors.qualification = 'Qualification is required'
    }

    if (!formData.experience.trim()) {
      newErrors.experience = 'Experience is required'
    } else if (!/^\d+$/.test(formData.experience)) {
      newErrors.experience = 'Please enter a valid number'
    }

    if (!agreedToTerms) {
      newErrors.terms = 'You must agree to the terms and conditions'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
    if (errors[name]) {
      setErrors(prev => ({
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

  const response = await api.post(
    '/users/register',
    {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      password: formData.password,

      role: 'teacher',

      subject: formData.subject,
      qualification: formData.qualification,
      experience: formData.experience
    }
  )

  console.log('TEACHER REGISTERED')
console.log(response.data)

setSuccessData({
  teacherId: response.data.user_id,
  email: formData.email
})

setShowSuccessModal(true)

} catch (error) {
  console.log("TEACHER REGISTRATION FAILED")
  console.log(error)

  setErrors({
    submit:
      error.response?.data?.message ||
      "Registration Failed"
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
        staggerChildren: 0.08,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 },
    },
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full"
    >
      {/* Header with Back Button */}
      <motion.div variants={itemVariants} className="mb-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-green-primary hover:text-green-secondary font-semibold transition-colors mb-4"
        >
          <ArrowLeft size={20} />
          Back to Roles
        </button>
        <h1 className="text-3xl md:text-4xl font-bold text-green-primary mb-2">
          Teacher Registration
        </h1>
        <p className="text-gray-600">Join our community of educators</p>
      </motion.div>

      {/* Form */}
      <motion.form onSubmit={handleSubmit} className="space-y-5">
        {/* Basic Information */}
        <motion.div variants={itemVariants}>
          <h3 className="text-lg font-bold text-green-primary mb-4">
            Basic Information
          </h3>
          <div className="space-y-4">
            <FormInput
              label="Full Name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              error={errors.name}
              placeholder="Dr. Jane Smith"
              disabled={isLoading}
            />
            <FormInput
              label="Email Address"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              placeholder="you@example.com"
              disabled={isLoading}
            />
            <FormInput
              label="Phone Number"
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              error={errors.phone}
              placeholder="+1 (555) 000-0000"
              disabled={isLoading}
            />
            <FormInput
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              placeholder="Enter your password"
              disabled={isLoading}
              helperText="At least 8 characters"
            />
            <FormInput
              label="Confirm Password"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
              placeholder="Confirm your password"
              disabled={isLoading}
            />
          </div>
        </motion.div>

        {/* Professional Information */}
        <motion.div variants={itemVariants}>
          <h3 className="text-lg font-bold text-green-primary mb-4">
            Professional Information
          </h3>
          <div className="space-y-4">
            <FormInput
              label="Subject"
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              error={errors.subject}
              placeholder="e.g., Mathematics, English, Physics"
              disabled={isLoading}
            />
            <FormInput
              label="Qualification"
              type="text"
              name="qualification"
              value={formData.qualification}
              onChange={handleChange}
              error={errors.qualification}
              placeholder="e.g., M.Sc. Physics, B.A. English"
              disabled={isLoading}
            />
            <FormInput
              label="Years of Experience"
              type="number"
              name="experience"
              value={formData.experience}
              onChange={handleChange}
              error={errors.experience}
              placeholder="Enter number of years"
              disabled={isLoading}
            />
          </div>
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

        {/* Terms and Conditions */}
        <motion.div variants={itemVariants} className="flex items-start gap-3">
          <input
            type="checkbox"
            id="terms"
            checked={agreedToTerms}
            onChange={e => {
              setAgreedToTerms(e.target.checked)
              if (errors.terms) {
                setErrors(prev => ({ ...prev, terms: '' }))
              }
            }}
            disabled={isLoading}
            className="mt-1 w-5 h-5 rounded border-2 border-green-primary text-green-primary focus:ring-2 focus:ring-green-primary/50 cursor-pointer disabled:opacity-60"
          />
          <label htmlFor="terms" className="text-sm text-gray-600 cursor-pointer">
            I agree to the{' '}
            <a href="#" className="text-green-primary hover:text-green-secondary font-semibold">
              Terms and Conditions
            </a>{' '}
            and{' '}
            <a href="#" className="text-green-primary hover:text-green-secondary font-semibold">
              Privacy Policy
            </a>
          </label>
        </motion.div>
        {errors.terms && (
          <p className="text-red-500 text-xs font-semibold -mt-3">{errors.terms}</p>
        )}

        {/* Submit Button */}
        <motion.button
          variants={itemVariants}
          type="submit"
          disabled={isLoading}
          className="btn-primary w-full flex items-center justify-center gap-2 mt-8"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Creating Account...
            </>
          ) : (
            'Create Account'
          )}
        </motion.button>
        {showSuccessModal && (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
    <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full mx-4">

      <div className="text-center">

        <div className="w-20 h-20 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
          <span className="text-4xl">🎉</span>
        </div>

        <h2 className="text-2xl font-bold text-green-700 mb-2">
          Registration Successful
        </h2>

        <p className="text-gray-600 mb-6">
          Welcome to EduVerse AI
        </p>

        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4 text-left">
          <p className="text-sm text-gray-500">
            Teacher ID
          </p>

          <p className="font-bold text-xl text-green-700">
            {successData?.teacherId}
          </p>
        </div>

        <div className="bg-gray-50 border rounded-xl p-4 mb-4 text-left">
          <p className="text-sm text-gray-500">
            Email
          </p>

          <p className="font-medium">
            {successData?.email}
          </p>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 mb-6">
          <p className="text-sm text-yellow-800">
            Save your Teacher ID. You will need it for future logins.
          </p>
        </div>

        <button
          onClick={() => navigate('/login')}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-semibold"
        >
          Proceed to Login
        </button>

      </div>

    </div>
  </div>
)}
      </motion.form>
    </motion.div>
  )
  }