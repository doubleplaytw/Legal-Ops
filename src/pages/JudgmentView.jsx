import { useState, useMemo } from 'react'
import { MOCK_JUDGMENTS, MOCK_CLIENT_HEALTH } from '../constants/mockData'

const COURTS = [
  '全部法院',
  // 最高審級
  '最高法院',
  '最高行政法院',
  // 專業法院
  '智慧財產及商業法院',
  // 高等法院
  '臺灣高等法院',
  '臺灣高等法院臺中分院',
  '臺灣高等法院臺南分院',
  '臺灣高等法院高雄分院',
  '臺灣高等法院花蓮分院',
  // 高等行政法院
  '臺北高等行政法院',
  '臺中高等行政法院',
  '高雄高等行政法院',
  // 地方法院
  '臺灣臺北地方法院',
  '臺灣士林地方法院',
  '臺灣新北地方法院',
  '臺灣桃園地方法院',
  '臺灣新竹地方法院',
  '臺灣苗栗地方法院',
  '臺灣臺中地方法院',
  '臺灣南投地方法院',
  '臺灣彰化地方法院',
  '臺灣雲林地方法院',
  '臺灣嘉義地方法院',
  '臺灣臺南地方法院',
  '臺灣高雄地方法院',
  '臺灣橋頭地方法院',
  '臺灣屏東地方法院',
  '臺灣臺東地方法院',
  '臺灣花蓮地方法院',
  '臺灣宜蘭地方法院',
  '臺灣基隆地方法院',
  '臺灣澎湖地方法院',
  '臺灣金門地方法院',
  '臺灣連江地方法院',
  // 地方行政法院（2023年新制）
  '臺灣臺北地方行政法院',
  '臺灣臺中地方行政法院',
  '臺灣高雄地方行政法院',
]

const CATEGORIES = ['憲法', '民事', '刑事', '行政', '懲戒']

const CATEGORY_TYPE_MAP = {
  '民事': ['民事訴訟', '商事相關', '家事案件', '財富傳承', '勞資糾紛', '智慧財產', '書狀撰寫', '常年法務'],
  '刑事': ['刑事訴訟'],
  '行政': ['行政訴訟'],
  '憲法': [],
  '懲戒': [],
}

const ZI_OPTIONS = [
  '台上', '台再', '台抗',
  '上', '上更', '上易',
  '訴', '易', '簡', '簡上',
  '家上', '家', '勞上', '勞',
  '智上', '民商上',
  '台行上', '行上', '行訴',
  '原', '矚', '重訴',
]

function parseCaseNo(caseNo) {
  const yearMatch = caseNo.match(/(\d+)年度/)
  const ziMatch   = caseNo.match(/年度(.+?)字第/)
  const numMatch  = caseNo.match(/字第(\d+)號/)
  return {
    year: yearMatch ? parseInt(yearMatch[1]) : null,
    zi:   ziMatch   ? ziMatch[1]             : '',
    num:  numMatch  ? parseInt(numMatch[1])  : null,
  }
}

function getResultStyle(result) {
  if (result.includes('廢棄') || result.includes('撤銷'))
    return 'bg-orange-50 text-orange-600 border border-orange-100'
  if (result.includes('部分'))
    return 'bg-blue-50 text-blue-600 border border-blue-100'
  if (result.includes('勝訴'))
    return 'bg-emerald-50 text-emerald-600 border border-emerald-100'
  return 'bg-gray-50 text-gray-500 border border-gray-100'
}

