export default function KpiCard({ label, value, unit, sub, accent, trend, amount }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-5 flex flex-col gap-1">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
      <div className="flex items-baseline gap-1.5 mt-1">
        <span className={`text-3xl font-bold ${accent ? 'text-[#E8A020]' : 'text-[#1E3480]'}`}>
          {value}
        </span>
        {unit && <span className="text-sm text-gray-400">{unit}</span>}
      </div>
      {amount != null && (
        <p className="text-sm font-semibold text-gray-500">
          NT$ {amount.toLocaleString()}
        </p>
      )}
      <div className="flex items-center justify-between mt-0.5">
        {sub && <p className="text-xs text-gray-400">{sub}</p>}
        {trend && (
          <div className={`flex items-center gap-0.5 text-xs font-semibold ml-auto ${trend.positive ? 'text-emerald-500' : 'text-red-400'}`}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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
