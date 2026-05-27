import { useState, useMemo } from 'react'
import HScrollArea from '../components/ui/HScrollArea'
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import { MOCK_LAWYERS } from '../constants/mockData'
import { CASE_TYPES, CASE_TYPE_COLORS } from '../constants/caseTypes'

const MAX_CASES = Math.max(...MOCK_LAWYERS.map((l) => l.activeCases))

const SORT_OPTIONS = [
  { value: 'id',       label: '字母 A → L' },
  { value: 'active',   label: '進行中案件（多→少）' },
  { value: 'deadline', label: '到期件數（多→少）' },
  { value: 'billing',  label: '計費時數（多→少）' },
  { value: 'closed',   label: '本月實際結案（多→少）' },
  { value: 'cycle',    label: '平均週期（長→短）' },
  { value: 'overdue',  label: '已逾期件數（多→少）' },
]

function sortLawyers(lawyers, key) {
  return [...lawyers].sort((a, b) => {
    if (key === 'id')       return a.id.localeCompare(b.id)
    if (key === 'active')   return b.activeCases - a.activeCases
    if (key === 'deadline') return b.upcomingDeadlines - a.upcomingDeadlines
    if (key === 'billing')  return b.billingHours - a.billingHours
    if (key === 'closed')   return b.closedThisMonth - a.closedThisMonth
    if (key === 'cycle')    return b.avgCycleDays - a.avgCycleDays
    if (key === 'overdue')  return b.overdue.expired - a.overdue.expired
    return 0
  })
}

