import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import AuthLayout from './AuthLayout'
import StudentRegistration from './Registration/StudentRegistration'
import TeacherRegistration from './Registration/TeacherRegistration'

export default function Register() {
  const [step, setStep] = useState('role-selection') // role-selection, student, teacher
  const [selectedRole, setSelectedRole] = useState(null)

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

  const roleCardVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.5 },
    },
    hover: { scale: 1.02, transition: { duration: 0.2 } },
  }

  const handleRoleSelect = (role) => {
    setSelectedRole(role)
    setStep(role === 'student' ? 'student' : 'teacher')
  }

  const handleBack = () => {
    setStep('role-selection')
    setSelectedRole(null)
  }

  return (
    <AuthLayout>
      <motion.div
        className="w-full max-w-2xl"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {step === 'role-selection' ? (
          <>
            {/* Header */}
            <motion.div variants={itemVariants} className="text-center mb-12">
              <h1 className="text-3xl md:text-4xl font-bold text-green-primary mb-2">
                Create Your Account
              </h1>
              <p className="text-gray-600">
                Join Shiksha Hub and revolutionize your learning journey
              </p>
            </motion.div>

            {/* Role Selection Cards */}
            <motion.div
              className="grid md:grid-cols-2 gap-6"
              variants={containerVariants}
            >
              {/* Student Card */}
              <motion.button
                variants={roleCardVariants}
                whileHover="hover"
                onClick={() => handleRoleSelect('student')}
                className="group relative overflow-hidden rounded-2xl p-8 bg-gradient-to-br from-green-primary/10 via-white to-white border-2 border-white/80 transition-all duration-300 hover:border-green-primary/50 hover:shadow-glow-lg text-left"
              >
                {/* Background Gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-green-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Content */}
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-primary to-green-secondary flex items-center justify-center mb-4 group-hover:shadow-glow transition-shadow">
                    <span className="text-2xl">🎓</span>
                  </div>
                  <h3 className="text-2xl font-bold text-green-primary mb-2">
                    Student
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Access personalized learning, assignments, and AI tutoring
                  </p>
                  <div className="flex items-center gap-2 text-green-primary font-semibold group-hover:gap-4 transition-all">
                    Get Started
                    <ChevronRight size={20} />
                  </div>
                </div>
              </motion.button>

              {/* Teacher Card */}
              <motion.button
                variants={roleCardVariants}
                whileHover="hover"
                onClick={() => handleRoleSelect('teacher')}
                className="group relative overflow-hidden rounded-2xl p-8 bg-gradient-to-br from-gold/10 via-white to-white border-2 border-white/80 transition-all duration-300 hover:border-gold/50 hover:shadow-glow-lg text-left"
              >
                {/* Background Gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-gold/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Content */}
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-gold to-yellow-600 flex items-center justify-center mb-4 group-hover:shadow-glow transition-shadow">
                    <span className="text-2xl">👨‍🏫</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gold mb-2">
                    Teacher
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Create assignments, track progress, and manage your classroom
                  </p>
                  <div className="flex items-center gap-2 text-gold font-semibold group-hover:gap-4 transition-all">
                    Get Started
                    <ChevronRight size={20} />
                  </div>
                </div>
              </motion.button>
            </motion.div>

            {/* Divider */}
            <motion.div variants={itemVariants} className="my-8 flex items-center gap-4">
              <div className="flex-1 h-px bg-gradient-to-r from-green-primary/20 to-transparent" />
              <span className="text-gray-600 text-sm font-semibold">OR</span>
              <div className="flex-1 h-px bg-gradient-to-l from-green-primary/20 to-transparent" />
            </motion.div>

            {/* Sign In Link */}
            <motion.div variants={itemVariants} className="text-center">
              <p className="text-gray-600">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="text-green-primary hover:text-green-secondary font-semibold transition-colors"
                >
                  Sign in
                </Link>
              </p>
            </motion.div>
          </>
        ) : step === 'student' ? (
          <StudentRegistration onBack={handleBack} />
        ) : (
          <TeacherRegistration onBack={handleBack} />
        )}
      </motion.div>
    </AuthLayout>
  )
}
