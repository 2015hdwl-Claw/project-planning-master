# Project Planning Master — 專案規劃大師

## 專案定位
**專案規劃大師 v2.0** 是一個自動化的專案規劃管理系統，標準化所有專案的 YC 5-phase 開發流程。

## 核心目標
- 自動化建立標準化專案文檔結構
- 強制執行統一檔案命名規範
- 提供多專案進度追蹤管理
- 整合最佳實踐流程與工具

## 技術架構

### 前端技術棧
- **框架**: Next.js 14 (App Router)
- **UI 組件**: shadcn/ui + Tailwind CSS
- **狀態管理**: Zustand
- **圖表**: Recharts

### 後端技術棧
- **框架**: Next.js API Routes
- **資料存儲**: JSON 檔案（未來升級至 SQLite）
- **驗證**: JWT（未來實施）

### 整合工具
- **Claude Code**: Memory 檔案整合
- **Git**: 自動化 commit 和 PR 流程
- **CI/CD**: GitHub Actions

## 開發流程

### 標準 YC 5-phase 流程
1. **Phase 1**: 構思與確認 - 使用 `/brainstorming`
2. **Phase 2**: 規劃與設計 - 使用 `/writing-plans`
3. **Phase 3**: 開發執行 - 使用 `/test-driven-development`
4. **Phase 4**: 成長與驗證 - 使用 `/requesting-code-review`
5. **Phase 5**: 擴展與規模 - 使用 `/ship`

### 當前階段 (Phase 3 - 開發執行)
已完成 Phase 1 構思與確認、Phase 2 規劃與設計，現在開始 MVP 核心功能開發。

### 主要工作項目
1. 專案文檔生成引擎開發
2. 進度追蹤儀表板實作
3. 標準化檔案命名驗證系統
4. YC 5-phase 流程管理功能

## 強制執行規則

### 檔案命名規範
所有專案檔案必須遵循標準化命名：
- 主計畫書: `{PROJECT_NAME}_YC_PLAN.md`
- 進度檔案: `{PROJECT_NAME}_PROGRESS.json`
- 版本檔案: `{PROJECT_NAME}_VERSIONS.json`
- 檢核表: `README.md`

### 開發流程規範
- 每個功能必須遵循 TDD 流程
- 完成後必須經過 Code Review
- 所有變更必須更新版本歷史
- 禁止跳過任何 Phase 的檢核項目

## 專案結構
```
C:\Users\ntpud\.claude\projects\project-planning-master\
├── README.md                              # 綜合檢核表
├── CLAUDE.md                              # 專案規則（本檔案）
├── project-planning-master_YC_PLAN.md    # YC 5-phase 計畫書
├── project-planning-master_PROGRESS.json # 進度追蹤
└── project-planning-master_VERSIONS.json  # 版本歷史
```

## 成功指標

### Phase 1 ✅ 已完成
- ✅ 核心價值提案明確
- ✅ 目標用戶需求確認
- ✅ 完成競品分析，找到差异化機會
- ✅ 確認技術可行性
- ✅ MVP 範圍明確定義

### Phase 2 ✅ 已完成
- ✅ 完整產品規格文檔
- ✅ UI/UX 設計完成
- ✅ 可執行的開發計畫
- ✅ 技術風險評估完成

### Phase 3 🔄 進行中
- ⏳ MVP 功能完整實現
- ⏳ 通過完整測試
- ⏳ 5 個測試用戶成功使用
- ⏳ 核心功能穩定運行

## 下一步行動
1. 開發專案文檔生成引擎
2. 建立進度追蹤儀表板
3. 實作標準化檔案命名驗證
4. 開發 YC 5-phase 流程引導功能

---
**專案規劃大師 v2.0 — 讓每個專案都遵循最佳實踐**