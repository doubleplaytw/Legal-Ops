export default function KpiCard({ label, value, unit, sub, accent, trend, amount, className = '', variant }) {
  const hasAlert = variant === 'danger' && value > 0
  const hasWarning = variant === 'warning' && value > 0
  const borderCls = hasAlert ? 'border-red-100' : hasWarning ? 'border-orange-100' : 'border-gray-100'
  const bgCls     = hasAlert ? 'bg-red-50/40'  : hasWarning ? 'bg-orange-50/40'  : 'bg-white'
  const valueCls  = hasAlert ? 'text-red-500'  : hasWarning ? 'text-orange-500'  : accent ? 'text-[#E8A020]' : 'text-[#1E3480]'

  return (
    <div className={`rounded-2xl border shadow-sm px-6 py-5 flex flex-col gap-1 ${bgCls} ${borderCls} ${className}`}>
      <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">{label}</p>
      <div className="flex items-baseline gap-1.5 mt-1 flex-wrap">
        <span className={`text-3xl font-bold ${valueCls}`}>{value}</span>
        {unit && <span className="text-base text-gray-500">{unit}</span>}
        {amount != null && (
          <span className="text-sm font-semibold text-gray-600 ml-1">
            NT$ {amount.toLocaleString()}
          </span>
        )}
      </div>
      <div className="flex items-center justify-between mt-0.5">
        {sub && <p className="text-sm text-gray-500">{sub}</p>}
        {trend && (
          <div className={`flex items-center gap-0.5 text-sm font-semibold ml-auto ${trend.up ? 'text-emerald-500' : 'text-red-400'}`}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              {trend.up
                ? <polyline points="18 15 12 9 6 15" />
                : <polyline points="6 9 12 15 18 9" />}
            </svg>
            {trend.label}
          </div>
        )}
      </div>
    </div>
  )
}
