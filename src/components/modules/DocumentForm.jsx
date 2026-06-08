import { useState, useEffect } from 'react'
import { DEADLINE_TYPES, INCOMING_DOC_TYPES, OUTGOING_DOC_TYPES } from '../../constants/documentTypes'
import { calcDeadlineDate } from '../../utils/deadlineCalc'

export default function DocumentForm({ cases, lawyers, onSubmit, onClose, loading }) {
  const [form, setForm] = useState({
    direction: '收文',
    caseNo: '',
    docType: '',
    docRef: '',
    date: new Date().toISOString().split('T')[0],
    summary: '',
    deadlineType: '無',
    deadlineDate: '',
    status: '待處理',
    lawyer: '',
    note: '',
  })

  function set(field, value) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  useEffect(() => {
    if (form.direction !== '收文') return
    const type = DEADLINE_TYPES.find(d => d.value === form.deadlineType)
    setForm(prev => ({
      ...prev,
      deadlineDate: type?.days ? calcDeadlineDate(prev.date, type.days) : '',
    }))
  }, [form.date, form.deadlineType, form.direction])

  const docTypes = form.direction === '收文' ? INCOMING_DOC_TYPES : OUTGOING_DOC_TYPES

  function handleDirectionChange(dir) {
    setForm(prev => ({ ...prev, direction: dir, docType: '', deadlineType: '無', deadlineDate: '' }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    onSubmit(form)
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-[#1E3480] text-base">新增收發文</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          {/* 方向 */}
          <div>
            <label className="text-xs font-semibold text-gray-500 block mb-1.5">方向</label>
            <div className="flex gap-3">
              {['收文', '發文'].map(d => (
                <button
                  key={d}
                  type="button"
                  onClick={() => handleDirectionChange(d)}
                  className={`flex-1 py-2 rounded-lg text-sm font-semibold border transition-colors ${
                    form.direction === d
                      ? 'bg-[#1E3480] text-white border-[#1E3480]'
                      : 'bg-white text-gray-500 border-gray-200 hover:border-[#1E3480]'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* 關聯案件 */}
          <div>
            <label className="text-xs font-semibold text-gray-500 block mb-1.5">
              關聯案件 <span className="text-red-400">*</span>
            </label>
            <select
              required
              value={form.caseNo}
              onChange={e => set('caseNo', e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1E3480]"
            >
              <option value="">— 選擇案件 —</option>
              {cases.map(c => (
                <option key={c.id} value={c.id}>{c.id}　{c.parties}</option>
              ))}
            </select>
          </div>

          {/* 文件類型 + 文號 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1.5">
                文件類型 <span className="text-red-400">*</span>
              </label>
              <select
                required
                value={form.docType}
                onChange={e => set('docType', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1E3480]"
              >
                <option value="">— 選擇 —</option>
                {docTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1.5">文號（選填）</label>
              <input
                type="text"
                value={form.docRef}
                onChange={e => set('docRef', e.target.value)}
                placeholder="114年度民上字第…"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1E3480]"
              />
            </div>
          </div>

          {/* 收發日期 + 律師 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1.5">
                收發日期 <span className="text-red-400">*</span>
              </label>
              <input
                type="date"
                required
                value={form.date}
                onChange={e => set('date', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1E3480]"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1.5">負責律師</label>
              <select
                value={form.lawyer}
                onChange={e => set('lawyer', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1E3480]"
              >
                <option value="">— 選擇 —</option>
                {lawyers.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
          </div>

          {/* 摘要 */}
          <div>
            <label className="text-xs font-semibold text-gray-500 block mb-1.5">摘要</label>
            <textarea
              value={form.summary}
              onChange={e => set('summary', e.target.value)}
              rows={2}
              placeholder="文件內容一行摘要…"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1E3480] resize-none"
            />
          </div>

          {/* 時效（收文限定）*/}
          {form.direction === '收文' && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 space-y-3">
              <p className="text-xs font-semibold text-amber-700">時效設定</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-amber-700 block mb-1.5">時效類型</label>
                  <select
                    value={form.deadlineType}
                    onChange={e => set('deadlineType', e.target.value)}
                    className="w-full border border-amber-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-400 bg-white"
                  >
                    {DEADLINE_TYPES.map(d => (
                      <option key={d.value} value={d.value}>
                        {d.value}{d.days ? `（${d.days} 天）` : ''}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-amber-700 block mb-1.5">時效截止日</label>
                  <input
                    type="date"
                    value={form.deadlineDate}
                    onChange={e => set('deadlineDate', e.target.value)}
                    className="w-full border border-amber-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-400 bg-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 處理狀態 */}
          <div>
            <label className="text-xs font-semibold text-gray-500 block mb-1.5">處理狀態</label>
            <div className="flex gap-3">
              {['待處理', '已處理'].map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => set('status', s)}
                  className={`flex-1 py-2 rounded-lg text-sm font-semibold border transition-colors ${
                    form.status === s
                      ? s === '待處理'
                        ? 'bg-amber-50 text-amber-700 border-amber-300'
                        : 'bg-green-50 text-green-700 border-green-300'
                      : 'bg-white text-gray-400 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* 備註 */}
          <div>
            <label className="text-xs font-semibold text-gray-500 block mb-1.5">備註（選填）</label>
            <textarea
              value={form.note}
              onChange={e => set('note', e.target.value)}
              rows={2}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1E3480] resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2 pb-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-500 text-sm font-semibold hover:bg-gray-50"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl bg-[#1E3480] text-white text-sm font-semibold hover:bg-[#2E56C8] disabled:opacity-50 transition-colors"
            >
              {loading ? '儲存中…' : '儲存'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
