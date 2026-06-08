/**
 * Legal Ops Dashboard — LINE Bot 收案機器人（模板填寫版）
 *
 * 流程：
 *   1. 使用者傳任意訊息 → Bot 回傳申請模板
 *   2. 使用者複製模板、填好後傳回 → Bot 解析並寫入 Google Sheets
 *   3. Bot 回傳確認訊息（含案件編號）
 *
 * 部署步驟：
 *   1. Apps Script「專案設定」→「指令碼屬性」設定以下三個值：
 *      - LINE_CHANNEL_ACCESS_TOKEN  （LINE Developers Console 取得）
 *      - LINE_CHANNEL_SECRET        （LINE Developers Console 取得）
 *      - SPREADSHEET_ID             （試算表網址中段的 ID）
 *   2. 部署為 Web App：執行身分「我」、存取權限「所有人」
 *   3. 複製 Web App 網址，填入 LINE Developers Console 的 Webhook URL
 *   4. 在 LINE Developers Console 開啟「Use webhook」、關閉「Auto-reply messages」
 */

// ─── 模板文字 ─────────────────────────────────────────────────────────────────

var TEMPLATE_TEXT =
  '您好！歡迎聯繫恩典法律事務所 👋\n\n' +
  '請複製以下格式填寫後回傳，我們將在一個工作天內與您聯繫：\n\n' +
  '────────────────\n' +
  '諮詢申請\n\n' +
  '類型：法律諮詢／課程講師／公關活動／其他業務\n' +
  '姓名：（您的姓名）\n' +
  '電話：（您的手機）\n' +
  '分所：台北總所／台中分所／高雄分所／線上諮詢\n' +
  '說明：（請簡述您的需求）\n' +
  '────────────────\n\n' +
  '填寫時請將說明後面的選項刪除，只保留您選擇的那一項即可。';

// ─── 設定（從指令碼屬性讀取）─────────────────────────────────────────────────

function getConfig() {
  var props = PropertiesService.getScriptProperties();
  return {
    LINE_TOKEN:     props.getProperty('LINE_CHANNEL_ACCESS_TOKEN'),
    LINE_SECRET:    props.getProperty('LINE_CHANNEL_SECRET'),
    SPREADSHEET_ID: props.getProperty('SPREADSHEET_ID'),
    SHEET_CLIENTS:  '客戶主檔',
    SHEET_CASES:    '案件'
  };
}

// ─── Webhook 入口 ─────────────────────────────────────────────────────────────

function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents);

    if (!body.events || body.events.length === 0) {
      return jsonResponse({ status: 'ok' });
    }

    body.events.forEach(function(event) {
      if (event.type === 'message' && event.message.type === 'text') {
        handleMessage(event);
      }
    });

  } catch (err) {
    Logger.log('doPost error: ' + err.toString());
  }

  return jsonResponse({ status: 'ok' });
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// ─── 訊息路由 ─────────────────────────────────────────────────────────────────

function handleMessage(event) {
  var text       = event.message.text.trim();
  var replyToken = event.replyToken;

  var parsed = parseTemplate(text);

  if (parsed) {
    // 使用者回傳填好的模板
    submitApplication(parsed, replyToken);
  } else {
    // 其他訊息 → 發送模板
    replyToUser(replyToken, [{ type: 'text', text: TEMPLATE_TEXT }]);
  }
}

// ─── 模板解析 ─────────────────────────────────────────────────────────────────

function parseTemplate(text) {
  // 必須同時包含這四個欄位才視為有效模板
  if (text.indexOf('類型：') === -1 || text.indexOf('姓名：') === -1 ||
      text.indexOf('電話：') === -1 || text.indexOf('分所：') === -1) {
    return null;
  }

  function extractField(label) {
    var pattern = new RegExp(label + '：([^\\n]+)');
    var match = text.match(pattern);
    return match ? match[1].trim() : '';
  }

  var consultType = extractField('類型');
  var name        = extractField('姓名');
  var mobile      = extractField('電話');
  var branch      = extractField('分所');
  var description = extractField('說明');

  // 姓名與電話為必填
  if (!name || !mobile) return null;

  return {
    consultType: consultType,
    name:        name,
    mobile:      mobile.replace(/[-\s]/g, ''),
    branch:      branch,
    description: description
  };
}

// ─── 寫入 Sheets 並回覆 ───────────────────────────────────────────────────────

