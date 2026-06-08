import { useState, useMemo } from 'react'
import { MOCK_CLIENT_HEALTH, MOCK_CASES, MOCK_JUDGMENTS, MOCK_STATUTES, MOCK_DOCUMENTS, CASE_STATUSES, DEADLINE_CATEGORIES } from '../constants/mockData'
import { useDemoMode } from '../hooks/useDemoMode'

const TODAY = new Date()
TODAY.setHours(0, 0, 0, 0)

function daysSince(dateStr) {
  return Math.floor((TODAY - new Date(dateStr)) / 86400000)
}

function daysUntil(dateStr) {
  return Math.floor((new Date(dateStr) - TODAY) / 86400000)
}

function followUpUrgency(days) {
  if (days < 0)  return { color: 'text-red-500',    label: `已逾期 ${Math.abs(days)} 天` }
  if (days === 0) return { color: 'text-red-500',    label: '今天到期' }
  if (days <= 3)  return { color: 'text-red-500',    label: `${days} 天後` }
  if (days <= 7)  return { color: 'text-orange-500', label: `${days} 天後` }
  return           { color: 'text-gray-500',         label: `${days} 天後` }
}

function contactUrgencyColor(days) {
  if (days > 14) return 'text-red-500'
  if (days > 7)  return 'text-orange-500'
  return 'text-emerald-600'
}

const URGENCY_CONFIG = {
  critical: { label: '緊急',  color: 'bg-red-50 text-red-600 border border-red-100' },
  warning:  { label: '待處理', color: 'bg-amber-50 text-amber-600 border border-amber-100' },
  normal:   null,
}

function getUrgency(client) {
  const now = new Date()
  const hasOverdueFollowUp = client.followUps.some(
    (f) => !f.done && new Date(f.date) < now
  )
  const linkedCase = MOCK_CASES.find((c) => c.id === client.caseNo)
  const caseOverdue = linkedCase?.expectedCloseDate &&
    linkedCase.status !== 'closed' &&
    new Date(linkedCase.expectedCloseDate) < now

  if (hasOverdueFollowUp || caseOverdue) return 'critical'

  const daysSinceContact = daysSince(client.lastContactDate)
  const hasUrgentFollowUp = client.followUps.some(
    (f) => !f.done && daysUntil(f.date) <= 3 && daysUntil(f.date) >= 0
  )
  if (daysSinceContact > 14 || hasUrgentFollowUp) return 'warning'

  return 'normal'
}

const URGENCY_SCORE = { critical: 0, warning: 1, normal: 2 }

const SELECT_CLS = 'w-full text-xs border border-gray-100 rounded-lg bg-gray-50 py-1.5 px-2 text-gray-600 focus:outline-none focus:border-[#1E3480] appearance-none cursor-pointer transition'

const URGENCY_FILTER_OPTIONS = [
  { value: 'all',      label: '全部急迫性' },
  { value: 'critical', label: '緊急' },
  { value: 'warning',  label: '待處理' },
  { value: 'normal',   label: '正常' },
]

function SectionLabel({ children }) {
  return <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-3">{children}</p>
}

