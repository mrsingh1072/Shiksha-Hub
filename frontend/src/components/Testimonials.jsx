import { motion } from 'framer-motion'
import { Star } from 'lucide-react'

export default function Testimonials({ feedbacks = [] }) {
  const latestFeedbacks = feedbacks.slice(0, 3)

  return (
    <section className="section bg-white">
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-green-primary mb-4">
            Latest <span className="gradient-text">Community Feedback</span>
          </h2>

          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Real feedback shared by students and teachers using Shiksha Hub.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {latestFeedbacks.map((feedback) => (
            <motion.div
              key={feedback._id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ y: -5 }}
              className="card p-6 border border-gray-100"
            >
              <div className="flex gap-1 mb-4">
                {[...Array(feedback.rating || 5)].map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    fill="#D4A017"
                    stroke="#D4A017"
                  />
                ))}
              </div>

              <p className="text-gray-700 leading-relaxed mb-5 italic">
                "{feedback.message}"
              </p>

              <div className="pt-4 border-t">
                <h4 className="font-semibold text-text">
                  {feedback.name}
                </h4>

                <p className="text-sm text-gray-500">
                  {feedback.role}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {latestFeedbacks.length === 0 && (
          <div className="text-center py-10">
            <p className="text-gray-500">
              No feedback available yet.
            </p>
          </div>
        )}
      </div>
    </section>
  )
}