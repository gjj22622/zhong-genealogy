## 1. 後端基礎建設

- [x] 1.1 建立後端專案結構（backend/ 目錄，FastAPI app、config、dependencies）
- [x] 1.2 設定 PostgreSQL 連線與 SQLAlchemy engine
- [x] 1.3 建立資料庫模型：users 表（id, username, password_hash, role, display_name, phone, email, line_id, relation_claim, person_id, status, created_at）
- [x] 1.4 建立資料庫模型：persons 表（id, name, gender, generation, branch, birth_year, death_year, spouse, parent_id, notes, children_ids, created_at, updated_at）
- [x] 1.5 建立資料庫模型：submissions 表（id, user_id, type, target_person_id, data, status, admin_notes, reviewed_by, reviewed_at, created_at）
- [x] 1.6 建立 Alembic 遷移腳本並執行初始遷移
- [ ] 1.7 將 INITIAL_DATA（152 筆族人）匯入 PostgreSQL

## 2. 認證系統

- [x] 2.1 實作密碼 hash/verify 工具函式（bcrypt）
- [x] 2.2 實作 JWT token 產生與驗證（access token 30min, refresh token 7 天）
- [x] 2.3 實作 POST /api/auth/register — 會員註冊（建立 pending 帳號）
- [x] 2.4 實作 POST /api/auth/login — 登入驗證（檢查帳號狀態）
- [x] 2.5 實作 POST /api/auth/refresh — 重新取得 access token
- [x] 2.6 實作認證 dependency（get_current_user, require_admin）

## 3. 族人資料 API

- [x] 3.1 實作 GET /api/persons — 取得全部族人（公開）
- [x] 3.2 實作 GET /api/persons/:id — 取得單一族人（公開）
- [x] 3.3 設定 CORS middleware 允許 GitHub Pages 網域

## 4. 提交審核流程

- [x] 4.1 實作 POST /api/submissions — 會員提交新增/修改申請（需 member 角色）
- [x] 4.2 實作 GET /api/submissions/mine — 查看自己的提交紀錄
- [x] 4.3 實作 GET /api/admin/submissions — 管理員查看所有待審核
- [x] 4.4 實作 PUT /api/admin/submissions/:id — 審核操作（approve/reject，含修改後通過）
- [x] 4.5 實作審核通過自動寫入族人表邏輯（新增 + 更新 parent 的 childrenIds）

## 5. Admin 會員管理 API

- [x] 5.1 實作 GET /api/admin/users — 查看所有會員列表
- [x] 5.2 實作 PUT /api/admin/users/:id — 修改會員角色/狀態
- [x] 5.3 實作 PUT /api/admin/persons/:id — 管理員直接編輯族人
- [x] 5.4 實作 DELETE /api/admin/persons/:id — 管理員刪除族人（更新子女 parentId）

## 6. 前端：登入/註冊 UI

- [ ] 6.1 在 鐘氏族譜.html 新增登入/註冊 Modal UI（大按鈕、長輩友善）
- [ ] 6.2 實作前端 API 呼叫工具函式（fetch wrapper with JWT）
- [ ] 6.3 實作登入流程：送出帳密 → 儲存 token → 更新 UI 狀態
- [ ] 6.4 實作註冊流程：填寫表單 → 送出 → 顯示「等待審核」
- [ ] 6.5 登入後顯示使用者名稱、登出按鈕

## 7. 前端：提交功能改造

- [ ] 7.1 修改「新增族人」表單：登入後送到 API submissions，未登入提示登入
- [ ] 7.2 修改「編輯族人」表單：同上，改為提交而非直接修改
- [ ] 7.3 新增「我的提交」頁面/區塊：顯示提交紀錄與審核狀態
- [ ] 7.4 前端載入時從 GET /api/persons 取得資料，fallback 到 localStorage

## 8. Admin 後台前端

- [ ] 8.1 建立 admin.html — 管理員後台頁面（獨立 HTML，鐘鼎傳世主題）
- [ ] 8.2 實作管理員登入驗證（檢查 JWT role=admin）
- [ ] 8.3 實作儀表板：待審核數量、會員總數、族人總數
- [ ] 8.4 實作「審核提交」面板：列表、通過/退回/修改後通過
- [ ] 8.5 實作「會員管理」面板：列表、角色修改、停用
- [ ] 8.6 實作「族人管理」面板：搜尋、編輯、刪除

## 9. 部署

- [ ] 9.1 設定 Zeabur 後端部署（zbpack.json、環境變數）
- [ ] 9.2 設定 PostgreSQL 資料庫（Zeabur 或外部服務）
- [ ] 9.3 前端 API_BASE_URL 設定為 Zeabur 後端網址
- [ ] 9.4 測試完整流程：註冊 → 審核 → 登入 → 提交 → 審核通過 → 族譜更新
