export default function LossReasonBar({ title, reasons }) {
  return (
    <div className="pt-3 mt-3 border-t border-gray-100">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">{title}</p>
      <div className="flex flex-col gap-1.5">
        {reasons.map(({ label, pct }) => (
          <div key={label} className="flex items-center gap-2">
            <span className="text-xs text-gray-500 w-16 shrink-0">{label}</span>
            <div className="flex-1 bg-gray-100 rounded-full h-1.5">
              <div
                className="bg-[#1E3480] h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="text-xs font-semibold text-gray-500 w-7 text-right">{pct}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}
