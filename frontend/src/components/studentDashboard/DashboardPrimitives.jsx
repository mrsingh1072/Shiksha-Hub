import { motion } from 'framer-motion'

export function DashboardCard({ children, className = '', delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay }}
      className={`rounded-[1.25rem] border border-green-primary/10 bg-white/95 p-4 shadow-[0_18px_50px_-30px_rgba(22,101,52,0.45)] backdrop-blur ${className}`}
    >
      {children}
    </motion.div>
  )
}

export function SectionHeader({ eyebrow, title, action }) {
  return (
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold">{eyebrow}</p>}
        <h2 className="mt-1 text-xl font-bold tracking-tight text-text sm:text-2xl">{title}</h2>
      </div>
      {action}
    </div>
  )
}

export function EmptyState({ icon: Icon, title, message }) {
  return (
    <div className="flex min-h-[148px] flex-col items-center justify-center rounded-2xl border border-dashed border-green-primary/20 bg-cream/60 p-6 text-center">
      {Icon && <Icon className="mb-3 h-8 w-8 text-green-primary" />}
      <p className="font-bold text-text">{title}</p>
      <p className="mt-1 max-w-sm text-sm text-gray-500">{message}</p>
    </div>
  )
}

export function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-cream px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-[17rem_1fr]">
        <div className="hidden rounded-[1.25rem] bg-white/70 p-5 lg:block">
          <div className="h-10 w-32 animate-pulse rounded-lg bg-green-primary/10" />
          <div className="mt-8 space-y-3">
            {[...Array(8)].map((_, index) => (
              <div key={index} className="h-10 animate-pulse rounded-lg bg-green-primary/10" />
            ))}
          </div>
        </div>
        <div className="space-y-5">
          <div className="h-52 animate-pulse rounded-[1.25rem] bg-white/80" />
          <div className="grid gap-5 md:grid-cols-3">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="h-32 animate-pulse rounded-[1.25rem] bg-white/80" />
            ))}
          </div>
          <div className="h-72 animate-pulse rounded-[1.25rem] bg-white/80" />
        </div>
      </div>
    </div>
  )
}
