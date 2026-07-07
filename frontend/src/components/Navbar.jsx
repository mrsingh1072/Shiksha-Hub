import { useState } from 'react'
import { motion } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { Link } from "react-router-dom";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)

  const navLinks = [
    { label: 'Features', href: '#features' },
    { label: 'For Students', href: '#students' },
    { label: 'For Teachers', href: '#teachers' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'FAQ', href: '#faq' },
  ]

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200/30"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-2 cursor-pointer"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-green-primary to-green-secondary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">E</span>
            </div>
            <span className="text-xl font-bold text-green-primary hidden sm:inline">Shiksha Hub</span>
          </motion.div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <motion.a
                key={link.label}
                href={link.href}
                whileHover={{ color: '#D4A017' }}
                className="text-text font-medium transition-colors"
              >
                {link.label}
              </motion.a>
            ))}
          </div>

          {/* CTA Buttons */}
          {/* CTA Buttons */}
<div className="hidden md:flex items-center gap-4">

  <Link to="/login">
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="btn-outline"
    >
      Sign In
    </motion.button>
  </Link>

  <Link to="/register">
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="btn-primary"
    >
      Get Started
    </motion.button>
  </Link>

</div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-text"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-gray-200/30 bg-white/50"
          >
            <div className="px-4 py-4 space-y-3">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="block text-text font-medium py-2 hover:text-gold transition-colors"
                >
                  {link.label}
                </a>
              ))}
              <div className="flex flex-col gap-3 pt-4 border-t">

  <Link
    to="/login"
    className="btn-outline w-full text-center"
  >
    Sign In
  </Link>

  <Link
    to="/register"
    className="btn-primary w-full text-center"
  >
    Get Started
  </Link>

</div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.nav>
  )
}
