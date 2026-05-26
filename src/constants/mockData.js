// 暫用假資料，待接 Google Sheets API 後替換

export const MOCK_LAWYERS = [
  { id: 'A', activeCases: 8,  closedThisMonth: 3, avgCycleDays: 42, upcomingDeadlines: 2, billingHours: 98,  overdue: { expired: 1, warning: 2 }, caseTypes: [{ type: '民事訴訟', count: 3 }, { type: '家事案件', count: 2 }, { type: '財富傳承', count: 2 }, { type: '行政訴訟', count: 1 }] },
  { id: 'B', activeCases: 6,  closedThisMonth: 2, avgCycleDays: 38, upcomingDeadlines: 1, billingHours: 110, overdue: { expired: 2, warning: 1 }, caseTypes: [{ type: '智慧財產', count: 3 }, { type: '商事相關', count: 2 }, { type: '勞資糾紛', count: 1 }] },
  { id: 'C', activeCases: 5,  closedThisMonth: 4, avgCycleDays: 30, upcomingDeadlines: 0, billingHours: 85,  overdue: { expired: 0, warning: 1 }, caseTypes: [{ type: '商事相關', count: 3 }, { type: '民事訴訟', count: 2 }] },
  { id: 'D', activeCases: 7,  closedThisMonth: 1, avgCycleDays: 55, upcomingDeadlines: 1, billingHours: 105, overdue: { expired: 1, warning: 2 }, caseTypes: [{ type: '刑事訴訟', count: 4 }, { type: '民事訴訟', count: 2 }, { type: '行政訴訟', count: 1 }] },
  { id: 'E', activeCases: 4,  closedThisMonth: 2, avgCycleDays: 28, upcomingDeadlines: 0, billingHours: 72,  overdue: { expired: 0, warning: 0 }, caseTypes: [{ type: '家事案件', count: 2 }, { type: '財富傳承', count: 2 }] },
  { id: 'F', activeCases: 6,  closedThisMonth: 2, avgCycleDays: 50, upcomingDeadlines: 3, billingHours: 125, overdue: { expired: 1, warning: 3 }, caseTypes: [{ type: '勞資糾紛', count: 3 }, { type: '民事訴訟', count: 2 }, { type: '行政訴訟', count: 1 }] },
  { id: 'G', activeCases: 3,  closedThisMonth: 1, avgCycleDays: 35, upcomingDeadlines: 0, billingHours: 58,  overdue: { expired: 0, warning: 0 }, caseTypes: [{ type: '智慧財產', count: 2 }, { type: '商事相關', count: 1 }] },
  { id: 'H', activeCases: 5,  closedThisMonth: 3, avgCycleDays: 44, upcomingDeadlines: 1, billingHours: 90,  overdue: { expired: 0, warning: 1 }, caseTypes: [{ type: '財富傳承', count: 3 }, { type: '家事案件', count: 2 }] },
  { id: 'I', activeCases: 4,  closedThisMonth: 2, avgCycleDays: 32, upcomingDeadlines: 0, billingHours: 78,  overdue: { expired: 0, warning: 0 }, caseTypes: [{ type: '民事訴訟', count: 2 }, { type: '商事相關', count: 2 }] },
  { id: 'J', activeCases: 6,  closedThisMonth: 2, avgCycleDays: 48, upcomingDeadlines: 2, billingHours: 108, overdue: { expired: 1, warning: 2 }, caseTypes: [{ type: '刑事訴訟', count: 3 }, { type: '行政訴訟', count: 2 }, { type: '勞資糾紛', count: 1 }] },
  { id: 'K', activeCases: 5,  closedThisMonth: 3, avgCycleDays: 36, upcomingDeadlines: 1, billingHours: 88,  overdue: { expired: 0, warning: 1 }, caseTypes: [{ type: '商事相關', count: 3 }, { type: '智慧財產', count: 2 }] },
  { id: 'L', activeCases: 3,  closedThisMonth: 1, avgCycleDays: 29, upcomingDeadlines: 0, billingHours: 55,  overdue: { expired: 0, warning: 0 }, caseTypes: [{ type: '家事案件', count: 2 }, { type: '民事訴訟', count: 1 }] },
]

