# 鍾氏族譜專案 — Folder Instructions

## 專案簡介
鍾氏家族族譜數位化應用 — 單一 HTML 檔案，涵蓋 152 位族人、10+ 世代、3 大支系（頂番婆、草湳底、埔姜崙），從清朝渡台至今約 300 年。

## 主要檔案
- **`鐘氏族譜.html`** — 主應用（單一 HTML，內嵌 CSS/JS，約 1350 行）
- **`＊鐘氏族譜彙整.xlsx`** — 原始 Excel 資料（12 個工作表）

## 輔助檔案（在上層 session 目錄）
- `gen_data.py` — Python 腳本，從 Excel 解析族人資料並產生 JS 陣列
- `initial_data.js` — 產生的 152 人 JavaScript 資料

## 架構原則
1. **單一檔案**：所有 HTML、CSS、JavaScript 都在同一個 `.html` 檔內，不依賴外部伺服器
2. **RWD 優先**：手機（< 769px）使用底部 Tab 導覽 + Bottom-sheet Modal；桌面使用頂部 Tab
3. **localStorage 持久化**：新增/編輯的資料存在瀏覽器，支援 JSON 匯出/匯入備份
4. **SVG 遞迴佈局**：族譜樹使用 `layoutTree()` 遞迴計算節點位置，`buildTreeLayout()` 建構過濾後的樹結構

## 資料格式
```javascript
{id, name, gender, generation, branch, birthYear, deathYear, spouse, childrenIds, parentId, notes}
```
- `id`：字串如 "p1"~"p154"（原始資料），"p200+" 為使用者新增
- `branch`：`"頂番婆"` / `"草湳底"` / `"埔姜崙"` / `"全族"`（僅根節點）
- `generation`：0 = 渡台祖，1~10 = 後續世代

## 已完成功能
- SVG 族譜樹視覺化（分支顏色、世代篩選、姓名搜尋）
- 收合/展開分支（`collapsedNodes` Set、▶/▼ 切換、子孫數量徽章、展開全部/收合全部）
- 人物詳情 Modal（含家族關係連結導覽）
- 全族搜尋
- 家族故事頁面
- 新增/編輯族人
- 縮放控制
- RWD 手機友善

## 注意事項
- 修改時務必維持單一檔案結構
- 手機觸控目標最小 44px
- 三大支系顏色不可更改：頂番婆(#8B4513)、草湳底(#2E7D32)、埔姜崙(#1565C0)
- Excel 解析已完成，除非發現資料錯誤否則不需重跑 `gen_data.py`
