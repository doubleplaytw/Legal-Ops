import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { CASE_TYPE_COLORS } from '../../constants/caseTypes'

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const { name, value } = payload[0]
  return (
    <div className="bg-white border border-gray-100 rounded-xl px-4 py-2.5 shadow-lg text-sm">
      <p className="font-semibold text-[#1E3480]">{name}</p>
      <p className="text-gray-500 mt-0.5">{value} 件</p>
    </div>
  )
}

function CustomLegend({ payload }) {
  return (
    <ul className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 mt-2">
      {payload.map((entry, i) => (
        <li key={i} className="flex items-center gap-1.5 text-xs text-gray-600">
          <span
            className="inline-block w-2.5 h-2.5 rounded-sm flex-shrink-0"
            style={{ backgroundColor: entry.color }}
          />
          {entry.value}
        </li>
      ))}
    </ul>
  )
}

export default function CasePieChart({ data, chartHeight = 180 }) {
  const total = data.reduce((sum, d) => sum + d.count, 0)
  const outerRadius = Math.min(80, Math.floor((chartHeight - 10) / 2))
  const innerRadius = Math.round(outerRadius * 0.625)

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-full" style={{ height: chartHeight }}>
        <ResponsiveContainer width="100%" height={chartHeight}>
          <PieChart>
            <Pie
              data={data}
              dataKey="count"
              nameKey="type"
              cx="50%"
              cy="50%"
              innerRadius={innerRadius}
              outerRadius={outerRadius}
              paddingAngle={3}
              strokeWidth={0}
            >
              {data.map((_, i) => (
                <Cell key={i} fill={CASE_TYPE_COLORS[i % CASE_TYPE_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl font-bold text-[#1E3480] leading-none">{total}</span>
          <span className="text-xs text-gray-400 mt-0.5">件</span>
        </div>
      </div>

      <ul className="flex flex-wrap justify-center gap-x-3 gap-y-1.5">
        {data.map((entry, i) => (
          <li key={i} className="flex items-center gap-1.5 text-xs text-gray-600">
            <span
              className="inline-block w-2.5 h-2.5 rounded-sm flex-shrink-0"
              style={{ backgroundColor: CASE_TYPE_COLORS[i % CASE_TYPE_COLORS.length] }}
            />
            {entry.type}
          </li>
        ))}
      </ul>
    </div>
  )
}
