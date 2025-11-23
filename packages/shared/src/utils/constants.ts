/**
 * Constants and Configuration
 * Shared constants used across all packages
 */

/**
 * Default ports
 */
export const DEFAULT_CORE_PORT = 8765;
export const DEFAULT_WS_PORT = 8766;
export const DEFAULT_LOGS_PORT = 8767;

/**
 * Network configuration
 */
export const WS_HEARTBEAT_INTERVAL = 30000; // 30 seconds
export const WS_RECONNECT_DELAY = 5000; // 5 seconds
export const WS_MAX_RECONNECT_ATTEMPTS = 5;
export const REQUEST_TIMEOUT = 30000; // 30 seconds

/**
 * Session configuration
 */
export const SESSION_TOKEN_EXPIRY = 3600000; // 1 hour
export const SESSION_CLEANUP_INTERVAL = 60000; // 1 minute
export const SESSION_IDLE_TIMEOUT = 1800000; // 30 minutes

/**
 * Build configuration
 */
export const BUILD_CACHE_SIZE_LIMIT = 1073741824; // 1 GB
export const BUILD_TIMEOUT = 300000; // 5 minutes
export const MAX_CONCURRENT_BUILDS = 3;

/**
 * File size limits
 */
export const MAX_APK_SIZE = 104857600; // 100 MB
export const MAX_LOG_FILE_SIZE = 10485760; // 10 MB
export const MAX_LOG_ENTRIES = 10000;

/**
 * Version information
 */
export const JETSTART_VERSION = '0.1.0';
export const MIN_ANDROID_API_LEVEL = 24; // Android 7.0
export const TARGET_ANDROID_API_LEVEL = 34; // Android 14

/**
 * URLs and paths
 */
export const JETSTART_CONFIG_FILE = 'jetstart.config.json';
export const JETSTART_CACHE_DIR = '.jetstart/cache';
export const JETSTART_SESSIONS_DIR = '.jetstart/sessions';
export const JETSTART_LOGS_DIR = '.jetstart/logs';

/**
 * Error codes
 */
export const ERROR_CODES = {
  // CLI errors (1xxx)
  INVALID_COMMAND: 1001,
  INVALID_PROJECT_NAME: 1002,
  PROJECT_ALREADY_EXISTS: 1003,
  PROJECT_NOT_FOUND: 1004,

  // Core errors (2xxx)
  SERVER_START_FAILED: 2001,
  BUILD_FAILED: 2002,
  SESSION_CREATION_FAILED: 2003,
  INVALID_SESSION: 2004,

  // Client errors (3xxx)
  CONNECTION_FAILED: 3001,
  DOWNLOAD_FAILED: 3002,
  INSTALLATION_FAILED: 3003,
  LAUNCH_FAILED: 3004,

  // Network errors (4xxx)
  WEBSOCKET_ERROR: 4001,
  NETWORK_TIMEOUT: 4002,
  AUTHENTICATION_FAILED: 4003,

  // Build errors (5xxx)
  COMPILATION_ERROR: 5001,
  PACKAGING_ERROR: 5002,
  SIGNING_ERROR: 5003,
} as const;

/**
 * Success messages
 */
export const SUCCESS_MESSAGES = {
  PROJECT_CREATED: 'Project created successfully',
  BUILD_COMPLETE: 'Build completed successfully',
  CONNECTION_ESTABLISHED: 'Connection established',
  APK_INSTALLED: 'APK installed successfully',
} as const;

/**
 * Log tags
 */
export const LOG_TAGS = {
  CLI: 'jetstart:cli',
  CORE: 'jetstart:core',
  CLIENT: 'jetstart:client',
  BUILD: 'jetstart:build',
  NETWORK: 'jetstart:network',
  WEBSOCKET: 'jetstart:ws',
  LOGS: 'jetstart:logs',
} as const;

/**
 * File patterns
 */
export const IGNORE_PATTERNS = [
  'node_modules',
  '.git',
  '.gradle',
  'build',
  'dist',
  '.idea',
  '*.iml',
  '.DS_Store',
  'local.properties',
];

/**
 * MIME types
 */
export const MIME_TYPES = {
  APK: 'application/vnd.android.package-archive',
  JSON: 'application/json',
  TEXT: 'text/plain',
} as const;