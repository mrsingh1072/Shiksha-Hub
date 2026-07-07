import { motion } from 'framer-motion'
import { Typewriter } from "react-simple-typewriter";

export default function Hero() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7 },
    },
  }

  const dashboardVariants = {
    hidden: { opacity: 0, x: 40, rotateY: 10 },
    visible: {
      opacity: 1,
      x: 0,
      rotateY: 0,
      transition: { duration: 0.9, ease: 'easeOut' },
    },
  }

  return (
    <section className="relative w-full min-h-screen overflow-hidden pt-24 pb-16">
      {/* Premium Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-cream via-white to-cream" />

      {/* Radial Gradient Spotlight */}
      <div className="absolute inset-0 bg-radial-gradient pointer-events-none" style={{
        background: 'radial-gradient(ellipse 1200px 600px at 50% 50%, rgba(47, 93, 80, 0.08) 0%, transparent 70%)'
      }} />

      {/* Floating Gradient Orbs */}
      <motion.div
        animate={{
          y: [0, 30, 0],
          x: [0, 15, 0]
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
        className="absolute top-20 right-20 w-72 h-72 bg-gradient-to-br from-green-primary/20 to-green-primary/5 rounded-full blur-3xl -z-0"
      />

      <motion.div
        animate={{
          y: [0, -40, 0],
          x: [0, -20, 0]
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 1
        }}
        className="absolute bottom-32 left-10 w-80 h-80 bg-gradient-to-br from-gold/15 to-gold/5 rounded-full blur-3xl -z-0"
      />

      <motion.div
        animate={{
          y: [0, 25, 0],
          x: [0, -25, 0]
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 2
        }}
        className="absolute top-1/2 left-1/4 w-64 h-64 bg-gradient-to-br from-green-secondary/10 to-transparent rounded-full blur-3xl -z-0"
      />

      {/* Subtle Particle Dots */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, Math.random() * 100 - 50, 0],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{
              duration: 8 + Math.random() * 4,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: Math.random() * 2
            }}
            className="absolute w-1 h-1 bg-green-primary/40 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      {/* Soft Spotlight Glow Behind Card */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.6, 0.8, 0.6]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
          className="absolute top-1/3 right-1/4 w-96 h-96 bg-gradient-radial from-green-primary/20 to-transparent rounded-full blur-3xl"
          style={{
            background: 'radial-gradient(circle, rgba(47, 93, 80, 0.15) 0%, transparent 70%)'
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center min-h-[calc(100vh-200px)]">
          {/* Left Content */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col justify-center"
          >
            {/* Badge */}
            <motion.div variants={itemVariants} className="mb-6 w-fit">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-primary/10 rounded-full">
                <span className="text-lg">🌍</span>
                <span className="text-green-primary font-semibold text-sm">वसुधैव कुटुम्बकम्</span>
              </div>
            </motion.div>

            {/* Heading */}
            <motion.h1
  variants={itemVariants}
  className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6"
>
  <span className="text-green-primary">
    Study Smarter.
  </span>

  <br />

  <span className="gradient-text">
    <Typewriter
      words={[
        "Generate Notes",
        "Practice Exams",
        "AI Tutor",
        "Evaluate Assignments",
        "Track Progress"
      ]}
      loop={0}
      cursor
      cursorStyle="|"
      typeSpeed={80}
      deleteSpeed={50}
      delaySpeed={2000}
    />
  </span>
</motion.h1>

            {/* Description */}
            <motion.p
              variants={itemVariants}
              className="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed max-w-lg"
            >
              Stop switching between multiple tools.Learn concepts with AI Tutor,generate study notes in seconds,create practice exams, evaluate assignments,and track academic progress from a single platform.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-4 mb-12"
            >
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(47, 93, 80, 0.3)' }}
                whileTap={{ scale: 0.95 }}
                className="btn-primary text-lg px-8 py-4"
              >
                Try AI Tutor
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn-secondary text-lg px-8 py-4"
              >
                Explore Platform
              </motion.button>
            </motion.div>

            {/* Stats */}
            <motion.div
              variants={itemVariants}
              className="grid grid-cols-3 gap-8 pt-8 border-t border-gray-200"
            >
              {[
                { value: 'AI Tutor', label: 'Ask Questions' },
                { value: 'Smart Notes', label: 'Generate Summaries' },
                { value: 'Exam ', label: 'Practice Tests' },
              ].map((stat, i) => (
                <div key={i}>
                  <p className="text-2xl md:text-3xl font-bold text-green-primary">{stat.value}</p>
                  <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right AI Tutor Demo */}
          <motion.div
            variants={dashboardVariants}
            initial="hidden"
            animate="visible"
            className="relative hidden lg:block perspective"
          >
            {/* Floating Card Container */}
            <motion.div
              animate={{
                y: [0, -20, 0],
                x: [0, 5, 0]
              }}
              transition={{
                repeat: Infinity,
                duration: 8,
                ease: 'easeInOut'
              }}
              className="relative"
            >
              {/* Glassmorphic Chat Card */}
              <div className="bg-white/70 backdrop-blur-2xl border border-white/50 rounded-3xl shadow-2xl overflow-hidden">
                {/* Gradient Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-green-primary/10 via-transparent to-gold/10 pointer-events-none" />

                {/* Header */}
                <div className="relative z-10 bg-gradient-to-r from-green-primary/5 to-gold/5 border-b border-white/30 px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-primary to-green-secondary rounded-full flex items-center justify-center text-white font-bold text-sm">
                      AI
                    </div>
                    <div>
                      <p className="font-semibold text-text text-sm">AI Tutor</p>
                      <p className="text-xs text-gray-500">Always Ready to Help</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="w-2 h-2 bg-green-primary rounded-full animate-pulse" />
                    {/*<span className="text-xs text-green-primary font-medium">Live</span>*/}
                  </div>
                </div>

                {/* Chat Messages */}
                <div className="relative z-10 h-72 overflow-y-auto px-6 py-6 space-y-4 bg-gradient-to-b from-white/30 to-white/10">
                  {/* Student Message */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="flex justify-end"
                  >
                    <div className="bg-gradient-to-r from-green-primary to-green-secondary text-white rounded-2xl rounded-tr-none px-4 py-3 max-w-xs shadow-lg">
                      <p className="text-sm leading-relaxed">Explain Binary Search in simple terms.</p>
                    </div>
                  </motion.div>

                  {/* AI Response with Typing Animation */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="flex justify-start"
                  >
                    <div className="bg-white/60 backdrop-blur-md border border-white/40 text-text rounded-2xl rounded-tl-none px-4 py-3 max-w-xs shadow-lg">
                      <p className="text-sm leading-relaxed">
                        Imagine searching a word in a dictionary. Instead of checking every page, you open the middle page and decide whether to go left or right. Binary Search works the same way.
                      </p>
                      {/* Typing Indicator */}
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 3 }}
                        className="flex gap-1 mt-2"
                      >
                        {[0, 1, 2].map((i) => (
                          <motion.span
                            key={i}
                            animate={{ y: [0, -4, 0] }}
                            transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.1 }}
                            className="w-2 h-2 bg-green-primary rounded-full"
                          />
                        ))}
                      </motion.div>
                    </div>
                  </motion.div>
                </div>

                {/* Feature Chips */}
                <div className="relative z-10 bg-white/40 backdrop-blur-md border-t border-white/30 px-6 py-5 space-y-3">
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Powered by AI</p>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { icon: '🤖', label: 'AI Tutor' },
                      { icon: '📝', label: 'Smart Notes' },
                      { icon: '📚', label: 'Exam Gen' },
                      { icon: '✍️', label: 'Evaluation' },
                    ].map((feature, i) => (
                      <motion.div
                        key={i}
                        whileHover={{ scale: 1.05, y: -2 }}
                        className="bg-white/60 backdrop-blur-md border border-white/40 rounded-xl p-3 text-center transition-all hover:shadow-lg"
                      >
                        <p className="text-lg mb-1">{feature.icon}</p>
                        <p className="text-xs font-semibold text-text">{feature.label}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Decorative Corner Elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-gold/20 to-transparent rounded-full blur-2xl -z-10 translate-x-16 -translate-y-16" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-green-primary/10 to-transparent rounded-full blur-2xl -z-10 -translate-x-8 translate-y-8" />
              </div>

              {/* Outer Glow */}
              <motion.div
                animate={{ boxShadow: ['0 0 60px rgba(47, 93, 80, 0.1)', '0 0 80px rgba(47, 93, 80, 0.2)', '0 0 60px rgba(47, 93, 80, 0.1)'] }}
                transition={{ repeat: Infinity, duration: 4 }}
                className="absolute inset-0 rounded-3xl pointer-events-none"
                style={{ margin: '-2px' }}
              />
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 2.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 hidden md:block"
      >
        <div className="w-6 h-10 border-2 border-green-primary rounded-full flex items-start justify-center p-2">
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ repeat: Infinity, duration: 2.5 }}
            className="w-1 h-2 bg-green-primary rounded-full"
          />
        </div>
      </motion.div>
    </section>
  )
}
