## ADDED Requirements

### Requirement: 新增族人導向 Google Form
系統 SHALL 將「新增族人」操作導向預先建立的 Google Form，在新分頁開啟。

#### Scenario: 點擊新增族人按鈕
- **WHEN** 使用者在編輯頁點擊「提交新增申請」按鈕
- **THEN** 在新分頁開啟 Google Form 新增族人表單

### Requirement: 修改資料導向 Google Form
系統 SHALL 提供「修改資料」按鈕，導向 Google Form 並可帶入預填資訊。

#### Scenario: 提交修改申請
- **WHEN** 使用者點擊「提交修改申請」按鈕
- **THEN** 在新分頁開啟 Google Form 修改申請表單

### Requirement: 保留本機離線功能
系統 SHALL 保留現有的本機新增/編輯功能作為離線 fallback，存在 localStorage。

#### Scenario: 離線時新增族人
- **WHEN** 使用者在無網路時新增族人
- **THEN** 資料存入 localStorage，與之前行為一致
