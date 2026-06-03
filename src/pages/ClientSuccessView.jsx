import { useState } from 'react'
import { MOCK_CLIENT_HEALTH, MOCK_CASES, CASE_STATUSES, DEADLINE_CATEGORIES } from '../constants/mockData'
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

function DetailPanel({ client, onBack, isDemoMode }) {
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
            <div className="flex items-center justify-between mb-4">
              <SectionLabel>接觸紀錄</SectionLabel>
              <button className="text-sm font-semibold text-[#1E3480] bg-[#1E3480]/5 hover:bg-[#1E3480]/10 px-3 py-1.5 rounded-lg border border-[#1E3480]/10 transition-all">
                ＋ 新增紀錄
              </button>
            </div>
            <ContactLog contacts={client.contacts} />
          </div>

          <div className="h-px bg-gray-100" />

          <div>
            <div className="flex items-center justify-between mb-4">
              <SectionLabel>相關文件</SectionLabel>
              <button className="text-sm font-semibold text-[#1E3480] bg-[#1E3480]/5 hover:bg-[#1E3480]/10 px-3 py-1.5 rounded-lg border border-[#1E3480]/10 transition-all">
                ＋ 新增連結
              </button>
            </div>
            {client.driveLinks.length === 0 ? (
              <p className="text-sm text-gray-400">尚未連結文件</p>
            ) : (
              <div className="flex flex-col gap-2">
                {client.driveLinks.map((doc) => (
                  <a key={doc.id} href={doc.url} target="_blank" rel="noreferrer"
                    className="flex items-center gap-2.5 text-sm text-[#1E3480] hover:underline">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-gray-400">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                    </svg>
                    {doc.name}
                  </a>
                ))}
              </div>
            )}
          </div>

          <div className="h-px bg-gray-100" />

          <div>
            <div className="flex items-center justify-between mb-4">
              <SectionLabel>後續追蹤</SectionLabel>
              <button className="text-sm font-semibold text-[#1E3480] bg-[#1E3480]/5 hover:bg-[#1E3480]/10 px-3 py-1.5 rounded-lg border border-[#1E3480]/10 transition-all">
                ＋ 新增追蹤
              </button>
            </div>
            <FollowUpList followUps={client.followUps} />
          </div>
        </div>
      )}
    </div>
  )
}

export default function ClientSuccessView() {
  const isDemoMode = useDemoMode()
  const [sortKey, setSortKey] = useState('urgency')
  const [selected, setSelected] = useState(null)

  const sorted = [...MOCK_CLIENT_HEALTH].sort((a, b) => {
    if (sortKey === 'urgency') {
      const diff = URGENCY_SCORE[getUrgency(a)] - URGENCY_SCORE[getUrgency(b)]
      if (diff !== 0) return diff
    }
    return daysSince(b.lastContactDate) - daysSince(a.lastContactDate)
  })

  return (
    <div className="flex flex-col md:flex-row h-full">

      <div className={`md:w-[260px] lg:w-[360px] md:shrink-0 bg-white md:border-r border-gray-100 flex flex-col ${selected ? 'hidden md:flex' : 'flex flex-1 md:flex-none'}`}>
        <div className="px-5 py-5 border-b border-gray-100">
          <p className="text-sm font-semibold text-[#E8A020] tracking-widest uppercase mb-1">Customer Success</p>
          <h1 className="text-2xl font-bold text-[#1E3480]">客戶健康追蹤</h1>
          <p className="text-sm text-gray-500 mt-0.5">{sorted.length} 位追蹤中客戶</p>
        </div>
        <div className="px-5 py-3 border-b border-gray-100 flex gap-1.5 shrink-0">
          {[
            { key: 'urgency', label: '急迫性' },
            { key: 'contact', label: '最後接觸' },
          ].map((o) => (
            <button
              key={o.key}
              onClick={() => setSortKey(o.key)}
              className={`text-sm px-3 py-1 rounded-lg border transition-all ${
                sortKey === o.key
                  ? 'bg-[#1E3480] border-[#1E3480] text-white font-semibold'
                  : 'border-gray-200 text-gray-500 hover:border-[#1E3480] hover:text-[#1E3480]'
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
        <div className="overflow-y-auto flex-1">
          {sorted.map((c) => (
            <ClientListItem
              key={c.id}
              client={c}
              selected={selected?.id === c.id}
              onClick={() => setSelected(c)}
            />
          ))}
        </div>
      </div>

      <div className={`flex-1 min-w-0 overflow-hidden bg-white ${selected ? 'flex flex-col' : 'hidden md:flex'}`}>
        {selected
          ? <DetailPanel client={selected} onBack={() => setSelected(null)} isDemoMode={isDemoMode} />
          : null
        }
      </div>

    </div>
  )
}
