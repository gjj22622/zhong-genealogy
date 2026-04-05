## 1. Google Sheets 設定

- [ ] 1.1 建立 Google Sheet，匯入 152 筆族人資料（欄位：id, name, gender, generation, branch, birthYear, deathYear, spouse, childrenIds, parentId, notes）
- [ ] 1.2 發佈 Google Sheet 為網頁（CSV 格式），取得公開 URL

## 2. Google Form 設定

- [ ] 2.1 建立「新增族人申請」Google Form（欄位：申請人姓名、聯絡方式、族人姓名、性別、世代、支系、出生年、配偶、父親姓名、備註）
- [ ] 2.2 建立「資料修改申請」Google Form（欄位：申請人姓名、聯絡方式、要修改的族人姓名、修改內容說明）
- [ ] 2.3 設定 Form 回覆通知（Email 通知管理員）

## 3. 前端整合 — 資料讀取

- [x] 3.1 實作 CSV fetch + 解析函式（fetchSheetsData），處理空值、childrenIds 分割、中文
- [x] 3.2 修改 loadData() 流程：先 fetch Sheets → 成功則用 Sheets 資料 → 失敗用 localStorage → 最後 fallback INITIAL_DATA
- [x] 3.3 設定 SHEETS_CSV_URL 常數（Google Sheets 發布的 CSV 網址）

## 4. 前端整合 — 編輯頁改造

- [x] 4.1 編輯頁新增「提交新增申請」按鈕，點擊開啟 Google Form（新分頁）
- [x] 4.2 編輯頁新增「提交修改申請」按鈕，點擊開啟 Google Form（新分頁）
- [x] 4.3 保留現有本機新增/編輯功能作為離線 fallback
- [x] 4.4 移除前端的 auth modal 和 API 相關 JS（簡化程式碼）

## 5. 清理

- [x] 5.1 移除前端中不再需要的 API_BASE、apiFetch、auth 相關 CSS/HTML/JS
- [ ] 5.2 更新使用說明（故事頁）：說明如何提交新增/修改申請
