/**
 * Google Apps Script — 諮詢預約表單寫入
 *
 * 部署步驟：
 * 1. 開啟 Google Sheets → 擴充功能 → Apps Script
 * 2. 將此檔案內容貼入 Code.gs
 * 3. 部署 → 新增部署 → 類型選「網頁應用程式」
 *    - 執行身分：「我」
 *    - 存取權：「所有人」
 * 4. 複製部署 URL，貼到 .env.local 的 VITE_APPS_SCRIPT_URL
 *
 * 寫入目標（工作表名稱不得更改）：
 *   【案件】      — 新增一列，status = 'appointment'，供 Legal Ops fetchCases() 讀取
 *   【潛在客戶】  — 新增一列，儲存聯絡資料（首次執行會自動建立並加表頭）
 */

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents)
    const ss   = SpreadsheetApp.getActiveSpreadsheet()
    const now  = new Date()
    const dateStr = Utilities.formatDate(now, 'Asia/Taipei', 'yyyy-MM-dd')

    // ── 產生案件編號（格式與既有案件一致）─────────────────────────────────
    const caseId = 'INT-' + Utilities.formatDate(now, 'Asia/Taipei', 'yyyyMMdd') +
                   '-' + Math.floor(Math.random() * 9000 + 1000)

    // ── 寫入【案件】工作表 ────────────────────────────────────────────────
    // 欄位順序對應 sheets.js fetchCases() 的 A–N 欄
    const casesSheet = ss.getSheetByName('案件')
    casesSheet.appendRow([
      caseId,                    // A 案件編號
      dateStr,                   // B 建立日期
      data.identity === '公司'
        ? (data.companyName || data.name)
        : data.name,             // C 當事人
      data.caseType,             // D 案由
      data.description || '',    // E 聲明事項
      data.caseType,             // F 案件類型
      'appointment',             // G 狀態
      '',                        // H 負責律師（待分配）
      data.preferredDate,        // I 下次期限（希望諮詢日期）
      '',                        // J 預計結案日
      '',                        // K 實際結案日
      '',                        // L 父案編號
      '',                        // M 子案類型
      '',                        // N 審級
    ])

    // ── 寫入【潛在客戶】工作表 ───────────────────────────────────────────
    let clientSheet = ss.getSheetByName('潛在客戶')
    if (!clientSheet) {
      clientSheet = ss.insertSheet('潛在客戶')
      clientSheet.appendRow([
        '客戶ID', '建立日期', '姓名', '電話', 'Email',
        '身分', '公司名稱', '時段偏好', '來源', '關聯案件編號',
      ])
    }
    const clientId = 'CLI-' + Utilities.formatDate(now, 'Asia/Taipei', 'yyyyMMddHHmmss')
    clientSheet.appendRow([
      clientId,
      dateStr,
      data.name,
      data.phone,
      data.email      || '',
      data.identity,
      data.companyName || '',
      data.timeSlot   || '',
      data.referral   || '',
      caseId,
    ])

    return ContentService
      .createTextOutput(JSON.stringify({ success: true, caseId, clientId }))
      .setMimeType(ContentService.MimeType.JSON)

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: err.message }))
      .setMimeType(ContentService.MimeType.JSON)
  }
}
