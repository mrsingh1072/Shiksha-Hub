import { motion } from 'framer-motion'
import { Brain, MessageSquare, Award } from 'lucide-react'

export default function AITutor() {
  return (
    <section className="section bg-white">
      <div className="section-container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-green-primary mb-6">
              Learn Smarter With Your <span className="gradient-text">Personal AI Tutor</span>
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed mb-8">
              Get instant, personalized tutoring in any subject. Our AI tutor understands your learning pace and adapts explanations to match your comprehension level.
            </p>

            <div className="space-y-6 mb-8">
              {[
  {
    icon: Brain,
    title: '24/7 Doubt Solving',
    desc: 'Ask questions anytime and get instant help.',
  },
  {
    icon: MessageSquare,
    title: 'Personalized Learning',
    desc: 'Explanations adapted to your understanding level.',
  },
  {
    icon: Award,
    title: 'Step-by-Step Guidance',
    desc: 'Learn concepts clearly instead of memorizing answers.',
  },
].map((item, i) => {
                const Icon = item.icon
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex gap-4"
                  >
                    <div className="w-12 h-12 bg-green-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon className="text-green-primary" size={24} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-text">{item.title}</h4>
                      <p className="text-gray-600">{item.desc}</p>
                    </div>
                  </motion.div>
                )
              })}
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn-primary text-lg px-8 py-4"
            >
              Try AI Tutor
            </motion.button>
          </motion.div>

          {/* Right Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="bg-gradient-to-br from-green-primary to-green-secondary rounded-3xl p-8 text-white shadow-2xl">
              <div className="mb-5 inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-sm font-medium">🤖 Live AI Tutor Demo</div>
              <div className="space-y-4">
                <div className="flex gap-3 items-start">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">👨‍🎓</div>
                  <div className="flex-1">
                    <p className="bg-white/10 rounded-lg px-4 py-3 backdrop-blur">
                      Can you explain Binary Search in simple words?
                    </p>
                  </div>
                </div>
                <div className="flex gap-3 justify-end">
                  <div className="flex-1">
                    <p className="bg-gold/30 rounded-lg px-4 py-3 text-right">Think of searching for a word in a dictionary. Instead of checking every page,you open the middle page and decide whether to go left or right. Binary Search works the same way.</p>
                  </div>
                  <div className="w-10 h-10 bg-gold/20 rounded-full flex items-center justify-center flex-shrink-0">🤖</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
