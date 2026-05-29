export default function DateRangePicker({ from, to, onChange }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm">
      <input
        type="date"
        value={from}
        onChange={(e) => onChange({ from: e.target.value, to })}
        className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-gray-700 text-xs focus:outline-none focus:ring-2 focus:ring-[#1E3480]/20 focus:border-[#1E3480]"
      />
      <span className="hidden sm:block text-gray-300 text-xs shrink-0">—</span>
      <input
        type="date"
        value={to}
        onChange={(e) => onChange({ from, to: e.target.value })}
        className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-gray-700 text-xs focus:outline-none focus:ring-2 focus:ring-[#1E3480]/20 focus:border-[#1E3480]"
      />
    </div>
  )
}
