## ADDED Requirements

### Requirement: 族人可註冊會員帳號
系統 SHALL 提供註冊表單，收集以下資訊：
- 使用者名稱（帳號）
- 密碼（最少 6 字元）
- 顯示名稱（真實姓名）
- 手機號碼
- Email（選填）
- Line ID（選填）
- 世代關係描述（例：「我是鍾俊雄的兒子」）

註冊後帳號狀態為 `pending`，需經管理員審核才能成為正式會員。

#### Scenario: 成功註冊
- **WHEN** 使用者填寫所有必填欄位並送出
- **THEN** 系統建立 `pending` 狀態的帳號，顯示「註冊成功，等待管理員審核」

#### Scenario: 使用者名稱已存在
- **WHEN** 使用者填寫的帳號已被註冊
- **THEN** 系統顯示「此帳號已被使用」錯誤訊息

#### Scenario: 密碼過短
- **WHEN** 使用者輸入少於 6 字元的密碼
- **THEN** 系統顯示「密碼至少需 6 個字元」錯誤訊息

### Requirement: 會員可登入系統
系統 SHALL 提供登入功能，使用帳號密碼驗證，成功後發放 JWT token。

#### Scenario: 成功登入
- **WHEN** 已審核通過的會員輸入正確帳號密碼
- **THEN** 系統回傳 JWT access token 和 refresh token，前端儲存並跳轉到族譜頁面

#### Scenario: 帳號尚未審核
- **WHEN** `pending` 狀態的帳號嘗試登入
- **THEN** 系統顯示「您的帳號正在等待管理員審核」

#### Scenario: 帳號密碼錯誤
- **WHEN** 使用者輸入錯誤的帳號或密碼
- **THEN** 系統顯示「帳號或密碼錯誤」（不區分哪個錯）

### Requirement: 會員可查看與更新個人資料
系統 SHALL 允許已登入會員查看並更新自己的手機、Email、Line ID 等聯絡資訊。

#### Scenario: 更新聯絡資訊
- **WHEN** 會員修改自己的 Line ID 並儲存
- **THEN** 系統更新該會員的 Line ID，顯示「已更新」

#### Scenario: 未登入嘗試存取
- **WHEN** 未登入的使用者嘗試存取個人資料 API
- **THEN** 系統回傳 401 Unauthorized
