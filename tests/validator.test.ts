import { describe, test, expect } from "bun:test";
import { validateProjectName, validateFileName, getStandardFiles, validateProjectStructure } from "../src/generator/validator";

describe("validateProjectName", () => {
  test("accepts valid kebab-case names", () => {
    expect(validateProjectName("admission-master").valid).toBe(true);
    expect(validateProjectName("social").valid).toBe(true);
    expect(validateProjectName("project-planning-master").valid).toBe(true);
    expect(validateProjectName("fitness-app").valid).toBe(true);
  });

  test("rejects uppercase letters", () => {
    const result = validateProjectName("AdmissionMaster");
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  test("rejects underscores", () => {
    const result = validateProjectName("admission_master");
    expect(result.valid).toBe(false);
  });

  test("rejects spaces", () => {
    const result = validateProjectName("admission master");
    expect(result.valid).toBe(false);
  });

  test("rejects date suffixes", () => {
    const result = validateProjectName("new-project-2026");
    expect(result.valid).toBe(false);
  });

  test("rejects empty string", () => {
    const result = validateProjectName("");
    expect(result.valid).toBe(false);
  });
});

describe("validateFileName", () => {
  test("accepts valid YC_PLAN file", () => {
    expect(validateFileName("admission-master", "admission-master_YC_PLAN.md").valid).toBe(true);
  });

  test("accepts valid PROGRESS file", () => {
    expect(validateFileName("admission-master", "admission-master_PROGRESS.json").valid).toBe(true);
  });

  test("accepts valid VERSIONS file", () => {
    expect(validateFileName("admission-master", "admission-master_VERSIONS.json").valid).toBe(true);
  });

  test("accepts README.md", () => {
    expect(validateFileName("admission-master", "README.md").valid).toBe(true);
  });

  test("rejects mismatched project name in file", () => {
    const result = validateFileName("social", "admission-master_YC_PLAN.md");
    expect(result.valid).toBe(false);
  });

  test("rejects lowercase PROGRESS suffix", () => {
    const result = validateFileName("admission-master", "admission-master_progress.json");
    expect(result.valid).toBe(false);
  });

  test("rejects VERSION (singular)", () => {
    const result = validateFileName("admission-master", "admission-master_VERSION.json");
    expect(result.valid).toBe(false);
  });

  test("rejects YC-PLAN with hyphen", () => {
    const result = validateFileName("admission-master", "admission-master_YC-PLAN.md");
    expect(result.valid).toBe(false);
  });
});

describe("getStandardFiles", () => {
  test("returns all 4 standard files for a project", () => {
    const files = getStandardFiles("fitness-app");
    expect(files).toHaveLength(4);
    expect(files).toContain("fitness-app_YC_PLAN.md");
    expect(files).toContain("fitness-app_PROGRESS.json");
    expect(files).toContain("fitness-app_VERSIONS.json");
    expect(files).toContain("README.md");
  });
});

describe("validateProjectStructure", () => {
  test("returns all missing files for empty directory", () => {
    const result = validateProjectStructure("new-project", []);
    expect(result.valid).toBe(false);
    expect(result.missing).toHaveLength(4);
    expect(result.missing).toContain("new-project_YC_PLAN.md");
  });

  test("returns valid when all files exist", () => {
    const result = validateProjectStructure("admission-master", [
      "admission-master_YC_PLAN.md",
      "admission-master_PROGRESS.json",
      "admission-master_VERSIONS.json",
      "README.md",
    ]);
    expect(result.valid).toBe(true);
    expect(result.missing).toHaveLength(0);
  });

  test("reports partial missing files", () => {
    const result = validateProjectStructure("social", [
      "social_YC_PLAN.md",
      "README.md",
    ]);
    expect(result.valid).toBe(false);
    expect(result.missing).toHaveLength(2);
  });
});
