## Why

目前族譜應用為純前端單一 HTML 檔，資料存在 localStorage，無法多人協作、無法審核新增資料。鍾氏族人需要一個管道來自行註冊、提交個人資訊與世代關係，並由管理員審核後正式加入族譜。這是從「個人工具」邁向「家族平台」的關鍵一步。

## What Changes

- 新增**後端 API 服務**（FastAPI），提供族人資料 CRUD、會員註冊/登入、管理員審核等功能
- 新增**會員系統**：鍾家族人可註冊帳號，填寫個人資訊（姓名、上下代關係、Line ID、手機、Email）
- 新增 **Admin 後台介面**：管理員可審核待加入的族人申請、編輯/刪除現有族人、管理會員
- 前端編輯功能改為**提交制**：使用者的新增/編輯操作不再直接寫入，而是送到後端待管理員審核
- 新增**資料庫持久化**（PostgreSQL），取代 localStorage 作為主要資料來源

## Capabilities

### New Capabilities
- `member-registration`: 會員註冊與登入系統，收集族人個資（姓名、世代關係、Line ID、手機、Email），支援密碼驗證
- `admin-review`: 管理員後台，審核族人申請（通過/退回/修改），管理現有族人資料，查看會員列表
- `submission-workflow`: 提交審核流程，前端新增/編輯族人資料後送到後端排隊，管理員審核後寫入正式族譜
- `clan-api`: 族人資料 REST API，提供族譜樹資料讀取、族人 CRUD（需權限控制）

### Modified Capabilities

（無現有 spec 需修改）

## Impact

- **前端 `鐘氏族譜.html`**：編輯頁面改為呼叫 API 提交，新增登入/註冊 UI
- **新增後端**：FastAPI 應用，含 SQLAlchemy ORM、Alembic 遷移、JWT 認證
- **資料庫**：PostgreSQL，需部署在 Zeabur 或其他雲端服務
- **部署**：前端繼續 GitHub Pages，後端部署至 Zeabur
- **依賴**：新增 Python 套件（fastapi, sqlalchemy, alembic, python-jose, passlib, pydantic）
