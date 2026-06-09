import { useState, useMemo } from 'react'
import HScrollArea from '../components/ui/HScrollArea'
import { MOCK_CASES, CASE_STATUSES } from '../constants/mockData'
import { CASE_TYPES, CASE_TYPE_COLORS } from '../constants/caseTypes'
import { useDemoMode } from '../hooks/useDemoMode'

const SELECT_CLS = 'text-xs border border-gray-200 rounded-lg px-3 py-1.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1E3480]/20 focus:border-[#1E3480] bg-white'

const TODAY = new Date()
TODAY.setHours(0, 0, 0, 0)

function getCloseStatus(expectedCloseDate, caseStatus) {
  if (caseStatus === 'closed' || !expectedCloseDate) return null
  const close = new Date(expectedCloseDate)
  const diffDays = Math.ceil((close - TODAY) / 86400000)
  if (diffDays < 0)   return { label: '結案已逾期',   class: 'bg-red-50 text-red-500 border border-red-100',           dot: 'bg-red-400'     }
  if (diffDays <= 30) return { label: '結案即將逾期', class: 'bg-orange-50 text-orange-500 border border-orange-100',   dot: 'bg-orange-400'  }
  return                     { label: '未逾期',       class: 'bg-emerald-50 text-emerald-600 border border-emerald-100', dot: 'bg-emerald-400' }
}

function daysUntil(dateStr) {
  if (!dateStr) return null
  return Math.ceil((new Date(dateStr) - TODAY) / 86400000)
}

function DeadlineBadge({ date }) {
  if (!date) return null
  const days = daysUntil(date)
  const color = days <= 2 ? 'text-red-500' : days <= 5 ? 'text-orange-500' : 'text-gray-400'
  return (
    <div className={`flex items-center gap-1 text-xs whitespace-nowrap ${color}`}>
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="shrink-0">
        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
      </svg>
      <span>下一個事件：{days <= 0 ? '已逾期' : `${days} 天後`}</span>
      <span className="ml-0.5">{date}</span>
    </div>
  )
}

function CaseTypeBadge({ type }) {
  const idx = CASE_TYPES.indexOf(type)
  const color = CASE_TYPE_COLORS[idx >= 0 ? idx : 0]
  return (
    <span className="text-xs font-medium px-2 py-0.5 rounded-md" style={{ backgroundColor: color + '20', color }}>
      {type}
    </span>
  )
}

function PendingRenewalBadge({ reason, deadline }) {
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const daysLeft = Math.ceil((new Date(deadline) - today) / 86400000)
  const urgent = daysLeft <= 7
  const cls = urgent
    ? 'bg-red-50 text-red-600 border border-red-100'
    : 'bg-amber-50 text-amber-600 border border-amber-100'
  const reasonLabel = reason === 'judgment' ? '判決未確定' : '合約即將到期'
  const timeLabel = daysLeft > 0 ? `${daysLeft} 天後到期` : '已到期'
  return (
    <div className={`flex items-center gap-1.5 text-sm font-semibold px-2 py-1 rounded-lg w-fit ${cls}`}>
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      {reasonLabel}
      <span className="font-normal opacity-75">· {timeLabel}</span>
    </div>
  )
}

const SUB_TYPE_LABEL = {
  appeal:      { text: '上訴', color: 'bg-violet-50 text-violet-600 border border-violet-100' },
  enforcement: { text: '強制執行', color: 'bg-amber-50 text-amber-600 border border-amber-100' },
}

