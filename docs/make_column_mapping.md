# Make — Google Sheets 欄位對應表

## ID 產生原則

客戶編號（`CL-YYYY-NNN`）與案件編號（`C-YYYY-NNN`）由 Google Sheets 內的 Apps Script 統一補齊，
**Make 寫入時 A 欄留空即可**，不需要 Make 自行產生 ID。

> 補號方式：在 Google Sheets 選單點「Legal Ops → 補齊編號」
> 腳本檔案：`docs/id_generator.gs`

---

## Make 情境流程（簡化版）

```
LINE Webhook
  └─ 解析訊息（split by |）
       ├─ Step 1：Google Sheets — Add a Row → 客戶主檔（A 欄留空）
       ├─ Step 2：Google Sheets — Add a Row → 案件（A 欄、O 欄皆留空）
       └─ Step 3：LINE Reply API → 傳送確認訊息
```

> 案件 O 欄（客戶編號）由 `id_generator.gs` 依姓名+日期自動比對填入。

---

## 客戶主檔（Values in columns）

| 欄位 | 填入值 |
|------|--------|
| 客戶編號 (A) | **留空**（由 Apps Script 補齊） |
| 姓名 (B) | `{{get(split(trigger.events[]; "\|"); 2)}}` |
| 客戶類型 (D) | **留空**（欄位保留但不使用） |
| 行動電話 (G) | `{{get(split(trigger.events[]; "\|"); 3)}}` |
| 所屬分所 (J) | `{{get(split(trigger.events[]; "\|"); 4)}}` |
| 來源管道 (K) | `LINE` |
| 初始諮詢項目 (L) | `{{get(split(trigger.events[]; "\|"); 5)}}` |
| 客戶狀態 (M) | `pending` |
| 委任合約狀態 (O) | `unsigned` |
| 利衝查詢狀態 (P) | `unchecked` |
| 初始需求說明 (T) | `{{get(split(trigger.events[]; "\|"); 6)}}` |
| 內部備註 (U) | `LINE 收案` |
| 建檔日期 (V) | `{{formatDate(now; "YYYY-MM-DD")}}` |

---

## 案件（Values in columns）

| 欄位 | 填入值 |
|------|--------|
| 案件編號 (A) | **留空**（由 Apps Script 補齊） |
| 建立日期 (B) | `{{formatDate(now; "YYYY-MM-DD")}}` |
| 當事人 (C) | `{{get(split(trigger.events[]; "\|"); 2)}}` |
| 案由 (D) | `{{get(split(trigger.events[]; "\|"); 5)}}` |
| 聲明事項 (E) | `{{get(split(trigger.events[]; "\|"); 6)}}` |
| 案件類型 (F) | `{{get(split(trigger.events[]; "\|"); 5)}}` |
| 狀態 (G) | `appointment` |
| 客戶編號 (O) | **留空**（由 Apps Script 比對後填入） |

---

## LINE 訊息格式（用戶需照此格式傳送）

用 `|` 分隔，共 6 段，順序固定：

```
諮詢申請|姓名|電話|分所|類型|需求說明
```

**實際範例：**
```
諮詢申請|王大明|0912-345-678|台北總所|法律諮詢|借貸糾紛，已提起訴訟
```

### 分所有效值（第 4 段）
- 台北總所
- 台中分所
- 高雄分所
- 線上諮詢

### 類型有效值（第 5 段）
- 法律諮詢
- 課程講師
- 公關活動
- 其他業務
