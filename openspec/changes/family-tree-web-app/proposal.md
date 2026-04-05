## Why

目前鐘氏族譜是一個單一 HTML 靜態檔案，所有族人資料以 JavaScript 陣列硬編碼在頁面中，無法讓多位家族成員協作新增或修改資料。需要打造一個部署在 GitHub 上的公開網頁應用，讓家族成員能瀏覽族譜、提交新增成員及修改請求，經管理員審核後正式呈現在族譜樹中。

## What Changes

- 建立完整的前後端應用架構，取代單一 HTML 靜態檔案
- 前端：React/TypeScript SPA，保留現有族譜樹視覺化、搜尋、家族故事功能
- 後端：Python FastAPI 提供 REST API，處理族人資料 CRUD 與審核流程
- 資料庫：使用 PostgreSQL 儲存族人資料、審核請求
- 新增使用者認證系統（管理員 / 一般成員角色）
- 新增成員申請流程：一般成員提交 → 管理員審核 → 通過後顯示在族譜樹
- 新增資料修改請求流程：一般成員提出修改 → 管理員審核 → 通過後更新前台
- 部署至 Zeabur 平台（依據專案慣例）

## Capabilities

### New Capabilities
- `family-tree-display`: 族譜樹互動式視覺化展示，包含支系篩選、世代篩選、搜尋、縮放平移功能
- `member-management`: 族人資料 CRUD 操作，包含新增成員申請與資料修改請求
- `approval-workflow`: 管理員審核流程，審核新增成員申請與資料修改請求
- `user-auth`: 使用者認證與授權，區分管理員與一般成員角色
- `family-story`: 家族故事與遷徙歷史展示頁面
- `data-migration`: 將現有 HTML 中的族人資料遷移至資料庫

### Modified Capabilities

（無既有 capabilities 需修改）

## Impact

- **前端**：從單一 HTML 檔改為 React/TypeScript 專案，需重新實作所有 UI 元件
- **後端**：新增 Python FastAPI 伺服器，需設定 API 路由、資料庫模型、認證中介層
- **資料庫**：新增 PostgreSQL，需設計族人、使用者、審核請求等資料表
- **部署**：需在 Zeabur 設定前後端服務、資料庫、環境變數
- **資料**：需將現有 ~150 位族人資料從 HTML 內嵌 JSON 遷移至資料庫
- **開發環境**：Windows PowerShell，需注意避免 Unix 特定語法
