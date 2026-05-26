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

export default function CasePieChart({ data }) {
  const total = data.reduce((sum, d) => sum + d.count, 0)

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex items-baseline gap-1">
        <span className="text-4xl font-bold text-[#1E3480]">{total}</span>
        <span className="text-sm text-gray-400">件</span>
      </div>

      <ResponsiveContainer width="100%" height={180}>
        <PieChart>
          <Pie
            data={data}
            dataKey="count"
            nameKey="type"
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={80}
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

      {/* Legend 獨立在圖表下方，不讓 Recharts 佔用圖表空間 */}
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
