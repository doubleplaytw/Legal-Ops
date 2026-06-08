/**
 * Legal Ops Dashboard — Google Sheets 初始化腳本
 * 依據 docs/SHEETS_SCHEMA.md 建立所有工作表結構
 *
 * 使用方式：
 *   1. 開啟目標 Google Sheets
 *   2. 點選「擴充功能」→「Apps Script」
 *   3. 貼上此腳本，點「執行」→「setupSheets」
 *   4. 授權後再次執行
 */

function setupSheets() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  var SHEETS = [
    {
      name: '律師設定',
      headers: [
        '律師ID', '姓名', '案件上限', '本季預計結案數', '本季累計結案數',
        '上季結算結案數', '本季累計計費時數(hr)', '季度計費目標(hr)',
        '上季計費時數(hr)', '本季收款目標(NTD)', '本季已收金額(NTD)', '上季已收金額(NTD)'
      ]
    },
    {
      name: '客戶主檔',
      headers: [
        '客戶編號', '姓名', '稱謂', '客戶類型', '統一編號', '身分證字號',
        '行動電話', '聯絡電話', '電子信箱', '所屬分所', '來源管道',
        '初始諮詢項目', '客戶狀態', '負責律師', '委任合約狀態', '利衝查詢狀態',
        '利衝查詢日期', '利衝備註', '關聯案件編號', '初始需求說明', '內部備註', '建檔日期'
      ]
    },
    {
      name: '案件',
      headers: [
        '案件編號', '建立日期', '當事人', '案由', '聲明事項', '案件類型',
        '狀態', '負責律師', '下次期限', '預計結案日', '實際結案日',
        '父案編號', '子案類型', '審級'
      ]
    },
    {
      name: '接觸紀錄',
      headers: ['紀錄ID', '案件編號', '接觸日期', '接觸類型', '律師', '備註']
    },
    {
      name: '追蹤事項',
      headers: ['追蹤ID', '案件編號', '到期日', '任務描述', '已完成', '類別']
    },
    {
      name: '期限事件',
      headers: ['事件ID', '案件編號', '類別', '到期日', '說明']
    },
    {
      name: '帳務',
      headers: [
        '月份', '諮詢時數', '未請款件數', '未請款金額(NTD)',
        '已請款未付款件數', '已請款未付款金額(NTD)'
      ]
    },
    {
      name: '文件連結',
      headers: ['連結ID', '案件編號', '文件名稱', 'URL']
    }
  ];

  SHEETS.forEach(function(sheetDef) {
    var existing = ss.getSheetByName(sheetDef.name);

    if (existing) {
      Logger.log('跳過（已存在）：' + sheetDef.name);
      return;
    }

    var sheet = ss.insertSheet(sheetDef.name);

    // 寫入 header（第 1 列）
    var headerRange = sheet.getRange(1, 1, 1, sheetDef.headers.length);
    headerRange.setValues([sheetDef.headers]);

    // 粗體
    headerRange.setFontWeight('bold');

    // 凍結第 1 列
    sheet.setFrozenRows(1);

    Logger.log('完成：' + sheetDef.name + ' 工作表已建立');
  });

  Logger.log('=== 所有工作表初始化完畢 ===');
}
