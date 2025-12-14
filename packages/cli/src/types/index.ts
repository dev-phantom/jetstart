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

// Create command options
export interface CreateOptions {
  package?: string;
  template?: string;
  skipInstall?: boolean;
  fullInstall?: boolean;
}

// Install audit command options
export interface AuditOptions {
  json?: boolean;
}

// Dev command options
export interface DevOptions {
  port?: string;
  host?: string;
  qr?: boolean;
  open?: boolean;
  emulator?: boolean;
  avd?: string;
}

// Install action enum
export enum InstallAction {
  SKIP = 'skip',
  UPDATE = 'update',
  REPLACE = 'replace',
}