export const MOCK_ACTIVE_CASES = [
  { type: '民事訴訟', count: 12 },
  { type: '刑事訴訟', count: 5 },
  { type: '家事案件', count: 8 },
  { type: '財富傳承', count: 6 },
  { type: '行政訴訟', count: 3 },
  { type: '勞資糾紛', count: 7 },
  { type: '智慧財產', count: 4 },
  { type: '商事相關', count: 10 },
]

export const MOCK_RETAINED_CASES = [
  { type: '民事訴訟', count: 7, date: '2026-03-10' },
  { type: '刑事訴訟', count: 2, date: '2026-04-01' },
  { type: '家事案件', count: 5, date: '2026-02-20' },
  { type: '財富傳承', count: 4, date: '2026-03-25' },
  { type: '行政訴訟', count: 1, date: '2026-05-01' },
  { type: '勞資糾紛', count: 3, date: '2026-01-30' },
  { type: '智慧財產', count: 2, date: '2026-04-15' },
  { type: '商事相關', count: 8, date: '2026-03-05' },
]

export const MOCK_CONSULTATION_CASES = [
  { type: '民事訴訟', count: 9, date: '2026-03-05' },
  { type: '刑事訴訟', count: 3, date: '2026-04-10' },
  { type: '家事案件', count: 6, date: '2026-02-15' },
  { type: '財富傳承', count: 5, date: '2026-03-30' },
  { type: '行政訴訟', count: 2, date: '2026-05-05' },
  { type: '勞資糾紛', count: 4, date: '2026-01-25' },
  { type: '智慧財產', count: 3, date: '2026-04-20' },
  { type: '商事相關', count: 6, date: '2026-03-15' },
]

export const MOCK_KPI = {
  plannedCloseThisMonth: 11, // 本月預計結案
  closedThisMonth: 9,        // 本月實際結案
  conversionRate: 68,        // 委任轉換率 %
  overdueInvoices: 2,        // 逾期帳單件數
  upcomingDeadlines: 3,      // 7天內到期
  uninvoiced: 5,             // 尚未請款
  invoicedUnpaid: 3,         // 已請款尚未付款
}

export const CASE_STATUSES = [
  { key: 'appointment', label: '預約諮詢', color: '#94A3B8', bg: '#F8FAFC' },
  { key: 'meeting',     label: '進行會晤', color: '#8B5CF6', bg: '#F5F3FF' },
  { key: 'quote',       label: '報價',     color: '#0D9488', bg: '#F0FDFA' },
  { key: 'signing',     label: '簽約',     color: '#F97316', bg: '#FFF7ED' },
  { key: 'retained',    label: '委任確定', color: '#3B82F6', bg: '#EFF6FF' },
  { key: 'active',      label: '進行中',   color: '#1E3480', bg: '#EEF2FF' },
  { key: 'closed',      label: '結案',     color: '#22C55E', bg: '#F0FDF4' },
]

