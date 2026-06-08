/**
 * Legal Ops Dashboard - Mailroom Web App
 *
 * 貼入方式：
 *   開啟你的前端 Web App 專案（不是 LINE Bot 那個），
 *   將以下程式碼整段貼入，或依說明合併進既有 doPost。
 *
 * 指令碼屬性需設定（「專案設定」→「指令碼屬性」）：
 *   SPREADSHEET_ID = 試算表網址中段的 ID
 */

// ----- Web App 入口 -----
// 若你的腳本已有 doPost，只需把 if (parsed.action === 'addDocument') 那段
// 合併進去，不要重複定義 doPost。

function doPost(e) {
  try {
    var parsed = JSON.parse(e.postData.contents);
    var result;

    if (parsed.action === 'addDocument') {
      result = handleAddDocument(parsed);
    } else if (parsed.action === 'submitIntake') {
      result = { success: true, message: 'intake not implemented here' };
    } else {
      result = { success: false, message: 'unknown action: ' + parsed.action };
    }

    return ContentService
      .createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    Logger.log('doPost error: ' + err.toString());
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ----- 新增收發文 -----

function handleAddDocument(data) {
  var ss    = SpreadsheetApp.openById(getSpreadsheetId());
  var sheet = ss.getSheetByName('收發文'); // 收發文

  if (!sheet) {
    throw new Error('找不到「收發文」工作表'); // 找不到「收發文」工作表
  }

  if (!data.direction || !data.caseNo || !data.docType || !data.date) {
    throw new Error('缺少必填欄位'); // 缺少必填欄位
  }

  var newId  = generateDocumentId(sheet);
  var status = data.status || '待處理'; // 待處理

  sheet.appendRow([
    newId,
    data.direction,
    data.caseNo,
    data.docType,
    data.docRef      || '',
    data.date,
    data.summary     || '',
    data.deadlineType || '無', // 無
    data.deadlineDate || '',
    '',
    status,
    data.lawyer      || '',
    data.note        || ''
  ]);

  Logger.log('addDocument OK: ' + newId);
  return { success: true, id: newId };
}

// ----- 工具函式 -----

function getSpreadsheetId() {
  var id = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
  if (!id) throw new Error('SPREADSHEET_ID not set in Script Properties');
  return id;
}

function generateDocumentId(sheet) {
  var year    = new Date().getFullYear();
  var lastRow = sheet.getLastRow();
  var maxSeq  = 0;

  if (lastRow >= 2) {
    var ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
    for (var i = 0; i < ids.length; i++) {
      var m = String(ids[i][0]).match(/^DOC-\d{4}-(\d+)$/);
      if (m) {
        var seq = parseInt(m[1], 10);
        if (seq > maxSeq) maxSeq = seq;
      }
    }
  }

  var next = String(maxSeq + 1);
  while (next.length < 3) next = '0' + next;
  return 'DOC-' + year + '-' + next;
}
