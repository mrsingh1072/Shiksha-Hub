import { motion } from 'framer-motion'
import { Mail, Linkedin, Twitter, Github } from 'lucide-react'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  const footerLinks = {
    Product: [
      { name: 'Features', href: '#features' },
      { name: 'Pricing', href: '#pricing' },
      { name: 'FAQ', href: '#faq' },
    ],
    Company: [
      { name: 'Students', href: '#students' },
      { name: 'Teachers', href: '#teachers' },
    ],
    Legal: [
      { name: 'Privacy', href: '#' },
      { name: 'Terms', href: '#' },
      { name: 'Cookie Policy', href: '#' },
    ],
  }

  const socialLinks = [
    {
      icon: Twitter,
      label: 'Twitter',
      href: 'https://x.com/Mrsingh1072',
    },
    {
      icon: Linkedin,
      label: 'LinkedIn',
      href: 'https://www.linkedin.com/in/saurabh-singh-959b48323/',
    },
    {
      icon: Github,
      label: 'GitHub',
      href: 'https://github.com/mrsingh1072',
    },
    {
      icon: Mail,
      label: 'Email',
      href: 'mailto:saurabhkumar08843@gmail.com',
    },
  ]

  return (
    <footer className="bg-dark text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Main Footer */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">

          {/* Brand */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-gold to-yellow-600 rounded-xl flex items-center justify-center">
                <span className="text-dark font-bold text-xl">E</span>
              </div>

              <span className="text-2xl font-bold">
                Shiksha Hub
              </span>
            </div>

            <p className="text-white/60 text-sm leading-relaxed max-w-xs">
              AI-powered platform for smarter learning,
              assessments, and academic growth.
            </p>
          </motion.div>

          {/* Footer Links */}
          {Object.entries(footerLinks).map(([title, links], idx) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
            >
              <h4 className="font-semibold text-white mb-4">
                {title}
              </h4>

              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      className="text-white/60 hover:text-gold transition-colors duration-200"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Divider */}
        <div className="border-t border-white/10 mb-8" />

        {/* Bottom Footer */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-white/60 text-sm"
          >
            © {currentYear} Shiksha Hub. All rights reserved.
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="flex items-center gap-5"
          >
            {socialLinks.map((social) => {
              const Icon = social.icon

              return (
                <motion.a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  title={social.label}
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.95 }}
                  className="text-white/60 hover:text-gold transition-colors duration-200"
                >
                  <Icon size={22} />
                </motion.a>
              )
            })}
          </motion.div>
        </div>

      </div>
    </footer>
  )
}