export const MOCK_CASES = [
  { id: 'C-2026-051', title: '王○○ v. 陳○○ 請求損害賠償',     type: '民事訴訟', status: 'appointment', lawyer: 'A', nextDeadline: null,         expectedCloseDate: null         },
  { id: 'C-2026-050', title: '○○餐飲集團 員工解雇爭議',        type: '勞資糾紛', status: 'meeting',     lawyer: 'B', nextDeadline: null,         expectedCloseDate: null         },
  { id: 'C-2026-049', title: '林○○ 遺囑信託規劃',             type: '財富傳承', status: 'quote',       lawyer: 'E', nextDeadline: null,         expectedCloseDate: null         },
  { id: 'C-2026-033', title: '○○科技 商標侵權案',              type: '智慧財產', status: 'signing',     lawyer: 'B', nextDeadline: '2026-05-30', expectedCloseDate: '2026-08-15' },
  { id: 'C-2026-048', title: '○○科技 軟體授權合約糾紛',        type: '智慧財產', status: 'retained',    lawyer: 'B', nextDeadline: '2026-06-10', expectedCloseDate: '2026-09-30' },
  { id: 'C-2026-047', title: '張○○ 離婚財產分配案',           type: '家事案件', status: 'retained',    lawyer: 'E', nextDeadline: '2026-06-15', expectedCloseDate: '2026-10-15' },
  { id: 'C-2026-046', title: '○○建設 工程款請求訴訟',          type: '商事相關', status: 'retained',    lawyer: 'C', nextDeadline: '2026-06-08', expectedCloseDate: '2026-08-30' },
  { id: 'C-2026-041', title: '王○○ v. 李○○ 民事給付案',       type: '民事訴訟', status: 'active',      lawyer: 'A', nextDeadline: '2026-05-28', expectedCloseDate: '2026-06-15' },
  { id: 'C-2026-040', title: '○○製藥 專利侵權訴訟',            type: '智慧財產', status: 'active',      lawyer: 'B', nextDeadline: '2026-06-02', expectedCloseDate: '2026-05-20' },
  { id: 'C-2026-039', title: '劉○○ 刑事詐欺案辯護',           type: '刑事訴訟', status: 'active',      lawyer: 'D', nextDeadline: '2026-06-05', expectedCloseDate: '2026-05-10' },
  { id: 'C-2026-038', title: '○○物流 行政裁罰撤銷案',          type: '行政訴訟', status: 'active',      lawyer: 'F', nextDeadline: '2026-06-01', expectedCloseDate: '2026-06-10' },
  { id: 'C-2026-037', title: '陳○○ 繼承遺產分割案',            type: '財富傳承', status: 'active',      lawyer: 'H', nextDeadline: '2026-06-12', expectedCloseDate: '2026-08-01' },
  { id: 'C-2026-036', title: '○○電商 消費者糾紛集體訴訟',      type: '商事相關', status: 'active',      lawyer: 'C', nextDeadline: '2026-06-20', expectedCloseDate: '2026-09-01' },
  { id: 'C-2026-030', title: '黃○○ 勞動契約終止爭議',          type: '勞資糾紛', status: 'active',      lawyer: 'F', nextDeadline: '2026-06-03', expectedCloseDate: '2026-06-20' },
  { id: 'C-2026-027', title: '張○○ 遺產分割案',               type: '財富傳承', status: 'active',      lawyer: 'A', nextDeadline: '2026-06-01', expectedCloseDate: '2026-07-01' },
  { id: 'C-2026-020', title: '○○金融 借貸契約履行案',          type: '商事相關', status: 'closed',      lawyer: 'K', nextDeadline: null,         expectedCloseDate: null         },
  { id: 'C-2026-018', title: '吳○○ 家暴保護令聲請',            type: '家事案件', status: 'closed',      lawyer: 'E', nextDeadline: null,         expectedCloseDate: null         },
  { id: 'C-2026-015', title: '林○○ 勞資爭議仲裁案',            type: '勞資糾紛', status: 'closed',      lawyer: 'F', nextDeadline: null,         expectedCloseDate: null         },
]

export const CONTACT_TYPES = [
  '電話會議',
  '視訊會議',
  '到所面談',
  '文件簽署',
  '進度更新',
  '開庭',
  '客戶不滿意處理',
  '預約諮詢安排',
]

export const DEADLINE_CATEGORIES = {
  STATUTORY: { label: '法定期間', color: 'bg-red-50 text-red-600' },
  HEARING:   { label: '開庭期日', color: 'bg-blue-50 text-blue-600' },
  FILING:    { label: '書狀截止', color: 'bg-purple-50 text-purple-600' },
  RETAINER:  { label: '委任到期', color: 'bg-orange-50 text-orange-600' },
  INVOICE:   { label: '帳單付款', color: 'bg-yellow-50 text-yellow-700' },
}

