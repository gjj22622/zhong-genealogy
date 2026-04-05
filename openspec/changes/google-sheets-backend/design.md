## Context

族譜應用目前資料內嵌在 HTML 的 INITIAL_DATA（152 筆）。已寫好 FastAPI 後端但部署複雜。改用 Google Sheets 作為資料來源，零成本、長輩也能理解。

## Goals / Non-Goals

**Goals:**
- 族人資料從 Google Sheets 即時讀取（管理員改了 Sheet，前端重新整理就看到）
- 族人可透過 Google Form 提交新增/修改申請
- 管理員在 Google Sheets 上直接管理（審核、編輯、刪除）
- 完全免費、無伺服器

**Non-Goals:**
- 即時同步（可接受重新整理才更新）
- 使用者帳號系統（Google Form 不需要登入）
- 後端 API 伺服器

## Decisions

### 1. Google Sheets 發布方式

**選擇**：使用 Google Sheets 的「發佈到網路」功能，輸出為 CSV，前端用 JS 解析。

**替代方案**：
- Google Sheets API + API Key → 需要 GCP 設定，複雜度高
- Apps Script Web App → 需要部署 Apps Script

**理由**：「發佈到網路」最簡單，不需要 API key，不需要 GCP 設定。CSV 格式前端解析簡單。

### 2. 資料格式（Google Sheets 欄位）

| 欄 | 名稱 | 對應 | 範例 |
|---|------|------|------|
| A | id | id | p1 |
| B | name | name | 開基祖母 |
| C | gender | gender | female |
| D | generation | generation | 0 |
| E | branch | branch | 全族 |
| F | birthYear | birthYear | (空) |
| G | deathYear | deathYear | (空) |
| H | spouse | spouse | (空) |
| I | childrenIds | childrenIds | p2,p3 |
| J | parentId | parentId | (空) |
| K | notes | notes | 攜二子由廈門經鹿港來台 |

第一列為標題列。childrenIds 用逗號分隔。

### 3. Google Form 設計

建立兩個 Form（或一個 Form 用條件分支）：

**新增族人申請表單**：
- 您的姓名（申請人）
- 您的手機/Email/Line ID
- 新增族人姓名
- 性別
- 世代（第幾代）
- 支系（頂番婆/草湳底/埔姜崙）
- 出生年
- 配偶姓名
- 父親姓名
- 備註

表單回覆會進入另一個 Google Sheet（回覆表），管理員審核後手動加入族人主表。

### 4. 前端整合方式

```
載入流程：
1. fetch Google Sheets CSV URL
2. 解析 CSV → persons 陣列
3. 成功 → 使用 API 資料 + 存入 localStorage cache
4. 失敗（離線）→ 使用 localStorage cache 或 INITIAL_DATA fallback
```

編輯頁改造：
- 「新增族人」→ 打開 Google Form（新分頁）
- 「修改資料」→ 打開 Google Form（帶預填欄位）
- 保留本機新增功能作為離線 fallback

## Risks / Trade-offs

- **[風險] Sheets 發佈有快取** → Google 約 5 分鐘更新一次 → 可接受
- **[風險] CSV 大量資料解析** → 152 筆不到 20KB，瞬間完成
- **[取捨] 無即時審核通知** → 管理員需定期看 Form 回覆 → 可接受
- **[取捨] Form 無法預填下拉選單** → 用文字輸入 + 說明文字引導
