/**
 * Legal Ops Dashboard — LINE Bot 收案機器人
 *
 * 功能：透過 LINE 一問一答收集客戶基本資料，自動寫入 Google Sheets
 * 寫入目標：客戶主檔（新增一列）、案件（新增對應空列）
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

// ─── 設定（從指令碼屬性讀取）─────────────────────────────────────────────────

function getConfig() {
  var props = PropertiesService.getScriptProperties();
  return {
    LINE_TOKEN:   props.getProperty('LINE_CHANNEL_ACCESS_TOKEN'),
    LINE_SECRET:  props.getProperty('LINE_CHANNEL_SECRET'),
    SPREADSHEET_ID: props.getProperty('SPREADSHEET_ID'),
    SHEET_CLIENTS: '客戶主檔',
    SHEET_CASES:   '案件'
  };
}

// ─── 對話步驟常數 ─────────────────────────────────────────────────────────────

var STEPS = {
  NAME:         0,
  PHONE:        1,
  BRANCH:       2,
  SERVICE_TYPE: 3,
  DESCRIPTION:  4,
  CONFIRM:      5
};

var BRANCH_OPTIONS  = ['台北總所', '台中分所', '高雄分所', '線上諮詢'];
var SERVICE_OPTIONS = ['法律諮詢', '課程講師', '公關活動', '其他業務'];

// ─── Webhook 入口 ─────────────────────────────────────────────────────────────

function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents);

    // LINE Webhook 連線驗證（events 為空陣列）
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
  var userId     = event.source.userId;
  var text       = event.message.text.trim();
  var replyToken = event.replyToken;

  var session = getSession(userId);

  // 尚未開始，或使用者要求重新填寫
  if (!session || text === '重新填寫' || text === '重新開始') {
    clearSession(userId);
    startConversation(userId, replyToken);
    return;
  }

  processStep(userId, text, session, replyToken);
}

// ─── 對話狀態機 ───────────────────────────────────────────────────────────────

function startConversation(userId, replyToken) {
  saveSession(userId, { step: STEPS.NAME });
  replyToUser(replyToken, [
    {
      type: 'text',
      text: '您好！歡迎聯繫恩典法律事務所 👋\n\n我將協助您完成初步諮詢登記，只需回答幾個簡單問題。\n\n請問您的姓名？'
    }
  ]);
}

function processStep(userId, text, session, replyToken) {
  switch (session.step) {

    case STEPS.NAME:
      session.name = text;
      session.step = STEPS.PHONE;
      saveSession(userId, session);
      replyToUser(replyToken, [
        { type: 'text', text: session.name + ' 您好！\n\n請問您的行動電話號碼？\n（格式：0912-345-678）' }
      ]);
      break;

    case STEPS.PHONE:
      if (!isValidPhone(text)) {
        replyToUser(replyToken, [
          { type: 'text', text: '電話格式有誤，請重新輸入 😊\n（格式：0912-345-678）' }
        ]);
        return;
      }
      session.phone = formatPhone(text);
      session.step  = STEPS.BRANCH;
      saveSession(userId, session);
      replyToUser(replyToken, [
        buildQuickReplyMessage('請選擇您希望服務的分所：', BRANCH_OPTIONS)
      ]);
      break;

    case STEPS.BRANCH:
      if (BRANCH_OPTIONS.indexOf(text) === -1) {
        replyToUser(replyToken, [
          buildQuickReplyMessage('請從下方選項選擇分所：', BRANCH_OPTIONS)
        ]);
        return;
      }
      session.branch = text;
      session.step   = STEPS.SERVICE_TYPE;
      saveSession(userId, session);
      replyToUser(replyToken, [
        buildQuickReplyMessage('請選擇諮詢項目：', SERVICE_OPTIONS)
      ]);
      break;

    case STEPS.SERVICE_TYPE:
      if (SERVICE_OPTIONS.indexOf(text) === -1) {
        replyToUser(replyToken, [
          buildQuickReplyMessage('請從下方選項選擇諮詢項目：', SERVICE_OPTIONS)
        ]);
        return;
      }
      session.serviceType = text;
      session.step        = STEPS.DESCRIPTION;
      saveSession(userId, session);
      replyToUser(replyToken, [
        { type: 'text', text: '最後，請簡單描述您的案件狀況或需求（100 字以內即可）：' }
      ]);
      break;

    case STEPS.DESCRIPTION:
      session.description = text;
      session.step        = STEPS.CONFIRM;
      saveSession(userId, session);
      replyToUser(replyToken, [buildConfirmMessage(session)]);
      break;

    case STEPS.CONFIRM:
      if (text === '確認送出') {
        var result = writeToSheets(session);
        clearSession(userId);
        replyToUser(replyToken, [
          {
            type: 'text',
            text: '✅ 登記完成！\n\n案件編號：' + result.caseId + '\n\n我們的律師將在一至兩個工作天內與您聯繫，感謝您的耐心等候。'
          }
        ]);
      } else if (text === '重新填寫') {
        clearSession(userId);
        startConversation(userId, replyToken);
      } else {
        replyToUser(replyToken, [
          buildQuickReplyMessage('請點下方按鈕確認：', ['確認送出', '重新填寫'])
        ]);
      }
      break;

    default:
      clearSession(userId);
      startConversation(userId, replyToken);
  }
}

// ─── Session 管理（ScriptProperties，以 LINE userId 為 key）──────────────────

function getSession(userId) {
  var raw = PropertiesService.getScriptProperties().getProperty('sess_' + userId);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch (e) { return null; }
}

function saveSession(userId, data) {
  PropertiesService.getScriptProperties().setProperty('sess_' + userId, JSON.stringify(data));
}

function clearSession(userId) {
  PropertiesService.getScriptProperties().deleteProperty('sess_' + userId);
}

// ─── Google Sheets 寫入 ───────────────────────────────────────────────────────

function writeToSheets(session) {
  var config   = getConfig();
  var ss       = SpreadsheetApp.openById(config.SPREADSHEET_ID);
  var today    = getToday();
  var clientId = generateClientId(ss, config.SHEET_CLIENTS);
  var caseId   = generateCaseId(ss, config.SHEET_CASES);

  // 客戶主檔：欄位順序嚴格對應 SHEETS_SCHEMA.md A–V
  var clientSheet = ss.getSheetByName(config.SHEET_CLIENTS);
  clientSheet.appendRow([
    clientId,            // A 客戶編號
    session.name,        // B 姓名
    '',                  // C 稱謂（律師補填）
    'individual',        // D 客戶類型（預設個人）
    '',                  // E 統一編號
    '',                  // F 身分證字號
    session.phone,       // G 行動電話
    '',                  // H 聯絡電話
    '',                  // I 電子信箱
    session.branch,      // J 所屬分所
    '其他',              // K 來源管道（LINE 歸入「其他」，律師可改）
    session.serviceType, // L 初始諮詢項目
    'pending',           // M 客戶狀態
    '',                  // N 負責律師（律師補填）
    'unsigned',          // O 委任合約狀態
    'unchecked',         // P 利衝查詢狀態
    '',                  // Q 利衝查詢日期
    '',                  // R 利衝備註
    caseId,              // S 關聯案件編號
    session.description, // T 初始需求說明
    'LINE 收案',         // U 內部備註
    today                // V 建檔日期
  ]);

  // 案件：欄位順序嚴格對應 SHEETS_SCHEMA.md A–N
  var caseSheet = ss.getSheetByName(config.SHEET_CASES);
  caseSheet.appendRow([
    caseId,              // A 案件編號
    today,               // B 建立日期
    session.name,        // C 當事人
    session.serviceType, // D 案由（初步以諮詢類型代入，律師可改）
    '',                  // E 聲明事項（律師補填）
    session.serviceType, // F 案件類型
    'appointment',       // G 狀態（預約諮詢）
    '',                  // H 負責律師（律師補填）
    '',                  // I 下次期限
    '',                  // J 預計結案日
    '',                  // K 實際結案日
    '',                  // L 父案編號
    '',                  // M 子案類型
    ''                   // N 審級
  ]);

  Logger.log('完成：客戶 ' + clientId + '，案件 ' + caseId);
  return { clientId: clientId, caseId: caseId };
}

// ─── LINE 訊息組裝 ────────────────────────────────────────────────────────────

function buildQuickReplyMessage(text, options) {
  return {
    type: 'text',
    text: text,
    quickReply: {
      items: options.map(function(opt) {
        return {
          type: 'action',
          action: { type: 'message', label: opt, text: opt }
        };
      })
    }
  };
}

function buildConfirmMessage(session) {
  var summary =
    '請確認以下資料是否正確：\n\n'
    + '姓名：'     + session.name        + '\n'
    + '電話：'     + session.phone       + '\n'
    + '分所：'     + session.branch      + '\n'
    + '諮詢類型：' + session.serviceType + '\n'
    + '需求說明：' + session.description + '\n\n'
    + '確認後將自動建立案件紀錄。';
  return buildQuickReplyMessage(summary, ['確認送出', '重新填寫']);
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

function getToday() {
  return Utilities.formatDate(new Date(), 'Asia/Taipei', 'yyyy-MM-dd');
}

function isValidPhone(text) {
  // 接受 0912345678 或 0912-345-678 格式
  return /^09\d{8}$/.test(text.replace(/-/g, ''));
}

function formatPhone(text) {
  var digits = text.replace(/-/g, '');
  return digits.slice(0, 4) + '-' + digits.slice(4, 7) + '-' + digits.slice(7);
}

function generateClientId(ss, sheetName) {
  var year  = new Date().getFullYear();
  var sheet = ss.getSheetByName(sheetName);
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
  var year  = new Date().getFullYear();
  var sheet = ss.getSheetByName(sheetName);
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
