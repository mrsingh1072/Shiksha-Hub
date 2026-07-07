import { motion } from 'framer-motion'
import { Check } from 'lucide-react'

export default function Pricing() {
  const plans = [
    {
      name: 'Free',
      price: '₹0',
      features: [
        'AI Tutor Access',
        'Smart Notes',
        '5 Practice Exams / Month',
        'Basic Analytics',
      ],
    },
    {
      name: 'Pro',
      price: '₹299',
      featured: true,
      features: [
        'Unlimited Practice Exams',
        'Assignment Evaluation',
        'Advanced Analytics',
        'Smart Notes',
      ],
    },
    {
      name: 'Institution',
      price: 'Custom',
      features: [
        'Teacher Dashboard',
        'Classroom Management',
        'Student Analytics',
        'Unlimited Assessments',
        'Admin Controls',
      ],
    },
  ]

  return (
    <section className="section bg-gradient-to-b from-white to-cream" id="pricing">
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="text-center mb-4"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-green-primary mb-4">
            Simple <span className="gradient-text">Pricing</span>
          </h2>

          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Flexible plans for students, educators, and institutions.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {plans.map((plan, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`rounded-3xl p-6 border transition-all duration-300 ${
                plan.featured
                  ? 'bg-green-primary text-white border-green-primary scale-100 shadow-2xl'
                  : 'bg-white border-gray-200 shadow-lg'
              }`}
            >
              {plan.featured && (
                <div className="inline-block px-4 py-2 rounded-full bg-gold text-white text-sm font-semibold mb-6">
                  Most Popular
                </div>
              )}

              <h3
                className={`text-2xl font-bold mb-2 ${
                  plan.featured ? 'text-white' : 'text-text'
                }`}
              >
                {plan.name}
              </h3>

              <p
                className={`mb-6 ${
                  plan.featured ? 'text-white/80' : 'text-gray-600'
                }`}
              >
                {plan.description}
              </p>

              <div className="mb-8">
                <span
                  className={`text-4xl font-bold ${
                    plan.featured ? 'text-gold' : 'text-green-primary'
                  }`}
                >
                  {plan.price}
                </span>

                {plan.price !== 'Custom' && (
                  <span
                    className={`ml-2 ${
                      plan.featured ? 'text-white/70' : 'text-gray-500'
                    }`}
                  >
                    /month
                  </span>
                )}
              </div>

              <div className="space-y-3 mb-8">
                {plan.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <Check
                      size={18}
                      className={
                        plan.featured
                          ? 'text-gold'
                          : 'text-green-primary'
                      }
                    />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              <button
                className={`w-full py-2.5 rounded-xl font-semibold transition-all ${
                  plan.featured
                    ? 'bg-gold text-white hover:opacity-90'
                    : 'bg-green-primary text-white hover:opacity-90'
                }`}
              >
                Get Started
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}