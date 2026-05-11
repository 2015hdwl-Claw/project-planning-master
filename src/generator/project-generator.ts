import { writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";
import { validateProjectName } from "./validator";
import { TemplateEngine, TemplateConfig } from "./template-engine";

export interface GenerateOptions {
  name: string;
  displayName: string;
  description: string;
  targetPath: string;
  projectType?: string;
  customFields?: Record<string, string>;
}

export interface GenerateResult {
  success: boolean;
  createdFiles: string[];
  errors?: string[];
}

const engine = new TemplateEngine();

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
  const { name, displayName, description, targetPath, projectType, customFields } = options;

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

  // Build template context
  const config = new TemplateConfig(projectType || "web-app");
  const ctx = config.buildContext({
    projectName: name,
    displayName,
    description,
    customFields: customFields || {},
  });

  // Create project directory
  mkdirSync(projectDir, { recursive: true });

  const createdFiles: string[] = [];

  // Generate YC_PLAN.md
  const ycPlanPath = join(projectDir, `${name}_YC_PLAN.md`);
  if (existsSync(ycPlanPath)) {
    return { success: false, createdFiles: [], errors: [`${name}_YC_PLAN.md already exists`] };
  }
  writeFileSync(ycPlanPath, engine.render("yc-plan", ctx));
  createdFiles.push(`${name}_YC_PLAN.md`);

  // Generate PROGRESS.json
  const progressPath = join(projectDir, `${name}_PROGRESS.json`);
  if (existsSync(progressPath)) {
    return { success: false, createdFiles: [], errors: [`${name}_PROGRESS.json already exists`] };
  }
  writeFileSync(progressPath, engine.render("progress", ctx));
  createdFiles.push(`${name}_PROGRESS.json`);

  // Generate VERSIONS.json
  const versionsPath = join(projectDir, `${name}_VERSIONS.json`);
  if (existsSync(versionsPath)) {
    return { success: false, createdFiles: [], errors: [`${name}_VERSIONS.json already exists`] };
  }
  writeFileSync(versionsPath, engine.render("versions", ctx));
  createdFiles.push(`${name}_VERSIONS.json`);

  // Generate README.md
  const readmePath = join(projectDir, "README.md");
  if (existsSync(readmePath)) {
    return { success: false, createdFiles: [], errors: ["README.md already exists"] };
  }
  writeFileSync(readmePath, engine.render("readme", ctx));
  createdFiles.push("README.md");

  return { success: true, createdFiles };
}
