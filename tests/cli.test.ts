import { describe, test, expect, beforeEach, afterEach } from "bun:test";
import { parseArgs, runCommand } from "../src/cli";
import { existsSync, rmSync, mkdirSync, readFileSync } from "fs";
import { join } from "path";

const TEST_DIR = join(import.meta.dir, "__cli_test__");

beforeEach(() => {
  if (existsSync(TEST_DIR)) rmSync(TEST_DIR, { recursive: true });
  mkdirSync(TEST_DIR, { recursive: true });
});

afterEach(() => {
  if (existsSync(TEST_DIR)) rmSync(TEST_DIR, { recursive: true });
});

describe("parseArgs", () => {
  test("parses generate command with required args", () => {
    const result = parseArgs(["generate", "my-project", "--display", "我的專案"]);
    expect(result.command).toBe("generate");
    expect(result.name).toBe("my-project");
    expect(result.displayName).toBe("我的專案");
  });

  test("parses validate command", () => {
    const result = parseArgs(["validate", "admission-master"]);
    expect(result.command).toBe("validate");
    expect(result.name).toBe("admission-master");
  });

  test("parses scan command", () => {
    const result = parseArgs(["scan"]);
    expect(result.command).toBe("scan");
  });

  test("returns help for no args", () => {
    const result = parseArgs([]);
    expect(result.command).toBe("help");
  });

  test("parses --desc flag", () => {
    const result = parseArgs(["generate", "test", "--display", "測試", "--desc", "測試描述"]);
    expect(result.description).toBe("測試描述");
  });

  test("parses --path flag", () => {
    const result = parseArgs(["generate", "test", "--display", "測試", "--path", "/custom/path"]);
    expect(result.path).toBe("/custom/path");
  });

  test("returns error for missing display name", () => {
    const result = parseArgs(["generate", "test"]);
    expect(result.error).toBeDefined();
  });
});

describe("runCommand", () => {
  test("generate creates project files", () => {
    const result = runCommand({
      command: "generate",
      name: "cli-test-project",
      displayName: "CLI測試",
      description: "CLI測試專案",
      path: TEST_DIR,
    });

    expect(result.success).toBe(true);
    expect(existsSync(join(TEST_DIR, "cli-test-project", "README.md"))).toBe(true);
  });

  test("validate reports missing files", () => {
    // Create project dir with partial files
    const projectDir = join(TEST_DIR, "partial-project");
    mkdirSync(projectDir, { recursive: true });
    require("fs").writeFileSync(
      join(projectDir, "partial-project_YC_PLAN.md"),
      "# Test"
    );

    const result = runCommand({
      command: "validate",
      name: "partial-project",
      path: TEST_DIR,
    });

    expect(result.success).toBe(true);
    expect(result.output).toContain("MISSING");
    expect(result.output).toContain("partial-project_PROGRESS.json");
  });

  test("scan finds existing projects", () => {
    // Create a fake project
    const projectDir = join(TEST_DIR, "scan-test");
    mkdirSync(projectDir, { recursive: true });
    require("fs").writeFileSync(
      join(projectDir, "scan-test_PROGRESS.json"),
      JSON.stringify({ project_name: "scan-test" })
    );

    const result = runCommand({
      command: "scan",
      path: TEST_DIR,
    });

    expect(result.success).toBe(true);
    expect(result.output).toContain("scan-test");
  });
});
