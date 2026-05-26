# Product Brief — Legal Ops Dashboard

## 產品定位

Demo 階段的純前端法律事務所操作平台。資料來源為 Google Sheets，暫無後端；Demo 驗證後再導入 Supabase。

---

## 使用角色

| 角色 | 主要用途 |
|------|----------|
| 律師 | 查看自己的案件、待辦、期限、相關文件 |
| 管理層 | 整體業績 KPI、財務報表、所有案件概覽 |
| 律師助理 | 資料新增／編輯／維護，全模組存取 |

---

## 核心模組

| 模組 | 功能重點 |
|------|----------|
| 案件追蹤 | 案件列表、狀態、負責律師、截止日期 |
| 文件管理 | 合約／文件上傳、簽署狀態、版本 |
| 帳單／費用 | 計費、發票、付款狀態 |
| 行事曆／期限 | 開庭日期、截止日、提醒 |

---

## 資料夾結構

```
Legal Ops/
├── public/
├── src/
│   ├── components/
│   │   ├── ui/            # 基礎元件（Button、Badge、Modal 等）
│   │   └── modules/       # 功能模組元件（CaseCard、TimelineItem 等）
│   ├── pages/             # 頁面層（Dashboard、Cases、Billing 等）
│   ├── hooks/             # 自定義 React hooks
│   ├── services/
│   │   ├── sheets.js      # Google Sheets 讀寫（唯一入口）
│   │   └── claude.js      # Claude API 呼叫
│   ├── utils/             # 純函數工具（日期計算、時效判斷等）
│   ├── constants/         # 固定常數（案件類型、權限等級、法定期間天數）
│   └── App.jsx
├── docs/
│   ├── PRODUCT_BRIEF.md
│   └── competitors.md
├── .env.local             # 環境變數（不進 git）
├── .env.example           # 環境變數範本（進 git）
└── CLAUDE.md
```

---

## 技術決策優先順序

1. **法定期間警示的準確性** > 任何 UI 細節
2. **資料不遺失** > 操作便利性
3. **權限邏輯正確** > 功能完整性

---

## 未來升級路徑

Demo 驗證後導入 Supabase（PostgreSQL + Row Level Security），替換 `src/services/sheets.js` 內部實作即可，介面不變。
