import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function CTA() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.3 },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  }

  return (
    <section className="bg-gradient-to-b from-green-primary to-green-secondary text-white overflow-hidden py-16 md:py-20">
      <div className="section-container">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-center"
        >
          <motion.h2
            variants={itemVariants}
            className="text-4xl md:text-5xl font-bold mb-4 leading-tight"
          >
            Ready to Transform Your <span className="text-gold">Learning Journey?</span>
          </motion.h2>

          <motion.p
            variants={itemVariants}
            className="text-xl text-white/90 mb-6 max-w-xl mx-auto leading-relaxed"
          >
            Join thousands of students and teachers using Shiksha Hub to achieve academic excellence. Start for free today.
          </motion.p>

          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8"
          >
            <Link to="/register">
  <motion.button
    whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}
    whileTap={{ scale: 0.95 }}
    className="bg-gold text-dark font-bold py-3 px-7 rounded-lg text-lg flex items-center gap-2 hover:bg-yellow-500 transition-colors"
  >
    Create Free Account <ArrowRight size={20} />
  </motion.button>
</Link>
<Link to="/login">
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    className="bg-white/20 border-2 border-white text-white font-bold py-3 px-7 rounded-lg text-lg backdrop-blur-md hover:bg-white/30 transition-all"
  >
    Sign In
  </motion.button>
</Link>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white/20 border-2 border-white text-white font-bold py-3 px-7 rounded-lg text-lg backdrop-blur-md hover:bg-white/30 transition-all"
            >
              Schedule Demo
            </motion.button>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="flex flex-wrap justify-center gap-5 md:gap-8 text-center"
          >
            {[
              { icon: '✓', text: 'No Credit Card Required' },
              { icon: '✓', text: '7-Day Free Trial' },
              { icon: '✓', text: 'Cancel Anytime' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-xl">{item.icon}</span>
                <span className="text-white/90">{item.text}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
