import { motion } from 'framer-motion'

export default function TrustedBy() {
  const users = [
    {
      title: '👨‍🎓 Students',
      description:
        'Learn faster with AI tutoring, smart notes, and personalized practice exams.',
    },
    {
      title: '👩‍🏫 Teachers',
      description:
        'Create assessments, evaluate assignments, and save hours of manual work.',
    },
    {
      title: '📊 Track Progress',
      description:
        'Monitor learning performance with powerful insights and analytics.',
    },
    {
      title: '🤝 Learn Together',
      description:
        'Connect students and educators through one intelligent learning platform.',
    },
  ]

  return (
    <section
      className="section relative overflow-hidden bg-cover bg-top bg-no-repeat"
      style={{
        backgroundImage: "url('/images/education.jpg')",
      }}
    >
      {/* White Overlay */}
      <div className="absolute inset-0 bg-white/70"></div>

      <div className="section-container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <h2 className="text-3xl md:text-5xl font-bold text-text mb-4">
            Built for{' '}
            <span className="gradient-text">
              Students and Teachers
            </span>
          </h2>

          <p className="text-gray-600 text-lg max-w-3xl mx-auto">
            Everything needed for modern learning and teaching — from doubt
            solving and notes generation to assessments, evaluation, and
            academic progress tracking.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {users.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              whileHover={{
                y: -10,
                scale: 1.04,
              }}
              className="bg-white/80 backdrop-blur-md rounded-2xl p-6 text-center shadow-md hover:shadow-2xl transition-all border border-white/50"
            >
              <h3 className="text-2xl font-bold mb-4">
                {item.title}
              </h3>

              <p className="text-gray-600 leading-relaxed">
                {item.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}