function ContactLog({ contacts }) {
  return (
    <div className="flex flex-col">
      {contacts.map((c, idx) => (
        <div key={c.id} className="flex gap-3">
          <div className="flex flex-col items-center shrink-0">
            <div className="w-2.5 h-2.5 rounded-full bg-[#1E3480] mt-1 shrink-0" />
            {idx < contacts.length - 1 && <div className="w-px flex-1 bg-gray-100 my-1" />}
          </div>
          <div className={`${idx < contacts.length - 1 ? 'pb-5' : ''} flex-1`}>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-semibold text-gray-700">{c.type}</span>
              <span className="text-gray-300">·</span>
              <span className="text-sm text-gray-500">{c.date}</span>
              <span className="text-gray-300">·</span>
              <span className="text-sm text-gray-500">{c.lawyer} 律師</span>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">{c.note}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

function FollowUpList({ followUps }) {
  return (
    <div className="flex flex-col gap-3">
      {followUps.map((f) => {
        const urgency = !f.done ? followUpUrgency(daysUntil(f.date)) : null
        return (
          <div key={f.id} className="flex items-start gap-3">
            <div className={`w-4 h-4 rounded border mt-0.5 shrink-0 flex items-center justify-center ${
              f.done ? 'bg-[#1E3480] border-[#1E3480]' : 'border-gray-300'
            }`}>
              {f.done && (
                <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                  <polyline points="2 6 5 9 10 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-0.5">
                {f.category && DEADLINE_CATEGORIES[f.category] && (
                  <span className={`text-sm font-medium px-1.5 py-0.5 rounded ${DEADLINE_CATEGORIES[f.category].color}`}>
                    {DEADLINE_CATEGORIES[f.category].label}
                  </span>
                )}
                <p className={`text-sm ${f.done ? 'text-gray-400 line-through' : 'text-gray-700'}`}>{f.task}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">{f.date}</span>
                {urgency && (
                  <span className={`text-sm font-semibold ${urgency.color}`}>{urgency.label}</span>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function StatusBadge({ statusKey }) {
  const s = CASE_STATUSES.find((s) => s.key === statusKey)
  if (!s) return null
  return (
    <span className="text-sm font-medium px-1.5 py-0.5 rounded whitespace-nowrap" style={{ color: s.color, backgroundColor: s.color + '18' }}>
      {s.label}
    </span>
  )
}

function ClientListItem({ client, selected, onClick }) {
  const days = daysSince(client.lastContactDate)
  const urgency = getUrgency(client)
  const urgencyConfig = URGENCY_CONFIG[urgency]
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition-all border-b border-gray-50 last:border-0 ${
        selected ? 'bg-[#1E3480]/5' : 'hover:bg-gray-50'
      }`}
    >
      <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${selected ? 'bg-[#1E3480]' : 'bg-[#1E3480]/10'}`}>
        <span className={`text-sm font-bold ${selected ? 'text-white' : 'text-[#1E3480]'}`}>{client.lawyer}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[#1E3480] truncate mb-0.5">{client.parties}</p>
        <p className="text-sm text-gray-600 truncate">{client.cause}</p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <p className="text-xs text-gray-400 truncate">{client.caseNo}</p>
          <StatusBadge statusKey={client.status} />
        </div>
      </div>
      <div className="flex flex-col items-end gap-1 shrink-0 ml-2">
        {urgencyConfig && (
          <span className={`text-sm font-semibold px-1.5 py-0.5 rounded whitespace-nowrap ${urgencyConfig.color}`}>
            {urgencyConfig.label}
          </span>
        )}
        <span className={`text-sm font-medium ${contactUrgencyColor(days)}`}>{days} 天前</span>
      </div>
    </button>
  )
}


function DetailPanel({ client, onBack, isDemoMode, linkedJudgments, linkedStatutes = [], documents = [] }) {
  const days = daysSince(client.lastContactDate)
  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Client header */}
      <div className="px-4 md:px-8 py-5 md:py-6 border-b border-gray-100">
        <button
          onClick={onBack}
          className="md:hidden flex items-center gap-1.5 text-sm font-semibold text-[#1E3480] mb-4"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          返回列表
        </button>
        <div className="flex items-center gap-2.5 mb-0.5 min-w-0">
          <h2 className="text-xl font-bold text-[#1E3480] truncate">{client.parties}</h2>
          <StatusBadge statusKey={client.status} />
        </div>
        <p className="text-sm text-gray-600 mt-0.5">{client.cause}</p>
        <p className="text-sm text-gray-600">{client.relief}</p>
        <p className="text-sm text-gray-400 mt-1">{client.caseNo} · {client.lawyer} 律師</p>

        <div className="flex flex-wrap items-center gap-4 mt-5">
          <div>
            <p className="text-sm text-gray-500 mb-1">最後接觸</p>
            <span className={`text-sm font-semibold ${contactUrgencyColor(days)}`}>{days} 天前（{client.lastContactDate}）</span>
          </div>
          <div className="w-px h-8 bg-gray-100" />
          <div>
            <p className="text-sm text-gray-500 mb-1">接觸次數</p>
            <span className="text-sm font-semibold text-gray-700">{client.contacts.length} 次</span>
          </div>
        </div>
      </div>

      {!isDemoMode && (
        <div className="px-4 md:px-8 py-6 flex flex-col gap-8">
          <div>
            <div className="mb-4">
              <SectionLabel>接觸紀錄</SectionLabel>
            </div>
            <ContactLog contacts={client.contacts} />
          </div>

          <div className="h-px bg-gray-100" />

          <div>
            <div className="mb-4">
              <SectionLabel>相關文件</SectionLabel>
            </div>
            {client.driveLinks.length === 0 && linkedStatutes.length === 0 && documents.length === 0 ? (
              <p className="text-sm text-gray-400">尚未連結文件</p>
            ) : (
              <div className="flex flex-col gap-2">
                {/* Drive 連結 */}
                {client.driveLinks.map((doc) => (
                  <a key={doc.id} href={doc.url} target="_blank" rel="noreferrer"
                    className="flex items-center gap-2.5 text-sm text-[#1E3480] hover:underline">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-gray-400">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                    </svg>
                    {doc.name}
                  </a>
                ))}
                {/* 法定時效 */}
                {linkedStatutes.map((s) => (
                  <div key={s.id} className="flex items-center gap-2.5 text-sm text-[#1E3480]">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-emerald-500">
                      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                    </svg>
                    <span>{s.name}</span>
                    <span className="text-xs text-gray-400">· {s.display} · {s.law}</span>
                  </div>
                ))}
                {/* 收發文紀錄 */}
                {documents.length > 0 && (
                  <div className="mt-1 pt-2 border-t border-gray-100 flex flex-col gap-1.5">
                    {documents.map((doc) => {
                      const days = doc.deadlineDate && doc.deadlineType !== '無' ? daysUntil(doc.deadlineDate) : null
                      return (
                        <div key={doc.id} className="flex items-start gap-2.5">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                            className={`shrink-0 mt-0.5 ${doc.direction === '收文' ? 'text-blue-400' : 'text-purple-400'}`}>
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                            <polyline points="22,6 12,13 2,6"/>
                          </svg>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm text-gray-700">{doc.docType}</span>
                              <span className="text-xs text-gray-400">{doc.date}</span>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          <div>
            <div className="mb-4">
              <SectionLabel>後續追蹤</SectionLabel>
            </div>
            <FollowUpList followUps={client.followUps} />
          </div>

          {linkedJudgments.length > 0 && (
            <>
              <div className="h-px bg-gray-100" />
              <div>
                <div className="mb-4">
                  <SectionLabel>參考文獻</SectionLabel>
                </div>
                <div className="flex flex-col gap-2">
                  {linkedJudgments.map((j) => (
                    <a key={j.id} href={j.url} target="_blank" rel="noreferrer"
                      className="flex items-center gap-2.5 text-sm text-[#1E3480] hover:underline">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-[#E8A020]">
                        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                      </svg>
                      <span>{j.caseNo}</span>
                      <span className="text-xs text-gray-400">· 參考判決</span>
                    </a>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}

const INIT_FILTERS = { urgency: 'all', lawyer: 'all', caseType: 'all', sort: 'urgency' }

export default function ClientSuccessView({ judgmentLinks = [], statuteLinks = [] }) {
  const isDemoMode = useDemoMode()
  const [selected, setSelected] = useState(null)
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState(INIT_FILTERS)

  function setFilter(key, val) {
    setFilters(f => ({ ...f, [key]: val }))
  }

  function getLinkedJudgments(clientId) {
    const linkedIds = judgmentLinks
      .filter(l => l.clientId === clientId)
      .map(l => l.judgmentId)
    return MOCK_JUDGMENTS.filter(j => linkedIds.includes(j.id))
  }

  function getLinkedStatutes(clientId) {
    const linkedIds = statuteLinks
      .filter(l => l.clientId === clientId)
      .map(l => l.statuteId)
    return MOCK_STATUTES.filter(s => linkedIds.includes(s.id))
  }

  const uniqueLawyers = useMemo(() =>
    [...new Set(MOCK_CLIENT_HEALTH.map(c => c.lawyer).filter(Boolean))].sort()
  , [])

  const uniqueCaseTypes = useMemo(() =>
    [...new Set(MOCK_CLIENT_HEALTH.map(c => c.caseType).filter(Boolean))].sort()
  , [])

  const displayed = useMemo(() => {
    let list = [...MOCK_CLIENT_HEALTH]
    if (filters.urgency !== 'all') list = list.filter(c => getUrgency(c) === filters.urgency)
    if (filters.lawyer !== 'all')   list = list.filter(c => c.lawyer === filters.lawyer)
    if (filters.caseType !== 'all') list = list.filter(c => c.caseType === filters.caseType)
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter(c =>
        c.parties.toLowerCase().includes(q) ||
        c.caseNo.toLowerCase().includes(q) ||
        c.lawyer.toLowerCase().includes(q)
      )
    }
    list.sort((a, b) => {
      if (filters.sort === 'urgency') {
        const diff = URGENCY_SCORE[getUrgency(a)] - URGENCY_SCORE[getUrgency(b)]
        if (diff !== 0) return diff
      }
      return daysSince(b.lastContactDate) - daysSince(a.lastContactDate)
    })
    return list
  }, [filters, search])

  const activeFilterCount = Object.entries(filters).filter(([k, v]) => k !== 'sort' && v !== 'all').length

  return (
    <div className="flex flex-col md:flex-row h-full">

      <div className={`md:w-2/5 md:shrink-0 bg-white md:border-r border-gray-100 flex flex-col ${selected ? 'hidden md:flex' : 'flex flex-1 md:flex-none'}`}>

        {/* 標題 */}
        <div className="px-5 py-5 border-b border-gray-100">
          <p className="text-sm font-semibold text-[#E8A020] tracking-widest uppercase mb-1">Customer Success</p>
          <h1 className="text-2xl font-bold text-[#1E3480]">客戶健康追蹤</h1>
        </div>

        {/* 搜尋 */}
        <div className="px-4 pt-3 pb-2">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              type="text"
              placeholder="搜尋當事人、案號、律師…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-sm bg-gray-50 border border-gray-100 rounded-lg focus:outline-none focus:border-[#1E3480] placeholder:text-gray-300 transition"
            />
          </div>
        </div>

        {/* 四維篩選 */}
        <div className="px-4 pb-3 grid grid-cols-2 gap-1.5">
          <div className="relative">
            <select value={filters.urgency} onChange={e => setFilter('urgency', e.target.value)} className={SELECT_CLS}>
              {URGENCY_FILTER_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <svg className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-400" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
          </div>

          <div className="relative">
            <select value={filters.lawyer} onChange={e => setFilter('lawyer', e.target.value)} className={SELECT_CLS}>
              <option value="all">全部律師</option>
              {uniqueLawyers.map(l => <option key={l} value={l}>{l} 律師</option>)}
            </select>
            <svg className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-400" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
          </div>

          <div className="relative">
            <select value={filters.caseType} onChange={e => setFilter('caseType', e.target.value)} className={SELECT_CLS}>
              <option value="all">全部案件類型</option>
              {uniqueCaseTypes.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <svg className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-400" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
          </div>

          <div className="relative">
            <select value={filters.sort} onChange={e => setFilter('sort', e.target.value)} className={SELECT_CLS}>
              <option value="urgency">排序：急迫性</option>
              <option value="contact">排序：最後接觸</option>
            </select>
            <svg className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-400" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
          </div>
        </div>

        {/* 結果數 */}
        <div className="px-4 pb-2 flex items-center justify-between">
          <span className="text-xs text-gray-400">{displayed.length} 筆結果</span>
          {(activeFilterCount > 0 || search.trim()) && (
            <button onClick={() => { setFilters(INIT_FILTERS); setSearch('') }} className="text-xs text-[#1E3480] hover:underline">
              清除篩選
            </button>
          )}
        </div>

        <div className="overflow-y-auto flex-1">
          {displayed.length === 0 ? (
            <p className="text-sm text-gray-300 text-center py-12">無符合結果</p>
          ) : (
            displayed.map((c) => (
              <ClientListItem
                key={c.id}
                client={c}
                selected={selected?.id === c.id}
                onClick={() => setSelected(c)}
              />
            ))
          )}
        </div>
      </div>

      <div className={`md:w-3/5 min-w-0 overflow-hidden bg-white ${selected ? 'flex flex-col' : 'hidden md:flex'}`}>
        {selected
          ? <DetailPanel client={selected} onBack={() => setSelected(null)} isDemoMode={isDemoMode} linkedJudgments={getLinkedJudgments(selected.id)} linkedStatutes={getLinkedStatutes(selected.id)} documents={MOCK_DOCUMENTS.filter(d => d.caseNo === selected.caseNo)} />
          : null
        }
      </div>

    </div>
  )
}
