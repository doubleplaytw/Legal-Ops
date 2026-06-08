import { useState, useMemo, useEffect } from 'react'
import { MOCK_CLIENT_MASTER, MOCK_CASES, CASE_STATUSES } from '../constants/mockData'
import { fetchClientMaster } from '../services/sheets'

// ── 常數 ──────────────────────────────────────────────────────────────────

const CLIENT_STATUS_CONFIG = {
  pending:    { label: '待諮詢', cls: 'bg-gray-100 text-gray-500' },
  consulting: { label: '諮詢中', cls: 'bg-blue-50 text-blue-600 border border-blue-100' },
  retained:   { label: '委任中', cls: 'bg-emerald-50 text-emerald-700 border border-emerald-100' },
  former:     { label: '前客戶', cls: 'bg-gray-50 text-gray-400 border border-gray-100' },
  lost:       { label: '流失',   cls: 'bg-red-50 text-red-500 border border-red-100' },
}

const STATUS_ORDER = ['pending', 'consulting', 'retained', 'former', 'lost']

const CONTRACT_CONFIG = {
  unsigned:   { label: '未簽',  cls: 'text-gray-400' },
  signed:     { label: '已簽',  cls: 'text-emerald-600 font-semibold' },
  terminated: { label: '終止',  cls: 'text-red-500' },
}

const CONFLICT_CONFIG = {
  unchecked: { label: '未查',   cls: 'text-gray-400' },
  clear:     { label: '無衝突', cls: 'text-emerald-600' },
  conflict:  { label: '有衝突', cls: 'text-red-500 font-semibold' },
}

const SELECT_CLS = 'w-full text-xs border border-gray-100 rounded-lg bg-gray-50 py-1.5 px-2 text-gray-600 focus:outline-none focus:border-[#1E3480] appearance-none cursor-pointer transition'

// ── 小工具 ─────────────────────────────────────────────────────────────────

function getLinkedCases(client) {
  return MOCK_CASES.filter(c => client.linkedCaseIds.includes(c.id))
}

function getCaseStatus(key) {
  return CASE_STATUSES.find(s => s.key === key)
}

function getInitials(name) {
  if (!name) return '?'
  const clean = name.replace(/[○股份有限公司]/g, '')
  return clean.charAt(0) || name.charAt(0)
}

// ── 子元件 ─────────────────────────────────────────────────────────────────

function StatusBadge({ status }) {
  const cfg = CLIENT_STATUS_CONFIG[status] || CLIENT_STATUS_CONFIG.pending
  return (
    <span className={`text-xs font-semibold px-1.5 py-0.5 rounded whitespace-nowrap ${cfg.cls}`}>
      {cfg.label}
    </span>
  )
}

function CaseStatusChip({ statusKey }) {
  const s = getCaseStatus(statusKey)
  if (!s) return null
  return (
    <span className="text-xs font-medium px-1.5 py-0.5 rounded whitespace-nowrap"
      style={{ color: s.color, backgroundColor: s.color + '18' }}>
      {s.label}
    </span>
  )
}

function SectionLabel({ children }) {
  return <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">{children}</p>
}

function InfoRow({ label, children }) {
  return (
    <div className="flex gap-3 py-2 border-b border-gray-50 last:border-0">
      <span className="w-24 shrink-0 text-sm text-gray-400">{label}</span>
      <span className="flex-1 text-sm text-gray-700">{children}</span>
    </div>
  )
}

const Dash = () => <span className="text-gray-300">—</span>

// ── 清單項目 ───────────────────────────────────────────────────────────────

function ClientListItem({ client, selected, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition-all border-b border-gray-50 last:border-0 ${
        selected ? 'bg-[#1E3480]/5' : 'hover:bg-gray-50'
      }`}
    >
      <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-sm font-bold ${
        selected ? 'bg-[#1E3480] text-white' : 'bg-[#1E3480]/10 text-[#1E3480]'
      }`}>
        {getInitials(client.name)}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5 min-w-0">
          <p className="text-sm font-semibold text-[#1E3480] truncate">{client.name}</p>
          {client.salutation && <span className="text-xs text-gray-400 shrink-0">{client.salutation}</span>}
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-gray-400">
            {client.assignedLawyer ? `${client.assignedLawyer} 律師` : '未指派'}
          </span>
        </div>
      </div>

      <div className="shrink-0">
        <StatusBadge status={client.clientStatus} />
      </div>
    </button>
  )
}

// ── 詳細面板 ───────────────────────────────────────────────────────────────

