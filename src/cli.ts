import { generateProject } from "./generator/project-generator";
import { validateProjectName, validateProjectStructure } from "./generator/validator";
import { existsSync, readdirSync, mkdirSync } from "fs";
import { join } from "path";

const DEFAULT_PROJECTS_PATH = "C:\\Users\\ntpud\\.claude\\projects";

export interface CliArgs {
  command: string;
  name?: string;
  displayName?: string;
  description?: string;
  path?: string;
  error?: string;
}

export interface CliResult {
  success: boolean;
  output: string;
}

export function parseArgs(args: string[]): CliArgs {
  if (args.length === 0) {
    return { command: "help" };
  }

  const command = args[0];

  if (command === "scan") {
    const pathIdx = args.indexOf("--path");
    return {
      command: "scan",
      path: pathIdx > -1 ? args[pathIdx + 1] : DEFAULT_PROJECTS_PATH,
    };
  }

  if (command === "help" || command === "--help" || command === "-h") {
    return { command: "help" };
  }

  const name = args[1];
  if (!name) {
    return { command, error: "Project name is required" };
  }

  const displayIdx = args.indexOf("--display");
  const descIdx = args.indexOf("--desc");
  const pathIdx = args.indexOf("--path");

  const displayName = displayIdx > -1 ? args[displayIdx + 1] : undefined;
  const description = descIdx > -1 ? args[descIdx + 1] : undefined;
  const path = pathIdx > -1 ? args[pathIdx + 1] : DEFAULT_PROJECTS_PATH;

  if (command === "generate" && !displayName) {
    return { command, error: "--display flag is required for generate command" };
  }

  return {
    command,
    name,
    displayName,
    description: description || "",
    path,
  };
}

export function runCommand(args: CliArgs): CliResult {
  switch (args.command) {
    case "generate":
      return runGenerate(args);
    case "validate":
      return runValidate(args);
    case "scan":
      return runScan(args);
    case "help":
      return runHelp();
    default:
      return { success: false, output: `Unknown command: ${args.command}` };
  }
}

function runGenerate(args: CliArgs): CliResult {
  if (args.error) {
    return { success: false, output: `Error: ${args.error}` };
  }

  const targetPath = args.path || DEFAULT_PROJECTS_PATH;

  const result = generateProject({
    name: args.name!,
    displayName: args.displayName!,
    description: args.description || "",
    targetPath,
  });

  if (result.success) {
    const lines = [
      `Project "${args.displayName}" (${args.name}) created successfully!`,
      "",
      "Generated files:",
      ...result.createdFiles.map((f) => `  + ${f}`),
      "",
      `Location: ${join(targetPath, args.name!)}`,
      "",
      "Next steps:",
      "  1. Edit the YC_PLAN.md with your project details",
      "  2. Start Phase 1 tasks",
      "  3. Update PROGRESS.json as you progress",
    ];
    return { success: true, output: lines.join("\n") };
  }

  return { success: false, output: `Generation failed:\n${result.errors?.join("\n")}` };
}

function runValidate(args: CliArgs): CliResult {
  const name = args.name;
  if (!name) {
    return { success: false, output: "Project name is required" };
  }

  // Validate naming
  const nameResult = validateProjectName(name);
  const lines: string[] = [`Validating project: ${name}`, ""];

  if (!nameResult.valid) {
    lines.push("Name validation FAILED:");
    nameResult.errors.forEach((e) => lines.push(`  X ${e}`));
    return { success: false, output: lines.join("\n") };
  }
  lines.push("Name validation: PASSED");

  // Validate structure
  const projectPath = join(args.path || DEFAULT_PROJECTS_PATH, name);
  if (!existsSync(projectPath)) {
    lines.push("", `Project directory not found: ${projectPath}`);
    return { success: true, output: lines.join("\n") };
  }

  const files = readdirSync(projectPath);
  const structResult = validateProjectStructure(name, files);

  if (structResult.valid) {
    lines.push("Structure validation: PASSED (all files present)");
  } else {
    lines.push("Structure validation: MISSING FILES");
    structResult.missing.forEach((f) => lines.push(`  - ${f} (missing)`));
    structResult.existing.forEach((f) => lines.push(`  + ${f}`));
  }

  return { success: true, output: lines.join("\n") };
}

function runScan(args: CliArgs): CliResult {
  const scanPath = args.path || DEFAULT_PROJECTS_PATH;

  if (!existsSync(scanPath)) {
    return { success: false, output: `Path not found: ${scanPath}` };
  }

  const entries = readdirSync(scanPath, { withFileTypes: true });
  const projects: string[] = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const dirPath = join(scanPath, entry.name);
    const files = readdirSync(dirPath);

    const hasProgress = files.some((f) => f.endsWith("_PROGRESS.json"));
    const hasPlan = files.some((f) => f.endsWith("_YC_PLAN.md"));

    if (hasProgress || hasPlan) {
      projects.push(entry.name);
    }
  }

  const lines = [
    `Scanning: ${scanPath}`,
    `Found ${projects.length} standard-format projects:`,
    "",
    ...projects.map((p) => `  - ${p}`),
  ];

  return { success: true, output: lines.join("\n") };
}

function runHelp(): CliResult {
  const lines = [
    "Project Planning Master - 專案規劃大師 CLI",
    "",
    "Usage:",
    "  ppm generate <name> --display <displayName> [--desc <desc>] [--path <path>]",
    "  ppm validate <name> [--path <path>]",
    "  ppm scan [--path <path>]",
    "  ppm help",
    "",
    "Commands:",
    "  generate  Create a new standardized project structure",
    "  validate  Validate project naming and file structure",
    "  scan      Scan directory for standard-format projects",
    "  help      Show this help message",
    "",
    "Options:",
    "  --display  Display name for the project (required for generate)",
    "  --desc     Project description",
    "  --path     Target directory path (default: C:\\Users\\ntpud\\.claude\\projects)",
  ];
  return { success: true, output: lines.join("\n") };
}

// CLI entry point
if (import.meta.main) {
  const args = parseArgs(process.argv.slice(2));
  if (args.error) {
    console.error(`Error: ${args.error}`);
    console.error("Run 'ppm help' for usage information");
    process.exit(1);
  }

  const result = runCommand(args);
  console.log(result.output);
  process.exit(result.success ? 0 : 1);
}
