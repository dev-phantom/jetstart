/**
 * Validation Utilities
 * Common validation functions used across packages
 */

import { QRCodeData, SessionToken, DeviceInfo } from '../types';

/**
 * Validate session ID format
 */
export function isValidSessionId(sessionId: string): boolean {
  return /^[a-zA-Z0-9-_]{8,64}$/.test(sessionId);
}

/**
 * Validate token format
 */
export function isValidToken(token: string): boolean {
  return /^[a-zA-Z0-9-_]{16,128}$/.test(token);
}

/**
 * Validate project name
 */
export function isValidProjectName(name: string): boolean {
  return /^[a-zA-Z][a-zA-Z0-9-_]{0,63}$/.test(name);
}

/**
 * Validate package name (Android)
 */
export function isValidPackageName(packageName: string): boolean {
  return /^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$/.test(packageName);
}

/**
 * Validate port number
 */
export function isValidPort(port: number): boolean {
  return Number.isInteger(port) && port >= 1024 && port <= 65535;
}

/**
 * Validate URL format
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate QR code data structure
 */
export function isValidQRCodeData(data: any): data is QRCodeData {
  return (
    data !== null &&
    typeof data === 'object' &&
    isValidSessionId(data.sessionId) &&
    isValidUrl(data.serverUrl) &&
    isValidUrl(data.wsUrl) &&
    isValidToken(data.token) &&
    typeof data.projectName === 'string' &&
    typeof data.version === 'string'
  );
}

/**
 * Validate session token structure
 */
export function isValidSessionToken(token: any): token is SessionToken {
  return (
    token !== null &&
    typeof token === 'object' &&
    isValidSessionId(token.sessionId) &&
    isValidToken(token.token) &&
    typeof token.expiresAt === 'number' &&
    isValidUrl(token.serverUrl) &&
    isValidUrl(token.wsUrl)
  );
}

/**
 * Validate device info structure
 */
export function isValidDeviceInfo(info: any): info is DeviceInfo {
  return (
    info !== null &&
    typeof info === 'object' &&
    typeof info.id === 'string' &&
    typeof info.name === 'string' &&
    typeof info.model === 'string' &&
    typeof info.manufacturer === 'string' &&
    typeof info.platform === 'string' &&
    typeof info.osVersion === 'string' &&
    typeof info.apiLevel === 'number'
  );
}

/**
 * Sanitize user input
 */
export function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>]/g, '');
}

/**
 * Validate version string (semver)
 */
export function isValidVersion(version: string): boolean {
  return /^\d+\.\d+\.\d+(-[a-zA-Z0-9.-]+)?$/.test(version);
}