import { motion } from 'framer-motion'
import { Lightbulb, Trophy, BookMarked, Zap } from 'lucide-react'

export default function StudentFeatures() {
  const features = [
  {
    icon: Lightbulb,
    title: 'AI Tutor',
    description:
      'Get instant explanations and personalized learning support.',
  },
  {
    icon: Trophy,
    title: 'Practice Exams',
    description:
      'Generate AI-powered tests tailored to your syllabus.',
  },
  {
    icon: BookMarked,
    title: 'Assignment Evaluation',
    description:
      'Receive detailed feedback and grading within seconds.',
  },
  {
    icon: Zap,
    title: 'Smart Notes',
    description:
      'Create summaries, flashcards, and revision notes instantly.',
  },
]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  }

  return (
    <section className="section bg-gradient-to-b from-cream to-white" id="students">
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-green-primary mb-4">
            Everything You <span className="gradient-text">Need in One Platform</span>
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Everything students and educators need to create, learn, assess, and succeed in one platform.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {features.map((feature, i) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={i}
                variants={itemVariants}
                whileHover={{ y: -6,scale: 1.02, boxShadow: '0 20px 40px rgba(47, 93, 80, 0.12)' }}
                className="card p-5 flex flex-col justify-start hover:border-gold/30 transition-all"
              >
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  whileInView={{ scale: 1, rotate: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="w-12 h-12 bg-green-primary/10 rounded-xl flex items-center justify-center mb-5"
                >
                  <Icon className="text-green-primary" size={28} />
                </motion.div>
                <h3 className="text-xl font-bold text-text mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
