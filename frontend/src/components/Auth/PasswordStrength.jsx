const RULES = [
  { id: 'length', label: 'At least 8 characters', test: (value) => value.length >= 8 },
  { id: 'upper', label: 'One uppercase letter', test: (value) => /[A-Z]/.test(value) },
  { id: 'lower', label: 'One lowercase letter', test: (value) => /[a-z]/.test(value) },
  { id: 'number', label: 'One number', test: (value) => /\d/.test(value) },
  { id: 'special', label: 'One special character', test: (value) => /[^A-Za-z0-9]/.test(value) },
]

export function getPasswordStrength(password = '') {
  const checks = RULES.map((rule) => ({
    ...rule,
    passed: rule.test(password),
  }))
  const score = checks.filter((item) => item.passed).length
  const valid = score === checks.length

  let strength = 'weak'
  if (score >= 4) strength = 'medium'
  if (valid) strength = 'strong'

  return { checks, score, valid, strength }
}

const STRENGTH_COLORS = {
  weak: 'bg-red-400',
  medium: 'bg-amber-400',
  strong: 'bg-green-primary',
}

export default function PasswordStrength({ password = '' }) {
  const { checks, score, strength } = getPasswordStrength(password)
  const width = `${(score / checks.length) * 100}%`

  return (
    <div className="space-y-3">
      <div>
        <div className="mb-2 flex items-center justify-between text-xs font-bold uppercase tracking-[0.12em] text-gray-400">
          <span>Password strength</span>
          <span className="capitalize text-text">{strength}</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-gray-100">
          <div className={`h-full transition-all duration-300 ${STRENGTH_COLORS[strength]}`} style={{ width }} />
        </div>
      </div>
      <ul className="grid gap-1 sm:grid-cols-2">
        {checks.map((check) => (
          <li
            key={check.id}
            className={`text-xs font-semibold ${check.passed ? 'text-green-primary' : 'text-gray-400'}`}
          >
            {check.passed ? '✓' : '○'} {check.label}
          </li>
        ))}
      </ul>
    </div>
  )
}

export function validateStrongPassword(password) {
  return getPasswordStrength(password).valid
}