function MiniDonut({ cases, max }) {
  const pct = Math.round((cases / max) * 100)
  const data = [{ value: pct }, { value: 100 - pct }]
  return (
    <div className="relative w-16 h-16 mx-auto">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="value" cx="50%" cy="50%" innerRadius={20} outerRadius={29} startAngle={90} endAngle={-270} strokeWidth={0}>
            <Cell fill="#1E3480" />
            <Cell fill="#F0F2F8" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-sm font-bold text-[#1E3480] leading-none">{cases}</span>
      </div>
    </div>
  )
}

function CaseTypeBars({ caseTypes }) {
  const countMap = Object.fromEntries(caseTypes.map((c) => [c.type, c.count]))
  const allTypes = CASE_TYPES.map((type, i) => ({ type, count: countMap[type] ?? 0, colorIndex: i }))
  const total = allTypes.reduce((s, c) => s + c.count, 0)
  return (
    <div className="flex flex-col gap-2">
      {allTypes.map((c) => (
        <div key={c.type} className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">{c.type}</span>
            <span className="text-sm font-semibold text-gray-700">{c.count}</span>
          </div>
          <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all" style={{ width: total > 0 ? `${(c.count / total) * 100}%` : '0%', backgroundColor: CASE_TYPE_COLORS[c.colorIndex] }} />
          </div>
        </div>
      ))}
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

function LawyerCard({ lawyer }) {
  const attainment = lawyer.plannedCloseThisMonth > 0
    ? Math.round((lawyer.closedThisMonth / lawyer.plannedCloseThisMonth) * 100)
    : 0

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col shrink-0 overflow-hidden" style={{ width: 'var(--card-width)' }}>

      {/* Header */}
      <div className="px-5 py-3.5 flex items-center justify-between bg-[#1E3480]">
        <div className="flex items-center gap-2">
          <span className="text-white font-bold text-lg tracking-widest leading-none">{lawyer.id}</span>
          <span className="text-white/50 text-xs">律師</span>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className={`text-xs font-semibold px-1.5 py-0.5 rounded whitespace-nowrap ${lawyer.overdue.expired > 0 ? 'bg-red-500 text-white' : 'bg-white/10 text-white/30'}`}>
            結案已逾期 {lawyer.overdue.expired}
          </span>
          <span className={`text-xs font-semibold px-1.5 py-0.5 rounded whitespace-nowrap ${lawyer.overdue.warning > 0 ? 'bg-[#E8A020] text-white' : 'bg-white/10 text-white/30'}`}>
            結案即將逾期 {lawyer.overdue.warning}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-0 p-4">

        {/* ① 工作量 */}
        <div className="flex items-center gap-4 pb-4">
          <MiniDonut cases={lawyer.activeCases} max={MAX_CASES} />
          <div className="flex flex-col gap-0.5">
            <p className="text-xs text-gray-400">進行中案件</p>
            <p className="text-sm font-bold text-[#1E3480]">{lawyer.activeCases} 件</p>
            <p className="text-xs text-gray-400 mt-1">平均結案週期</p>
            <p className="text-sm font-bold text-[#1E3480]">{lawyer.avgCycleDays} 天</p>
          </div>
        </div>

        <div className="h-px bg-gray-100 mb-4" />

        {/* ② 本月結案進度 */}
        <div className="pb-4">
          <div className="flex items-center justify-between mb-2">
            <SectionLabel>本月結案進度</SectionLabel>
            <span className={`text-xs font-bold ${attainment >= 100 ? 'text-emerald-500' : attainment >= 70 ? 'text-[#1E3480]' : 'text-orange-500'}`}>
              {attainment}%
            </span>
          </div>
          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden mb-3">
            <div
              className={`h-full rounded-full transition-all ${attainment >= 100 ? 'bg-emerald-400' : attainment >= 70 ? 'bg-[#1E3480]' : 'bg-orange-400'}`}
              style={{ width: `${Math.min(attainment, 100)}%` }}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex flex-col items-center gap-0.5">
              <span className="text-xs text-gray-400">本月預計</span>
              <div className="flex items-baseline gap-0.5">
                <span className="text-lg font-bold text-gray-400">{lawyer.plannedCloseThisMonth}</span>
                <span className="text-xs text-gray-300">件</span>
              </div>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-200">
              <polyline points="9 18 15 12 9 6" />
            </svg>
            <div className="flex flex-col items-center gap-0.5">
              <span className="text-xs text-gray-400">本月實際</span>
              <div className="flex items-baseline gap-0.5">
                <span className="text-lg font-bold text-[#1E3480]">{lawyer.closedThisMonth}</span>
                <span className="text-xs text-gray-400">件</span>
              </div>
            </div>
          </div>
        </div>

        <div className="h-px bg-gray-100 mb-4" />

        {/* ③ 計費時數 */}
        <div className="pb-4">
          <p className="text-xs text-gray-400 mb-0.5">本月計費時數</p>
          <div className="flex items-baseline gap-2">
            <div className="flex items-baseline gap-0.5">
              <span className="text-lg font-bold text-[#1E3480]">{lawyer.billingHours}</span>
              <span className="text-xs text-gray-400">hr</span>
            </div>
            {lawyer.billingHours !== lawyer.billingHoursLastMonth && (
              <div className={`flex items-center gap-0.5 text-xs font-semibold ${lawyer.billingHours > lawyer.billingHoursLastMonth ? 'text-emerald-500' : 'text-red-400'}`}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  {lawyer.billingHours > lawyer.billingHoursLastMonth
                    ? <polyline points="18 15 12 9 6 15" />
                    : <polyline points="6 9 12 15 18 9" />}
                </svg>
                {Math.abs(lawyer.billingHours - lawyer.billingHoursLastMonth)}hr
              </div>
            )}
          </div>
          <p className="text-xs text-gray-300 mt-0.5">上月 {lawyer.billingHoursLastMonth}hr</p>
        </div>

        <div className="h-px bg-gray-100 mb-4" />

        {/* ④ 案件分布 */}
        <div>
          <SectionLabel>案件分布</SectionLabel>
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
      <HScrollArea style={{ '--card-width': 'calc((100vw - 224px - 64px) / 4.5)' }}>
        <div className="flex gap-4 h-full" style={{ width: 'max-content' }}>
          {displayed.map((lawyer) => (
            <LawyerCard key={lawyer.id} lawyer={lawyer} />
          ))}
        </div>
      </HScrollArea>

    </div>
  )
}
