## ADDED Requirements

### Requirement: 公開 API 提供族人資料
系統 SHALL 提供 REST API 讓任何人（含未登入）讀取族譜資料。

#### Scenario: 取得全部族人
- **WHEN** 客戶端發送 GET /api/persons
- **THEN** 系統回傳所有族人列表（JSON 陣列），包含 id、name、gender、generation、branch、birthYear、deathYear、spouse、childrenIds、parentId、notes

#### Scenario: 取得單一族人
- **WHEN** 客戶端發送 GET /api/persons/p1
- **THEN** 系統回傳該族人的完整資料

#### Scenario: 族人不存在
- **WHEN** 客戶端發送 GET /api/persons/p999
- **THEN** 系統回傳 404 Not Found

### Requirement: API 支援 CORS
系統 SHALL 設定 CORS 允許前端網域（GitHub Pages）存取 API。

#### Scenario: 跨域請求
- **WHEN** 前端從 gjj22622.github.io 發送 API 請求
- **THEN** 後端回傳正確的 CORS headers，請求成功

### Requirement: API 需權限控制
系統 SHALL 對寫入操作進行 JWT 權限驗證。

#### Scenario: 無 token 嘗試提交
- **WHEN** 未帶 Authorization header 發送 POST /api/submissions
- **THEN** 系統回傳 401 Unauthorized

#### Scenario: 一般會員嘗試存取 admin API
- **WHEN** role=member 的使用者發送 GET /api/admin/submissions
- **THEN** 系統回傳 403 Forbidden

#### Scenario: 管理員存取 admin API
- **WHEN** role=admin 的使用者發送 GET /api/admin/submissions
- **THEN** 系統回傳所有待審核提交列表

### Requirement: 前端整合 API
前端 SHALL 在載入時從 API 取得族人資料，取代內嵌的 INITIAL_DATA。若 API 不可用，SHALL fallback 到 localStorage cache。

#### Scenario: API 可用時載入
- **WHEN** 前端載入且 API 回應正常
- **THEN** 使用 API 回傳的資料渲染族譜，同時更新 localStorage cache

#### Scenario: API 不可用時載入
- **WHEN** 前端載入但 API 無回應（離線或伺服器停機）
- **THEN** 使用 localStorage cache 資料渲染族譜，顯示「離線模式」提示
