## Context

目前鐘氏族譜為單一 HTML 靜態檔案（`鐘氏族譜.html`），內嵌約 150 位族人資料作為 JavaScript 陣列，已具備族譜樹視覺化（SVG）、搜尋、家族故事、新增/編輯功能的 UI。但所有操作僅在瀏覽器端完成，無持久化儲存，無多人協作能力。

開發環境為 Windows 11 PowerShell，專案慣例部署至 Zeabur 平台，技術棧為 TypeScript（前端）+ Python（後端）。

## Goals / Non-Goals

**Goals:**
- 保留現有族譜樹的視覺風格與互動體驗
- 讓家族成員可公開瀏覽、搜尋族譜
- 一般成員可提交新增成員申請與修改請求
- 管理員可審核、批准或拒絕所有申請
- 審核通過後即時反映在前台族譜樹中
- 部署為可公開存取的 Web 應用

**Non-Goals:**
- 即時通訊或聊天功能
- 族譜資料的版本回溯（Git-like history）
- 多語系支援（僅繁體中文）
- 原生行動 App（僅 Web responsive）
- 複雜的權限層級（僅管理員 / 一般成員兩種角色）

## Decisions

### 1. 前端框架：React + TypeScript + Vite

**選擇**：React 18 + TypeScript，使用 Vite 作為建置工具

**替代方案**：
- Next.js：SSR 對此應用非必要，增加部署複雜度
- Vue：團隊技術棧偏向 TypeScript/React
- 維持純 HTML：無法支援複雜的審核流程 UI

**理由**：Vite 建置快速，React 生態系成熟，TypeScript 提供型別安全。族譜樹視覺化使用 D3.js 搭配 React 包裝。

### 2. 後端框架：Python FastAPI

**選擇**：FastAPI + SQLAlchemy + Alembic

**替代方案**：
- Django：較重，此專案不需要 Django 內建的 admin/template 系統
- Node.js/Express：可行，但專案慣例後端使用 Python
- Supabase/Firebase：減少後端開發但限制客製化審核流程

**理由**：FastAPI 自動產生 OpenAPI 文件，async 支援佳，與 Python 生態系整合良好。

### 3. 資料庫：PostgreSQL

**選擇**：PostgreSQL（Zeabur 提供託管服務）

**替代方案**：
- SQLite：不適合多人同時存取的生產環境
- MongoDB：族譜資料有明確的關聯結構，SQL 更合適

**理由**：族人之間的父子關係、支系歸屬是典型的關聯式資料，PostgreSQL 的遞迴 CTE 查詢適合處理族譜樹結構。

### 4. 認證方式：JWT + 簡易註冊碼

**選擇**：JWT Token 認證，管理員透過環境變數設定的密鑰登入，一般成員使用家族註冊碼 + email 註冊

**替代方案**：
- OAuth（Google/LINE 登入）：增加第三方依賴，家族成員未必都有 Google 帳號
- 完全公開無認證：無法控制誰能提交申請

**理由**：家族應用不需要複雜的 OAuth 流程，使用家族共享的註冊碼（如家族群組分享）即可控制註冊資格，同時降低開發複雜度。

### 5. 部署架構

```
Zeabur
├── Frontend (Vite static build)
├── Backend (FastAPI)
└── PostgreSQL (managed)
```

前後端分離部署，前端為靜態檔案，後端為 API 服務。

## Risks / Trade-offs

- **[資料遷移風險]** 現有 HTML 內嵌資料的 ID 格式（p1, p2...）與關聯需完整保留 → 撰寫遷移腳本並驗證所有父子關係完整性
- **[單一管理員瓶頸]** 所有審核依賴管理員 → 初期可接受，未來可擴展為多管理員
- **[家族註冊碼外洩]** 註冊碼可能被分享給非家族成員 → 管理員可隨時更換註冊碼，且所有新增/修改仍需審核
- **[免費額度限制]** Zeabur 免費方案可能有流量/儲存限制 → 族譜應用流量低，短期內不會超限
