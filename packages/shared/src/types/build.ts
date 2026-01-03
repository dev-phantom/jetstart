/**
 * Build System Types
 * Types related to compilation, building, and APK generation
 */

export interface BuildConfig {
  projectPath: string;
  outputPath: string;
  buildType: BuildType;
  minifyEnabled: boolean;
  debuggable: boolean;
  versionCode: number;
  versionName: string;
  applicationId: string;
}

export enum BuildType {
  DEBUG = 'debug',
  RELEASE = 'release',
}

export interface BuildResult {
  success: boolean;
  apkPath?: string;
  apkSize?: number;
  buildTime: number;
  errors?: BuildError[];
  warnings?: BuildWarning[];
}

export interface BuildError {
  file: string;
  line: number;
  column: number;
  message: string;
  severity: ErrorSeverity;
}

export interface BuildWarning {
  message: string;
  file?: string;
  line?: number;
}

export enum ErrorSeverity {
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info',
}

export interface BuildStatus {
  phase: BuildPhase;
  progress: number; // 0-100
  message: string;
  timestamp: number;
}

export enum BuildPhase {
  IDLE = 'idle',
  INITIALIZING = 'initializing',
  COMPILING = 'compiling',
  PACKAGING = 'packaging',
  SIGNING = 'signing',
  OPTIMIZING = 'optimizing',
  COMPLETE = 'complete',
  FAILED = 'failed',
}

export interface APKInfo {
  path: string;
  size: number;
  hash: string;
  versionCode: number;
  versionName: string;
  minSdkVersion: number;
  targetSdkVersion: number;
  applicationId: string;
}

export interface CacheInfo {
  enabled: boolean;
  size: number;
  lastCleared: number;
  hitRate: number;
}