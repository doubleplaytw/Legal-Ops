import { useState } from 'react'
import { MOCK_CLIENT_HEALTH, CASE_STATUSES } from '../constants/mockData'

const TODAY = new Date()
TODAY.setHours(0, 0, 0, 0)

function daysSince(dateStr) {
  return Math.floor((TODAY - new Date(dateStr)) / 86400000)
}

function contactUrgencyColor(days) {
  if (days > 14) return 'text-red-500'
  if (days > 7)  return 'text-orange-500'
  return 'text-emerald-600'
}


function SectionLabel({ children }) {
  return <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">{children}</p>
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
              <span className="text-xs text-gray-400">{c.date}</span>
              <span className="text-gray-300">·</span>
              <span className="text-xs text-gray-400">{c.lawyer} 律師</span>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed">{c.note}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

function FollowUpList({ followUps }) {
  return (
    <div className="flex flex-col gap-3">
      {followUps.map((f) => (
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
          <div>
            <p className={`text-sm ${f.done ? 'text-gray-400 line-through' : 'text-gray-700'}`}>{f.task}</p>
            <p className="text-xs text-gray-400 mt-0.5">{f.date}</p>
          </div>
        </div>
      ))}
    </div>
  )
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

function ClientListItem({ client, selected, onClick }) {
  const days = daysSince(client.lastContactDate)
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition-all border-b border-gray-50 last:border-0 ${
        selected ? 'bg-[#1E3480]/5' : 'hover:bg-gray-50'
      }`}
    >
      <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${selected ? 'bg-[#1E3480]' : 'bg-[#1E3480]/10'}`}>
        <span className={`text-xs font-bold ${selected ? 'text-white' : 'text-[#1E3480]'}`}>{client.lawyer}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-800 truncate">{client.client}</p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="text-xs text-gray-400">{client.caseType}</span>
          <StatusBadge statusKey={client.status} />
        </div>
      </div>
      <span className={`text-xs font-medium shrink-0 ${contactUrgencyColor(days)}`}>{days} 天前</span>
    </button>
  )
}

function DetailPanel({ client }) {
  const days = daysSince(client.lastContactDate)
  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Client header */}
      <div className="px-8 py-6 border-b border-gray-100">
        <div className="flex items-center gap-2.5 mb-0.5">
          <h2 className="text-xl font-bold text-[#1E3480]">{client.client}</h2>
          <StatusBadge statusKey={client.status} />
        </div>
        <p className="text-sm text-gray-400">{client.caseNo} · {client.caseType} · {client.lawyer} 律師</p>

        <div className="flex items-center gap-6 mt-5">
          <div>
            <p className="text-xs text-gray-400 mb-1">最後接觸</p>
            <span className={`text-sm font-semibold ${contactUrgencyColor(days)}`}>{days} 天前（{client.lastContactDate}）</span>
          </div>
          <div className="w-px h-8 bg-gray-100" />
          <div>
            <p className="text-xs text-gray-400 mb-1">接觸次數</p>
            <span className="text-sm font-semibold text-gray-700">{client.contacts.length} 次</span>
          </div>
        </div>
      </div>

      <div className="px-8 py-6 flex flex-col gap-8">
        {/* Contact log */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <SectionLabel>接觸紀錄</SectionLabel>
            <button className="text-xs font-semibold text-[#1E3480] bg-[#1E3480]/5 hover:bg-[#1E3480]/10 px-3 py-1.5 rounded-lg border border-[#1E3480]/10 transition-all">
              ＋ 新增紀錄
            </button>
          </div>
          <ContactLog contacts={client.contacts} />
        </div>

        <div className="h-px bg-gray-100" />

        {/* Drive links */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <SectionLabel>相關文件</SectionLabel>
            <button className="text-xs font-semibold text-[#1E3480] bg-[#1E3480]/5 hover:bg-[#1E3480]/10 px-3 py-1.5 rounded-lg border border-[#1E3480]/10 transition-all">
              ＋ 新增連結
            </button>
          </div>
          {client.driveLinks.length === 0 ? (
            <p className="text-xs text-gray-300">尚未連結文件</p>
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

        {/* Follow ups */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <SectionLabel>後續追蹤</SectionLabel>
            <button className="text-xs font-semibold text-[#1E3480] bg-[#1E3480]/5 hover:bg-[#1E3480]/10 px-3 py-1.5 rounded-lg border border-[#1E3480]/10 transition-all">
              ＋ 新增追蹤
            </button>
          </div>
          <FollowUpList followUps={client.followUps} />
        </div>
      </div>
    </div>
  )
}

export default function ClientSuccessView() {
  const sorted = [...MOCK_CLIENT_HEALTH].sort((a, b) =>
    daysSince(b.lastContactDate) - daysSince(a.lastContactDate)
  )
  const [selected, setSelected] = useState(sorted[0])

  return (
    <div className="flex h-full">

      {/* Left list */}
      <div className="w-72 shrink-0 bg-white border-r border-gray-100 flex flex-col">
        <div className="px-5 py-5 border-b border-gray-100">
          <p className="text-xs font-semibold text-[#E8A020] tracking-widest uppercase mb-1">Client Success</p>
          <h1 className="text-lg font-bold text-[#1E3480]">客戶健康追蹤</h1>
          <p className="text-xs text-gray-400 mt-0.5">{sorted.length} 位追蹤中客戶</p>
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

      {/* Right detail */}
      <div className="flex-1 overflow-hidden bg-white">
        {selected
          ? <DetailPanel client={selected} />
          : <div className="flex items-center justify-center h-full text-sm text-gray-300">請選擇客戶</div>
        }
      </div>

    </div>
  )
}
