import { useState } from 'react'
import { CASE_TYPE_COLORS } from '../../constants/caseTypes'

const VIEWBOX_W = 200

function polar(cx, cy, r, angle) {
  return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) }
}

function arcPath(cx, cy, innerR, outerR, startAngle, endAngle) {
  const a = polar(cx, cy, outerR, startAngle)
  const b = polar(cx, cy, outerR, endAngle)
  const c = polar(cx, cy, innerR, endAngle)
  const d = polar(cx, cy, innerR, startAngle)
  const large = endAngle - startAngle > Math.PI ? 1 : 0
  return `M ${a.x} ${a.y} A ${outerR} ${outerR} 0 ${large} 1 ${b.x} ${b.y} L ${c.x} ${c.y} A ${innerR} ${innerR} 0 ${large} 0 ${d.x} ${d.y} Z`
}

export default function CasePieChart({ data, chartHeight = 180 }) {
  const [activeIndex, setActiveIndex] = useState(null)
  const [tipPos, setTipPos] = useState({ x: 0, y: 0, isLeft: true })

  const total = data.reduce((s, d) => s + d.count, 0)
  const cx = VIEWBOX_W / 2
  const cy = chartHeight / 2
  const outerR = Math.min(VIEWBOX_W * 0.42, (chartHeight - 10) / 2)
  const innerR = Math.round(outerR * 0.625)
  const pad = (3 * Math.PI) / 180

  let angle = -Math.PI / 2
  const slices = total === 0 ? [] : data.map((d, i) => {
    const span = (d.count / total) * 2 * Math.PI
    const path = arcPath(cx, cy, innerR, outerR, angle + pad / 2, angle + span - pad / 2)
    angle += span
    return { path, fill: CASE_TYPE_COLORS[i % CASE_TYPE_COLORS.length], index: i }
  })

  const activeItem = activeIndex !== null ? data[activeIndex] : null

  function handleMouseMove(e) {
    const rect = e.currentTarget.getBoundingClientRect()
    setTipPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      isLeft: e.clientX - rect.left < rect.width / 2,
    })
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className="relative w-full"
        style={{ height: chartHeight }}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setActiveIndex(null)}
      >
        <svg viewBox={`0 0 ${VIEWBOX_W} ${chartHeight}`} width="100%" height={chartHeight} style={{ display: 'block' }}>
          {slices.map((s) => (
            <path
              key={s.index}
              d={s.path}
              fill={s.fill}
              opacity={activeIndex === null || activeIndex === s.index ? 1 : 0.4}
              style={{ cursor: 'pointer', transition: 'opacity 0.15s' }}
              onMouseEnter={() => setActiveIndex(s.index)}
            />
          ))}
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl font-bold text-[#1E3480] leading-none">{total}</span>
          <span className="text-sm text-gray-500 mt-0.5">件</span>
        </div>

        {activeItem && (
          <div
            className="absolute bg-white border border-gray-100 rounded-xl px-3 py-2 shadow-lg pointer-events-none z-10"
            style={{
              top: tipPos.y,
              left: tipPos.x,
              transform: tipPos.isLeft
                ? 'translateX(calc(-100% - 10px)) translateY(-50%)'
                : 'translateX(10px) translateY(-50%)',
            }}
          >
            <p className="text-sm font-semibold text-[#1E3480] whitespace-nowrap">{activeItem.type}</p>
            <p className="text-sm text-gray-500 mt-0.5 whitespace-nowrap">{activeItem.count} 件</p>
          </div>
        )}
      </div>

      <ul className="flex flex-wrap justify-center gap-x-3 gap-y-1.5">
        {data.map((entry, i) => (
          <li key={i} className="flex items-center gap-1.5 text-sm text-gray-600">
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
