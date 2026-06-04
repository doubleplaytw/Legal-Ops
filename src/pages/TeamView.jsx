import { useState, useMemo } from 'react'
import HScrollArea from '../components/ui/HScrollArea'
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import { MOCK_LAWYERS } from '../constants/mockData'
import { CASE_TYPES, CASE_TYPE_COLORS } from '../constants/caseTypes'

const SORT_OPTIONS = [
  { value: 'id',       label: '字母 A → L' },
  { value: 'active',   label: '進行中案件（多→少）' },
  { value: 'deadline', label: '到期件數（多→少）' },
  { value: 'billing',  label: '本季計費時數（多→少）' },
  { value: 'newcases',    label: '本月新收案件（多→少）' },
  { value: 'cycle',       label: '平均週期（長→短）' },
  { value: 'receivable',  label: '本季收款目標（多→少）' },
  { value: 'collection',  label: '本季收款率（低→高）' },
]

function sortLawyers(lawyers, key) {
  return [...lawyers].sort((a, b) => {
    if (key === 'id')       return a.id.localeCompare(b.id)
    if (key === 'active')   return b.activeCases - a.activeCases
    if (key === 'deadline') return b.upcomingDeadlines - a.upcomingDeadlines
    if (key === 'billing')  return b.billingHoursQ - a.billingHoursQ
    if (key === 'newcases')   return b.newCasesThisMonth - a.newCasesThisMonth
    if (key === 'cycle')      return b.avgCycleDays - a.avgCycleDays
    if (key === 'receivable') return b.receivableAmount - a.receivableAmount
    if (key === 'collection') {
      const rateA = a.receivableAmount > 0 ? a.receivedAmount / a.receivableAmount : 0
      const rateB = b.receivableAmount > 0 ? b.receivedAmount / b.receivableAmount : 0
      return rateA - rateB
    }
    return 0
  })
}

function MiniDonut({ cases, capacity }) {
  const pct = Math.round((cases / capacity) * 100)
  const data = [{ value: pct }, { value: 100 - pct }]
  const isNearFull = pct >= 80
  const fillColor = isNearFull ? '#E8A020' : '#1E3480'
  return (
    <div className="relative w-16 h-16 mx-auto shrink-0">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="value" cx="50%" cy="50%" innerRadius={20} outerRadius={29} startAngle={90} endAngle={-270} strokeWidth={0}>
            <Cell fill={fillColor} />
            <Cell fill="#F0F2F8" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xs font-bold leading-none" style={{ color: fillColor }}>{cases}</span>
        <span className="text-[9px] text-gray-300 leading-none mt-0.5">/{capacity}</span>
      </div>
    </div>
  )
}

function CaseTypeBars({ caseTypes }) {
  const active = caseTypes.filter((c) => c.count > 0)
  return (
    <div className="flex flex-col">
      <div className="flex items-center pb-1.5 mb-1 border-b border-gray-50">
        <span className="flex-1 text-xs text-gray-300">類型</span>
        <span className="text-xs text-gray-300 w-6 text-center">件</span>
        <span className="text-xs text-gray-300 w-14 text-right">使用期間</span>
        <span className="text-xs text-gray-300 w-14 text-right">結案週期</span>
      </div>
      {active.map((c) => {
        const colorIndex = CASE_TYPES.indexOf(c.type)
        const color = CASE_TYPE_COLORS[colorIndex >= 0 ? colorIndex : 0]
        return (
          <div key={c.type} className="flex items-center py-1.5 border-b border-gray-50 last:border-0">
            <div className="flex-1 flex items-center gap-1.5 min-w-0">
              <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
              <span className="text-xs text-gray-600 truncate">{c.type}</span>
            </div>
            <span className="text-xs font-semibold text-[#1E3480] w-6 text-center">{c.count}</span>
            <span className="text-xs text-gray-400 w-14 text-right">{c.avgElapsedDays} 天</span>
            <span className="text-xs font-semibold text-gray-600 w-14 text-right">{c.avgDays} 天</span>
          </div>
        )
      })}
    </div>
  )
}


function OverdueBadges({ overdue }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${overdue.expired > 0 ? 'bg-red-50 text-red-500' : 'bg-gray-50 text-gray-300'}`}>
        已逾期 {overdue.expired}
      </span>
      <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${overdue.warning > 0 ? 'bg-orange-50 text-orange-500' : 'bg-gray-50 text-gray-300'}`}>
        即將逾期 {overdue.warning}
      </span>
    </div>
  )
}

function SectionLabel({ children }) {
  return <p className="text-xs font-bold text-gray-600 uppercase tracking-widest mb-2">{children}</p>
}

function QuarterKpiBlock({ sectionLabel, targetDisplay, currentDisplay, lastQValue, currentValue, diffUnit, rate }) {
  const diff = currentValue - lastQValue
  const rateColor = rate >= 70 ? 'text-[#1E3480]' : 'text-red-500'
  const diffPositive = diff >= 0
  return (
    <div className="pb-4">
      <SectionLabel>{sectionLabel}</SectionLabel>
      <div className="grid grid-cols-2 gap-x-4 gap-y-3">
        <div>
          <p className="text-xs text-gray-400 mb-0.5">當季目標</p>
          <p className="text-sm font-bold text-gray-400">{targetDisplay}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400 mb-0.5">達成率</p>
          <div className="flex items-baseline gap-0.5">
            <span className={`text-xl font-bold ${rateColor}`}>{rate}</span>
            <span className="text-xs text-gray-400">%</span>
          </div>
        </div>
        <div>
          <p className="text-xs text-gray-400 mb-0.5">本季目前</p>
          <p className="text-sm font-bold text-[#1E3480]">{currentDisplay}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400 mb-0.5">較上季</p>
          <p className="text-sm font-bold text-gray-600">
            {diffUnit === 'currency'
              ? `${diffPositive ? '+' : '-'} NT$ ${Math.abs(diff).toLocaleString()}`
              : diffUnit === 'cases'
              ? `${diffPositive ? '+' : ''}${diff} 件`
              : `${diffPositive ? '+' : ''}${diff} hr`}
          </p>
        </div>
      </div>
    </div>
  )
}

