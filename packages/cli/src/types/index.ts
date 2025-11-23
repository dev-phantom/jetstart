/**
 * CLI-specific types
 */

export interface ProjectConfig {
  projectName: string;
  packageName: string;
  template: string;
  minSdkVersion?: number;
  targetSdkVersion?: number;
}

export interface TemplateOptions {
  projectName: string;
  packageName: string;
  template: string;
}

export interface CommandContext {
  cwd: string;
  config?: ProjectConfig;
}