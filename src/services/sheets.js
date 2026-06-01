/**
 * Google Sheets API v4 唯一入口
 *
 * ── 試算表工作表清單（名稱不得更改）──────────────────────────────────────
 *
 * 【律師設定】手動維護，由所長更新
 *   A 律師ID  B 姓名  C 案件上限  D 本月預計結案  E 計費時數(本月)  F 計費時數(上月)
 *   D 季度預計結案數  E 本季累計結案數  F 上季結算結案數
 *   G 本季累計計費時數(hr)  H 季度計費目標(hr)  I 上季計費時數(hr)
 *   J 本季收款目標(NTD)  K 本季已收金額(NTD)  L 上季已收金額(NTD)
 *   所有達成率均由前端計算，不存入 Sheets
 *
 * 【案件】主資料，每案一列
 *   A 案件編號  B 建立日期  C 當事人  D 案由  E 聲明事項  F 案件類型
 *   G 狀態      H 負責律師  I 下次期限  J 預計結案日  K 實際結案日
 *   L 父案編號  M 子案類型(appeal/enforcement)  N 審級
 *
 * 【接觸紀錄】客戶健康追蹤的溝通紀錄
 *   A 紀錄ID  B 案件編號  C 接觸日期  D 接觸類型  E 律師  F 備註
 *
 * 【追蹤事項】後續追蹤待辦
 *   A 追蹤ID  B 案件編號  C 到期日  D 任務描述  E 已完成(TRUE/FALSE)  F 類別
 *
 * 【期限事件】法定期間、庭審、書狀等重要期限
 *   A 事件ID  B 案件編號  C 類別  D 到期日  E 說明
 *
 * 【帳務】每月一列，由管理人員更新
 *   A 月份(YYYY-MM)  B 諮詢時數  C 未請款件數  D 未請款金額
 *   E 已請款未付款件數  F 已請款未付款金額
 *
 * 【文件連結】案件相關 Google Drive 連結
 *   A 連結ID  B 案件編號  C 文件名稱  D URL
 *
 * ─────────────────────────────────────────────────────────────────────────
 * 切換正式資料時：僅替換此檔案的實作，元件層不需改動。
 */

const BASE_URL = 'https://sheets.googleapis.com/v4/spreadsheets'
const SPREADSHEET_ID = import.meta.env.VITE_GOOGLE_SPREADSHEET_ID
const API_KEY = import.meta.env.VITE_GOOGLE_SHEETS_API_KEY

async function fetchRange(range) {
  const url = `${BASE_URL}/${SPREADSHEET_ID}/values/${encodeURIComponent(range)}?key=${API_KEY}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Sheets API error: ${res.status} — ${range}`)
  const json = await res.json()
  return json.values ?? []
}

// ── 律師設定 ──────────────────────────────────────────────────────────────

/**
 * 回傳格式：{ [lawyerId]: { name, caseCapacity, plannedCloseThisMonth, billingHours, billingHoursLastMonth } }
 */
export async function fetchLawyerSettings() {
  const rows = await fetchRange('律師設定!A2:H')
  return Object.fromEntries(
    rows.map(([id, name, capacity, plannedCloseQ, closedQ, closedLastQ, billingQ, billingQTarget, billingLastQ, receivable, received, receivedLastQ]) => [
      id,
      {
        name: name ?? '',
        caseCapacity: Number(capacity) || 10,
        plannedCloseQ: Number(plannedCloseQ) || 0,
        closedQ: Number(closedQ) || 0,
        closedLastQ: Number(closedLastQ) || 0,
        billingHoursQ: Number(billingQ) || 0,
        billingHoursQTarget: Number(billingQTarget) || 0,
        billingHoursLastQ: Number(billingLastQ) || 0,
        receivableAmount: Number(receivable) || 0,
        receivedAmount: Number(received) || 0,
        receivedAmountLastQ: Number(receivedLastQ) || 0,
      },
    ])
  )
}

// ── 案件 ──────────────────────────────────────────────────────────────────

/**
 * 回傳格式與 MOCK_CASES 一致
 */
export async function fetchCases() {
  const rows = await fetchRange('案件!A2:N')
  return rows.map(([id, createdAt, parties, cause, relief, type, status, lawyer,
    nextDeadline, expectedCloseDate, closedAt, parentCaseId, subType, instanceLevel]) => ({
    id,
    createdAt: createdAt || null,
    parties,
    cause,
    relief,
    type,
    status,
    lawyer,
    nextDeadline: nextDeadline || null,
    expectedCloseDate: expectedCloseDate || null,
    closedAt: closedAt || null,
    parentCaseId: parentCaseId || null,
    subType: subType || null,
    instanceLevel: instanceLevel || null,
  }))
}

// ── 接觸紀錄 ──────────────────────────────────────────────────────────────

/**
 * 回傳格式：{ [caseNo]: Contact[] }
 */
export async function fetchContacts() {
  const rows = await fetchRange('接觸紀錄!A2:F')
  const map = {}
  rows.forEach(([id, caseNo, date, type, lawyer, note]) => {
    if (!map[caseNo]) map[caseNo] = []
    map[caseNo].push({ id: Number(id), date, type, lawyer, note: note ?? '' })
  })
  return map
}

// ── 追蹤事項 ──────────────────────────────────────────────────────────────

/**
 * 回傳格式：{ [caseNo]: FollowUp[] }
 */
export async function fetchFollowUps() {
  const rows = await fetchRange('追蹤事項!A2:F')
  const map = {}
  rows.forEach(([id, caseNo, date, task, done, category]) => {
    if (!map[caseNo]) map[caseNo] = []
    map[caseNo].push({
      id: Number(id),
      date,
      task,
      done: done === 'TRUE',
      category: category ?? '',
    })
  })
  return map
}

// ── 期限事件 ──────────────────────────────────────────────────────────────

/**
 * 回傳格式與 MOCK_UPCOMING_DEADLINES 一致
 */
export async function fetchDeadlineEvents() {
  const rows = await fetchRange('期限事件!A2:E')
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return rows.map(([id, caseNo, category, date, note]) => ({
    id: Number(id),
    caseNo,
    category,
    date,
    note: note ?? '',
    daysLeft: Math.floor((new Date(date) - today) / 86400000),
  }))
}

// ── 帳務 ──────────────────────────────────────────────────────────────────

/**
 * 回傳當月帳務資料，格式對應 MOCK_KPI 帳務區塊
 */
export async function fetchBillingByMonth(month) {
  const rows = await fetchRange('帳務!A2:F')
  const row = rows.find(([m]) => m === month)
  if (!row) return null
  const [, consultHours, uninvoiced, uninvoicedAmount, invoicedUnpaid, invoicedUnpaidAmount] = row
  return {
    consultationHours: Number(consultHours) || 0,
    uninvoiced: Number(uninvoiced) || 0,
    uninvoicedAmount: Number(uninvoicedAmount) || 0,
    invoicedUnpaid: Number(invoicedUnpaid) || 0,
    invoicedUnpaidAmount: Number(invoicedUnpaidAmount) || 0,
  }
}

// ── 文件連結 ──────────────────────────────────────────────────────────────

/**
 * 回傳格式：{ [caseNo]: DriveLink[] }
 */
export async function fetchDriveLinks() {
  const rows = await fetchRange('文件連結!A2:D')
  const map = {}
  rows.forEach(([id, caseNo, name, url]) => {
    if (!map[caseNo]) map[caseNo] = []
    map[caseNo].push({ id: Number(id), name, url })
  })
  return map
}
