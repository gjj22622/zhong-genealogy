## ADDED Requirements

### Requirement: 管理員可審核會員註冊
系統 SHALL 提供管理員介面，列出所有 `pending` 狀態的會員申請，管理員可逐一審核。

#### Scenario: 通過會員申請
- **WHEN** 管理員點擊「通過」某會員申請
- **THEN** 該會員狀態變為 `active`，可正常登入使用系統

#### Scenario: 退回會員申請
- **WHEN** 管理員點擊「退回」並填寫退回理由
- **THEN** 該會員狀態變為 `rejected`，紀錄退回理由

### Requirement: 管理員可審核族人提交
系統 SHALL 顯示所有待審核的族人新增/修改提交，管理員可通過、退回、或修改後通過。

#### Scenario: 通過族人新增提交
- **WHEN** 管理員審核一筆「新增族人」提交並點擊「通過」
- **THEN** 系統將提交資料寫入正式族人表，提交狀態變為 `approved`

#### Scenario: 修改後通過
- **WHEN** 管理員修改提交中的某些欄位（如更正出生年），然後點擊「通過」
- **THEN** 系統以管理員修改後的資料寫入族人表

#### Scenario: 退回提交
- **WHEN** 管理員退回一筆提交並填寫原因
- **THEN** 提交狀態變為 `rejected`，提交者可在「我的提交」中看到退回原因

### Requirement: 管理員可直接管理族人資料
系統 SHALL 允許管理員直接新增、編輯、刪除族人資料，無需經過提交審核流程。

#### Scenario: 管理員直接編輯族人
- **WHEN** 管理員在後台修改某族人的配偶名稱並儲存
- **THEN** 族人資料立即更新

#### Scenario: 管理員刪除族人
- **WHEN** 管理員刪除某族人，且確認刪除
- **THEN** 該族人從族譜中移除，其子女的 parentId 設為 null

### Requirement: 管理員可管理會員帳號
系統 SHALL 允許管理員查看所有會員列表、修改角色、停用帳號。

#### Scenario: 將會員升為管理員
- **WHEN** 管理員將某會員的角色改為 `admin`
- **THEN** 該會員獲得管理員權限

#### Scenario: 停用會員帳號
- **WHEN** 管理員將某會員狀態改為 `suspended`
- **THEN** 該會員無法登入

### Requirement: Admin 後台需獨立頁面
系統 SHALL 提供獨立的 `admin.html` 頁面，僅管理員角色可存取。

#### Scenario: 非管理員嘗試存取
- **WHEN** 一般會員嘗試開啟 admin.html
- **THEN** 系統檢查 JWT 角色，若非 admin 則跳轉到登入頁或顯示「無權限」

#### Scenario: 管理員登入後台
- **WHEN** 管理員登入並開啟 admin.html
- **THEN** 顯示儀表板：待審核數量、會員總數、族人總數
