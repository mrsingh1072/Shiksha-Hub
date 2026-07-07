import { motion } from 'framer-motion'
import { BookOpen, Zap, BarChart3, Users } from 'lucide-react'

export default function WhyShikshaHub() {
  const features = [
  {
    icon: BookOpen,
    title: 'AI Tutor',
    description:
      'Get instant explanations and solve doubts step by step.',
  },
  {
    icon: Zap,
    title: 'Smart Notes',
    description:
      'Generate summaries and study notes in seconds.',
  },
  {
    icon: BarChart3,
    title: 'Exam Generator',
    description:
      'Create personalized quizzes and practice tests.',
  },
  {
    icon: Users,
    title: 'Assignment Evaluation',
    description:
      'Receive feedback and improve your submissions.',
  },
]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  }

  return (
    <section className="section bg-gradient-to-br from-green-primary via-green-primary to-green-secondary text-white">
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-24"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Everything You Need in One Platform</h2>
          <p className="text-white/80 text-lg max-w-2xl mx-auto">
            Learn, practice, evaluate, and improve with AI-powered tools built for students and educators.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {features.map((feature, i) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={i}
                variants={itemVariants}
                whileHover={{ scale: 1.05, y: -10 }}
                className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 min-h-[240px] hover:bg-white/15 transition-all"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="w-14 h-14 bg-gold/20 rounded-lg flex items-center justify-center mb-4"
                >
                  <Icon size={28} className="text-gold" />
                </motion.div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-white/80 leading-relaxed">{feature.description}</p>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
