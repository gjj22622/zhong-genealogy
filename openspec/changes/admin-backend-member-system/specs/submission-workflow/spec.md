## ADDED Requirements

### Requirement: 會員可提交新增族人申請
系統 SHALL 允許已登入會員提交「新增族人」申請，包含族人姓名、性別、世代、支系、出生年、配偶、父親、備註等欄位。

#### Scenario: 成功提交新增申請
- **WHEN** 會員填寫完整的族人資訊並送出
- **THEN** 系統建立 `pending` 狀態的 submission 記錄，顯示「已提交，等待管理員審核」

#### Scenario: 未登入嘗試提交
- **WHEN** 未登入使用者嘗試送出族人資料
- **THEN** 系統提示「請先登入或註冊」

### Requirement: 會員可提交修改族人申請
系統 SHALL 允許已登入會員對現有族人提出修改申請，需指定 target_person_id 和要修改的欄位。

#### Scenario: 提交修改申請
- **WHEN** 會員修改某族人的出生年資訊並送出
- **THEN** 系統建立 type=edit 的 submission，包含 target_person_id 和修改後的資料

### Requirement: 會員可查看自己的提交紀錄
系統 SHALL 提供「我的提交」頁面，列出該會員所有提交的申請及其審核狀態。

#### Scenario: 查看提交清單
- **WHEN** 會員進入「我的提交」頁面
- **THEN** 系統顯示該會員所有 submission，包含類型、狀態、提交時間、審核結果

#### Scenario: 查看被退回的提交
- **WHEN** 會員的某筆提交被退回
- **THEN** 提交記錄顯示 `rejected` 狀態及管理員填寫的退回原因

### Requirement: 提交通過後自動更新族譜
系統 SHALL 在管理員通過提交後，自動將資料寫入正式族人表。

#### Scenario: 新增提交通過
- **WHEN** 管理員通過一筆 type=add 的 submission
- **THEN** 系統在 persons 表建立新記錄，並更新父親的 childrenIds

#### Scenario: 修改提交通過
- **WHEN** 管理員通過一筆 type=edit 的 submission
- **THEN** 系統更新 target_person_id 對應的族人資料
