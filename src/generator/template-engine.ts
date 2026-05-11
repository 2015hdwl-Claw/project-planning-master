const DEFAULT_TEMPLATES: Record<string, string> = {
  "yc-plan": `# {{displayName}} YC 5-Phase 計畫書

> **專案代碼**: {{projectName}}
> **啟動日期**: {{date}}
> **當前階段**: Phase 1 (構思與確認)
> **整體進度**: 0% 完成

---

## 專案概述

{{description}}

---

## Phase 1: 構思與確認 (Idea Validation)

### 目標
驗證想法可行性，評估市場機會。

### 時間框架
{{date}} ~ (2 週)

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
`,

  "progress": `{
  "project_name": "{{projectName}}",
  "last_updated": "{{date}}",
  "overall_progress": "0%",
  "current_phase": "Phase 1",
  "phases": {
    "phase_1": {
      "name": "構思與確認",
      "status": "in_progress",
      "progress": "0%",
      "start_date": "{{date}}",
      "tasks": []
    },
    "phase_2": {
      "name": "規劃與設計",
      "status": "pending",
      "progress": "0%",
      "tasks": []
    },
    "phase_3": {
      "name": "開發執行",
      "status": "pending",
      "progress": "0%",
      "tasks": []
    },
    "phase_4": {
      "name": "成長與驗證",
      "status": "pending",
      "progress": "0%",
      "tasks": []
    },
    "phase_5": {
      "name": "擴展與規模",
      "status": "pending",
      "progress": "0%",
      "tasks": []
    }
  },
  "milestones": [],
  "next_actions": []
}`,

  "versions": `{
  "project_name": "{{projectName}}",
  "created_date": "{{date}}",
  "current_version": "0.1.0-alpha",
  "status": "concept",
  "versions": [
    {
      "version": "0.1.0-alpha",
      "date": "{{date}}",
      "phase": "Phase 1",
      "description": "專案啟動",
      "features": ["{{description}}"],
      "decisions": ["採用 YC 5-phase 標準化開發流程"],
      "next_milestone": "完成 Phase 1 構思與確認"
    }
  ],
  "upcoming_releases": [],
  "breaking_changes": [],
  "deprecations": [],
  "known_issues": []
}`,

  "readme": `# {{displayName}}

> {{description}}

**專案代碼**: {{projectName}} | **啟動日期**: {{date}} | **當前階段**: Phase 1 (構思與確認)

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
`,
};

const templateRegistry = new Map<string, string>();
for (const [k, v] of Object.entries(DEFAULT_TEMPLATES)) {
  templateRegistry.set(k, v);
}

export function registerTemplate(name: string, template: string): void {
  templateRegistry.set(name, template);
}

export function getTemplate(name: string): string | undefined {
  return templateRegistry.get(name);
}

export function listTemplates(): string[] {
  return [...templateRegistry.keys()];
}

export function compileTemplate(
  template: string,
  vars: Record<string, unknown>,
): string {
  let result = template;

  // Handle conditional blocks: {{#VAR}}...{{/VAR}}
  result = result.replace(
    /\{\{#(\w+)\}\}([\s\S]*?)\{\{\/\1\}\}/g,
    (_, varName, content) => {
      return vars[varName] ? content : "";
    },
  );

  // Handle each loops: {{#each VAR}}...{{/each}}
  result = result.replace(
    /\{\{#each\s+(\w+)\}\}([\s\S]*?)\{\{\/each\}\}/g,
    (_, varName, body) => {
      const arr = vars[varName];
      if (!Array.isArray(arr)) return "";
      return arr
        .map((item) => {
          if (typeof item === "object" && item !== null) {
            return processObjectLoop(body, item);
          }
          return body.replace(/\{\{\.\}\}/g, String(item));
        })
        .join("");
    },
  );

  // Handle dot-notation: {{obj.prop}}
  result = result.replace(/\{\{(\w+(?:\.\w+)+)\}\}/g, (_, path) => {
    const val = resolveDotPath(vars, path);
    return val !== undefined ? String(val) : `{{${path}}}`;
  });

  // Handle date formatting: {{VAR:yyyy-mm-dd}}
  result = result.replace(
    /\{\{(\w+):yyyy-mm-dd\}\}/g,
    (_, varName) => {
      const val = vars[varName];
      if (!val) return `{{${varName}:yyyy-mm-dd}}`;
      const d = new Date(String(val));
      if (isNaN(d.getTime())) return `{{${varName}:yyyy-mm-dd}}`;
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      return `${yyyy}-${mm}-${dd}`;
    },
  );

  // Handle simple variable replacement: {{VAR}}
  result = result.replace(/\{\{(\w+)\}\}/g, (_, varName) => {
    const val = vars[varName];
    return val !== undefined ? String(val) : `{{${varName}}}`;
  });

  return result;
}

function processObjectLoop(
  body: string,
  obj: Record<string, unknown>,
): string {
  return body.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    return obj[key] !== undefined ? String(obj[key]) : `{{${key}}}`;
  });
}

function resolveDotPath(obj: Record<string, unknown>, path: string): unknown {
  const parts = path.split(".");
  let current: unknown = obj;
  for (const part of parts) {
    if (current === null || current === undefined || typeof current !== "object") {
      return undefined;
    }
    current = (current as Record<string, unknown>)[part];
  }
  return current;
}

export class TemplateEngine {
  private templates: Map<string, string>;

  constructor() {
    this.templates = new Map(templateRegistry);
  }

  registerTemplate(name: string, template: string): void {
    this.templates.set(name, template);
  }

  render(name: string, vars: Record<string, unknown>): string {
    const template = this.templates.get(name);
    if (!template) {
      throw new Error(`Template not found: ${name}`);
    }
    return compileTemplate(template, vars);
  }

  listTemplates(): string[] {
    return [...this.templates.keys()];
  }
}

interface TemplateConfigOptions {
  projectName: string;
  displayName: string;
  description: string;
  customFields?: Record<string, string>;
}

export class TemplateConfig {
  projectType: string;
  requiredFields: string[];
  extraPhases: Record<string, unknown> | null;

  private static readonly TYPE_CONFIGS: Record<string, string[]> = {
    "web-app": ["projectName", "displayName", "description"],
    "cli-tool": ["projectName", "displayName", "description"],
    "library": ["projectName", "displayName", "description"],
  };

  constructor(projectType: string) {
    this.projectType =
      projectType in TemplateConfig.TYPE_CONFIGS ? projectType : "web-app";
    this.requiredFields = [
      ...(TemplateConfig.TYPE_CONFIGS[this.projectType] || TemplateConfig.TYPE_CONFIGS["web-app"]),
    ];
    this.extraPhases = this.projectType === "web-app"
      ? { deployment: true }
      : null;
  }

  validate(data: Record<string, unknown>): { valid: boolean; missing: string[] } {
    const missing = this.requiredFields.filter((f) => !data[f]);
    return { valid: missing.length === 0, missing };
  }

  buildContext(options: TemplateConfigOptions): Record<string, unknown> {
    const ctx: Record<string, unknown> = {
      projectName: options.projectName,
      displayName: options.displayName,
      description: options.description || "",
      date: new Date().toISOString().split("T")[0],
      timestamp: new Date().toISOString(),
      projectType: this.projectType,
    };

    if (options.customFields) {
      Object.assign(ctx, options.customFields);
    }

    return ctx;
  }
}
