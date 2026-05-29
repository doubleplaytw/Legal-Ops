import { useState, useMemo } from 'react'
import { MOCK_STATUTES, STATUTE_TYPES } from '../constants/mockData'
import { CASE_TYPES } from '../constants/caseTypes'

const TYPE_STYLE = {
  '消滅時效': 'bg-red-50 text-red-600 border border-red-100',
  '取得時效': 'bg-emerald-50 text-emerald-600 border border-emerald-100',
  '追訴時效': 'bg-violet-50 text-violet-600 border border-violet-100',
  '除斥期間': 'bg-amber-50 text-amber-600 border border-amber-100',
  '合約期間': 'bg-sky-50 text-sky-600 border border-sky-100',
}

function TypeBadge({ type }) {
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-md whitespace-nowrap ${TYPE_STYLE[type]}`}>
      {type}
    </span>
  )
}

function StatuteRow({ s }) {
  return (
    <tr className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors">
      <td className="px-4 py-3.5 align-top">
        <TypeBadge type={s.type} />
      </td>
      <td className="px-4 py-3.5 align-top">
        <p className="text-xs font-semibold text-[#1E3480]">{s.law}</p>
      </td>
      <td className="px-4 py-3.5 align-top">
        <p className="text-sm font-semibold text-gray-800">{s.name}</p>
        <p className="hidden lg:block text-xs text-gray-400 mt-0.5 leading-relaxed">{s.note}</p>
      </td>
      <td className="px-4 py-3.5 align-top text-center whitespace-nowrap">
        <span className="text-sm font-bold text-[#1E3480]">{s.display}</span>
        {!s.years && (
          <p className="text-xs text-gray-300 mt-0.5">{s.days.toLocaleString()} 天</p>
        )}
      </td>
      <td className="px-4 py-3.5 align-top">
        <div className="flex flex-wrap gap-1">
          {s.caseTypes.map((t) => (
            <span key={t} className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">
              {t}
            </span>
          ))}
        </div>
      </td>
    </tr>
  )
}

export default function StatutesView() {
  const [filterType, setFilterType] = useState('all')
  const [filterCaseType, setFilterCaseType] = useState('all')
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    return MOCK_STATUTES.filter((s) => {
      if (filterType !== 'all' && s.type !== filterType) return false
      if (filterCaseType !== 'all' && !s.caseTypes.includes(filterCaseType)) return false
      if (search) {
        const q = search.toLowerCase()
        if (
          !s.law.toLowerCase().includes(q) &&
          !s.name.toLowerCase().includes(q) &&
          !s.note.toLowerCase().includes(q)
        ) return false
      }
      return true
    })
  }, [filterType, filterCaseType, search])

  const countByType = useMemo(() => {
    const map = {}
    STATUTE_TYPES.forEach((t) => { map[t] = MOCK_STATUTES.filter((s) => s.type === t).length })
    return map
  }, [])

  return (
    <div className="px-8 py-8 flex flex-col gap-6 h-full">

      {/* Page title */}
      <div className="flex items-end gap-4 shrink-0">
        <div>
          <p className="text-xs font-semibold text-[#E8A020] tracking-widest uppercase mb-1">Statutes</p>
          <h1 className="text-2xl font-bold text-[#1E3480]">法律時效庫</h1>
        </div>
        <div className="mb-1 h-px flex-1 bg-gradient-to-r from-[#1E3480]/20 to-transparent" />
      </div>

      {/* Type summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 shrink-0">
        {STATUTE_TYPES.map((type) => (
          <button
            key={type}
            onClick={() => setFilterType(filterType === type ? 'all' : type)}
            className={`rounded-xl border px-4 py-3 text-left transition-all ${
              filterType === type
                ? 'bg-[#1E3480] border-[#1E3480] shadow-md'
                : 'bg-white border-gray-100 shadow-sm hover:shadow-md'
            }`}
          >
            <p className={`text-xs font-semibold mb-1 ${filterType === type ? 'text-white/70' : 'text-gray-400'}`}>
              {type}
            </p>
            <p className={`text-2xl font-bold ${filterType === type ? 'text-white' : 'text-[#1E3480]'}`}>
              {countByType[type]}
            </p>
            <p className={`text-xs mt-0.5 ${filterType === type ? 'text-white/50' : 'text-gray-300'}`}>
              筆資料
            </p>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 shrink-0 flex-wrap">
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-500">適用案件</label>
          <select
            value={filterCaseType}
            onChange={(e) => setFilterCaseType(e.target.value)}
            className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1E3480]/20 focus:border-[#1E3480] bg-white"
          >
            <option value="all">全部案件類型</option>
            {CASE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        <div className="relative">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="搜尋法條、說明..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="text-xs border border-gray-200 rounded-lg pl-8 pr-3 py-1.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1E3480]/20 focus:border-[#1E3480] bg-white w-52"
          />
        </div>

        {(filterType !== 'all' || filterCaseType !== 'all' || search) && (
          <button
            onClick={() => { setFilterType('all'); setFilterCaseType('all'); setSearch('') }}
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            清除篩選
          </button>
        )}

        <span className="text-xs text-gray-400 ml-auto">共 {filtered.length} 筆</span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex-1 overflow-y-auto">
        <table className="w-full">
          <thead className="sticky top-0 bg-gray-50 border-b border-gray-100 z-10">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider w-24">時效種類</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider w-36">法源依據</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">說明</th>
              <th className="px-4 py-3 text-center text-xs font-bold text-gray-400 uppercase tracking-wider w-28">時效期間</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider w-44">適用案件類型</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-16 text-center text-sm text-gray-300">
                  無符合條件的資料
                </td>
              </tr>
            ) : (
              filtered.map((s) => <StatuteRow key={s.id} s={s} />)
            )}
          </tbody>
        </table>
      </div>

    </div>
  )
}
