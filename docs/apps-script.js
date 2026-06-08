/**
 * Google Apps Script — 諮詢預約表單寫入
 *
 * 部署步驟：
 * 1. 開啟你的 Google Sheets → 上方選單「擴充功能」→「Apps Script」
 * 2. 將此檔案全部內容貼入 Code.gs（覆蓋原本內容）
 * 3. 上方選單「部署」→「新增部署作業」
 *    - 類型選「網頁應用程式」
 *    - 執行身分：「我（你的 Google 帳號）」
 *    - 存取權：「所有人」
 * 4. 按「部署」，複製產生的「網頁應用程式 URL」
 * 5. 貼到 .env.local 的 VITE_APPS_SCRIPT_URL=（貼在這裡）
 *
 * 寫入目標（工作表名稱不得更改）：
 *   【客戶主檔】— 新增一列（A–V 欄，與 sheets.js fetchClientMaster 對應）
 *   【案件】    — 新增一列，status = 'appointment'
 */

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents)
    const ss   = SpreadsheetApp.getActiveSpreadsheet()
    const now  = new Date()
    const dateStr = Utilities.formatDate(now, 'Asia/Taipei', 'yyyy-MM-dd')

    // ── 產生案件編號 ─────────────────────────────────────────────────────────
    const caseId = 'INT-' + Utilities.formatDate(now, 'Asia/Taipei', 'yyyyMMdd') +
                   '-' + Math.floor(Math.random() * 9000 + 1000)

    // ── 產生客戶編號 ─────────────────────────────────────────────────────────
    const clientSheet = ss.getSheetByName('客戶主檔')
    const lastRow = clientSheet.getLastRow()
    const seq = lastRow >= 2
      ? lastRow  // 簡單以列數做序號，律師可手動修正
      : 1
    const clientId = 'CL-' + new Date().getFullYear() + '-' + String(seq).padStart(3, '0')

    // ── 寫入【客戶主檔】— 欄位順序嚴格對應 fetchClientMaster() A–V ───────────
    const branchStr = Array.isArray(data.branch) ? data.branch.join('、') : (data.branch || '')
    clientSheet.appendRow([
      clientId,             // A 客戶編號
      data.name || '',      // B 姓名
      data.salutation || '',// C 稱謂
      'individual',         // D 客戶類型（預設個人，律師可改）
      '',                   // E 統一編號
      '',                   // F 身分證字號
      data.mobile || '',    // G 行動電話
      data.phone  || '',    // H 聯絡電話
      data.email  || '',    // I 電子信箱
      branchStr,            // J 所屬分所
      data.referral || '',  // K 來源管道
      data.consultType || '',// L 初始諮詢項目
      'pending',            // M 客戶狀態
      '',                   // N 負責律師（律師補填）
      'unsigned',           // O 委任合約狀態
      'unchecked',          // P 利衝查詢狀態
      '',                   // Q 利衝查詢日期
      '',                   // R 利衝備註
      caseId,               // S 關聯案件編號
      data.description || '',// T 初始需求說明
      '',                   // U 內部備註
      dateStr,              // V 建檔日期
    ])

    // ── 寫入【案件】— 欄位順序嚴格對應 fetchCases() A–N ─────────────────────
    const casesSheet = ss.getSheetByName('案件')
    casesSheet.appendRow([
      caseId,                       // A 案件編號
      dateStr,                      // B 建立日期
      data.name || '',              // C 當事人
      data.consultType || '初次諮詢',// D 案由
      data.description || '',       // E 聲明事項
      data.consultType || '法律諮詢',// F 案件類型
      'appointment',                // G 狀態
      '',                           // H 負責律師（待分配）
      '',                           // I 下次期限
      '',                           // J 預計結案日
      '',                           // K 實際結案日
      '',                           // L 父案編號
      '',                           // M 子案類型
      '',                           // N 審級
    ])

    return ContentService
      .createTextOutput(JSON.stringify({ success: true, caseId: caseId, clientId: clientId }))
      .setMimeType(ContentService.MimeType.JSON)

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: err.message }))
      .setMimeType(ContentService.MimeType.JSON)
  }
}
