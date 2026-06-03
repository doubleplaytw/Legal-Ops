import { useState } from 'react'
import { CASE_TYPE_COLORS } from '../../constants/caseTypes'

const V = 200          // viewBox width & height (square)
const CX = V / 2       // 100
const CY = V / 2       // 100
const OUTER_R = 88
const INNER_R = Math.round(OUTER_R * 0.58)
const PAD = (3 * Math.PI) / 180

function polar(cx, cy, r, a) {
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) }
}

function arcPath(cx, cy, ri, ro, a0, a1) {
  const a = polar(cx, cy, ro, a0)
  const b = polar(cx, cy, ro, a1)
  const c = polar(cx, cy, ri, a1)
  const d = polar(cx, cy, ri, a0)
  const lg = a1 - a0 > Math.PI ? 1 : 0
  return `M ${a.x} ${a.y} A ${ro} ${ro} 0 ${lg} 1 ${b.x} ${b.y} L ${c.x} ${c.y} A ${ri} ${ri} 0 ${lg} 0 ${d.x} ${d.y} Z`
}

export default function CasePieChart({
  data,
  colors = CASE_TYPE_COLORS,
  valueKey = 'count',
  centerText,
  renderTooltip,
}) {
  const [activeIndex, setActiveIndex] = useState(null)
  const [tipPos, setTipPos] = useState({ x: 0, y: 0, isLeft: true })

  const total = data.reduce((s, d) => s + (d[valueKey] || 0), 0)

  let angle = -Math.PI / 2
  const slices = total === 0 ? [] : data.map((d, i) => {
    const val = d[valueKey] || 0
    const span = (val / total) * 2 * Math.PI
    const path = arcPath(CX, CY, INNER_R, OUTER_R, angle + PAD / 2, angle + span - PAD / 2)
    angle += span
    return { path, fill: colors[i % colors.length], index: i }
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
    <div
      className="flex-1 min-h-0 relative w-full"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setActiveIndex(null)}
    >
      {/* SVG fills container; square viewBox + xMidYMid meet keeps donut centred */}
      <svg
        viewBox={`0 0 ${V} ${V}`}
        width="100%"
        height="100%"
        style={{ display: 'block' }}
      >
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

      {/* Centre label — inset-0 covers same box as SVG, so justify-center lands on donut hole */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        {centerText ?? (
          <div className="flex items-baseline gap-0.5">
            <span className="text-3xl font-bold text-[#1E3480] leading-none">{total}</span>
            <span className="text-sm text-gray-500">件</span>
          </div>
        )}
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
          {renderTooltip
            ? renderTooltip(activeItem, total)
            : <p className="text-sm text-gray-500 mt-0.5 whitespace-nowrap">{activeItem[valueKey]} 件</p>
          }
        </div>
      )}
    </div>
  )
}