function JudgmentListCard({ j, selected, linkedCount, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-4 border-b border-gray-50 last:border-0 transition-colors ${
        selected ? 'bg-[#1E3480]/5' : 'hover:bg-gray-50'
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <p className="text-xs font-semibold text-[#1E3480] leading-snug">{j.caseNo}</p>
        {linkedCount > 0 && (
          <span className="text-xs font-semibold px-1.5 py-0.5 rounded-full bg-[#1E3480]/10 text-[#1E3480] whitespace-nowrap shrink-0">
            已關聯 {linkedCount}
          </span>
        )}
      </div>
      <p className="text-sm text-gray-700 mb-2">{j.cause}</p>
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-gray-400">{j.court}</span>
        <span className="text-gray-200">·</span>
        <span className="text-xs text-gray-400">{j.date}</span>
        <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${getResultStyle(j.result)}`}>
          {j.result}
        </span>
      </div>
    </button>
  )
}

function LinkModal({ judgment, links, onClose, onConfirm }) {
  const [selectedId, setSelectedId] = useState(null)

  const linkedClientIds = links
    .filter(l => l.judgmentId === judgment.id)
    .map(l => l.clientId)

  const linked   = MOCK_CLIENT_HEALTH.filter(c =>  linkedClientIds.includes(c.id))
  const available = MOCK_CLIENT_HEALTH.filter(c => !linkedClientIds.includes(c.id))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-[480px] max-h-[560px] flex flex-col overflow-hidden">

        <div className="px-6 py-5 border-b border-gray-100 shrink-0">
          <h3 className="text-base font-bold text-[#1E3480]">關聯至案件</h3>
          <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{judgment.caseNo}</p>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
          {linked.length > 0 && (
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">已關聯案件</p>
              {linked.map(c => (
                <div key={c.id} className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-gray-50 mb-1.5">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#1E3480] shrink-0">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-500 truncate">{c.parties}</p>
                    <p className="text-xs text-gray-400 truncate">{c.caseNo} · {c.caseType}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {available.length > 0 ? (
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">選擇案件</p>
              {available.map(c => (
                <button
                  key={c.id}
                  onClick={() => setSelectedId(c.id === selectedId ? null : c.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left mb-1.5 border transition-all ${
                    selectedId === c.id
                      ? 'border-[#1E3480] bg-[#1E3480]/5'
                      : 'border-gray-100 hover:border-gray-200 bg-white'
                  }`}
                >
                  <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                    selectedId === c.id ? 'bg-[#1E3480] border-[#1E3480]' : 'border-gray-300'
                  }`}>
                    {selectedId === c.id && (
                      <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                        <polyline points="2 6 5 9 10 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-700 truncate">{c.parties}</p>
                    <p className="text-xs text-gray-400 truncate">{c.caseNo} · {c.caseType}</p>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-6">已關聯至所有追蹤案件</p>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2 shrink-0">
          <button
            onClick={onClose}
            className="text-sm px-4 py-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
          >
            取消
          </button>
          <button
            onClick={() => { if (selectedId) { onConfirm(judgment.id, selectedId); onClose() } }}
            disabled={!selectedId}
            className={`text-sm font-semibold px-4 py-2 rounded-lg transition-all ${
              selectedId
                ? 'bg-[#1E3480] text-white hover:bg-[#1E3480]/90'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            確認關聯
          </button>
        </div>
      </div>
    </div>
  )
}

