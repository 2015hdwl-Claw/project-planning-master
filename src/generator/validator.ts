export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export interface StructureResult {
  valid: boolean;
  missing: string[];
  existing: string[];
}

const STANDARD_FILES = [
  { suffix: "_YC_PLAN.md", type: "yc-plan" },
  { suffix: "_PROGRESS.json", type: "progress" },
  { suffix: "_VERSIONS.json", type: "versions" },
] as const;

const README = "README.md";

const VALID_FILENAME_PATTERNS = [
  /^.+_YC_PLAN\.md$/,
  /^.+_PROGRESS\.json$/,
  /^.+_VERSIONS\.json$/,
  /^README\.md$/,
];

export function validateProjectName(name: string): ValidationResult {
  const errors: string[] = [];

  if (!name || name.trim() === "") {
    errors.push("Project name cannot be empty");
    return { valid: false, errors };
  }

  if (/[A-Z]/.test(name)) {
    errors.push("Must use lowercase letters only (kebab-case)");
  }

  if (name.includes("_")) {
    errors.push("Must use hyphens (-) not underscores (_)");
  }

  if (name.includes(" ")) {
    errors.push("Must not contain spaces");
  }

  if (/-\d{4}$/.test(name)) {
    errors.push("Must not end with a date suffix (e.g., -2026)");
  }

  if (!/^[a-z][a-z0-9-]*$/.test(name)) {
    if (errors.length === 0) {
      errors.push("Must be kebab-case: lowercase letters, numbers, hyphens");
    }
  }

  return { valid: errors.length === 0, errors };
}

export function validateFileName(projectName: string, fileName: string): ValidationResult {
  const errors: string[] = [];

  if (fileName === README) {
    return { valid: true, errors: [] };
  }

  // Check pattern matches
  const matchesPattern = VALID_FILENAME_PATTERNS.some((p) => p.test(fileName));
  if (!matchesPattern) {
    errors.push(`"${fileName}" does not match any standard naming pattern`);
    return { valid: false, errors };
  }

  // Extract prefix from fileName
  const prefix = fileName.replace(/_(YC_PLAN\.md|PROGRESS\.json|VERSIONS\.json)$/, "");

  if (prefix !== projectName) {
    errors.push(`File prefix "${prefix}" does not match project name "${projectName}"`);
  }

  // Check exact suffix format
  if (fileName.includes("_PROGRESS.") && !fileName.endsWith("_PROGRESS.json")) {
    errors.push("PROGRESS suffix must be exactly _PROGRESS.json (uppercase)");
  }

  if (fileName.includes("_VERSION") && !fileName.endsWith("_VERSIONS.json")) {
    if (fileName.endsWith("_VERSION.json")) {
      errors.push("Must use _VERSIONS.json (plural), not _VERSION.json");
    }
  }

  if (fileName.includes("_YC-PLAN")) {
    errors.push("Must use _YC_PLAN.md (underscore), not _YC-PLAN.md (hyphen)");
  }

  return { valid: errors.length === 0, errors };
}

export function getStandardFiles(projectName: string): string[] {
  return [
    ...STANDARD_FILES.map((f) => `${projectName}${f.suffix}`),
    README,
  ];
}

export function validateProjectStructure(projectName: string, existingFiles: string[]): StructureResult {
  const required = getStandardFiles(projectName);
  const existing = required.filter((f) => existingFiles.includes(f));
  const missing = required.filter((f) => !existingFiles.includes(f));

  return {
    valid: missing.length === 0,
    missing,
    existing,
  };
}
