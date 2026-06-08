/**
 * Legal Ops — 補齊空白編號
 *
 * 安裝方式：
 *   1. 開啟 Google Sheets → 擴充功能 → Apps Script
 *   2. 貼上此程式碼，存檔
 *   3. 重新整理試算表，頂部選單會出現「Legal Ops」
 *   4. 點「Legal Ops → 補齊編號」即可執行
 *
 * 執行順序：
 *   1. 補 客戶主檔 A 欄（客戶編號 CL-YYYY-NNN）
 *   2. 補 案件 A 欄（案件編號 C-YYYY-NNN）
 *   3. 補 案件 O 欄（客戶編號，依姓名+日期自動比對）
 */

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Legal Ops')
    .addItem('補齊編號', 'fillMissingIds')
    .addItem('設定自動補號（每小時）', 'setupHourlyTrigger')
    .addToUi();
}

/**
 * 設定每小時自動執行 fillMissingIds。
 * 只需點一次「Legal Ops → 設定自動補號」，之後永久生效。
 * 重複點不會重複建立觸發器。
 */
function setupHourlyTrigger() {
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === 'fillMissingIds') {
      SpreadsheetApp.getUi().alert('自動補號已經設定過了，不需要重複執行。');
      return;
    }
  }
  ScriptApp.newTrigger('fillMissingIds')
    .timeBased()
    .everyHours(1)
    .create();
  SpreadsheetApp.getUi().alert('設定完成！之後每小時會自動補齊空白編號。');
}

// ─── 主函式 ───────────────────────────────────────────────────────────────────

function fillMissingIds() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  var clientsFilled = fillClientIds(ss);
  var casesFilled   = fillCaseIds(ss);
  var linked        = linkCasesToClients(ss);

  SpreadsheetApp.getUi().alert(
    '完成！\n\n' +
    '客戶編號補了 ' + clientsFilled + ' 筆\n' +
    '案件編號補了 ' + casesFilled   + ' 筆\n' +
    '案件客戶編號連結了 ' + linked  + ' 筆'
  );
}

// ─── 補客戶主檔 A 欄 ──────────────────────────────────────────────────────────

function fillClientIds(ss) {
  var sheet   = ss.getSheetByName('客戶主檔');
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return 0;

  var year = new Date().getFullYear();
  var col  = sheet.getRange(2, 1, lastRow - 1, 1).getValues();

  // 找現有最大序號（跨年取全部，不限當年）
  var maxSeq = 0;
  col.forEach(function(row) {
    var m = String(row[0]).match(/^CL-\d{4}-(\d+)$/);
    if (m) maxSeq = Math.max(maxSeq, parseInt(m[1], 10));
  });

  var filled = 0;
  col.forEach(function(row, i) {
    if (!row[0] || String(row[0]).trim() === '') {
      maxSeq++;
      sheet.getRange(i + 2, 1).setValue('CL-' + year + '-' + String(maxSeq).padStart(3, '0'));
      filled++;
    }
  });
  return filled;
}

// ─── 補案件 A 欄 ──────────────────────────────────────────────────────────────

function fillCaseIds(ss) {
  var sheet   = ss.getSheetByName('案件');
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return 0;

  var year = new Date().getFullYear();
  var col  = sheet.getRange(2, 1, lastRow - 1, 1).getValues();

  var maxSeq = 0;
  col.forEach(function(row) {
    var m = String(row[0]).match(/^C-\d{4}-(\d+)$/);
    if (m) maxSeq = Math.max(maxSeq, parseInt(m[1], 10));
  });

  var filled = 0;
  col.forEach(function(row, i) {
    if (!row[0] || String(row[0]).trim() === '') {
      maxSeq++;
      sheet.getRange(i + 2, 1).setValue('C-' + year + '-' + String(maxSeq).padStart(3, '0'));
      filled++;
    }
  });
  return filled;
}

// ─── 補案件 O 欄（客戶編號）─────────────────────────────────────────────────

/**
 * 比對規則：案件 C 欄（當事人）= 客戶主檔 B 欄（姓名），且建立日期相同
 * 若同一天同名只有一筆，自動填入；若有歧義則跳過（讓律師手動填）
 */
function linkCasesToClients(ss) {
  var clientSheet = ss.getSheetByName('客戶主檔');
  var caseSheet   = ss.getSheetByName('案件');

  var clientLastRow = clientSheet.getLastRow();
  var caseLastRow   = caseSheet.getLastRow();
  if (clientLastRow < 2 || caseLastRow < 2) return 0;

  // 客戶主檔：A=客戶編號, B=姓名, V=建檔日期
  var clientData = clientSheet.getRange(2, 1, clientLastRow - 1, 22).getValues();

  // key: "姓名|日期" → clientId（若有重複 key 設為 null 表示歧義）
  var lookup = {};
  clientData.forEach(function(row) {
    var clientId = String(row[0]).trim();
    var name     = String(row[1]).trim();
    var date     = String(row[21]).trim(); // V 欄建檔日期
    if (!clientId || !name) return;
    var key = name + '|' + date;
    lookup[key] = (key in lookup) ? null : clientId; // 重複 → null
  });

  // 案件：A=案件編號, B=建立日期, C=當事人, O=客戶編號（第 15 欄）
  var caseData = caseSheet.getRange(2, 1, caseLastRow - 1, 15).getValues();
  var linked = 0;

  caseData.forEach(function(row, i) {
    var existingClientNo = String(row[14]).trim(); // O 欄
    if (existingClientNo) return; // 已有值，跳過

    var name = String(row[2]).trim();  // C 欄當事人
    var date = String(row[1]).trim();  // B 欄建立日期
    var key  = name + '|' + date;
    var clientId = lookup[key];

    if (clientId) { // null（歧義）或 undefined（找不到）都跳過
      caseSheet.getRange(i + 2, 15).setValue(clientId);
      linked++;
    }
  });

  return linked;
}