export const MOCK_CLIENT_HEALTH = [
  {
    id: 'ch-1',
    client: '○○科技',
    caseNo: 'C-2026-048',
    caseType: '智慧財產',
    status: 'retained',
    lawyer: 'B',
    lastContactDate: '2026-05-23',
    contacts: [
      { id: 1, date: '2026-05-23', type: '電話會議', lawyer: 'B', note: '確認軟體授權訴訟進度，客戶表示認可目前策略' },
      { id: 2, date: '2026-05-15', type: '進度更新', lawyer: 'B', note: '收到對方答辯書，已向客戶說明影響範圍' },
      { id: 3, date: '2026-05-05', type: '到所面談', lawyer: 'B', note: '討論訴訟策略，確認下一步行動方案' },
    ],
    followUps: [
      { id: 1, date: '2026-06-10', task: '開庭前文件確認', done: false },
      { id: 2, date: '2026-06-20', task: '寄送月度進度報告', done: false },
    ],
    driveLinks: [
      { id: 1, name: '委任合約書', url: '#' },
      { id: 2, name: '訴訟策略簡報', url: '#' },
    ],
  },
  {
    id: 'ch-2',
    client: '王○○',
    caseNo: 'C-2026-041',
    caseType: '民事訴訟',
    status: 'active',
    lawyer: 'A',
    lastContactDate: '2026-05-22',
    contacts: [
      { id: 1, date: '2026-05-22', type: '預約諮詢安排', lawyer: 'A', note: '安排 06/05 到所面談，確認開庭後疑問與下一步策略' },
      { id: 2, date: '2026-05-18', type: '視訊會議', lawyer: 'A', note: '說明開庭結果，客戶有疑問需後續補充說明' },
      { id: 3, date: '2026-05-08', type: '開庭', lawyer: 'A', note: '第一次言詞辯論庭，程序順利進行' },
    ],
    followUps: [
      { id: 1, date: '2026-05-28', task: '書狀送達確認', done: false },
      { id: 2, date: '2026-06-01', task: '法律意見書寄送', done: true },
    ],
    driveLinks: [
      { id: 1, name: '起訴狀', url: '#' },
      { id: 2, name: '開庭筆錄', url: '#' },
    ],
  },
  {
    id: 'ch-3',
    client: '○○物流',
    caseNo: 'C-2026-038',
    caseType: '行政訴訟',
    status: 'active',
    lawyer: 'F',
    lastContactDate: '2026-05-10',
    contacts: [
      { id: 1, date: '2026-05-10', type: '客戶不滿意處理', lawyer: 'F', note: '客戶來電表達對進度遲緩不滿，已安撫並承諾每週主動更新進度' },
      { id: 2, date: '2026-05-05', type: '電話會議', lawyer: 'F', note: '客戶對行政訴訟進度感到焦慮，需加強溝通頻率' },
      { id: 3, date: '2026-04-25', type: '到所面談', lawyer: 'F', note: '討論行政裁罰撤銷策略與勝訴機率評估' },
    ],
    followUps: [
      { id: 1, date: '2026-06-01', task: '行政訴訟答辯狀提交', done: false },
      { id: 2, date: '2026-05-30', task: '主動聯繫客戶更新進度', done: false },
    ],
    driveLinks: [
      { id: 1, name: '行政裁罰書', url: '#' },
    ],
  },
  {
    id: 'ch-4',
    client: '張○○',
    caseNo: 'C-2026-047',
    caseType: '家事案件',
    status: 'retained',
    lawyer: 'E',
    lastContactDate: '2026-05-25',
    contacts: [
      { id: 1, date: '2026-05-25', type: '到所面談', lawyer: 'E', note: '離婚協議草案討論，客戶對進展感到滿意' },
      { id: 2, date: '2026-05-20', type: '文件簽署', lawyer: 'E', note: '財產清冊確認簽署完成' },
      { id: 3, date: '2026-05-12', type: '進度更新', lawyer: 'E', note: '案件進展順利，預計如期結案' },
    ],
    followUps: [
      { id: 1, date: '2026-06-15', task: '協議書最終版確認', done: false },
    ],
    driveLinks: [
      { id: 1, name: '財產清冊', url: '#' },
      { id: 2, name: '離婚協議草案', url: '#' },
    ],
  },
  {
    id: 'ch-5',
    client: '○○電商',
    caseNo: 'C-2026-036',
    caseType: '商事相關',
    status: 'active',
    lawyer: 'C',
    lastContactDate: '2026-05-14',
    contacts: [
      { id: 1, date: '2026-05-14', type: '視訊會議', lawyer: 'C', note: '集體訴訟策略說明，確認參與原告名單' },
      { id: 2, date: '2026-05-01', type: '進度更新', lawyer: 'C', note: '收到法院傳票，已通知所有相關原告' },
    ],
    followUps: [
      { id: 1, date: '2026-06-20', task: '原告授權書收集完成', done: false },
      { id: 2, date: '2026-06-05', task: '集體訴訟說明會', done: false },
    ],
    driveLinks: [],
  },
  {
    id: 'ch-6',
    client: '陳○○',
    caseNo: 'C-2026-037',
    caseType: '財富傳承',
    status: 'active',
    lawyer: 'H',
    lastContactDate: '2026-05-21',
    contacts: [
      { id: 1, date: '2026-05-21', type: '到所面談', lawyer: 'H', note: '遺產分割協議進度說明，家屬意見有分歧需協調' },
      { id: 2, date: '2026-05-13', type: '電話會議', lawyer: 'H', note: '與繼承人甲方確認立場與底線' },
    ],
    followUps: [
      { id: 1, date: '2026-06-12', task: '遺產分割協議草案寄送', done: false },
    ],
    driveLinks: [
      { id: 1, name: '遺囑書', url: '#' },
    ],
  },
  {
    id: 'ch-7',
    client: '王○○',
    caseNo: 'C-2026-051',
    caseType: '民事訴訟',
    status: 'appointment',
    lawyer: 'A',
    lastContactDate: '2026-05-24',
    contacts: [
      { id: 1, date: '2026-05-24', type: '預約諮詢安排', lawyer: 'A', note: '客戶來電詢問損害賠償相關事宜，已安排 06/03 初次諮詢' },
    ],
    followUps: [
      { id: 1, date: '2026-06-03', task: '初次諮詢面談', done: false },
    ],
    driveLinks: [],
  },
  {
    id: 'ch-8',
    client: '○○餐飲集團',
    caseNo: 'C-2026-050',
    caseType: '勞資糾紛',
    status: 'meeting',
    lawyer: 'B',
    lastContactDate: '2026-05-25',
    contacts: [
      { id: 1, date: '2026-05-25', type: '到所面談', lawyer: 'B', note: '員工解雇爭議初步說明，確認案件背景與訴求方向' },
    ],
    followUps: [
      { id: 1, date: '2026-06-05', task: '提供服務報價方案', done: false },
    ],
    driveLinks: [],
  },
]

export const MOCK_UPCOMING_DEADLINES = [
  { id: 1, caseNo: 'C-2026-041', title: '王○○ v. 李○○ 民事給付案',       caseType: '民事訴訟', category: 'STATUTORY', date: '2026-05-28', daysLeft: 2, lawyer: 'A 律師' },
  { id: 2, caseNo: 'C-2026-033', title: '○○科技股份有限公司 商標侵權案',   caseType: '智慧財產', category: 'HEARING',   date: '2026-05-30', daysLeft: 4, lawyer: 'B 律師' },
  { id: 3, caseNo: 'C-2026-027', title: '張○○ 遺產分割案',               caseType: '財富傳承', category: 'FILING',    date: '2026-06-01', daysLeft: 6, lawyer: 'A 律師' },
  { id: 4, caseNo: 'C-2026-019', title: '○○建設股份有限公司 不動產糾紛案', caseType: '商事相關', category: 'RETAINER', date: '2026-06-01', daysLeft: 6, lawyer: 'C 律師' },
  { id: 5, caseNo: 'C-2026-015', title: '林○○ 勞資爭議仲裁案',            caseType: '勞資糾紛', category: 'INVOICE',  date: '2026-06-02', daysLeft: 7, lawyer: 'B 律師' },
]
