## ADDED Requirements

### Requirement: 成員註冊
系統 SHALL 提供註冊功能，需輸入 email、密碼與家族註冊碼。

#### Scenario: 使用正確註冊碼註冊
- **WHEN** 使用者輸入有效的 email、密碼與正確的家族註冊碼
- **THEN** 系統建立帳號，角色為「一般成員」，自動登入並導向族譜樹頁面

#### Scenario: 使用錯誤註冊碼
- **WHEN** 使用者輸入錯誤的家族註冊碼
- **THEN** 系統顯示「註冊碼無效」錯誤，不建立帳號

### Requirement: 登入登出
系統 SHALL 提供 email + 密碼登入功能，使用 JWT Token 驗證。

#### Scenario: 成功登入
- **WHEN** 使用者輸入正確的 email 與密碼
- **THEN** 系統發放 JWT Token，導向族譜樹頁面，顯示使用者名稱

#### Scenario: 登入失敗
- **WHEN** 使用者輸入錯誤的密碼
- **THEN** 系統顯示「帳號或密碼錯誤」

#### Scenario: 登出
- **WHEN** 已登入使用者點擊「登出」
- **THEN** 系統清除 Token，回到未登入狀態

### Requirement: 角色授權
系統 SHALL 區分「管理員」與「一般成員」兩種角色，管理員可存取審核面板。

#### Scenario: 管理員存取審核面板
- **WHEN** 管理員角色的使用者存取審核面板
- **THEN** 系統允許存取，顯示審核面板內容

#### Scenario: 一般成員存取審核面板
- **WHEN** 一般成員角色的使用者嘗試存取審核面板
- **THEN** 系統拒絕存取，顯示權限不足訊息

### Requirement: 管理員帳號設定
系統 SHALL 透過環境變數設定初始管理員帳號，管理員可將其他成員升級為管理員。

#### Scenario: 初始管理員
- **WHEN** 系統首次啟動且環境變數 ADMIN_EMAIL 已設定
- **THEN** 該 email 對應的帳號自動設為管理員角色