function CaseCard({ c, allCases }) {
  const isSubCase = !!c.parentCaseId
  const subTypeInfo = isSubCase ? SUB_TYPE_LABEL[c.subType] : null
  const activeSubCount = c.subCases?.filter(id => {
    const sub = allCases.find(x => x.id === id)
    return sub && sub.status !== 'closed'
  }).length ?? 0

  return (
    <div className={`bg-white rounded-xl border shadow-sm hover:shadow-md transition-shadow p-4 flex flex-col gap-3 cursor-pointer ${isSubCase ? 'border-l-4 border-l-violet-300 border-gray-100' : 'border-gray-100'}`}>

      {/* Type + 子案 badge */}
      <div className="flex items-start justify-between gap-2">
        <CaseTypeBadge type={c.type} />
        {activeSubCount > 0 && (
          <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-violet-50 text-violet-600 border border-violet-100 whitespace-nowrap">
            子案 {activeSubCount}
          </span>
        )}
      </div>

      {/* 子案標籤 — 案件類型下方 */}
      {isSubCase && (
        <div className="flex items-center gap-1.5">
          <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${subTypeInfo?.color}`}>
            {subTypeInfo?.text}{c.instanceLevel ? ` · ${c.instanceLevel}` : ''}
          </span>
          <span className="text-xs text-gray-400">父案 {c.parentCaseId}</span>
        </div>
      )}

      {/* 待續委 badge */}
      {c.renewalReason && c.renewalDeadline && (
        <PendingRenewalBadge reason={c.renewalReason} deadline={c.renewalDeadline} />
      )}

      {/* 父案已結案但子案仍進行中 */}
      {c.status === 'closed' && activeSubCount > 0 && (
        <div className="flex items-center gap-1.5 text-xs font-semibold px-2 py-1.5 rounded-lg bg-amber-50 text-amber-600 border border-amber-100">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          尚有 {activeSubCount} 件子案進行中
        </div>
      )}

      {/* 訴訟三要素 + ID */}
      <div className="flex flex-col gap-1">
        <p className="text-xs text-gray-600">{c.parties}</p>
        <p className="text-sm font-semibold text-[#1E3480] leading-snug">{c.cause}</p>
        <p className="text-xs text-gray-600">{c.relief}</p>
        <p className="text-xs text-gray-300 mt-0.5">{c.id}</p>
      </div>

      {/* Expected close date (if set and not closed) */}
      {c.expectedCloseDate && c.status !== 'closed' && (
        <div className="flex items-center gap-1 text-xs text-gray-400">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0">
            <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          <span>預計結案 {c.expectedCloseDate}</span>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between flex-wrap gap-y-2 pt-3 mt-auto border-t border-gray-100">
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="w-5 h-5 rounded-full bg-[#1E3480] flex items-center justify-center shrink-0">
            <span className="text-white font-bold" style={{ fontSize: '9px' }}>{c.lawyer}</span>
          </div>
          <span className="text-xs text-gray-500">{c.lawyer} 律師</span>
        </div>
        <DeadlineBadge date={c.nextDeadline} />
      </div>
    </div>
  )
}

function KanbanColumn({ status, cases, stageIndex, isDemoMode, allCases }) {
  const overdueCount = cases.filter((c) => getCloseStatus(c.expectedCloseDate, c.status)?.label === '已逾期').length
  const displayLabel = isDemoMode ? `階段 ${stageIndex}` : status.label
  return (
    <div className="flex flex-col gap-3 min-w-[280px] w-[280px]">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: status.color }} />
          <span className="text-sm font-bold text-gray-700">{displayLabel}</span>
          {overdueCount > 0 && (
            <span className="text-xs font-bold text-red-500 bg-red-50 px-1.5 py-0.5 rounded-full">逾期 {overdueCount}</span>
          )}
        </div>
        <span className="text-xs font-semibold text-white px-2 py-0.5 rounded-full" style={{ backgroundColor: status.color }}>
          {cases.length}
        </span>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl p-3 min-h-[200px]" style={{ backgroundColor: status.bg }}>
        {cases.length === 0 && (
          <div className="flex items-center justify-center h-20 text-xs text-gray-300">無案件</div>
        )}
        {cases.map((c) => <CaseCard key={c.id} c={c} allCases={allCases} />)}
      </div>
    </div>
  )
}

export default function CaseView() {
  const isDemoMode = useDemoMode()
  const [filterLawyer, setFilterLawyer] = useState('all')
  const [filterType, setFilterType] = useState('all')
  const [filterOverdue, setFilterOverdue] = useState(false)
  const [filterPendingRenewal, setFilterPendingRenewal] = useState(false)

  const lawyers = ['all', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L']

  const allCases = useMemo(() => MOCK_CASES, [])

  const filtered = useMemo(() => {
    return allCases.filter((c) => {
      if (filterLawyer !== 'all' && c.lawyer !== filterLawyer) return false
      if (filterType !== 'all' && c.type !== filterType) return false
      if (filterOverdue) {
        const cs = getCloseStatus(c.expectedCloseDate, c.status)
        if (!cs || cs.label !== '已逾期') return false
      }
      if (filterPendingRenewal && c.status !== 'pending_renewal') return false
      return true
    })
  }, [allCases, filterLawyer, filterType, filterOverdue, filterPendingRenewal])

  const byStatus = useMemo(() => {
    const map = {}
    CASE_STATUSES.forEach((s) => { map[s.key] = [] })
    filtered.forEach((c) => { if (map[c.status]) map[c.status].push(c) })
    return map
  }, [filtered])

  const overdueTotal = allCases.filter((c) => getCloseStatus(c.expectedCloseDate, c.status)?.label === '已逾期').length
  const pendingRenewalTotal = allCases.filter((c) => c.status === 'pending_renewal').length

  return (
    <div className="px-4 md:px-8 py-4 md:py-8 flex flex-col gap-6 h-full">

      <div className="flex items-end gap-4 shrink-0">
        <div>
          <p className="text-xs font-semibold text-[#E8A020] tracking-widest uppercase mb-1">Cases</p>
          <h1 className="text-2xl font-bold text-[#1E3480]">所有案件</h1>
        </div>
        <div className="mb-1 h-px flex-1 bg-gradient-to-r from-[#1E3480]/20 to-transparent" />
      </div>

      <div className="flex items-center gap-4 shrink-0 flex-wrap">
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-500">負責律師</label>
          <select value={filterLawyer} onChange={(e) => setFilterLawyer(e.target.value)}
            className={SELECT_CLS}>
            {lawyers.map((l) => <option key={l} value={l}>{l === 'all' ? '全部律師' : `${l} 律師`}</option>)}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-500">案件類型</label>
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)}
            className={SELECT_CLS}>
            <option value="all">全部類型</option>
            {CASE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        <button onClick={() => setFilterOverdue((v) => !v)}
          className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
            filterOverdue ? 'bg-red-500 border-red-500 text-white font-semibold' : 'border-gray-200 text-gray-500 hover:border-red-400 hover:text-red-500'
          }`}>
          {filterOverdue ? '✕ 僅顯示已逾期' : `僅顯示已逾期${overdueTotal > 0 ? `（${overdueTotal}）` : ''}`}
        </button>

        <button onClick={() => setFilterPendingRenewal((v) => !v)}
          className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
            filterPendingRenewal ? 'bg-amber-500 border-amber-500 text-white font-semibold' : 'border-gray-200 text-gray-500 hover:border-amber-400 hover:text-amber-600'
          }`}>
          {filterPendingRenewal ? '✕ 僅顯示待續委' : `僅顯示待續委${pendingRenewalTotal > 0 ? `（${pendingRenewalTotal}）` : ''}`}
        </button>

        <span className="text-xs text-gray-400 ml-auto">共 {filtered.length} 件</span>
      </div>

      <HScrollArea>
        <div className="flex gap-5 h-full" style={{ width: 'max-content' }}>
          {CASE_STATUSES.map((status, idx) => (
            <KanbanColumn key={status.key} status={status} cases={byStatus[status.key]} stageIndex={idx + 1} isDemoMode={isDemoMode} allCases={allCases} />
          ))}
        </div>
      </HScrollArea>

    </div>
  )
}
