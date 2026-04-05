## ADDED Requirements

### Requirement: 前端從 Google Sheets 載入族人資料
系統 SHALL 在頁面載入時，從 Google Sheets 發布的 CSV URL fetch 資料，解析為 persons 陣列。

#### Scenario: Google Sheets 可用
- **WHEN** 前端載入且 Google Sheets CSV 回應正常
- **THEN** 解析 CSV 為 persons 陣列，更新族譜樹，同時存入 localStorage cache

#### Scenario: Google Sheets 不可用（離線）
- **WHEN** 前端載入但 fetch 失敗（離線或 Sheets 暫時無法連線）
- **THEN** 使用 localStorage cache 資料，若 cache 也無則使用 INITIAL_DATA fallback

### Requirement: CSV 解析正確處理所有欄位
系統 SHALL 正確解析 CSV 中的所有欄位，包含空值、逗號分隔的 childrenIds、中文字元。

#### Scenario: childrenIds 欄位含多值
- **WHEN** CSV 中某筆資料的 childrenIds 為 "p2,p3"
- **THEN** 解析為陣列 ["p2", "p3"]

#### Scenario: 空值欄位
- **WHEN** CSV 中某筆資料的 birthYear 為空
- **THEN** 解析為 null，不產生錯誤
