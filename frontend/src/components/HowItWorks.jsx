import { motion } from 'framer-motion'
import { FileText, Zap, Share2 } from 'lucide-react'

export default function NotesGenerator() {
  return (
    <section className="section bg-gradient-to-b from-white to-cream">
      <div className="section-container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Visual */}
          <motion.div
  initial={{ opacity: 0, scale: 0.8 }}
  whileInView={{ opacity: 1, scale: 1 }}
  transition={{ duration: 0.6 }}
  className="order-2 lg:order-1"
>
  <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-200">

    <div className="space-y-5">

      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-green-primary text-white flex items-center justify-center font-bold">
          01
        </div>
        <div>
          <p className="font-semibold text-text">Upload Content</p>
          <p className="text-gray-500 text-sm">
            Notes, PDFs, textbooks, or questions
          </p>
        </div>
      </div>

      <div className="ml-6 h-8 border-l-2 border-dashed border-green-primary"></div>

      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-green-primary text-white flex items-center justify-center font-bold">
          02
        </div>
        <div>
          <p className="font-semibold text-text">AI Processing</p>
          <p className="text-gray-500 text-sm">
            Understands concepts and learning needs
          </p>
        </div>
      </div>

      <div className="ml-6 h-8 border-l-2 border-dashed border-green-primary"></div>

      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-green-primary text-white flex items-center justify-center font-bold">
          03
        </div>
        <div>
          <p className="font-semibold text-text">Generate Resources</p>
          <p className="text-gray-500 text-sm">
            Notes, quizzes, explanations, and tests
          </p>
        </div>
      </div>

      <div className="ml-6 h-8 border-l-2 border-dashed border-green-primary"></div>

      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-green-primary text-white flex items-center justify-center font-bold">
          04
        </div>
        <div>
          <p className="font-semibold text-text">Track Progress</p>
          <p className="text-gray-500 text-sm">
            Monitor performance and improve continuously
          </p>
        </div>
      </div>

    </div>

  </div>
</motion.div>

          {/* Right Content */}
<motion.div
  initial={{ opacity: 0, x: 50 }}
  whileInView={{ opacity: 1, x: 0 }}
  transition={{ duration: 0.6 }}
  className="order-1 lg:order-2"
>
  <div className="inline-block px-4 py-2 bg-gold/20 rounded-full text-gold font-semibold text-sm mb-4">🚀 Learning Workflow</div>

  <h2 className="text-4xl md:text-5xl font-bold text-green-primary mb-6">
    How <span className="text-gold">Shiksha Hub Works</span>
  </h2>

  <p className="text-gray-600 text-lg leading-relaxed mb-8">Upload your content, let AI analyze it, generate learning resources, and track your progress—all in one seamless workflow.</p>

  <div className="space-y-6 mb-8">
    {[
      {
        icon: FileText,
        title: 'Upload Content',
        desc: 'Upload notes, PDFs, textbooks, or questions.',
      },
      {
        icon: Zap,
        title: 'AI Processing',
        desc: 'Shiksha Hub understands concepts and learning needs.',
      },
      {
        icon: Share2,
        title: 'Generate Resources',
        desc: 'Get notes, quizzes, explanations, and tests instantly.',
      },
    ].map((item, i) => {
      const Icon = item.icon
      return (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.1 }}
          className="flex gap-4"
        >
          <div className="w-12 h-12 bg-gold/10 rounded-lg flex items-center justify-center flex-shrink-0">
            <Icon className="text-gold" size={24} />
          </div>

          <div>
            <h4 className="font-semibold text-text">
              {item.title}
            </h4>

            <p className="text-gray-600">
              {item.desc}
            </p>
          </div>
        </motion.div>
      )
    })}
  </div>

  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    className="btn-secondary text-lg px-8 py-4"
  >
    Start Learning
  </motion.button>
</motion.div>
        </div>
      </div>
    </section>
  )
}
