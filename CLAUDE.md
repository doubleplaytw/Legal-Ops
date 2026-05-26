# Legal Ops Dashboard

## 參考資料（強制執行）

**在執行任何功能開發、介面設計、產品規劃任務之前，必須先完成以下兩個步驟，不得略過：**

1. 使用 Read 工具讀取 `docs/competitors.md`，了解競品功能與市場定位
2. 使用 Read 工具讀取 `docs/PRODUCT_BRIEF.md`，確認產品定位與角色需求

讀完後才可以開始動手。若這兩個檔案與當前任務有直接關聯，需在回應中說明參考了哪些內容。

# CLAUDE.md — Legal Ops 開發操作規範

> Claude Code 每次 session 啟動時的核心指令文件。業務背景請參閱 `docs/PRODUCT_BRIEF.md`。

---

## 專案現況（一句話）

這是一個 **Demo 階段的純前端 Legal Ops 系統**，資料來源為 Google Sheets，暫無後端。目標是先跑通主要流程，後端（Supabase）留待 Demo 驗證後再建。

---

## 技術棧（已鎖定）

| 層級 | 選型 | 備註 |
|------|------|------|
| 前端 | React（純前端，無 SSR） | Demo 階段，不用 Next.js |
| 資料源 | Google Sheets + Google Sheets API | 過渡期唯一資料層 |
| AI 功能 | Claude API（`@anthropic-ai/sdk`） | 需從環境變數讀取 key |
| 樣式 | Tailwind CSS | |
| 版本控制 | GitHub | |
| 開發工具 | Cursor + Claude Code | |

**未來升級路徑（Demo 後才動）：** Supabase（PostgreSQL + Row Level Security）

---

## 專案資料夾結構

```
Legal Ops/
├── public/
├── src/
│   ├── components/
│   │   ├── ui/            # 基礎元件（Button、Badge、Modal 等）
│   │   └── modules/       # 功能模組元件（CaseCard、TimelineItem 等）
│   ├── pages/             # 頁面層（Dashboard、Cases、Clients 等）
│   ├── hooks/             # 自定義 React hooks
│   ├── services/
│   │   ├── sheets.js      # Google Sheets 讀寫邏輯（唯一入口）
│   │   └── claude.js      # Claude API 呼叫邏輯
│   ├── utils/             # 純函數工具（日期計算、時效判斷等）
│   ├── constants/         # 固定常數（案件類型、權限等級、法定期間天數）
│   └── App.jsx
├── docs/
│   ├── PRODUCT_BRIEF.md   # 業務背景文件
│   └── competitors.md     # 競品分析
├── .env.local             # 環境變數（不進 git）
├── .env.example           # 環境變數範本（進 git）
└── CLAUDE.md
```

---

## 命名規範

| 類型 | 規範 | 範例 |
|------|------|------|
| 元件檔案 | PascalCase | `CaseTimeline.jsx` |
| 非元件 JS 檔 | camelCase | `sheets.js`、`useDeadlines.js` |
| 樣式 | Tailwind 優先，不自訂 class name | |
| 變數 / 函數 | camelCase | `fetchCaseById`、`isOverdue` |
| 常數 | UPPER_SNAKE_CASE | `CASE_TYPES`、`DEADLINE_DAYS` |
| Google Sheets 工作表名稱 | 一旦命名**不得更改**，改名會壞掉 API 串接 | |

---

## 環境變數管理

- 所有 key 與 token 一律寫在 `.env.local`，**絕對不硬寫在程式碼裡**
- `.env.local` 已加入 `.gitignore`，不進版本控制
- 新增任何環境變數時，同步更新 `.env.example`（填佔位符，不填真實值）

```
# .env.example 範例格式
REACT_APP_GOOGLE_SHEETS_API_KEY=your_key_here
REACT_APP_GOOGLE_SPREADSHEET_ID=your_spreadsheet_id_here
REACT_APP_ANTHROPIC_API_KEY=your_anthropic_key_here
```

---

## 「先問再動」規則

以下情況 Claude Code **必須先說明意圖、等待確認後才執行**：

| 情況 | 原因 |
|------|------|
| 新增第三方 API 串接 | 可能產生費用或資安風險，需 Richard 確認 |

其他操作（新增元件、修改樣式、重構函數）可直接執行，完成後說明即可。

---

## Google Sheets 操作原則

- **只透過 `src/services/sheets.js` 這個單一入口讀寫**，不在元件內直接呼叫 API
- 讀取用 Google Sheets API v4（`GET spreadsheets/{id}/values/{range}`）
- 寫入前先確認欄位順序，Sheets 欄位順序即資料結構，**不隨意插入新欄位**
- 函數介面需預留擴充空間（未來遷移至 Supabase 時只需替換 `sheets.js` 內部實作）

---

## 測試策略

Demo 階段不寫自動化測試，但：
- 每完成一個功能，在 `README.md` 的「手動測試清單」補上驗收步驟
- **例外：** 日期計算與法定時效相關的 `utils` 函數，需附手寫驗證範例（console.log 即可）——這類邏輯出錯的成本最高

---

## 完成功能後的回報格式

```
【完成】功能名稱
解決的問題：（一句話，從業主視角描述）
做了什麼：（技術動作，一到三點）
需要你確認：（如有）
下一步建議：（如有）
```

---

## 技術決策衝突時的優先順序

1. **法定期間警示的準確性** > 任何 UI 細節（算錯時效等於商譽危機）
2. **資料不遺失** > 操作便利性
3. **權限邏輯正確** > 功能完整性（即使 Demo 階段）

詳細業務背景 → `docs/PRODUCT_BRIEF.md`