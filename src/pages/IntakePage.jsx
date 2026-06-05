import { useState } from 'react'

const BRANCHES      = ['台北總所', '台中分所', '高雄分所', '線上諮詢']
const REFERRALS     = ['網路社群', '報章雜誌', '其他']
const CONSULT_TYPES = ['法律諮詢', '課程講師', '公關活動', '其他業務']

const INPUT_CLS = 'flex-1 text-sm border-0 border-b border-gray-200 py-2 px-0 text-gray-800 focus:outline-none focus:border-[#1E3480] bg-transparent placeholder:text-gray-300 transition'
const SELECT_CLS = 'w-full text-sm border-0 border-b border-gray-200 py-2 px-0 text-gray-800 focus:outline-none focus:border-[#1E3480] bg-transparent transition appearance-none cursor-pointer'

function Row({ label, required, error, children }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-start gap-3">
        <span className="w-24 shrink-0 text-sm font-semibold text-gray-700 pt-2 leading-tight">
          {label}{required && <span className="text-red-400">*</span>}
        </span>
        <div className="flex-1 flex items-center gap-2">{children}</div>
      </div>
      {error && <p className="text-xs text-red-500 pl-27 ml-[108px]">{error}</p>}
    </div>
  )
}

function Divider() {
  return <div className="h-px bg-gray-100 mx-0" />
}

function SuccessScreen() {
  return (
    <div className="flex flex-col items-center justify-center gap-5 py-12 text-center px-6">
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
      <p className="text-xs text-gray-400">如有緊急需求，請直接來電洽詢。</p>
    </div>
  )
}