function submitApplication(data, replyToken) {
  try {
    var result = writeToSheets(data);
    replyToUser(replyToken, [{
      type: 'text',
      text: '✅ 申請已收到！\n\n' +
            '姓名：' + data.name + '\n' +
            '諮詢項目：' + data.consultType + '\n' +
            '案件編號：' + result.caseId + '\n\n' +
            '我們將在一個工作天內以電話與您確認諮詢時間，感謝您的耐心等候。'
    }]);
  } catch (err) {
    Logger.log('submitApplication error: ' + err.toString());
    replyToUser(replyToken, [{
      type: 'text',
      text: '很抱歉，系統發生錯誤，請稍後再試或直接來電洽詢。'
    }]);
  }
}

// ─── Google Sheets 寫入 ───────────────────────────────────────────────────────

function writeToSheets(data) {
  var config  = getConfig();
  var ss      = SpreadsheetApp.openById(config.SPREADSHEET_ID);
  var today   = Utilities.formatDate(new Date(), 'Asia/Taipei', 'yyyy-MM-dd');
  var clientId = generateClientId(ss, config.SHEET_CLIENTS);
  var caseId   = generateCaseId(ss, config.SHEET_CASES);

  // 客戶主檔：欄位順序對應 fetchClientMaster() A–V
  var clientSheet = ss.getSheetByName(config.SHEET_CLIENTS);
  clientSheet.appendRow([
    clientId,            // A 客戶編號
    data.name,           // B 姓名
    '',                  // C 稱謂（律師補填）
    'individual',        // D 客戶類型
    '',                  // E 統一編號
    '',                  // F 身分證字號
    data.mobile,         // G 行動電話
    '',                  // H 聯絡電話
    '',                  // I 電子信箱
    data.branch,         // J 所屬分所
    'LINE',              // K 來源管道
    data.consultType,    // L 初始諮詢項目
    'pending',           // M 客戶狀態
    '',                  // N 負責律師（律師補填）
    'unsigned',          // O 委任合約狀態
    'unchecked',         // P 利衝查詢狀態
    '',                  // Q 利衝查詢日期
    '',                  // R 利衝備註
    caseId,              // S 關聯案件編號
    data.description,    // T 初始需求說明
    'LINE 收案',         // U 內部備註
    today                // V 建檔日期
  ]);

  // 案件：欄位順序對應 fetchCases() A–N
  var caseSheet = ss.getSheetByName(config.SHEET_CASES);
  caseSheet.appendRow([
    caseId,              // A 案件編號
    today,               // B 建立日期
    data.name,           // C 當事人
    data.consultType,    // D 案由
    data.description,    // E 聲明事項
    data.consultType,    // F 案件類型
    'appointment',       // G 狀態
    '',                  // H 負責律師
    '',                  // I 下次期限
    '',                  // J 預計結案日
    '',                  // K 實際結案日
    '',                  // L 父案編號
    '',                  // M 子案類型
    ''                   // N 審級
  ]);

  return { clientId: clientId, caseId: caseId };
}

// ─── 呼叫 LINE Reply API ──────────────────────────────────────────────────────

function replyToUser(replyToken, messages) {
  var config = getConfig();
  var options = {
    method:      'post',
    contentType: 'application/json',
    headers:     { Authorization: 'Bearer ' + config.LINE_TOKEN },
    payload:     JSON.stringify({ replyToken: replyToken, messages: messages }),
    muteHttpExceptions: true
  };
  var res = UrlFetchApp.fetch('https://api.line.me/v2/bot/message/reply', options);
  if (res.getResponseCode() !== 200) {
    Logger.log('LINE reply error ' + res.getResponseCode() + ': ' + res.getContentText());
  }
}

// ─── 工具函式 ─────────────────────────────────────────────────────────────────

function generateClientId(ss, sheetName) {
  var year    = new Date().getFullYear();
  var sheet   = ss.getSheetByName(sheetName);
  var lastRow = sheet.getLastRow();
  var maxSeq  = 0;
  if (lastRow >= 2) {
    sheet.getRange(2, 1, lastRow - 1, 1).getValues().forEach(function(row) {
      var m = String(row[0]).match(/^CL-\d{4}-(\d+)$/);
      if (m) maxSeq = Math.max(maxSeq, parseInt(m[1], 10));
    });
  }
  return 'CL-' + year + '-' + String(maxSeq + 1).padStart(3, '0');
}

function generateCaseId(ss, sheetName) {
  var year    = new Date().getFullYear();
  var sheet   = ss.getSheetByName(sheetName);
  var lastRow = sheet.getLastRow();
  var maxSeq  = 0;
  if (lastRow >= 2) {
    sheet.getRange(2, 1, lastRow - 1, 1).getValues().forEach(function(row) {
      var m = String(row[0]).match(/^C-\d{4}-(\d+)$/);
      if (m) maxSeq = Math.max(maxSeq, parseInt(m[1], 10));
    });
  }
  return 'C-' + year + '-' + String(maxSeq + 1).padStart(3, '0');
}
