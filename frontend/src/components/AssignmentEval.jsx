import { motion } from 'framer-motion'
import { PenTool, TrendingUp, MessageCircle } from 'lucide-react'

export default function AssignmentEval() {
  return (
    <section className="section bg-gradient-to-b from-white to-cream">
      <div className="section-container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Right Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="order-2 lg:order-1"
          >
            <div
  className="rounded-3xl shadow-2xl p-8 border border-gray-200 bg-cover bg-center relative overflow-hidden"
  style={{
    backgroundImage: "url('/images/assignment-bg.jpeg')",
  }}
>
  <div className="absolute inset-0 bg-white/85"></div>

  <div className="relative z-10">
              <div className="space-y-6">
                <div className="flex justify-between items-center pb-4 border-b">
                  <p className="font-semibold text-text">Assignment Score</p>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-green-primary">87</p>
                    <p className="text-xs text-gray-500">Overall Score</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between mb-2">
                    <p className="text-sm font-semibold text-text">Grammar</p>
                    <p className="text-sm text-gold">92%</p>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-gold h-2 rounded-full" style={{ width: '92%' }} />
                  </div>
                </div>
                <div className="space-y-3">
  <div className="flex justify-between mb-2">
    <p className="text-sm font-semibold text-text">Structure</p>
    <p className="text-sm text-gold">89%</p>
  </div>
  <div className="w-full bg-gray-200 rounded-full h-2">
    <div
      className="bg-gold h-2 rounded-full"
      style={{ width: '89%' }}
    />
  </div>
</div>
              </div>
            </div>
            </div>
          </motion.div>

          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="order-1 lg:order-2"
          >
            <div className="inline-block px-4 py-2 bg-gold/20 rounded-full text-gold font-semibold text-sm mb-4">
              ✍️ Assignment Evaluation
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-green-primary mb-6">
              AI-Powered <span className="gradient-text">Assignment Grading</span>
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed mb-8">
              Get instant, detailed evaluations of your assignments with personalized feedback on grammar, content, structure, and more.
            </p>

            <div className="space-y-6 mb-8">
              {[
                { icon: PenTool, title: 'Instant Grading', desc: 'Get assignment scores within seconds.' },
                { icon: TrendingUp, title: 'Improvement Tips', desc: 'Identify strengths and improvement areas.' },
                { icon: MessageCircle, title: 'Detailed Feedback', desc: 'Receive section-wise comments and suggestions.' },
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
              className="btn-secondary text-lg px-8 py-4"
            >
              Evaluate Assignmen
            </motion.button>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
