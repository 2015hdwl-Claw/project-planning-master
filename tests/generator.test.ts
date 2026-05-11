import { describe, test, expect, beforeEach, afterEach } from "bun:test";
import { generateProject, generateFromTemplate } from "../src/generator/project-generator";
import { existsSync, rmSync, mkdirSync, readFileSync } from "fs";
import { join } from "path";

const TEST_DIR = join(import.meta.dir, "__test_output__");

beforeEach(() => {
  if (existsSync(TEST_DIR)) rmSync(TEST_DIR, { recursive: true });
  mkdirSync(TEST_DIR, { recursive: true });
});

afterEach(() => {
  if (existsSync(TEST_DIR)) rmSync(TEST_DIR, { recursive: true });
});

describe("generateProject", () => {
  test("creates all 4 standard files", () => {
    const result = generateProject({
      name: "test-project",
      displayName: "測試專案",
      description: "一個測試用的專案",
      targetPath: TEST_DIR,
    });

    expect(result.success).toBe(true);
    expect(result.createdFiles).toHaveLength(4);
    const projectDir = join(TEST_DIR, "test-project");
    expect(existsSync(join(projectDir, "test-project_YC_PLAN.md"))).toBe(true);
    expect(existsSync(join(projectDir, "test-project_PROGRESS.json"))).toBe(true);
    expect(existsSync(join(projectDir, "test-project_VERSIONS.json"))).toBe(true);
    expect(existsSync(join(projectDir, "README.md"))).toBe(true);
  });

  test("YC_PLAN contains project name and 5 phases", () => {
    generateProject({
      name: "my-app",
      displayName: "我的應用",
      description: "測試描述",
      targetPath: TEST_DIR,
    });

    const content = readFileSync(join(TEST_DIR, "my-app", "my-app_YC_PLAN.md"), "utf8");
    expect(content).toContain("my-app");
    expect(content).toContain("Phase 1");
    expect(content).toContain("Phase 2");
    expect(content).toContain("Phase 3");
    expect(content).toContain("Phase 4");
    expect(content).toContain("Phase 5");
  });

  test("PROGRESS.json is valid JSON with correct structure", () => {
    generateProject({
      name: "demo-app",
      displayName: "展示應用",
      description: "展示用",
      targetPath: TEST_DIR,
    });

    const content = readFileSync(join(TEST_DIR, "demo-app", "demo-app_PROGRESS.json"), "utf8");
    const data = JSON.parse(content);

    expect(data.project_name).toBe("demo-app");
    expect(data.overall_progress).toBe("0%");
    expect(data.current_phase).toBe("Phase 1");
    expect(data.phases).toBeDefined();
    expect(data.phases.phase_1).toBeDefined();
    expect(data.phases.phase_5).toBeDefined();
  });

  test("VERSIONS.json is valid JSON with initial version", () => {
    generateProject({
      name: "sample",
      displayName: "範例",
      description: "範例專案",
      targetPath: TEST_DIR,
    });

    const content = readFileSync(join(TEST_DIR, "sample", "sample_VERSIONS.json"), "utf8");
    const data = JSON.parse(content);

    expect(data.project_name).toBe("sample");
    expect(data.versions).toHaveLength(1);
    expect(data.versions[0].version).toBe("0.1.0-alpha");
  });

  test("README.md contains 5-phase checklist", () => {
    generateProject({
      name: "checklist-test",
      displayName: "檢核測試",
      description: "測試檢核表",
      targetPath: TEST_DIR,
    });

    const content = readFileSync(join(TEST_DIR, "checklist-test", "README.md"), "utf8");
    expect(content).toContain("Phase 1");
    expect(content).toContain("Phase 5");
    expect(content).toContain("[ ]");
  });

  test("rejects invalid project name", () => {
    const result = generateProject({
      name: "Invalid_Name",
      displayName: "無效",
      description: "無效名稱",
      targetPath: TEST_DIR,
    });

    expect(result.success).toBe(false);
    expect(result.errors).toBeDefined();
    expect(result.errors!.length).toBeGreaterThan(0);
  });

  test("does not overwrite existing files", () => {
    generateProject({
      name: "existing",
      displayName: "已存在",
      description: "測試",
      targetPath: TEST_DIR,
    });

    const result = generateProject({
      name: "existing",
      displayName: "已存在",
      description: "再次生成",
      targetPath: TEST_DIR,
    });

    expect(result.success).toBe(false);
    expect(result.errors?.[0]).toContain("already exists");
  });
});

describe("generateFromTemplate", () => {
  test("replaces all template variables", () => {
    const template = "{{PROJECT_NAME}} - {{DISPLAY_NAME}} - {{DATE}}";
    const result = generateFromTemplate(template, {
      projectName: "my-project",
      displayName: "我的專案",
    });

    expect(result).toContain("my-project");
    expect(result).toContain("我的專案");
    expect(result).toContain(new Date().getFullYear().toString());
    expect(result).not.toContain("{{");
  });
});
