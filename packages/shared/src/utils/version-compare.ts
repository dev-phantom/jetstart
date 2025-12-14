/**
 * Version comparison utilities for checking tool compatibility
 */

export interface ParsedVersion {
  major: number;
  minor: number;
  patch: number;
  original: string;
}

/**
 * Parse a version string into its components
 * Handles versions like "17.0.9", "1.9.21", "34.0.0", "v20.10.0"
 */
export function parseVersion(version: string): ParsedVersion {
  // Remove 'v' prefix and any non-numeric/dot characters at the start
  const cleaned = version.replace(/^v/, '').replace(/[^\d.].*/g, '');

  // Split by dots and parse each part
  const parts = cleaned.split('.');

  return {
    major: parseInt(parts[0] || '0', 10),
    minor: parseInt(parts[1] || '0', 10),
    patch: parseInt(parts[2] || '0', 10),
    original: version,
  };
}

/**
 * Compare two version strings
 * Returns:
 *  - Negative number if v1 < v2
 *  - Zero if v1 === v2
 *  - Positive number if v1 > v2
 */
export function compareVersions(v1: string, v2: string): number {
  const a = parseVersion(v1);
  const b = parseVersion(v2);

  if (a.major !== b.major) return a.major - b.major;
  if (a.minor !== b.minor) return a.minor - b.minor;
  return a.patch - b.patch;
}

/**
 * Check if a version satisfies a requirement string
 * Supports operators: >=, <=, >, <, =, ^, ~
 *
 * Examples:
 *  - isVersionCompatible('17.0.9', '>=17') -> true
 *  - isVersionCompatible('16.0.0', '>=17') -> false
 *  - isVersionCompatible('1.9.21', '^1.9.0') -> true (same major, >= minor)
 *  - isVersionCompatible('1.8.0', '^1.9.0') -> false
 *  - isVersionCompatible('34.0.1', '~34.0.0') -> true (same major.minor, >= patch)
 */
export function isVersionCompatible(version: string, requirement: string): boolean {
  // Handle caret (^) - same major version, >= specified version
  if (requirement.startsWith('^')) {
    const reqVersion = requirement.slice(1);
    const v = parseVersion(version);
    const r = parseVersion(reqVersion);
    return v.major === r.major && compareVersions(version, reqVersion) >= 0;
  }

  // Handle tilde (~) - same major.minor version, >= specified version
  if (requirement.startsWith('~')) {
    const reqVersion = requirement.slice(1);
    const v = parseVersion(version);
    const r = parseVersion(reqVersion);
    return v.major === r.major && v.minor === r.minor && compareVersions(version, reqVersion) >= 0;
  }

  // Handle >= operator
  if (requirement.startsWith('>=')) {
    const reqVersion = requirement.slice(2).trim();
    return compareVersions(version, reqVersion) >= 0;
  }

  // Handle <= operator
  if (requirement.startsWith('<=')) {
    const reqVersion = requirement.slice(2).trim();
    return compareVersions(version, reqVersion) <= 0;
  }

  // Handle > operator
  if (requirement.startsWith('>')) {
    const reqVersion = requirement.slice(1).trim();
    return compareVersions(version, reqVersion) > 0;
  }

  // Handle < operator
  if (requirement.startsWith('<')) {
    const reqVersion = requirement.slice(1).trim();
    return compareVersions(version, reqVersion) < 0;
  }

  // Handle = operator or exact match
  const reqVersion = requirement.startsWith('=') ? requirement.slice(1).trim() : requirement;
  return compareVersions(version, reqVersion) === 0;
}

/**
 * Format a version for display
 */
export function formatVersion(version: ParsedVersion | string): string {
  if (typeof version === 'string') {
    return version;
  }
  return `${version.major}.${version.minor}.${version.patch}`;
}

/**
 * Check if version is within a range
 * Range format: ">=min <=max" or "min - max"
 */
export function isVersionInRange(version: string, range: string): boolean {
  // Handle "min - max" format
  if (range.includes(' - ')) {
    const [min, max] = range.split(' - ').map(v => v.trim());
    return compareVersions(version, min) >= 0 && compareVersions(version, max) <= 0;
  }

  // Handle ">=min <=max" format
  const parts = range.split(/\s+/);
  for (const part of parts) {
    if (!isVersionCompatible(version, part)) {
      return false;
    }
  }

  return true;
}
