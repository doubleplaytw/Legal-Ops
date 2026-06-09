import { useState, useEffect } from 'react'
import { fetchDocuments, fetchCases } from '../services/sheets'
import { daysUntil } from '../utils/deadlineCalc'
import { MOCK_DOCUMENTS, MOCK_CASES } from '../constants/mockData'

function DeadlineBadge({ deadlineDate, deadlineType }) {
  if (!deadlineDate || deadlineType === '無' || !deadlineType) return null
  const days = daysUntil(deadlineDate)
  if (days === null) return null

  const base = 'text-xs font-semibold whitespace-nowrap px-2 py-0.5 rounded-full'
  if (days < 0)   return <span className={`${base} text-white bg-red-500`}>{deadlineType} 逾期 {Math.abs(days)} 天</span>
  if (days <= 7)  return <span className={`${base} font-bold text-red-600 bg-red-50`}>{deadlineType} 剩 {days} 天</span>
  if (days <= 14) return <span className={`${base} text-amber-600 bg-amber-50`}>{deadlineType} 剩 {days} 天</span>
  return                 <span className={`${base} text-gray-400 bg-gray-50`}>{deadlineType} 剩 {days} 天</span>
}

export default function MailroomView() {
  const [docs, setDocs] = useState([])
  const [cases, setCases] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [dirFilter, setDirFilter] = useState('全部')
  const [statusFilter, setStatusFilter] = useState('全部')

  async function loadData() {
    const [docsData, casesData] = await Promise.all([
      fetchDocuments(),
      fetchCases(),
    ])
    setDocs(docsData.length > 0 ? docsData : MOCK_DOCUMENTS)
    setCases(casesData.length > 0 ? casesData : MOCK_CASES)
  }

  useEffect(() => {
    loadData()
      .catch(() => {
        setDocs(MOCK_DOCUMENTS)
        setCases(MOCK_CASES)
      })
      .finally(() => setLoading(false))
  }, [])

  const caseMap = Object.fromEntries(cases.map(c => [c.id, c]))

  const filtered = docs.filter(d => {
    if (dirFilter !== '全部' && d.direction !== dirFilter) return false
    if (statusFilter !== '全部' && d.status !== statusFilter) return false
    return true
  })

  const pendingCount = docs.filter(d => d.status === '待處理').length
  const urgentCount = docs.filter(d => {
    if (!d.deadlineDate || d.deadlineType === '無' || !d.deadlineType) return false
    const days = daysUntil(d.deadlineDate)
    return days !== null && days >= 0 && days <= 14
  }).length
  const overdueCount = docs.filter(d => {
    if (!d.deadlineDate || d.deadlineType === '無' || !d.deadlineType) return false
    const days = daysUntil(d.deadlineDate)
    return days !== null && days < 0
  }).length

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-gray-400 text-sm">載入中…</div>
  )
  if (error) return (
    <div className="flex items-center justify-center h-64 text-red-400 text-sm">資料載入失敗：{error}</div>
  )

  return (
    <div className="p-4 md:p-8 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-[#E8A020] tracking-widest uppercase mb-1">Mail Log</p>
          <h1 className="text-2xl font-bold text-[#1E3480]">Mail Room</h1>
          <p className="text-xs text-gray-400 mt-0.5">共 {docs.length} 筆記錄</p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="text-2xl font-bold text-gray-700">{pendingCount}</div>
          <div className="text-xs text-gray-400 mt-1">待處理</div>
        </div>
        <div className={`rounded-xl p-4 border ${urgentCount > 0 ? 'bg-amber-50 border-amber-200' : 'bg-white border-gray-100'}`}>
          <div className={`text-2xl font-bold ${urgentCount > 0 ? 'text-amber-600' : 'text-gray-700'}`}>
            {urgentCount}
          </div>
          <div className="text-xs text-gray-400 mt-1">14 天內到期</div>
        </div>
        <div className={`rounded-xl p-4 border ${overdueCount > 0 ? 'bg-red-50 border-red-200' : 'bg-white border-gray-100'}`}>
          <div className={`text-2xl font-bold ${overdueCount > 0 ? 'text-red-600' : 'text-gray-700'}`}>
            {overdueCount}
          </div>
          <div className="text-xs text-gray-400 mt-1">已逾期</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="flex bg-white rounded-lg border border-gray-100 overflow-hidden">
          {['全部', '收文', '發文'].map(f => (
            <button
              key={f}
              onClick={() => setDirFilter(f)}
              className={`px-3 py-1.5 text-xs font-semibold transition-colors ${
                dirFilter === f ? 'bg-[#1E3480] text-white' : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="flex bg-white rounded-lg border border-gray-100 overflow-hidden">
          {['全部', '待處理', '已處理'].map(f => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={`px-3 py-1.5 text-xs font-semibold transition-colors ${
                statusFilter === f ? 'bg-[#1E3480] text-white' : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Table — desktop */}
      <div className="hidden md:block bg-white rounded-xl border border-gray-100 overflow-x-auto">
        <table className="w-full text-sm" style={{ minWidth: '680px' }}>
          <thead>
            <tr className="border-b border-gray-100 text-xs text-gray-400 font-semibold whitespace-nowrap">
              <th className="text-left px-4 py-3">日期</th>
              <th className="text-left px-3 py-3">方向</th>
              <th className="text-left px-4 py-3">案件</th>
              <th className="text-left px-4 py-3">文件類型</th>
              <th className="text-left px-4 py-3">時效</th>
              <th className="text-left px-3 py-3">狀態</th>
              <th className="text-left px-3 py-3">律師</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center text-gray-400 py-12 text-sm">
                  無符合條件的收發文記錄
                </td>
              </tr>
            ) : (
              filtered.map(doc => (
                <tr key={doc.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">{doc.date}</td>
                  <td className="px-3 py-3 whitespace-nowrap">
                    <span className={`text-xs font-semibold whitespace-nowrap px-2 py-0.5 rounded-full ${
                      doc.direction === '收文' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'
                    }`}>
                      {doc.direction}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-xs font-mono text-gray-400">{doc.caseNo}</div>
                    <div className="text-xs text-gray-700 truncate max-w-[120px]">
                      {caseMap[doc.caseNo]?.parties ?? ''}
                    </div>
                  </td>
                  <td className="px-4 py-3 max-w-[200px]">
                    <div className="text-sm text-gray-700 truncate">
                      {doc.docType}
                      {doc.docRef ? <span className="text-gray-400 font-normal"> · {doc.docRef}</span> : ''}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <DeadlineBadge deadlineDate={doc.deadlineDate} deadlineType={doc.deadlineType} />
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap">
                    <span className={`text-xs font-semibold whitespace-nowrap px-2 py-0.5 rounded-full ${
                      doc.status === '待處理' ? 'bg-amber-50 text-amber-600' : 'bg-green-50 text-green-600'
                    }`}>
                      {doc.status}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-xs text-gray-500 whitespace-nowrap">{doc.lawyer}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Cards — mobile */}
      <div className="md:hidden space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center text-gray-400 py-12 text-sm">無符合條件的收發文記錄</div>
        ) : (
          filtered.map(doc => (
            <div key={doc.id} className="bg-white rounded-xl border border-gray-100 p-4 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    doc.direction === '收文' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'
                  }`}>
                    {doc.direction}
                  </span>
                  <span className="text-xs text-gray-400">{doc.date}</span>
                </div>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                  doc.status === '待處理' ? 'bg-amber-50 text-amber-600' : 'bg-green-50 text-green-600'
                }`}>
                  {doc.status}
                </span>
              </div>
              <div className="text-sm font-semibold text-gray-700">{doc.docType}</div>
              <div className="text-xs text-gray-400">
                {doc.caseNo}　{caseMap[doc.caseNo]?.parties ?? ''}
              </div>
              {doc.summary && <div className="text-xs text-gray-500">{doc.summary}</div>}
              <DeadlineBadge deadlineDate={doc.deadlineDate} deadlineType={doc.deadlineType} />
            </div>
          ))
        )}
      </div>

    </div>
  )
}
