## Context

鐘氏族譜目前是純前端 HTML 應用，資料內嵌在 JS 中，使用者編輯存在 localStorage。專案已有部分後端基礎（FastAPI + PostgreSQL + Alembic），見先前的 commit 歷史，但尚未整合到前端。本次設計需在此基礎上擴展會員系統與管理員審核流程。

前端部署於 GitHub Pages（靜態），後端將部署於 Zeabur。

## Goals / Non-Goals

**Goals:**
- 建立會員註冊/登入系統，收集族人個資與世代關係
- 建立管理員審核機制，所有新增/修改需經審核才正式生效
- 建立 Admin 後台 UI，讓管理員能高效審核、管理族人資料
- 前端族譜資料改為從 API 讀取，保留離線 fallback（localStorage cache）

**Non-Goals:**
- 即時通訊功能（Line 群組整合等）— 後續版本
- 付費機制或金流
- 多族譜支援（僅鐘氏一族）
- 原生 App（維持 PWA/Web）

## Decisions

### 1. 認證方式：JWT + 簡易密碼

**選擇**：JWT access token（短效 30min）+ refresh token（長效 7 天），密碼用 bcrypt hash。

**替代方案**：
- OAuth2 社群登入（LINE Login、Google）— 長輩可能不熟悉授權流程，且增加第三方依賴
- Magic Link（Email 驗證碼）— 部分長輩可能沒有 Email

**理由**：帳號密碼最直覺，長輩理解門檻低。未來可加 LINE Login 作為替代。

### 2. 角色設計：三層級

- `admin`：管理員，可審核、編輯、刪除所有資料
- `member`：已驗證族人，可瀏覽、提交新增/修改申請
- `guest`：未登入，只能瀏覽族譜（唯讀）

**理由**：最小權限原則。不需要複雜的 RBAC，三層級足夠。

### 3. 審核流程：Submission 佇列

提交的新增/修改族人資料存為 `submission` 記錄，狀態：`pending` → `approved` / `rejected`。

Admin 審核時可修改提交內容再通過。通過後自動寫入正式 `person` 表。

**理由**：避免錯誤資料直接進入族譜，且保留完整的修改紀錄。

### 4. 前端架構：維持單一 HTML + API 整合

**選擇**：在現有 `鐘氏族譜.html` 中加入登入/註冊 UI 和 API 呼叫。Admin 後台另建一個獨立 HTML 頁面 `admin.html`。

**替代方案**：
- 遷移到 React SPA — 改動量巨大，且已投入大量客製 CSS
- iframe 嵌入 — UX 差

**理由**：維持單一檔案架構原則，避免大規模重構。Admin 後台需求不同，獨立頁面合理。

### 5. 資料庫設計

```
users (會員)
  id, username, password_hash, role, display_name,
  phone, email, line_id, relation_claim, person_id (FK→persons),
  status (pending/active/suspended), created_at

persons (族人 — 擴展現有表)
  id, name, gender, generation, branch, birth_year, death_year,
  spouse, parent_id, notes, created_at, updated_at

submissions (審核佇列)
  id, user_id (FK→users), type (add/edit),
  target_person_id (編輯時), data (JSON — 提交的欄位),
  status (pending/approved/rejected),
  admin_notes, reviewed_by, reviewed_at, created_at
```

### 6. API 路由規劃

```
POST /api/auth/register     — 會員註冊
POST /api/auth/login        — 登入取得 JWT
GET  /api/persons           — 取得全部族人（公開）
GET  /api/persons/:id       — 取得單一族人（公開）
POST /api/submissions       — 提交新增/修改（需 member）
GET  /api/submissions/mine  — 查看自己的提交（需 member）

# Admin 專用
GET  /api/admin/submissions        — 查看所有待審核
PUT  /api/admin/submissions/:id    — 審核（approve/reject）
GET  /api/admin/users              — 查看所有會員
PUT  /api/admin/users/:id          — 修改會員狀態/角色
DELETE /api/admin/persons/:id      — 刪除族人
PUT  /api/admin/persons/:id        — 直接編輯族人
```

## Risks / Trade-offs

- **[風險] 長輩不會註冊** → 提供「由家人代為註冊」流程，或管理員可手動建立帳號
- **[風險] 資料一致性** → 前端 cache 與後端資料可能不同步 → 每次開啟頁面從 API 拉取最新資料，localStorage 作為離線 fallback
- **[風險] Zeabur 冷啟動慢** → 首次 API 請求可能延遲 → 前端顯示載入動畫，先顯示 cache 資料
- **[取捨] Admin 後台為簡單 HTML** → 不如專業框架漂亮但維持一致的技術棧
