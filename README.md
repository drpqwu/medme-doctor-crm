# 醫Me 醫師客戶 CRM + AI 洞察系統

醫療器材業務團隊專用的醫師客戶關係管理系統，Phase 1 MVP。

## 功能

- 🔐 **登入系統** — 帳號密碼 + JWT，權限分級（管理員 / 一般同仁）
- 👨‍⚕️ **醫師資料管理** — 新增/查看/編輯/刪除，含科別、醫院、聯絡方式、臨床偏好
- 🏷️ **標籤系統** — 自訂標籤，快速分類醫師
- 📝 **拜訪紀錄** — 時間軸顯示所有互動，可附上檔案
- ⭐ **滿意度追蹤** — 1-5 星評分，記錄不滿意原因
- 🔍 **搜尋篩選** — 按姓名、科別、醫院搜尋；按標籤篩選
- 📊 **Dashboard** — 統計概覽、最近活動

## 技術棧

- **前端**: React 18 + TypeScript + Tailwind CSS
- **後端**: Next.js 14 App Router API Routes
- **資料庫**: SQLite (better-sqlite3)，可升級為 PostgreSQL
- **認證**: JWT (HTTP-only Cookie)

## 本地開發

```bash
# 安裝依賴
npm install

# 啟動開發伺服器（資料庫會自動初始化）
npm run dev
```

開啟 http://localhost:3000

**預設帳號：**
- 帳號：`admin`
- 密碼：`admin123`

> ⚠️ 首次登入後請立即修改密碼！

## 環境變數

複製 `.env.local.example` 並修改：

| 變數 | 說明 |
|------|------|
| `JWT_SECRET` | JWT 簽名密鑰，請換成隨機字串 |
| `DATABASE_PATH` | SQLite 資料庫路徑 |
| `UPLOAD_DIR` | 附件上傳目錄 |

## 部署 (Vercel)

> ⚠️ Vercel 為無伺服器架構，SQLite 資料無法持久化。  
> 正式部署請先遷移至 PostgreSQL（Neon / Supabase / Railway）。

## 資料庫升級至 PostgreSQL

1. 安裝 `pg` 套件
2. 修改 `src/lib/db.ts` 改用 pg 連線
3. 設定 `DATABASE_URL` 環境變數