function DetailPanel({ client, onBack }) {
  const linkedCases = getLinkedCases(client)
  const contractCfg = CONTRACT_CONFIG[client.contractStatus] || CONTRACT_CONFIG.unsigned
  const conflictCfg = CONFLICT_CONFIG[client.conflictCheck] || CONFLICT_CONFIG.unchecked

  return (
    <div className="flex flex-col h-full overflow-y-auto">

      {/* Header */}
      <div className="px-5 md:px-8 py-5 border-b border-gray-100">
        <button
          onClick={onBack}
          className="md:hidden flex items-center gap-1.5 text-sm font-semibold text-[#1E3480] mb-4"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          返回列表
        </button>

        {/* 姓名 + 狀態 */}
        <div className="flex items-start gap-3 mb-3">
          <div className="w-11 h-11 rounded-full bg-[#1E3480] flex items-center justify-center shrink-0">
            <span className="text-base font-bold text-white">{getInitials(client.name)}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1.5">
              <h2 className="text-lg font-bold text-[#1E3480]">{client.name}</h2>
              {client.salutation && <span className="text-sm text-gray-500">{client.salutation}</span>}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <StatusBadge status={client.clientStatus} />
            </div>
          </div>
        </div>

        {/* 客戶代碼 · 分所 · 建檔日期 */}
        <div className="flex items-center gap-3 text-xs text-gray-400 pl-14 flex-wrap">
          <span className="font-mono">{client.clientNo}</span>
          {client.branch && <><span>·</span><span>{client.branch}</span></>}
          {client.createdAt && <><span>·</span><span>建檔 {client.createdAt}</span></>}
        </div>
      </div>

      <div className="px-5 md:px-8 py-6 flex flex-col gap-8">

        {/* 聯絡資訊 — 固定 8 列，個人/法人統一 */}
        <div>
          <SectionLabel>聯絡資訊</SectionLabel>
          <InfoRow label="行動電話">{client.mobile || <Dash />}</InfoRow>
          <InfoRow label="聯絡電話">{client.phone || <Dash />}</InfoRow>
          <InfoRow label="電子信箱">{client.email || <Dash />}</InfoRow>
          <InfoRow label="客戶ID">
            {client.nationalId || client.taxId || <Dash />}
          </InfoRow>
          <InfoRow label="來源管道">{client.referral || <Dash />}</InfoRow>
          <InfoRow label="初始諮詢">{client.consultType || <Dash />}</InfoRow>
          <InfoRow label="負責律師">
            {client.assignedLawyer
              ? <span className="font-semibold text-[#1E3480]">{client.assignedLawyer} 律師</span>
              : <span className="text-gray-400">未指派</span>}
          </InfoRow>
          <InfoRow label="委任合約">
            <span className={contractCfg.cls}>{contractCfg.label}</span>
          </InfoRow>
        </div>

        <div className="h-px bg-gray-100" />

        {/* 案件概況 */}
        <div>
          <SectionLabel>案件概況</SectionLabel>
          {linkedCases.length === 0 ? (
            <p className="text-sm text-gray-300">尚無關聯案件</p>
          ) : (
            <div className="flex flex-col gap-2">
              {linkedCases.map(c => (
                <div key={c.id} className="flex items-center gap-2 py-2 border-b border-gray-50 last:border-0">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <span className="text-sm font-mono text-gray-500 shrink-0">{c.id}</span>
                      <CaseStatusChip statusKey={c.status} />
                      {c.instanceLevel && (
                        <span className="text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">{c.instanceLevel}</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-700 truncate">{c.cause}</p>
                    <p className="text-xs text-gray-400">{c.type} · {c.lawyer} 律師</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="h-px bg-gray-100" />

        {/* 利衝查詢 */}
        <div>
          <SectionLabel>利衝查詢</SectionLabel>
          <InfoRow label="查詢狀態">
            <span className={`font-semibold ${conflictCfg.cls}`}>{conflictCfg.label}</span>
          </InfoRow>
          <InfoRow label="查詢日期">{client.conflictCheckDate || <Dash />}</InfoRow>
          <InfoRow label="備註">{client.conflictNote || <Dash />}</InfoRow>
        </div>

        <div className="h-px bg-gray-100" />

        {/* 備註 */}
        <div>
          <SectionLabel>備註</SectionLabel>
          {client.initialNote && (
            <div className="mb-4">
              <p className="text-xs text-gray-400 mb-1">初始需求說明</p>
              <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 rounded-lg px-3 py-2.5">{client.initialNote}</p>
            </div>
          )}
          {client.internalNote && (
            <div>
              <p className="text-xs text-gray-400 mb-1">內部備註</p>
              <p className="text-sm text-gray-700 leading-relaxed bg-amber-50/60 rounded-lg px-3 py-2.5">{client.internalNote}</p>
            </div>
          )}
          {!client.initialNote && !client.internalNote && (
            <p className="text-sm text-gray-300">尚無備註</p>
          )}
        </div>

      </div>
    </div>
  )
}

// ── 主頁面 ─────────────────────────────────────────────────────────────────

const INIT_FILTERS = { status: 'all', referral: 'all', branch: 'all' }

export default function ClientMasterView() {
  const [selected, setSelected] = useState(null)
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState(INIT_FILTERS)
  const [sheetClients, setSheetClients] = useState([])

  useEffect(() => {
    fetchClientMaster()
      .then(setSheetClients)
      .catch(err => console.error('fetchClientMaster failed:', err))
  }, [])

  const allClients = useMemo(
    () => sheetClients.length > 0 ? sheetClients : MOCK_CLIENT_MASTER,
    [sheetClients]
  )

  const uniqueReferrals = useMemo(() =>
    [...new Set(allClients.map(c => c.referral).filter(Boolean))].sort()
  , [allClients])

  const uniqueBranches = useMemo(() =>
    [...new Set(allClients.flatMap(c => c.branch ? c.branch.split('、') : []).filter(Boolean))].sort()
  , [allClients])

  function setFilter(key, val) {
    setFilters(f => ({ ...f, [key]: val }))
  }

  const filtered = useMemo(() => {
    let list = allClients
    if (filters.status !== 'all')   list = list.filter(c => c.clientStatus === filters.status)
    if (filters.referral !== 'all') list = list.filter(c => c.referral === filters.referral)
    if (filters.branch !== 'all')     list = list.filter(c => c.branch?.includes(filters.branch))
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.mobile.includes(q) ||
        c.clientNo.toLowerCase().includes(q)
      )
    }
    return list
  }, [allClients, filters, search])

  const activeFilterCount = Object.values(filters).filter(v => v !== 'all').length

  return (
    <div className="flex flex-col md:flex-row h-full">

      {/* 左側清單 — 4 */}
      <div className={`md:w-2/5 md:shrink-0 bg-white md:border-r border-gray-100 flex flex-col ${selected ? 'hidden md:flex' : 'flex flex-1 md:flex-none'}`}>

        {/* 標題 */}
        <div className="px-5 py-5 border-b border-gray-100">
          <p className="text-sm font-semibold text-[#E8A020] tracking-widest uppercase mb-1">Customer Master Data</p>
          <h1 className="text-2xl font-bold text-[#1E3480]">Profile</h1>
        </div>

        {/* 搜尋 */}
        <div className="px-4 pt-3 pb-2">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              type="text"
              placeholder="搜尋姓名、電話、編號…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-sm bg-gray-50 border border-gray-100 rounded-lg focus:outline-none focus:border-[#1E3480] placeholder:text-gray-300 transition"
            />
          </div>
        </div>

        {/* 四維篩選 */}
        <div className="px-4 pb-3 grid grid-cols-2 gap-1.5">
          <div className="relative">
            <select value={filters.status} onChange={e => setFilter('status', e.target.value)} className={SELECT_CLS}>
              <option value="all">全部狀態</option>
              {STATUS_ORDER.map(s => (
                <option key={s} value={s}>{CLIENT_STATUS_CONFIG[s].label}</option>
              ))}
            </select>
            <svg className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-400" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
          </div>

          <div className="relative">
            <select value={filters.referral} onChange={e => setFilter('referral', e.target.value)} className={SELECT_CLS}>
              <option value="all">全部來源</option>
              {uniqueReferrals.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            <svg className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-400" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
          </div>

          <div className="relative">
            <select value={filters.branch} onChange={e => setFilter('branch', e.target.value)} className={SELECT_CLS}>
              <option value="all">全部分所</option>
              {uniqueBranches.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
            <svg className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-400" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
          </div>
        </div>

        {/* 篩選結果提示 */}
        <div className="px-4 pb-2 flex items-center justify-between">
          <span className="text-xs text-gray-400">{filtered.length} 筆結果</span>
          {activeFilterCount > 0 && (
            <button onClick={() => setFilters(INIT_FILTERS)} className="text-xs text-[#1E3480] hover:underline">
              清除篩選
            </button>
          )}
        </div>

        {/* 清單 */}
        <div className="overflow-y-auto flex-1">
          {filtered.length === 0 ? (
            <p className="text-sm text-gray-300 text-center py-12">無符合結果</p>
          ) : (
            filtered.map(c => (
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

      {/* 右側詳細面板 — 6 */}
      <div className={`md:w-3/5 min-w-0 overflow-hidden bg-white ${selected ? 'flex flex-col' : 'hidden md:flex items-center justify-center'}`}>
        {selected ? (
          <DetailPanel client={selected} onBack={() => setSelected(null)} />
        ) : (
          <div className="text-center text-gray-300">
            <svg className="mx-auto mb-3" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            <p className="text-sm">選擇左側客戶查看詳細資料</p>
          </div>
        )}
      </div>

    </div>
  )
}
