import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import api from '../services/api'

export default function Dashboard() {
  const [stats, setStats] = useState({
    users: 0,
    exams: 0,
    submissions: 0,
    success_rate: 92,
    overview: {
      ai_tutor: 0,
      notes: 0,
      practice_exams: 0,
      assignments_reviewed: 0
    }
  });

  useEffect(() => {
    api.get('/api/public/stats')
      .then(res => setStats(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <section className="section bg-gradient-to-br from-green-primary via-green-primary to-green-secondary text-white">
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Unified <span className="text-green-accent">Learning Dashboard</span>
          </h2>
          <p className="text-white/80 text-base max-w-2xl mx-auto">
            Monitor learning progress, assessments, assignments, and classroom insights from one intelligent dashboard.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6 md:p-8 shadow-2xl overflow-hidden"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8">
            {[
              { label: 'Active Learners', value: `${stats.users}+` },
              { label: 'Tests Generated', value: `${stats.exams}+` },
              { label: 'Assignments Evaluated', value: `${stats.submissions}+` },
              { label: 'Success Rate', value: `${stats.success_rate}%` },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 text-center"
              >
                <p className="text-white/60 text-sm mb-2">{stat.label}</p>
                <p className="text-xl md:text-3xl font-bold text-white">{stat.value}</p>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Learning Progress */}
            <motion.div
  initial={{ opacity: 0, x: -30 }}
  whileInView={{ opacity: 1, x: 0 }}
  transition={{ delay: 0.2 }}
  className="bg-white/5 backdrop-blur-md border border-white/20 rounded-2xl p-4"
>
  <p className="text-white font-semibold mb-6">
    Platform Overview
  </p>

  <div className="grid grid-cols-2 gap-4">
    {[
      { label: 'AI Tutor Sessions', value: stats.overview.ai_tutor },
      { label: 'Notes Generated', value: stats.overview.notes },
      { label: 'Assignments Reviewed', value: stats.overview.assignments_reviewed },
      { label: 'Practice Exams', value: stats.overview.practice_exams },
    ].map((item, i) => (
      <motion.div
        key={i}
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 + i * 0.1 }}
        className="bg-white/10 border border-white/10 rounded-xl p-3"
      >
        <p className="text-white/70 text-sm mb-2">
          {item.label}
        </p>

        <p className="text-2xl font-bold text-gold">
          {item.value}
        </p>
      </motion.div>
    ))}
  </div>
</motion.div>

            {/* Feature Engagement */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/5 backdrop-blur-md border border-white/20 rounded-2xl p-4"
            >
              <p className="text-white font-semibold mb-6">Feature Engagement</p>
              <div className="space-y-4">
                {[
                  { subject: 'AI Tutor', score: 94 },
                  { subject: 'Practice Exams', score: 88 },
                  { subject: 'Assignment Review', score: 91 },
                  { subject: 'Smart Notes', score: 87 },
                  { subject: 'Learning Analytics', score: 89 },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <p className="text-white/60 w-24 text-sm">{item.subject}</p>
                    <div className="flex-1 bg-white/10 rounded-full h-2">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${item.score}%` }}
                        transition={{ delay: 0.5 + i * 0.05 }}
                        className="h-2 rounded-full bg-gradient-to-r from-[#6B8E23] to-[#D6E685]"
                      />
                    </div>
                    <p className="text-gold text-sm font-semibold w-8 text-right">{item.score}%</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
