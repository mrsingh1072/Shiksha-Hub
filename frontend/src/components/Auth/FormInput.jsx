export default function FormInput({
  label,
  type = 'text',
  name,
  value,
  onChange,
  error,
  placeholder,
  disabled = false,
  helperText,
  required = true,
  icon: Icon,
}) {
  return (
    <div>
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
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          placeholder={placeholder}
          className={`w-full ${Icon ? 'pl-12' : 'px-4'} py-3 rounded-lg border-2 bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-green-primary/50 disabled:opacity-60 disabled:cursor-not-allowed ${
            error
              ? 'border-red-500 focus:border-red-500'
              : 'border-white/80 hover:border-green-primary/30 focus:border-green-primary'
          }`}
        />
      </div>
      {/* ── Fixed-height slot: prevents layout shift when error/helper appears ── */}
      <div className="h-5 mt-1">
        {error && <p className="text-red-500 text-xs font-semibold">{error}</p>}
        {helperText && !error && <p className="text-gray-500 text-xs">{helperText}</p>}
      </div>
    </div>
  )
}
