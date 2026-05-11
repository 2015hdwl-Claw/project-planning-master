import { writeFileSync, existsSync } from "fs";
import { join } from "path";
import { validateProjectName } from "./validator";

export interface GenerateOptions {
  name: string;
  displayName: string;
  description: string;
  targetPath: string;
}

export interface GenerateResult {
  success: boolean;
  createdFiles: string[];
  errors?: string[];
}

export function generateFromTemplate(
  template: string,
  vars: { projectName: string; displayName: string },
): string {
  const date = new Date().toISOString().split("T")[0];
  return template
    .replace(/\{\{PROJECT_NAME\}\}/g, vars.projectName)
    .replace(/\{\{DISPLAY_NAME\}\}/g, vars.displayName)
    .replace(/\{\{DATE\}\}/g, date)
    .replace(/\{\{TIMESTAMP\}\}/g, new Date().toISOString());
}

export function generateProject(options: GenerateOptions): GenerateResult {
  const { name, displayName, description, targetPath } = options;

  // Validate project name
  const nameValidation = validateProjectName(name);
  if (!nameValidation.valid) {
    return { success: false, createdFiles: [], errors: nameValidation.errors };
  }

  // Check target directory
  if (!existsSync(targetPath)) {
    return { success: false, createdFiles: [], errors: ["Target path does not exist"] };
  }

  const projectDir = join(targetPath, name);

  // Check if project already exists
  if (existsSync(projectDir)) {
    const ycPlan = join(projectDir, `${name}_YC_PLAN.md`);
    if (existsSync(ycPlan)) {
      return { success: false, createdFiles: [], errors: [`Project directory ${name} already exists`] };
    }
  }

  // Create project directory
  const { mkdirSync } = require("fs");
  mkdirSync(projectDir, { recursive: true });

  const createdFiles: string[] = [];
  const vars = { projectName: name, displayName };

  // Generate YC_PLAN.md
  const ycPlanPath = join(projectDir, `${name}_YC_PLAN.md`);
  if (existsSync(ycPlanPath)) {
    return { success: false, createdFiles: [], errors: [`${name}_YC_PLAN.md already exists`] };
  }
  writeFileSync(ycPlanPath, generateYcPlan(name, displayName, description));
  createdFiles.push(`${name}_YC_PLAN.md`);

  // Generate PROGRESS.json
  const progressPath = join(projectDir, `${name}_PROGRESS.json`);
  if (existsSync(progressPath)) {
    return { success: false, createdFiles: [], errors: [`${name}_PROGRESS.json already exists`] };
  }
  writeFileSync(progressPath, generateProgress(name));
  createdFiles.push(`${name}_PROGRESS.json`);

  // Generate VERSIONS.json
  const versionsPath = join(projectDir, `${name}_VERSIONS.json`);
  if (existsSync(versionsPath)) {
    return { success: false, createdFiles: [], errors: [`${name}_VERSIONS.json already exists`] };
  }
  writeFileSync(versionsPath, generateVersions(name, displayName, description));
  createdFiles.push(`${name}_VERSIONS.json`);

  // Generate README.md
  const readmePath = join(projectDir, "README.md");
  if (existsSync(readmePath)) {
    return { success: false, createdFiles: [], errors: ["README.md already exists"] };
  }
  writeFileSync(readmePath, generateReadme(name, displayName, description));
  createdFiles.push("README.md");

  return { success: true, createdFiles };
}

