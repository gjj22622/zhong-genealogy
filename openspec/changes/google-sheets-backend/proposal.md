## Why

現有的 FastAPI + PostgreSQL 後端對於 152 筆資料來說過度複雜，部署需要伺服器和資料庫服務，維護成本高。Google Sheets 作為「資料庫」+ Google Forms 作為「提交入口」，零成本、零維護、管理員直接在 Google Sheets 上審核，完美適合這個規模的家族應用。

## What Changes

- 將 152 筆族人資料匯入 **Google Sheets**，作為唯一資料來源
- Google Sheets 發布為網頁（JSON），前端直接 fetch 讀取
- 建立 **Google Form** 作為「新增族人申請」和「資料修改申請」的提交入口
- 前端載入時從 Google Sheets 讀取最新資料，取代內嵌的 INITIAL_DATA
- 前端「新增/編輯」表單改為導向 Google Form
- **移除** FastAPI 後端依賴（不再需要伺服器、資料庫、JWT）
- 管理員直接在 Google Sheets 上審核、編輯資料

## Capabilities

### New Capabilities
- `sheets-data-source`: 從 Google Sheets 發布的 JSON 讀取族人資料，含 fallback 到內嵌資料
- `forms-submission`: 透過 Google Forms 收集新增族人申請與資料修改請求

### Modified Capabilities

（無）

## Impact

- **前端 `鐘氏族譜.html`**：loadData 改為 fetch Google Sheets JSON，編輯頁改為導向 Google Form
- **移除依賴**：不再需要 FastAPI 後端、PostgreSQL、Zeabur 部署、JWT 認證
- **新增依賴**：Google Sheets（免費）、Google Forms（免費）
- **管理流程**：管理員在 Google Sheets 直接操作，所見即所得