function LawyerCard({ lawyer }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col shrink-0 overflow-hidden" style={{ width: 'var(--card-width)' }}>

      {/* Header — 固定不捲動 */}
      <div className="px-5 py-3.5 flex items-center bg-[#1E3480] shrink-0">
        <span className="text-white font-bold text-2xl tracking-widest leading-none">{lawyer.id}</span>
        <span className="text-white/70 text-2xl font-bold leading-none ml-2">律師</span>
      </div>

      <div className="flex flex-col gap-0 p-4 overflow-y-auto flex-1 [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">

        {/* ① 工作量 */}
        <div className="flex items-center gap-4 pb-4">
          <MiniDonut cases={lawyer.activeCases} capacity={lawyer.caseCapacity} />
          <div className="flex flex-col gap-2">
            <div>
              <p className="text-xs text-gray-400">進行中案件</p>
              <div className="flex items-baseline gap-1">
                <p className="text-sm font-bold text-[#1E3480]">{lawyer.activeCases}</p>
                <p className="text-sm text-gray-500">/ {lawyer.caseCapacity} 件</p>
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-400">本月新收</p>
              <div className="flex items-baseline gap-0.5">
                <p className="text-sm font-bold text-[#1E3480]">{lawyer.newCasesThisMonth}</p>
                <p className="text-xs text-gray-400">件</p>
              </div>
            </div>
          </div>
        </div>

        <div className="h-px bg-gray-100 mb-4" />

        {/* ② 本季計費時數 */}
        <QuarterKpiBlock
          sectionLabel="本季計費時數"
          targetDisplay={`${lawyer.billingHoursQTarget} hr`}
          currentDisplay={`${lawyer.billingHoursQ} hr`}
          currentValue={lawyer.billingHoursQ}
          lastQValue={lawyer.billingHoursLastQ}
          diffUnit="hours"
          rate={lawyer.billingHoursQTarget > 0 ? Math.round((lawyer.billingHoursQ / lawyer.billingHoursQTarget) * 100) : 0}
        />

        <div className="h-px bg-gray-100 mb-4" />

        {/* ④ 本季財務 */}
        <QuarterKpiBlock
          sectionLabel="本季財務"
          targetDisplay={`NT$ ${lawyer.receivableAmount.toLocaleString()}`}
          currentDisplay={`NT$ ${lawyer.receivedAmount.toLocaleString()}`}
          currentValue={lawyer.receivedAmount}
          lastQValue={lawyer.receivedAmountLastQ}
          diffUnit="currency"
          rate={lawyer.receivableAmount > 0 ? Math.round((lawyer.receivedAmount / lawyer.receivableAmount) * 100) : 0}
        />

        <div className="h-px bg-gray-100 mb-4" />

        {/* ⑤ 案件分布 */}
        <div>
          <SectionLabel>進行案件明細</SectionLabel>
          <CaseTypeBars caseTypes={lawyer.caseTypes} />
        </div>

      </div>
    </div>
  )
}

export default function TeamView() {
  const [sortKey, setSortKey] = useState('id')
  const [onlyUrgent, setOnlyUrgent] = useState(false)

  const displayed = useMemo(() => {
    let list = onlyUrgent ? MOCK_LAWYERS.filter((l) => l.upcomingDeadlines > 0) : MOCK_LAWYERS
    return sortLawyers(list, sortKey)
  }, [sortKey, onlyUrgent])

  return (
    <div className="px-8 py-8 flex flex-col gap-6 h-full">

      {/* Page title */}
      <div className="flex items-end gap-4 shrink-0">
        <div>
          <p className="text-xs font-semibold text-[#E8A020] tracking-widest uppercase mb-1">Team</p>
          <h1 className="text-2xl font-bold text-[#1E3480]">律師團隊</h1>
        </div>
        <div className="mb-1 h-px flex-1 bg-gradient-to-r from-[#1E3480]/20 to-transparent" />
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-4 shrink-0">
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-500">排序</label>
          <select
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value)}
            className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1E3480]/20 focus:border-[#1E3480] bg-white"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        <button
          onClick={() => setOnlyUrgent((v) => !v)}
          className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
            onlyUrgent
              ? 'bg-[#E8A020] border-[#E8A020] text-white font-semibold'
              : 'border-gray-200 text-gray-500 hover:border-[#E8A020] hover:text-[#E8A020]'
          }`}
        >
          僅顯示有到期案件
        </button>

        <span className="text-xs text-gray-400 ml-auto">
          顯示 {displayed.length} / {MOCK_LAWYERS.length} 位律師
        </span>
      </div>

      {/* Lawyer columns */}
      <HScrollArea style={{ '--card-width': 'clamp(260px, calc((100vw - 288px) / 2.8), 320px)' }}>
        <div className="flex gap-4 h-full" style={{ width: 'max-content' }}>
          {displayed.map((lawyer) => (
            <LawyerCard key={lawyer.id} lawyer={lawyer} />
          ))}
        </div>
      </HScrollArea>

    </div>
  )
}
