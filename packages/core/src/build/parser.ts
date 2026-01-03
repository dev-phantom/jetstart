/**
 * Build Output Parser
 * Parses Gradle build output to extract errors, warnings, and build info
 */

import { BuildResult, BuildError, BuildWarning, ErrorSeverity } from '@jetstart/shared';

export class BuildOutputParser {
  /**
   * Parse Gradle build output
   */
  static parse(output: string, startTime: number): BuildResult {
    const lines = output.split('\n');
    const errors: BuildError[] = [];
    const warnings: BuildWarning[] = [];
    let apkPath: string | undefined;
    let apkSize: number | undefined;

    for (const line of lines) {
      // Parse Kotlin compiler errors: e: /path/file.kt:10:5: Error message
      const errorMatch = line.match(/^e: (.+):(\d+):(\d+): (.+)$/);
      if (errorMatch) {
        errors.push({
          file: errorMatch[1],
          line: parseInt(errorMatch[2], 10),
          column: parseInt(errorMatch[3], 10),
          message: errorMatch[4],
          severity: ErrorSeverity.ERROR,
        });
        continue;
      }

      // Parse Kotlin compiler warnings: w: /path/file.kt:10:5: Warning message
      const warningMatch = line.match(/^w: (.+):(\d+):(\d+): (.+)$/);
      if (warningMatch) {
        warnings.push({
          file: warningMatch[1],
          line: parseInt(warningMatch[2], 10),
          message: warningMatch[4],
        });
        continue;
      }

      // Parse APK location (check both outputs and intermediates directories)
      if (line.includes('.apk') && (line.includes('app/build/outputs') || line.includes('app\\build\\outputs') || line.includes('app/build/intermediates') || line.includes('app\\build\\intermediates'))) {
        const apkMatch = line.match(/([^\s]+\.apk)/);
        if (apkMatch) {
          apkPath = apkMatch[1];
        }
      }

      // Parse build success
      if (line.includes('BUILD SUCCESSFUL')) {
        // Success is determined later
      }

      // Parse build failure
      if (line.includes('BUILD FAILED')) {
        // Failure is determined by errors array
      }
    }

    const buildTime = Date.now() - startTime;
    const success = errors.length === 0 && output.includes('BUILD SUCCESSFUL');

    return {
      success,
      apkPath,
      apkSize,
      buildTime,
      errors: errors.length > 0 ? errors : undefined,
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  }
}
