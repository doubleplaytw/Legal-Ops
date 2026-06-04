import { useState } from 'react'
import { CASE_TYPES } from '../constants/caseTypes'

const TIME_SLOTS = ['上午（09:00–12:00）', '下午（13:00–17:00）', '不限']
const REFERRALS  = ['親友介紹', 'Google 搜尋', '社群媒體', '律所官網', '其他']

const FIELD_CLS = 'w-full text-sm border border-gray-200 rounded-xl px-4 py-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1E3480]/20 focus:border-[#1E3480] bg-white placeholder:text-gray-300 transition'
const LABEL_CLS = 'block text-sm font-semibold text-gray-700 mb-1.5'

function Field({ label, required, error, children }) {
  return (
    <div>
      <label className={LABEL_CLS}>
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  )
}

function SectionTitle({ num, children }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <span className="w-6 h-6 rounded-full bg-[#1E3480] text-white text-xs font-bold flex items-center justify-center shrink-0">{num}</span>
      <h2 className="text-sm font-bold text-[#1E3480] tracking-widest uppercase">{children}</h2>
    </div>
  )
}

function SuccessScreen() {
  return (
    <div className="flex flex-col items-center justify-center gap-5 py-10 text-center px-4">
      <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>
      <div>
        <h2 className="text-xl font-bold text-[#1E3480] mb-2">預約申請已送出</h2>
        <p className="text-sm text-gray-500 leading-relaxed">
          感謝您的預約！<br />
          我們將在一個工作天內以電話或 Email 與您確認諮詢時間。
        </p>
      </div>
      <div className="mt-2 w-full max-w-xs bg-[#1E3480]/5 rounded-xl px-5 py-4 text-left">
        <p className="text-xs font-semibold text-[#1E3480] mb-1">如有緊急需求</p>
        <p className="text-sm text-gray-600">請直接來電，我們將優先安排。</p>
      </div>
    </div>
  )
}

