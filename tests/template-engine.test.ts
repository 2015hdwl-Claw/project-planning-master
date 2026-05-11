import { describe, test, expect, beforeEach, afterEach } from "bun:test";
import {
  TemplateEngine,
  compileTemplate,
  registerTemplate,
  getTemplate,
  listTemplates,
  TemplateConfig,
} from "../src/generator/template-engine";
import { existsSync, rmSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";

const TEST_DIR = join(import.meta.dir, "__template_test__");

beforeEach(() => {
  if (existsSync(TEST_DIR)) rmSync(TEST_DIR, { recursive: true });
  mkdirSync(TEST_DIR, { recursive: true });
});

afterEach(() => {
  if (existsSync(TEST_DIR)) rmSync(TEST_DIR, { recursive: true });
});

describe("compileTemplate", () => {
  test("replaces standard variables", () => {
    const result = compileTemplate("{{PROJECT_NAME}} by {{AUTHOR}}", {
      PROJECT_NAME: "my-app",
      AUTHOR: "Alice",
    });
    expect(result).toBe("my-app by Alice");
  });

  test("replaces nested object variables with dot notation", () => {
    const result = compileTemplate("{{config.db.host}}:{{config.db.port}}", {
      config: { db: { host: "localhost", port: "5432" } },
    });
    expect(result).toBe("localhost:5432");
  });

  test("handles conditional blocks - if variable exists", () => {
    const template = "Hello{{#DESCRIPTION}}, {{DESCRIPTION}}{{/DESCRIPTION}}!";
    const result = compileTemplate(template, { DESCRIPTION: "world" });
    expect(result).toBe("Hello, world!");
  });

  test("handles conditional blocks - if variable missing", () => {
    const template = "Hello{{#DESCRIPTION}}, {{DESCRIPTION}}{{/DESCRIPTION}}!";
    const result = compileTemplate(template, {});
    expect(result).toBe("Hello!");
  });

  test("handles each loops for arrays", () => {
    const template = "Tags:{{#each TAGS}} [{{.}}]{{/each}}";
    const result = compileTemplate(template, { TAGS: ["web", "mobile", "api"] });
    expect(result).toBe("Tags: [web] [mobile] [api]");
  });

  test("handles each loops with object properties", () => {
    const template = "{{#each PHASES}}- {{name}}: {{status}}\n{{/each}}";
    const result = compileTemplate(template, {
      PHASES: [
        { name: "Phase 1", status: "done" },
        { name: "Phase 2", status: "active" },
      ],
    });
    expect(result).toContain("- Phase 1: done");
    expect(result).toContain("- Phase 2: active");
  });

  test("handles empty arrays gracefully", () => {
    const template = "Items:{{#each ITEMS}} {{.}}{{/each}}";
    const result = compileTemplate(template, { ITEMS: [] });
    expect(result).toBe("Items:");
  });

  test("leaves unknown variables as-is", () => {
    const result = compileTemplate("{{UNKNOWN_VAR}}", {});
    expect(result).toBe("{{UNKNOWN_VAR}}");
  });

  test("handles date formatting", () => {
    const result = compileTemplate("Date: {{DATE:yyyy-mm-dd}}", { DATE: new Date("2026-05-11").toISOString() });
    expect(result).toContain("2026");
    expect(result).toContain("05");
    expect(result).toContain("11");
  });
});

describe("TemplateEngine", () => {
  test("creates engine with default templates", () => {
    const engine = new TemplateEngine();
    const templates = engine.listTemplates();
    expect(templates.length).toBeGreaterThanOrEqual(4);
    expect(templates).toContain("yc-plan");
    expect(templates).toContain("progress");
    expect(templates).toContain("versions");
    expect(templates).toContain("readme");
  });

  test("renders yc-plan template with project data", () => {
    const engine = new TemplateEngine();
    const result = engine.render("yc-plan", {
      projectName: "test-app",
      displayName: "測試應用",
      description: "一個測試專案",
      date: "2026-05-11",
    });
    expect(result).toContain("測試應用");
    expect(result).toContain("test-app");
    expect(result).toContain("Phase 1");
    expect(result).toContain("Phase 5");
    expect(result).toContain("2026-05-11");
  });

  test("renders progress template with valid JSON", () => {
    const engine = new TemplateEngine();
    const result = engine.render("progress", {
      projectName: "demo",
      date: "2026-05-11",
    });
    const data = JSON.parse(result);
    expect(data.project_name).toBe("demo");
    expect(data.current_phase).toBe("Phase 1");
    expect(data.phases.phase_1).toBeDefined();
    expect(data.phases.phase_5).toBeDefined();
  });

  test("renders versions template", () => {
    const engine = new TemplateEngine();
    const result = engine.render("versions", {
      projectName: "sample",
      displayName: "範例",
      description: "範例專案",
      date: "2026-05-11",
    });
    const data = JSON.parse(result);
    expect(data.project_name).toBe("sample");
    expect(data.versions[0].version).toBe("0.1.0-alpha");
  });

  test("renders readme template with checklist", () => {
    const engine = new TemplateEngine();
    const result = engine.render("readme", {
      projectName: "check-app",
      displayName: "檢核應用",
      description: "測試用",
      date: "2026-05-11",
    });
    expect(result).toContain("檢核應用");
    expect(result).toContain("[ ]");
    expect(result).toContain("Phase 1");
    expect(result).toContain("Phase 5");
  });

  test("allows registering custom template", () => {
    const engine = new TemplateEngine();
    engine.registerTemplate("custom-plan", "# {{displayName}}\n\n{{description}}");
    const result = engine.render("custom-plan", {
      displayName: "自定義",
      description: "自定義模板",
    });
    expect(result).toBe("# 自定義\n\n自定義模板");
  });

  test("throws on rendering non-existent template", () => {
    const engine = new TemplateEngine();
    expect(() => engine.render("nonexistent", {})).toThrow();
  });
});

describe("template registry (module-level)", () => {
  test("registerTemplate and getTemplate round-trip", () => {
    registerTemplate("test-reg", "Hello {{name}}");
    const tpl = getTemplate("test-reg");
    expect(tpl).toBe("Hello {{name}}");
  });

  test("listTemplates includes registered templates", () => {
    registerTemplate("list-test", "content");
    const all = listTemplates();
    expect(all).toContain("list-test");
  });
});

describe("TemplateConfig", () => {
  test("creates config from project type 'web-app'", () => {
    const config = new TemplateConfig("web-app");
    expect(config.projectType).toBe("web-app");
    expect(config.requiredFields).toContain("projectName");
    expect(config.requiredFields).toContain("displayName");
    expect(config.extraPhases).toBeDefined();
  });

  test("creates config from project type 'cli-tool'", () => {
    const config = new TemplateConfig("cli-tool");
    expect(config.projectType).toBe("cli-tool");
    expect(config.requiredFields).toContain("projectName");
  });

  test("creates config from project type 'library'", () => {
    const config = new TemplateConfig("library");
    expect(config.projectType).toBe("library");
  });

  test("defaults to 'web-app' for unknown type", () => {
    const config = new TemplateConfig("unknown-type");
    expect(config.projectType).toBe("web-app");
  });

  test("validates required fields", () => {
    const config = new TemplateConfig("web-app");
    const result = config.validate({ projectName: "test", displayName: "測試", description: "desc" });
    expect(result.valid).toBe(true);
  });

  test("reports missing required fields", () => {
    const config = new TemplateConfig("web-app");
    const result = config.validate({ projectName: "test" });
    expect(result.valid).toBe(false);
    expect(result.missing).toContain("displayName");
  });

  test("adds custom fields to context", () => {
    const config = new TemplateConfig("web-app");
    const ctx = config.buildContext({
      projectName: "app",
      displayName: "App",
      description: "desc",
      customFields: { AUTHOR: "Bob", LICENSE: "MIT" },
    });
    expect(ctx.AUTHOR).toBe("Bob");
    expect(ctx.LICENSE).toBe("MIT");
  });

  test("web-app includes deployment phase fields", () => {
    const config = new TemplateConfig("web-app");
    expect(config.extraPhases).toBeDefined();
    const ctx = config.buildContext({
      projectName: "app",
      displayName: "App",
      description: "",
      customFields: {},
    });
    expect(ctx.projectType).toBe("web-app");
  });

  test("cli-tool includes command reference fields", () => {
    const config = new TemplateConfig("cli-tool");
    const ctx = config.buildContext({
      projectName: "tool",
      displayName: "Tool",
      description: "",
      customFields: {},
    });
    expect(ctx.projectType).toBe("cli-tool");
  });
});

describe("TemplateEngine with TemplateConfig", () => {
  test("generates web-app project with all files", () => {
    const engine = new TemplateEngine();
    const config = new TemplateConfig("web-app");

    const ctx = config.buildContext({
      projectName: "my-webapp",
      displayName: "我的網站",
      description: "一個網頁應用",
      customFields: { AUTHOR: "Dev" },
    });

    const plan = engine.render("yc-plan", ctx);
    expect(plan).toContain("我的網站");
    expect(plan).toContain("my-webapp");

    const readme = engine.render("readme", ctx);
    expect(readme).toContain("我的網站");
  });

  test("generates cli-tool project with command section", () => {
    const engine = new TemplateEngine();
    const config = new TemplateConfig("cli-tool");

    const ctx = config.buildContext({
      projectName: "my-cli",
      displayName: "我的工具",
      description: "CLI 工具",
      customFields: {},
    });

    const plan = engine.render("yc-plan", ctx);
    expect(plan).toContain("我的工具");
  });

  test("validates before rendering and throws on missing fields", () => {
    const engine = new TemplateEngine();
    const config = new TemplateConfig("web-app");

    const validation = config.validate({});
    expect(validation.valid).toBe(false);
    expect(validation.missing.length).toBeGreaterThan(0);
  });
});

