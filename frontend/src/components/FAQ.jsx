import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(0)

  const faqs = [
    {
      question: 'How does the AI tutor personalize learning?',
      answer:
        'Our AI analyzes your learning patterns, strengths, weaknesses, and pace to create a customized learning experience. It adapts explanations and difficulty levels in real-time based on your performance.',
    },
    {
      question: 'Can I use Shiksha Hub for all subjects?',
      answer:
        'Yes! Shiksha Hub supports a wide range of subjects including Mathematics, Physics, Chemistry, Biology, English, History, and more. We continuously add new subjects based on user feedback.',
    },
    {
      question: 'Is my data safe and private?',
      answer:
        'Absolutely. We use industry-standard encryption and comply with GDPR, CCPA, and other privacy regulations. Your data is never sold or shared with third parties.',
    },
    {
      question: 'Can teachers use this for their classes?',
      answer:
        'Yes! Teachers can create classes, assign tasks, monitor student progress, and use AI-powered grading. Our platform is designed to work seamlessly for both individual learners and classroom settings.',
    },
  ]

  return (
    <section className="bg-gradient-to-b from-cream to-white py-12 md:py-16"id="faq">
      <div className="section-container max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-green-primary mb-4">
            Frequently Asked <span className="gradient-text">Questions</span>
          </h2>
          <p className="text-gray-600 text-lg">
            Everything you need to know about Shiksha Hub.
          </p>
        </motion.div>

        <div className="space-y-2">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? -1 : i)}
                className="w-full card p-4 text-left flex justify-between items-center hover:border-gold/30 transition-all"
              >
                <h3 className="text-base font-semibold text-text pr-4">{faq.question}</h3>
                <motion.div
                  animate={{ rotate: openIndex === i ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex-shrink-0"
                >
                  <ChevronDown className="text-green-primary" size={24} />
                </motion.div>
              </button>

              <AnimatePresence>
                {openIndex === i && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white border-x border-b border-gold/20 px-4 py-3"
                  >
                    <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