export default function IntakePage() {
  const [form, setForm] = useState({
    identity: '個人', name: '', phone: '', email: '', companyName: '',
    caseType: '', description: '',
    preferredDate: '', timeSlot: '不限', referral: '',
  })
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle')

  function set(field, value) {
    setForm(f => ({ ...f, [field]: value }))
    if (errors[field]) setErrors(e => ({ ...e, [field]: '' }))
  }

  function validate() {
    const e = {}
    if (!form.name.trim())     e.name          = '請輸入姓名'
    if (!form.phone.trim())    e.phone         = '請輸入聯絡電話'
    else if (!/^0\d{8,9}$/.test(form.phone.replace(/\s/g, '')))
                               e.phone         = '請輸入有效電話號碼'
    if (form.identity === '公司' && !form.companyName.trim())
                               e.companyName   = '請輸入公司名稱'
    if (!form.caseType)        e.caseType      = '請選擇案件類型'
    if (!form.preferredDate)   e.preferredDate = '請選擇希望諮詢日期'
    return e
  }

  function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setStatus('submitting')
    // TODO: 串接 Apps Script 後替換為真實寫入（見 docs/apps-script.js）
    setTimeout(() => setStatus('success'), 800)
  }

  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* Header */}
      <header className="bg-[#1E3480] px-6 py-5 shadow-md">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <div className="w-1 h-7 bg-[#E8A020] rounded-full shrink-0" />
          <div>
            <p className="text-white font-bold tracking-widest text-sm uppercase">恩典法律事務所</p>
            <p className="text-white/50 text-xs tracking-wider">Grace Law Firm</p>
          </div>
        </div>
      </header>

      {/* Body */}
      <main className="flex-1 flex justify-center px-4 py-8">
        <div className="w-full max-w-lg">

          {status !== 'success' && (
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-[#1E3480] mb-1.5">預約法律諮詢</h1>
              <p className="text-sm text-gray-500">填寫下方表單，我們將盡快與您聯繫安排諮詢時間。</p>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

            {status === 'success' ? <SuccessScreen /> : (
              <form onSubmit={handleSubmit} noValidate>

                {/* ── Section 1：身份與聯絡方式 ── */}
                <div className="px-6 pt-6 pb-5">
                  <SectionTitle num="1">聯絡資料</SectionTitle>
                  <div className="flex flex-col gap-4">

                    {/* 個人 / 公司 切換 */}
                    <div className="flex gap-2">
                      {['個人', '公司'].map(id => (
                        <button key={id} type="button" onClick={() => set('identity', id)}
                          className={`flex-1 py-2 rounded-xl text-sm font-semibold border transition-all ${
                            form.identity === id
                              ? 'bg-[#1E3480] border-[#1E3480] text-white'
                              : 'border-gray-200 text-gray-500 hover:border-[#1E3480] hover:text-[#1E3480]'
                          }`}>
                          {id}
                        </button>
                      ))}
                    </div>

                    {form.identity === '公司' && (
                      <Field label="公司名稱" required error={errors.companyName}>
                        <input className={FIELD_CLS} placeholder="○○股份有限公司"
                          value={form.companyName} onChange={e => set('companyName', e.target.value)} />
                      </Field>
                    )}

                    <Field label="姓名" required error={errors.name}>
                      <input className={FIELD_CLS}
                        placeholder={form.identity === '公司' ? '聯絡人姓名' : '您的姓名'}
                        value={form.name} onChange={e => set('name', e.target.value)} />
                    </Field>

                    <Field label="聯絡電話" required error={errors.phone}>
                      <input className={FIELD_CLS} type="tel" placeholder="0912345678"
                        value={form.phone} onChange={e => set('phone', e.target.value)} />
                    </Field>

                    <Field label="Email（選填）">
                      <input className={FIELD_CLS} type="email" placeholder="example@email.com"
                        value={form.email} onChange={e => set('email', e.target.value)} />
                    </Field>

                  </div>
                </div>

                <div className="h-px bg-gray-100" />

                {/* ── Section 2：案件需求 ── */}
                <div className="px-6 pt-5 pb-5">
                  <SectionTitle num="2">案件需求</SectionTitle>
                  <div className="flex flex-col gap-4">

                    <Field label="案件類型" required error={errors.caseType}>
                      <select className={FIELD_CLS} value={form.caseType}
                        onChange={e => set('caseType', e.target.value)}>
                        <option value="">請選擇案件類型</option>
                        {CASE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </Field>

                    <Field label="案情簡述（選填）">
                      <textarea className={FIELD_CLS + ' resize-none'} rows={3}
                        placeholder="請簡短描述您的法律問題"
                        value={form.description} onChange={e => set('description', e.target.value)} />
                    </Field>

                  </div>
                </div>

                <div className="h-px bg-gray-100" />

                {/* ── Section 3：預約資訊 ── */}
                <div className="px-6 pt-5 pb-6">
                  <SectionTitle num="3">預約資訊</SectionTitle>
                  <div className="flex flex-col gap-4">

                    <Field label="希望諮詢日期" required error={errors.preferredDate}>
                      <input className={FIELD_CLS} type="date" min={today}
                        value={form.preferredDate} onChange={e => set('preferredDate', e.target.value)} />
                    </Field>

                    <Field label="時段偏好">
                      <div className="flex gap-2 flex-wrap">
                        {TIME_SLOTS.map(t => (
                          <button key={t} type="button" onClick={() => set('timeSlot', t)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                              form.timeSlot === t
                                ? 'bg-[#1E3480] border-[#1E3480] text-white'
                                : 'border-gray-200 text-gray-500 hover:border-[#1E3480] hover:text-[#1E3480]'
                            }`}>
                            {t}
                          </button>
                        ))}
                      </div>
                    </Field>

                    <Field label="如何得知本所（選填）">
                      <select className={FIELD_CLS} value={form.referral}
                        onChange={e => set('referral', e.target.value)}>
                        <option value="">請選擇</option>
                        {REFERRALS.map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </Field>

                  </div>
                </div>

                {/* ── 送出 ── */}
                <div className="px-6 pb-6 flex flex-col gap-3">
                  <button type="submit" disabled={status === 'submitting'}
                    className="w-full py-3 rounded-xl bg-[#1E3480] text-white font-bold text-sm tracking-wide hover:bg-[#162860] active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed">
                    {status === 'submitting'
                      ? <span className="flex items-center justify-center gap-2">
                          <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
                          送出中
                        </span>
                      : '送出預約申請'}
                  </button>
                  <p className="text-xs text-gray-400 text-center">
                    送出後我們將在一個工作天內與您聯繫。<br />
                    標示 <span className="text-red-400">*</span> 為必填欄位。
                  </p>
                </div>

              </form>
            )}
          </div>

          <p className="text-center text-xs text-gray-400 mt-5">© 恩典法律事務所 Grace Law Firm</p>
        </div>
      </main>

    </div>
  )
}
