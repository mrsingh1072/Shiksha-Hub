import { motion } from 'framer-motion'
import { CheckCircle2, Target, Clock } from 'lucide-react'

export default function ExamGenerator() {
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
            <div className="inline-block px-4 py-2 bg-green-secondary/20 rounded-full text-green-secondary font-semibold text-sm mb-4">
              📝 AI Exam Generator
            </div>
            <h2 className="text-4xl md:text-[52px] font-bold text-green-primary mb-6">
              Create Personalized <span className="gradient-text">Practice Exams</span>
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed mb-8">
              Generate unlimited, unique practice exams tailored to your curriculum. Get instant feedback and targeted learning recommendations.
            </p>

            <div className="space-y-6 mb-8">
              {[
  {
    icon: Target,
    title: 'Smart Question Selection',
    desc: 'AI generates relevant questions based on your learning needs.',
  },
  {
    icon: CheckCircle2,
    title: 'Instant Feedback',
    desc: 'Understand mistakes immediately with detailed explanations.',
  },
  {
    icon: Clock,
    title: 'Timed Mock Exams',
    desc: 'Build confidence with realistic exam simulations.',
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
                    <div className="w-12 h-12 bg-green-secondary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon className="text-green-secondary" size={24} />
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
              Generate Exam
            </motion.button>
          </motion.div>

          {/* Right Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 p-8">
    
          <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-green-primary">
          AI Exam Generator</h3>

           <span className="px-3 py-1 bg-green-primary/10 text-green-primary rounded-full text-sm font-medium">Exam Ready</span>
          </div>

    <div className="space-y-4">
      <div className="flex justify-between">
        <span className="text-gray-600">Subject</span>
        <span className="font-semibold">DSA Fundamentals</span>
      </div>

      <div className="flex justify-between">
        <span className="text-gray-600">Difficulty</span>
        <span className="font-semibold">Medium</span>
      </div>

      <div className="flex justify-between">
        <span className="text-gray-600">Questions</span>
        <span className="font-semibold">25</span>
      </div>

      <div className="flex justify-between">
        <span className="text-gray-600">Duration</span>
        <span className="font-semibold">30 mins</span>
      </div>
    </div>
    {/* Tags */}
<div className="flex gap-2 mt-5">
  <span className="px-2 py-1 bg-green-primary/10 text-green-primary rounded-full text-[11px] font-medium">
    MCQ
  </span>

  <span className="px-2 py-1 bg-green-primary/10 text-green-primary rounded-full text-[11px] font-medium">
    Coding
  </span>

  <span className="px-2 py-1 bg-green-primary/10 text-green-primary rounded-full text-[11px] font-medium">
    Short Answer
  </span>
</div>

{/* Progress */}
<div className="mt-5">
  <div className="flex justify-between text-sm mb-2">
    <span className="text-gray-600">✅ Generation Status</span>
    <span className="font-medium text-green-primary">100%</span>
  </div>

  <div className="w-full h-2 bg-gray-200 rounded-full">
    <div className="h-2 bg-green-primary rounded-full w-full"></div>
  </div>
</div>

    <div className="my-6 border-t border-gray-200"></div>

    <div className="space-y-3">
      <div className="flex justify-between bg-green-primary/5 rounded-lg p-3">
        <span>MCQs</span>
        <span className="font-bold">15</span>
      </div>

      <div className="flex justify-between bg-green-primary/5 rounded-lg p-3">
        <span>Short Answers</span>
        <span className="font-bold">5</span>
      </div>

      <div className="flex justify-between bg-green-primary/5 rounded-lg p-3">
        <span>Coding Questions</span>
        <span className="font-bold">5</span>
      </div>
    </div>

    <button className="w-full mt-6 bg-green-primary text-white py-3 rounded-xl font-semibold hover:opacity-90 transition">
  Generate Exam
</button>
  </div>
</motion.div>
        </div>
      </div>
    </section>
  )
}