function DetailPanel({ judgment, links, onOpenModal }) {
  const linkedClientIds = links
    .filter(l => l.judgmentId === judgment.id)
    .map(l => l.clientId)
  const linkedClients = MOCK_CLIENT_HEALTH.filter(c => linkedClientIds.includes(c.id))

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="px-6 py-6 border-b border-gray-100 shrink-0">
        <p className="text-xs font-semibold text-[#E8A020] tracking-widest uppercase mb-1">{judgment.court}</p>
        <h2 className="text-base font-bold text-[#1E3480] leading-snug mb-3">{judgment.caseNo}</h2>

        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className={`text-xs font-semibold px-2 py-0.5 rounded ${getResultStyle(judgment.result)}`}>
            {judgment.result}
          </span>
          <span className="text-xs text-gray-400">{judgment.date}</span>
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-start gap-2">
            <span className="text-xs text-gray-400 w-12 shrink-0 pt-0.5">案由</span>
            <span className="text-sm text-gray-700">{judgment.cause}</span>
          </div>
        </div>
      </div>

      <div className="px-6 py-5 flex flex-col gap-5 flex-1">
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">判決要旨</p>
          <p className="text-sm text-gray-700 leading-relaxed">{judgment.summary}</p>
        </div>

        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">關鍵詞</p>
          <div className="flex flex-wrap gap-1.5">
            {judgment.tags.map(t => (
              <span key={t} className="text-xs font-medium px-2 py-0.5 rounded-full bg-[#1E3480]/8 text-[#1E3480]">
                {t}
              </span>
            ))}
          </div>
        </div>

        {linkedClients.length > 0 && (
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">已關聯案件</p>
            <div className="flex flex-col gap-1.5">
              {linkedClients.map(c => (
                <div key={c.id} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#1E3480]/5">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#1E3480] shrink-0">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  <span className="text-sm font-semibold text-[#1E3480]">{c.parties}</span>
                  <span className="text-xs text-gray-400">{c.caseNo}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={onOpenModal}
            className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg bg-[#1E3480] text-white hover:bg-[#1E3480]/90 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
            </svg>
            關聯至案件
          </button>
          <a
            href={judgment.url}
            target="_blank"
            rel="noreferrer"
            className="text-sm font-semibold px-4 py-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
          >
            查看全文
          </a>
        </div>
      </div>
    </div>
  )
}

export default function JudgmentView({ links, onLink }) {
  const [search, setSearch]               = useState('')
  const [filterCourt, setFilterCourt]     = useState('全部法院')
  const [filterCategories, setFilterCategories] = useState([])
  const [filterYear, setFilterYear]       = useState('')
  const [filterZi, setFilterZi]           = useState('')
  const [filterNumFrom, setFilterNumFrom] = useState('')
  const [filterNumTo, setFilterNumTo]     = useState('')
  const [dateFrom, setDateFrom]           = useState({ year: '', month: '', day: '' })
  const [dateTo, setDateTo]               = useState({ year: '', month: '', day: '' })
  const [selected, setSelected]           = useState(null)
  const [modalOpen, setModalOpen]         = useState(false)

  function toggleCategory(cat) {
    setFilterCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    )
  }

  function clearAll() {
    setSearch(''); setFilterCourt('全部法院')
    setFilterCategories([]); setFilterYear(''); setFilterZi('')
    setFilterNumFrom(''); setFilterNumTo('')
    setDateFrom({ year: '', month: '', day: '' })
    setDateTo({ year: '', month: '', day: '' })
  }

  const hasFilters = search || filterCourt !== '全部法院' ||
    filterCategories.length > 0 || filterYear || filterZi || filterNumFrom || filterNumTo ||
    dateFrom.year || dateTo.year

  const filtered = useMemo(() => {
    return MOCK_JUDGMENTS.filter(j => {
      // 關鍵字
      if (search) {
        const q = search.toLowerCase()
        if (
          !j.cause.toLowerCase().includes(q) &&
          !j.caseNo.toLowerCase().includes(q) &&
          !j.tags.some(t => t.toLowerCase().includes(q)) &&
          !j.summary.toLowerCase().includes(q)
        ) return false
      }
      // 法院
      if (filterCourt !== '全部法院' && j.court !== filterCourt) return false
      // 案件類別（憲法/民事/刑事/行政/懲戒）
      if (filterCategories.length > 0) {
        const allowed = filterCategories.flatMap(c => CATEGORY_TYPE_MAP[c] ?? [])
        if (!j.caseTypes.some(t => allowed.includes(t))) return false
      }
      // 裁判字號
      const parsed = parseCaseNo(j.caseNo)
      if (filterYear && parsed.year !== parseInt(filterYear)) return false
      if (filterZi && parsed.zi !== filterZi) return false
      if (filterNumFrom && parsed.num < parseInt(filterNumFrom)) return false
      if (filterNumTo   && parsed.num > parseInt(filterNumTo))   return false
      // 裁判期間（民國年轉西元）
      if (dateFrom.year) {
        const adFrom = new Date(parseInt(dateFrom.year) + 1911, (parseInt(dateFrom.month) || 1) - 1, parseInt(dateFrom.day) || 1)
        if (new Date(j.date) < adFrom) return false
      }
      if (dateTo.year) {
        const adTo = new Date(parseInt(dateTo.year) + 1911, (parseInt(dateTo.month) || 12) - 1, parseInt(dateTo.day) || 31)
        if (new Date(j.date) > adTo) return false
      }
      return true
    })
  }, [search, filterCourt, filterCategories, filterYear, filterZi, filterNumFrom, filterNumTo, dateFrom, dateTo])

  function linkedCount(judgmentId) {
    return links.filter(l => l.judgmentId === judgmentId).length
  }

  return (
    <div className="flex flex-col h-full">

      {/* Header */}
      <div className="px-8 py-6 shrink-0 border-b border-gray-100 bg-white">
        <div className="flex items-end gap-4 mb-5">
          <div>
            <p className="text-xs font-semibold text-[#E8A020] tracking-widest uppercase mb-1">Research</p>
            <h1 className="text-2xl font-bold text-[#1E3480]">判決研究</h1>
          </div>
          <div className="mb-1 h-px flex-1 bg-gradient-to-r from-[#1E3480]/20 to-transparent" />
        </div>

        <div className="flex flex-col gap-3">

          {/* Row 1：關鍵字 + 案件類型 + 法院 */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                type="text"
                placeholder="搜尋案由、法條、關鍵詞..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="text-xs border border-gray-200 rounded-lg pl-8 pr-3 py-1.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1E3480]/20 focus:border-[#1E3480] bg-white w-56"
              />
            </div>
            <select value={filterCourt} onChange={e => setFilterCourt(e.target.value)}
              className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1E3480]/20 focus:border-[#1E3480] bg-white">
              {COURTS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            {hasFilters && (
              <button onClick={clearAll} className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
                清除全部
              </button>
            )}
            <span className="text-xs text-gray-400 ml-auto">共 {filtered.length} 筆</span>
          </div>

          {/* Row 2：案件類別 */}
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs text-gray-500 w-16 shrink-0">案件類別</span>
            <div className="flex items-center gap-4 flex-wrap">
              {CATEGORIES.map(cat => (
                <label key={cat} className="flex items-center gap-1.5 cursor-pointer select-none">
                  <div
                    onClick={() => toggleCategory(cat)}
                    className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                      filterCategories.includes(cat)
                        ? 'bg-[#1E3480] border-[#1E3480]'
                        : 'border-gray-300 hover:border-[#1E3480]'
                    }`}
                  >
                    {filterCategories.includes(cat) && (
                      <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                        <polyline points="2 6 5 9 10 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                  <span className="text-xs text-gray-700">{cat}</span>
                </label>
              ))}
              <span className="text-xs text-gray-400">（未勾選預設為全選）</span>
            </div>
          </div>

          {/* Row 3：裁判字號 */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-gray-500 w-16 shrink-0">裁判字號</span>
            <input
              type="number"
              placeholder="年度"
              value={filterYear}
              onChange={e => setFilterYear(e.target.value)}
              className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1E3480]/20 focus:border-[#1E3480] bg-white w-20"
            />
            <span className="text-xs text-gray-500">年度</span>
            <select value={filterZi} onChange={e => setFilterZi(e.target.value)}
              className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1E3480]/20 focus:border-[#1E3480] bg-white">
              <option value="">常用字別</option>
              {ZI_OPTIONS.map(z => <option key={z} value={z}>{z}</option>)}
            </select>
            <span className="text-xs text-gray-500">字第</span>
            <input
              type="number"
              placeholder="起"
              value={filterNumFrom}
              onChange={e => setFilterNumFrom(e.target.value)}
              className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1E3480]/20 focus:border-[#1E3480] bg-white w-20"
            />
            <span className="text-xs text-gray-400">—</span>
            <input
              type="number"
              placeholder="迄"
              value={filterNumTo}
              onChange={e => setFilterNumTo(e.target.value)}
              className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1E3480]/20 focus:border-[#1E3480] bg-white w-20"
            />
            <span className="text-xs text-gray-500">號</span>
          </div>

          {/* Row 4：裁判期間 */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-gray-500 w-16 shrink-0">裁判期間</span>
            <span className="text-xs text-gray-500">民國</span>
            {['year', 'month', 'day'].map((f, i) => (
              <span key={f} className="flex items-center gap-1">
                <input
                  type="number"
                  placeholder={f === 'year' ? '年' : f === 'month' ? '月' : '日'}
                  value={dateFrom[f]}
                  onChange={e => setDateFrom(prev => ({ ...prev, [f]: e.target.value }))}
                  className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1E3480]/20 focus:border-[#1E3480] bg-white w-16"
                />
                <span className="text-xs text-gray-500">{f === 'year' ? '年' : f === 'month' ? '月' : '日'}</span>
              </span>
            ))}
            <span className="text-xs text-gray-400 mx-1">至</span>
            {['year', 'month', 'day'].map((f) => (
              <span key={f} className="flex items-center gap-1">
                <input
                  type="number"
                  placeholder={f === 'year' ? '年' : f === 'month' ? '月' : '日'}
                  value={dateTo[f]}
                  onChange={e => setDateTo(prev => ({ ...prev, [f]: e.target.value }))}
                  className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1E3480]/20 focus:border-[#1E3480] bg-white w-16"
                />
                <span className="text-xs text-gray-500">{f === 'year' ? '年' : f === 'month' ? '月' : '日'}</span>
              </span>
            ))}
          </div>

        </div>
      </div>

      {/* Body: list + detail */}
      <div className="flex flex-1 overflow-hidden">

        {/* Left: judgment list */}
        <div className="w-[360px] shrink-0 border-r border-gray-100 overflow-y-auto bg-white">
          {filtered.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-16">無符合條件的判決</p>
          )}
          {filtered.map(j => (
            <JudgmentListCard
              key={j.id}
              j={j}
              selected={selected?.id === j.id}
              linkedCount={linkedCount(j.id)}
              onClick={() => setSelected(j)}
            />
          ))}
        </div>

        {/* Right: detail panel */}
        <div className="flex-1 overflow-hidden bg-[#F4F6FB]">
          {selected ? (
            <DetailPanel
              judgment={selected}
              links={links}
              onOpenModal={() => setModalOpen(true)}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-8">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-200">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
              </svg>
              <p className="text-sm text-gray-400">點選左側判決查看詳情</p>
            </div>
          )}
        </div>
      </div>

      {/* Link modal */}
      {modalOpen && selected && (
        <LinkModal
          judgment={selected}
          links={links}
          onClose={() => setModalOpen(false)}
          onConfirm={onLink}
        />
      )}
    </div>
  )
}