export default function IntakePage() {
  const [form, setForm] = useState({
    consultType: '', salutation: '先生', name: '',
    phone: '', mobile: '', email: '',
    branch: [], referral: '', description: '',
  })
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle')

  function set(field, value) {
    setForm(f => ({ ...f, [field]: value }))
    if (errors[field]) setErrors(e => ({ ...e, [field]: '' }))
  }

  function validate() {
    const e = {}
    if (!form.consultType)       e.consultType = '請選擇諮詢項目'
    if (!form.name.trim())       e.name        = '請輸入姓名'
    if (!form.mobile.trim())     e.mobile      = '請輸入行動電話'
    else if (!/^09\d{8}$/.test(form.mobile.replace(/\s/g, '')))
                                 e.mobile      = '請輸入有效手機號碼'
    if (!form.branch.length)      e.branch      = '請選擇分所'
    return e
  }

  function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setStatus('submitting')
    // Demo：寫入 localStorage 供客戶主檔讀取；正式串接 Apps Script 後移除
    try {
      const queue = JSON.parse(localStorage.getItem('intake_queue') || '[]')
      queue.unshift({ ...form, submittedAt: new Date().toISOString().split('T')[0] })
      localStorage.setItem('intake_queue', JSON.stringify(queue))
    } catch (_) {}
    // TODO: 串接 Apps Script（見 docs/apps-script.js）
    setTimeout(() => setStatus('success'), 800)
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">

      {/* Header */}
      <header className="bg-[#1E3480] px-5 py-4 shadow-md">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <div className="w-1 h-6 bg-[#E8A020] rounded-full shrink-0" />
          <div>
            <p className="text-white font-bold tracking-widest text-sm">Demo Law Firm</p>
            <p className="text-white/50 text-[11px] tracking-wider">Demo Law Firm</p>
          </div>
        </div>
      </header>

      {/* Body */}
      <main className="flex-1 flex justify-center px-4 py-6">
        <div className="w-full max-w-lg">

          {status === 'success' ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
              <SuccessScreen />
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-100 overflow-hidden">

                {/* 諮詢項目 */}
                <div className="px-5 py-4">
                  <Row label="諮詢項目" required error={errors.consultType}>
                    <div className="flex-1 relative">
                      <select className={SELECT_CLS} value={form.consultType}
                        onChange={e => set('consultType', e.target.value)}>
                        <option value="">請選擇想要諮詢的項目</option>
                        {CONSULT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                      <svg className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                    </div>
                  </Row>
                </div>

                {/* 姓名 + 稱謂 */}
                <div className="px-5 py-4">
                  <Row label="姓名" required error={errors.name}>
                    <input className={INPUT_CLS} placeholder="請輸入您的姓名"
                      value={form.name} onChange={e => set('name', e.target.value)} />
                    <div className="flex items-center gap-3 shrink-0">
                      {['先生', '小姐'].map(s => (
                        <label key={s} className="flex items-center gap-1 cursor-pointer">
                          <input type="radio" name="salutation" value={s}
                            checked={form.salutation === s}
                            onChange={() => set('salutation', s)}
                            className="accent-[#1E3480] w-3.5 h-3.5" />
                          <span className="text-sm text-gray-600">{s}</span>
                        </label>
                      ))}
                    </div>
                  </Row>
                </div>

                {/* 聯絡電話 */}
                <div className="px-5 py-4">
                  <Row label="聯絡電話" error={errors.phone}>
                    <input className={INPUT_CLS} type="tel" placeholder="請輸入您的聯絡電話"
                      value={form.phone} onChange={e => set('phone', e.target.value)} />
                  </Row>
                </div>

                {/* 行動電話 */}
                <div className="px-5 py-4">
                  <Row label="行動電話" required error={errors.mobile}>
                    <input className={INPUT_CLS} type="tel" placeholder="請輸入您的行動電話"
                      value={form.mobile} onChange={e => set('mobile', e.target.value)} />
                  </Row>
                </div>

                {/* 電子信箱 */}
                <div className="px-5 py-4">
                  <Row label="電子信箱" error={errors.email}>
                    <input className={INPUT_CLS} type="email" placeholder="請輸入您的電子信箱"
                      value={form.email} onChange={e => set('email', e.target.value)} />
                  </Row>
                </div>

                {/* 分所選填 */}
                <div className="px-5 py-4">
                  <Row label="分所選填" required error={errors.branch}>
                    <div className="flex-1 flex flex-wrap gap-x-5 gap-y-2 pt-1">
                      {BRANCHES.map(b => (
                        <label key={b} className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="checkbox"
                            value={b}
                            checked={form.branch.includes(b)}
                            onChange={e => {
                              const checked = e.target.checked
                              set('branch', checked
                                ? [...form.branch, b]
                                : form.branch.filter(x => x !== b))
                            }}
                            className="accent-[#1E3480] w-3.5 h-3.5"
                          />
                          <span className="text-sm text-gray-600">{b}</span>
                        </label>
                      ))}
                    </div>
                  </Row>
                </div>

                {/* 如何得知 */}
                <div className="px-5 py-4">
                  <Row label="如何得知" error={errors.referral}>
                    <div className="flex-1 relative">
                      <select className={SELECT_CLS} value={form.referral}
                        onChange={e => set('referral', e.target.value)}>
                        <option value="">如何得知我們</option>
                        {REFERRALS.map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                      <svg className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                    </div>
                  </Row>
                </div>

                {/* 其他備註說明 */}
                <div className="px-5 py-4">
                  <Row label="其他備註說明" error={errors.description}>
                    <textarea
                      className="flex-1 text-sm border-0 border-b border-gray-200 py-2 px-0 text-gray-800 focus:outline-none focus:border-[#1E3480] bg-transparent placeholder:text-gray-300 resize-none transition"
                      rows={4}
                      placeholder=""
                      value={form.description}
                      onChange={e => set('description', e.target.value)}
                    />
                  </Row>
                </div>

                {/* 送出按鈕 */}
                <div className="px-5 py-5 bg-gray-50">
                  <button type="submit" disabled={status === 'submitting'}
                    className="w-full py-3.5 rounded-xl bg-[#1E3480] text-white font-bold text-sm tracking-widest hover:bg-[#162860] active:scale-[0.98] transition-all disabled:opacity-60 flex items-center justify-center gap-2">
                    {status === 'submitting'
                      ? <><svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>送出中</>
                      : <>送出 <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></>
                    }
                  </button>
                </div>

              </div>
            </form>
          )}

          <p className="text-center text-xs text-gray-400 mt-5">© Demo Law Firm Demo Law Firm</p>
        </div>
      </main>

    </div>
  )
}
