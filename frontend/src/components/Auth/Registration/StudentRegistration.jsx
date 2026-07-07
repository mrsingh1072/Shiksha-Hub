import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import FormInput from '../FormInput'
import FormSelect from '../FormSelect'
import { validateEmail, validatePassword } from '../../../utils/validation'
import api from '../../../services/api'
import { useNavigate } from 'react-router-dom'

export default function StudentRegistration({ onBack }) {
  const navigate = useNavigate()
  
  const [studentType, setStudentType] = useState('school') // school or college
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    schoolName: '',
    class: '',
    collegeName: '',
    degree: '',
    course: '',
    yearSemester: '',
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

    if (studentType === 'school') {
      if (!formData.schoolName.trim()) {
        newErrors.schoolName = 'School name is required'
      }
      if (!formData.class.trim()) {
        newErrors.class = 'Class is required'
      }
    } else {
      if (!formData.collegeName.trim()) {
        newErrors.collegeName = 'College name is required'
      }
      if (!formData.degree.trim()) {
        newErrors.degree = 'Degree is required'
      }
      if (!formData.course.trim()) {
        newErrors.course = 'Course is required'
      }
      if (!formData.yearSemester.trim()) {
        newErrors.yearSemester = 'Year/Semester is required'
      }
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
      // API call here
      const response = await api.post('/users/register', {
  name: formData.name,
  email: formData.email,
  phone: formData.phone,
  password: formData.password,

  role: 'student',

  studentType: studentType,

  schoolName:
    studentType === 'school'
      ? formData.schoolName
      : '',

  studentClass:
    studentType === 'school'
      ? formData.class
      : '',

  collegeName:
    studentType === 'college'
      ? formData.collegeName
      : '',

  degree:
    studentType === 'college'
      ? formData.degree
      : '',

  course:
    studentType === 'college'
      ? formData.course
      : '',

  yearSemester:
    studentType === 'college'
      ? formData.yearSemester
      : '',
})

console.log(response.data)

setSuccessData({
  role: 'student',
  studentId: response.data.user_id,
  email: formData.email
})

setShowSuccessModal(true)
    } catch (error) {
      setErrors({ submit: error.message })
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
          Student Registration
        </h1>
        <p className="text-gray-600">Tell us about your educational background</p>
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
              placeholder="John Doe"
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

        {/* Student Type Selector */}
        <motion.div variants={itemVariants}>
          <h3 className="text-lg font-bold text-green-primary mb-4">
            Education Level
          </h3>
          <div className="flex gap-4 bg-white/50 backdrop-blur-sm p-1 rounded-lg border border-white/80">
            {[
              { id: 'school', label: 'School Student' },
              { id: 'college', label: 'College Student' },
            ].map(type => (
              <button
                key={type.id}
                type="button"
                onClick={() => setStudentType(type.id)}
                className={`flex-1 py-3 px-4 rounded-md font-semibold transition-all duration-300 ${
                  studentType === type.id
                    ? 'bg-green-primary text-white shadow-glow'
                    : 'text-gray-600 hover:bg-white/50'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* School Student Fields */}
        {studentType === 'school' && (
          <motion.div
            variants={itemVariants}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <h3 className="text-lg font-bold text-green-primary mb-4">
              School Information
            </h3>
            <div className="space-y-4">
              <FormInput
                label="School Name"
                type="text"
                name="schoolName"
                value={formData.schoolName}
                onChange={handleChange}
                error={errors.schoolName}
                placeholder="Enter your school name"
                disabled={isLoading}
              />
              <FormInput
                label="Class/Grade"
                type="text"
                name="class"
                value={formData.class}
                onChange={handleChange}
                error={errors.class}
                placeholder="e.g., Grade 10, Class XI"
                disabled={isLoading}
              />
            </div>
          </motion.div>
        )}

        {/* College Student Fields */}
        {studentType === 'college' && (
          <motion.div
            variants={itemVariants}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <h3 className="text-lg font-bold text-green-primary mb-4">
              College Information
            </h3>
            <div className="space-y-4">
              <FormInput
                label="College Name"
                type="text"
                name="collegeName"
                value={formData.collegeName}
                onChange={handleChange}
                error={errors.collegeName}
                placeholder="Enter your college name"
                disabled={isLoading}
              />
              <FormInput
                label="Degree"
                type="text"
                name="degree"
                value={formData.degree}
                onChange={handleChange}
                error={errors.degree}
                placeholder="e.g., Bachelor of Science, Bachelor of Commerce"
                disabled={isLoading}
              />
              <FormInput
                label="Course/Major"
                type="text"
                name="course"
                value={formData.course}
                onChange={handleChange}
                error={errors.course}
                placeholder="e.g., Computer Science, Business Administration"
                disabled={isLoading}
              />
              <FormInput
                label="Year/Semester"
                type="text"
                name="yearSemester"
                value={formData.yearSemester}
                onChange={handleChange}
                error={errors.yearSemester}
                placeholder="e.g., 2nd Year, 4th Semester"
                disabled={isLoading}
              />
            </div>
          </motion.div>
        )}

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
          Welcome to Shiksha Hub
        </p>

        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4 text-left">
          <p className="text-sm text-gray-500">Student ID</p>
          <p className="font-bold text-xl text-green-700">
            {successData?.studentId || 'Generating...'}
          </p>
        </div>

        <div className="bg-gray-50 border rounded-xl p-4 mb-4 text-left">
          <p className="text-sm text-gray-500">Email</p>
          <p className="font-medium">
            {successData?.email}
          </p>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 mb-6">
          <p className="text-sm text-yellow-800">
            Save your Student ID. You will need it for future logins.
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
