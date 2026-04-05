## ADDED Requirements

### Requirement: HTML 資料擷取
系統 SHALL 提供遷移腳本，從現有 `鐘氏族譜.html` 中擷取 INITIAL_DATA 陣列的所有族人資料。

#### Scenario: 擷取族人資料
- **WHEN** 執行資料遷移腳本
- **THEN** 腳本從 HTML 檔案中解析出所有族人物件，保留 id、name、gender、generation、branch、birthYear、deathYear、spouse、childrenIds、parentId、notes 等欄位

### Requirement: 資料匯入資料庫
遷移腳本 SHALL 將擷取的族人資料寫入 PostgreSQL 資料庫，保持父子關係完整性。

#### Scenario: 完整匯入
- **WHEN** 遷移腳本將資料寫入資料庫
- **THEN** 所有族人記錄正確建立，父子關係（parentId / childrenIds）完整對應，無孤立節點

#### Scenario: 冪等執行
- **WHEN** 遷移腳本重複執行
- **THEN** 不會產生重複資料，已存在的記錄不被覆蓋

### Requirement: 資料驗證
遷移腳本 SHALL 在匯入後驗證資料完整性。

#### Scenario: 驗證族譜樹結構
- **WHEN** 資料匯入完成
- **THEN** 腳本驗證：所有 parentId 指向存在的族人、所有 childrenIds 中的成員存在且反向指回正確的 parentId、根節點（開基祖母）無 parentId
