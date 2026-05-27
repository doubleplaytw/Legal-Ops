import { useState } from 'react'
import { MOCK_CLIENT_HEALTH, CASE_STATUSES, DEADLINE_CATEGORIES } from '../../constants/mockData'

const TODAY = new Date()
TODAY.setHours(0, 0, 0, 0)

function daysSince(dateStr) {
  return Math.floor((TODAY - new Date(dateStr)) / 86400000)
}

function daysUntil(dateStr) {
  return Math.floor((new Date(dateStr) - TODAY) / 86400000)
}

function followUpUrgency(days) {
  if (days < 0)   return { color: 'text-red-500',    label: `已逾期 ${Math.abs(days)} 天` }
  if (days === 0)  return { color: 'text-red-500',    label: '今天到期' }
  if (days <= 3)   return { color: 'text-red-500',    label: `${days} 天後` }
  if (days <= 7)   return { color: 'text-orange-500', label: `${days} 天後` }
  return            { color: 'text-gray-400',         label: `${days} 天後` }
}

function contactUrgencyColor(days) {
  if (days > 14) return 'text-red-500'
  if (days > 7)  return 'text-orange-500'
  return 'text-gray-400'
}


function SectionLabel({ children }) {
  return <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2.5">{children}</p>
}

function StatusBadge({ statusKey }) {
  const s = CASE_STATUSES.find((s) => s.key === statusKey)
  if (!s) return null
  return (
    <span className="text-xs font-medium px-1.5 py-0.5 rounded whitespace-nowrap" style={{ color: s.color, backgroundColor: s.color + '18' }}>
      {s.label}
    </span>
  )
}

function ClientRow({ client, onClick }) {
  const days = daysSince(client.lastContactDate)
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition text-left"
    >
      <div className="w-8 h-8 rounded-full bg-[#1E3480]/10 flex items-center justify-center shrink-0">
        <span className="text-xs font-bold text-[#1E3480]">{client.lawyer}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[#1E3480] truncate">{client.parties}</p>
        <p className="text-xs text-gray-600 truncate">{client.cause}</p>
        <p className="text-xs text-gray-600 truncate">{client.relief}</p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <StatusBadge statusKey={client.status} />
        </div>
      </div>
      <span className={`text-xs font-medium shrink-0 ${contactUrgencyColor(days)}`}>{days} 天前</span>
    </button>
  )
}

function ContactLog({ contacts }) {
  return (
    <div className="flex flex-col">
      {contacts.map((c, idx) => (
        <div key={c.id} className="flex gap-3">
          <div className="flex flex-col items-center shrink-0">
            <div className="w-2 h-2 rounded-full bg-[#1E3480] mt-1 shrink-0" />
            {idx < contacts.length - 1 && <div className="w-px flex-1 bg-gray-100 my-1" />}
          </div>
          <div className={`${idx < contacts.length - 1 ? 'pb-4' : ''} flex-1`}>
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-xs font-semibold text-gray-700">{c.type}</span>
              <span className="text-xs text-gray-300">·</span>
              <span className="text-xs text-gray-400">{c.date.slice(5)}</span>
              <span className="text-xs text-gray-300">·</span>
              <span className="text-xs text-gray-400">{c.lawyer} 律師</span>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">{c.note}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

function FollowUpList({ followUps }) {
  return (
    <div className="flex flex-col gap-2.5">
      {followUps.map((f) => {
        const urgency = !f.done ? followUpUrgency(daysUntil(f.date)) : null
        return (
          <div key={f.id} className="flex items-start gap-2.5">
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
              <div className="flex items-center gap-1.5 mb-0.5">
                {f.category && DEADLINE_CATEGORIES[f.category] && (
                  <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${DEADLINE_CATEGORIES[f.category].color}`}>
                    {DEADLINE_CATEGORIES[f.category].label}
                  </span>
                )}
                <p className={`text-xs ${f.done ? 'text-gray-400 line-through' : 'text-gray-700'}`}>{f.task}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">{f.date}</span>
                {urgency && (
                  <span className={`text-xs font-semibold ${urgency.color}`}>{urgency.label}</span>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function ClientDetail({ client, onBack }) {
  const days = daysSince(client.lastContactDate)
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-5 py-3.5 border-b border-gray-100 shrink-0">
        <button
          onClick={onBack}
          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 shrink-0"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-gray-800 truncate">{client.client}</p>
          <p className="text-xs font-semibold text-[#1E3480] truncate">{client.parties}</p>
          <p className="text-xs text-gray-600 truncate">{client.cause}</p>
          <p className="text-xs text-gray-600 truncate">{client.relief}</p>
        </div>
      </div>

      <div className="overflow-y-auto flex-1 px-5 py-4 flex flex-col gap-5">
        {/* Last contact summary */}
        <div className="flex items-center justify-between bg-gray-50 rounded-xl p-3.5">
          <p className="text-xs text-gray-400">最後接觸</p>
          <span className={`text-xs font-semibold ${contactUrgencyColor(days)}`}>{days} 天前（{client.lastContactDate}）</span>
        </div>

        {/* Contact log */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <SectionLabel>接觸紀錄</SectionLabel>
            <button className="text-xs font-semibold text-[#1E3480] hover:underline">＋ 新增</button>
          </div>
          <ContactLog contacts={client.contacts} />
        </div>

        {/* Follow ups */}
        <div>
          <SectionLabel>後續追蹤</SectionLabel>
          <FollowUpList followUps={client.followUps} />
        </div>
      </div>
    </div>
  )
}

export default function ClientHealthPanel({ open, onClose }) {
  const [selected, setSelected] = useState(null)

  const sorted = [...MOCK_CLIENT_HEALTH].sort((a, b) =>
    daysSince(b.lastContactDate) - daysSince(a.lastContactDate)
  )

  const handleClose = () => {
    setSelected(null)
    onClose()
  }

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-20 bg-black/10" onClick={handleClose} />
      )}
      <div className={`fixed top-0 right-0 h-full w-80 bg-white shadow-2xl z-30 flex flex-col transition-transform duration-300 ease-in-out ${open ? 'translate-x-0' : 'translate-x-full'}`}>
        {selected ? (
          <ClientDetail client={selected} onBack={() => setSelected(null)} />
        ) : (
          <>
            <div className="px-5 py-4 border-b border-gray-100 flex items-start justify-between shrink-0">
              <div>
                <p className="text-xs font-semibold text-[#E8A020] tracking-widest uppercase mb-0.5">Client Success</p>
                <h2 className="text-base font-bold text-[#1E3480]">客戶健康追蹤</h2>
                <p className="text-xs text-gray-400 mt-0.5">{sorted.length} 位追蹤中客戶</p>
              </div>
              <button
                onClick={handleClose}
                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 mt-0.5"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="overflow-y-auto flex-1 px-3 py-2">
              {sorted.map((c) => (
                <ClientRow key={c.id} client={c} onClick={() => setSelected(c)} />
              ))}
            </div>
          </>
        )}
      </div>
    </>
  )
}
