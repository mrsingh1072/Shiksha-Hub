export function ProgressRing({ value, label }) {
  const radius = 48
  const circumference = 2 * Math.PI * radius
  const dashOffset = circumference - (value / 100) * circumference

  return (
    <div className="flex items-center gap-4">
      <div className="relative h-32 w-32 shrink-0">
        <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
          <circle cx="60" cy="60" r={radius} fill="none" stroke="#E9E4D7" strokeWidth="12" />
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke="#2F5D50"
            strokeLinecap="round"
            strokeWidth="12"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-3xl font-bold text-green-primary">{value}%</span>
        </div>
      </div>
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-gold">{label}</p>
        <p className="mt-2 text-sm text-gray-600">Based on assignments, practice performance, tutor usage, and recent academic activity.</p>
      </div>
    </div>
  )
}

export function LearningTrendChart({ data }) {
  const max = Math.max(...data.map((item) => item.value), 1)

  return (
    <div className="h-52 w-full">
      <div className="flex h-44 items-end gap-3 rounded-xl bg-cream/70 p-4">
        {data.map((item) => (
          <div key={item.label} className="flex h-full flex-1 flex-col justify-end gap-2">
            <div
              className="min-h-4 rounded-t-lg bg-gradient-to-t from-green-primary to-green-secondary shadow-sm transition-all duration-500"
              style={{ height: `${Math.max(12, (item.value / max) * 100)}%` }}
              title={`${item.label}: ${item.value}`}
            />
          </div>
        ))}
      </div>
      <div className="mt-2 grid grid-cols-6 text-center text-xs font-semibold text-gray-500">
        {data.map((item) => (
          <span key={item.label}>{item.label}</span>
        ))}
      </div>
    </div>
  )
}
