import { Link } from 'react-router-dom'

const NAVBAR_H = 'h-[72px]'
const NAVBAR_OFFSET = 'pt-[72px]'

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-green-50 via-white to-emerald-50">

      {/* Navbar */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 ${NAVBAR_H} flex items-center justify-between px-6 md:px-12 bg-white/80 backdrop-blur-md border-b border-gray-100`}
      >
        <Link
          to="/"
          className="text-2xl font-bold leading-none bg-gradient-to-r from-green-primary to-green-secondary bg-clip-text text-transparent"
        >
          Shiksha Hub
        </Link>

        <Link
          to="/"
          className="text-gray-600 hover:text-green-primary font-semibold transition-colors"
        >
          Back to Home
        </Link>
      </nav>

      {/* Main wrapper */}
      <div className={`${NAVBAR_OFFSET} flex-1 flex items-center justify-center px-4 py-6`}>

        <div className="w-full max-w-7xl bg-white rounded-[32px] shadow-2xl overflow-hidden">

          <div className="grid lg:grid-cols-2 min-h-[680px]">

            {/* LEFT PANEL */}
            <div className="hidden lg:flex flex-col justify-center bg-gradient-to-br from-[#2F5D50] to-[#5A8F2D] text-white p-16">

              <h1 className="text-6xl font-bold mb-6 leading-tight">
                Shiksha Hub
              </h1>

              <p className="text-2xl text-white/90 mb-12">
                Learn Smarter. Study Faster.
              </p>

              <div className="space-y-6 text-xl">
                <div className="flex items-center gap-3">🤖 AI Tutor Assistance</div>
                <div className="flex items-center gap-3">📚 Smart Note Generation</div>
                <div className="flex items-center gap-3">📝 AI Exam Generator</div>
                <div className="flex items-center gap-3">📊 Learning Analytics</div>
              </div>

              <div className="mt-14 bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20">
                <h3 className="text-2xl font-semibold mb-4">
                  Your AI Learning Companion
                </h3>

                <p className="text-white/80 leading-relaxed">
                  Generate notes, practice exams, ask questions, track progress,
                  and learn with AI — all from one platform.
                </p>
              </div>

            </div>

            {/* RIGHT PANEL (CENTER FIXED) */}
            <div className="flex items-center justify-center p-6 lg:p-10">

              <div className="w-full max-w-md transform -translate-y-6">

                {children}

              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  )
}