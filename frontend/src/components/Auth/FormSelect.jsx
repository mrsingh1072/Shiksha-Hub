import { motion } from 'framer-motion'

export default function FormSelect({
  label,
  name,
  value,
  onChange,
  error,
  placeholder,
  disabled = false,
  helperText,
  required = true,
  options = [],
  icon: Icon,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="relative">
        {Icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            <Icon size={20} />
          </div>
        )}
        <select
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`w-full ${Icon ? 'pl-12' : 'px-4'} py-3 rounded-lg border-2 transition-all duration-300 bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-green-primary/50 disabled:opacity-60 disabled:cursor-not-allowed appearance-none ${
            error
              ? 'border-red-500 focus:border-red-500'
              : 'border-white/80 hover:border-green-primary/30 focus:border-green-primary'
          }`}
        >
          <option value="">{placeholder}</option>
          {options.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </div>
      </div>
      {error && <p className="text-red-500 text-xs mt-1 font-semibold">{error}</p>}
      {helperText && !error && (
        <p className="text-gray-500 text-xs mt-1">{helperText}</p>
      )}
    </motion.div>
  )
}