function generateYcPlan(name: string, displayName: string, description: string): string {
  const date = new Date().toISOString().split("T")[0];
  return `# ${displayName} YC 5-Phase 計畫書

> **專案代碼**: ${name}
> **啟動日期**: ${date}
> **當前階段**: Phase 1 (構思與確認)
> **整體進度**: 0% 完成

---

## 專案概述

${description}

---

## Phase 1: 構思與確認 (Idea Validation)

### 目標
驗證想法可行性，評估市場機會。

### 時間框架
${date} ~ (2 週)

### 關鍵任務
- [ ] 產品定位與核心功能確認
- [ ] 目標用戶訪談
- [ ] 競品分析
- [ ] 技術可行性評估
- [ ] MVP 功能範圍定義

### 成果
- [ ] 產品需求文檔
- [ ] 用戶訪談報告
- [ ] 競品分析報告
- [ ] 技術架構草稿

---

## Phase 2: 規劃與設計 (Product & Planning)

### 目標
詳細產品規格，技術架構設計。

### 關鍵任務
- [ ] 詳細功能規格制定
- [ ] 用戶介面設計
- [ ] 技術架構設計
- [ ] 開發計畫與里程碑制定

### 成果
- [ ] 產品規格文檔
- [ ] UI/UX 設計稿
- [ ] 技術架構文檔
- [ ] 開發時間表

---

## Phase 3: 開發執行 (Development)

### 目標
MVP 開發，核心功能實現，測試驗證。

### 關鍵任務
- [ ] 核心功能開發
- [ ] 測試與品質保證
- [ ] 整合與優化

### 成果
- [ ] 可用的 MVP 產品
- [ ] 測試報告
- [ ] 部署文檔

---

## Phase 4: 成長與驗證 (Growth & Validation)

### 目標
產品優化，用戶反饋收集，市場驗證。

### 關鍵任務
- [ ] Beta 測試計畫
- [ ] 用戶反饋收集與分析
- [ ] 產品優化與迭代

### 成果
- [ ] Beta 測試報告
- [ ] 產品優化報告
- [ ] 發布檢核表

---

## Phase 5: 擴展與規模 (Scale)

### 目標
產品發布，用戶增長，功能擴展。

### 關鍵任務
- [ ] 產品正式發布
- [ ] 用戶增長策略執行
- [ ] 功能擴展與升級

### 成果
- [ ] 產品發布公告
- [ ] 用戶增長報告
- [ ] 功能路線圖
`;
}

function generateProgress(name: string): string {
  const date = new Date().toISOString().split("T")[0];
  return JSON.stringify({
    project_name: name,
    last_updated: date,
    overall_progress: "0%",
    current_phase: "Phase 1",
    phases: {
      phase_1: {
        name: "構思與確認",
        status: "in_progress",
        progress: "0%",
        start_date: date,
        tasks: [],
      },
      phase_2: {
        name: "規劃與設計",
        status: "pending",
        progress: "0%",
        tasks: [],
      },
      phase_3: {
        name: "開發執行",
        status: "pending",
        progress: "0%",
        tasks: [],
      },
      phase_4: {
        name: "成長與驗證",
        status: "pending",
        progress: "0%",
        tasks: [],
      },
      phase_5: {
        name: "擴展與規模",
        status: "pending",
        progress: "0%",
        tasks: [],
      },
    },
    milestones: [],
    next_actions: [],
  }, null, 2);
}

function generateVersions(name: string, displayName: string, description: string): string {
  const date = new Date().toISOString().split("T")[0];
  return JSON.stringify({
    project_name: name,
    created_date: date,
    current_version: "0.1.0-alpha",
    status: "concept",
    versions: [
      {
        version: "0.1.0-alpha",
        date,
        phase: "Phase 1",
        description: "專案啟動",
        features: [description],
        decisions: ["採用 YC 5-phase 標準化開發流程"],
        next_milestone: "完成 Phase 1 構思與確認",
      },
    ],
    upcoming_releases: [],
    breaking_changes: [],
    deprecations: [],
    known_issues: [],
  }, null, 2);
}

function generateReadme(name: string, displayName: string, description: string): string {
  const date = new Date().toISOString().split("T")[0];
  return `# ${displayName}

> ${description}

**專案代碼**: ${name} | **啟動日期**: ${date} | **當前階段**: Phase 1 (構思與確認)

---

## Phase 1: 構思與確認 (0% 完成)

### 檢核表
- [ ] 產品定位與核心功能確認
- [ ] 目標用戶訪談
- [ ] 競品分析
- [ ] 技術可行性評估
- [ ] MVP 功能範圍定義

### 成功標準
- ⏳ 核心價值提案明確
- ⏳ 用戶需求確認
- ⏳ MVP 範圍明確定義

---

## Phase 2: 規劃與設計 (0% 完成)

### 檢核表
- [ ] 詳細功能規格制定
- [ ] 用戶介面設計
- [ ] 技術架構設計
- [ ] 開發計畫制定

---

## Phase 3: 開發執行 (0% 完成)

### 檢核表
- [ ] 核心功能開發
- [ ] 測試與品質保證
- [ ] 整合與優化

---

## Phase 4: 成長與驗證 (0% 完成)

### 檢核表
- [ ] Beta 測試計畫
- [ ] 用戶反饋收集
- [ ] 產品優化

---

## Phase 5: 擴展與規模 (0% 完成)

### 檢核表
- [ ] 產品正式發布
- [ ] 用戶增長策略
- [ ] 功能擴展
`;
}
