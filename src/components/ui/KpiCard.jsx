export default function KpiCard({ label, value, unit, sub, accent, trend, amount, amountPrimary, className = '', variant }) {
  const isCritical = variant === 'danger'  && value >= 3
  const isDanger   = variant === 'danger'  && value > 0
  const isWarning  = variant === 'warning' && value > 0

  const barCls   = isCritical ? 'bg-red-500'
    : isDanger   ? 'bg-red-400'
    : isWarning  ? 'bg-orange-400'
    : 'bg-gray-200'

  const valueCls = isDanger  ? 'text-red-500'
    : isWarning  ? 'text-orange-500'
    : accent     ? 'text-[#E8A020]'
    : 'text-[#1E3480]'

  return (
    <div className={`flex rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden ${className}`}>
      <div className={`w-1 shrink-0 ${barCls} ${isCritical ? 'animate-pulse' : ''}`} />
      <div className="flex-1 px-6 py-5 flex flex-col gap-1">
        <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">{label}</p>
        <div className="flex items-baseline gap-1.5 mt-1 flex-wrap">
          {amountPrimary && amount != null ? (
            <>
              <span className={`text-3xl font-bold ${valueCls}`}>NT$ {amount.toLocaleString()}</span>
              <span className="text-sm text-gray-400 ml-1">（{value} {unit}）</span>
            </>
          ) : (
            <>
              <span className={`text-3xl font-bold ${valueCls}`}>{value}</span>
              {unit && <span className="text-base text-gray-500">{unit}</span>}
              {amount != null && (
                <span className="text-sm font-semibold text-gray-600 ml-1">NT$ {amount.toLocaleString()}</span>
              )}
            </>
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
    </div>
  )
}
