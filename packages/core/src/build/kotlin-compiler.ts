/**
 * Kotlin Compiler Service
 * Compiles Kotlin files to .class files for hot reload
 */

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { spawn } from 'child_process';
import { log, error as logError } from '../utils/logger';

export interface CompileResult {
  success: boolean;
  classFiles: string[];
  errors: string[];
  outputDir: string;
}

export class KotlinCompiler {
  private static readonly TAG = 'KotlinCompiler';
  private kotlincPath: string | null = null;
  private composeCompilerPath: string | null = null;
  private projectClasspath: string[] = [];

  constructor(private projectPath: string) {}

  /**
   * Find Compose compiler plugin JAR
   * For Kotlin 2.0+, the Compose compiler is bundled with kotlinc
   */
  async findComposeCompiler(): Promise<string | null> {
    if (this.composeCompilerPath) return this.composeCompilerPath;

    // First check if kotlinc has a bundled Compose compiler (Kotlin 2.0+)
    const kotlincPath = await this.findKotlinc();
    if (kotlincPath) {
      const kotlincDir = path.dirname(path.dirname(kotlincPath)); // Go up from bin/kotlinc
      const bundledComposePlugin = path.join(kotlincDir, 'lib', 'compose-compiler-plugin.jar');

      if (fs.existsSync(bundledComposePlugin)) {
        this.composeCompilerPath = bundledComposePlugin;
        log(`Found bundled Compose compiler (Kotlin 2.0+)`);
        return this.composeCompilerPath;
      }
    }

    // Fallback to Gradle cache for older Kotlin versions
    const gradleCache = path.join(os.homedir(), '.gradle', 'caches', 'modules-2', 'files-2.1');
    const composeCompilerDir = path.join(gradleCache, 'androidx.compose.compiler', 'compiler');

    if (!fs.existsSync(composeCompilerDir)) {
      log('Compose compiler not found');
      return null;
    }

    // Find latest version
    const versions = fs.readdirSync(composeCompilerDir)
      .filter(v => fs.statSync(path.join(composeCompilerDir, v)).isDirectory())
      .sort().reverse();

    for (const version of versions) {
      const versionDir = path.join(composeCompilerDir, version);
      const hashes = fs.readdirSync(versionDir);

      for (const hash of hashes) {
        const hashDir = path.join(versionDir, hash);
        if (!fs.statSync(hashDir).isDirectory()) continue;

        const files = fs.readdirSync(hashDir);
        for (const file of files) {
          if (file.endsWith('.jar') && !file.endsWith('-sources.jar')) {
            this.composeCompilerPath = path.join(hashDir, file);
            log(`Found Compose compiler: ${version}`);
            return this.composeCompilerPath;
          }
        }
      }
    }

    return null;
  }

  /**
   * Find kotlinc executable
   */
  async findKotlinc(): Promise<string | null> {
    if (this.kotlincPath) return this.kotlincPath;

    // Check common locations
    const locations = [
      // From environment variable
      process.env.KOTLIN_HOME ? path.join(process.env.KOTLIN_HOME, 'bin', 'kotlinc') : null,
      // From Android Studio
      process.env.ANDROID_STUDIO_HOME ? path.join(process.env.ANDROID_STUDIO_HOME, 'plugins', 'Kotlin', 'kotlinc', 'bin', 'kotlinc') : null,
      // System-wide installation (Windows)
      'C:\\Program Files\\kotlinc\\bin\\kotlinc.bat',
      'C:\\kotlinc\\bin\\kotlinc.bat',
      // System-wide installation (Unix)
      '/usr/local/bin/kotlinc',
      '/usr/bin/kotlinc',
      // Homebrew (macOS)
      '/opt/homebrew/bin/kotlinc',
    ].filter(Boolean) as string[];

    for (const loc of locations) {
      const execPath = os.platform() === 'win32' && !loc.endsWith('.bat') ? `${loc}.bat` : loc;
      if (fs.existsSync(execPath)) {
        this.kotlincPath = execPath;
        log(`Found kotlinc at: ${execPath}`);
        return execPath;
      }
    }

    // Try to find via 'where' (Windows) or 'which' (Unix)
    try {
      const cmd = os.platform() === 'win32' ? 'where' : 'which';
      const result = await this.runCommand(cmd, ['kotlinc']);
      if (result.success && result.stdout.trim()) {
        this.kotlincPath = result.stdout.trim().split('\n')[0];
        log(`Found kotlinc via ${cmd}: ${this.kotlincPath}`);
        return this.kotlincPath;
      }
    } catch (e) {
      // Ignore
    }

    logError('kotlinc not found. Please install Kotlin or set KOTLIN_HOME');
    return null;
  }

  /**
   * Build the classpath for compilation
   * This needs to include Android SDK, Compose, and project dependencies
   */
  async buildClasspath(): Promise<string[]> {
    if (this.projectClasspath.length > 0) return this.projectClasspath;

    const classpath: string[] = [];
    // Check multiple locations for Android SDK
    let androidHome = process.env.ANDROID_HOME || process.env.ANDROID_SDK_ROOT;

    // Fallback to common Windows locations
    if (!androidHome) {
      const commonLocations = [
        'C:\\Android',
        path.join(os.homedir(), 'AppData', 'Local', 'Android', 'Sdk'),
        'C:\\Users\\Public\\Android\\Sdk',
      ];
      for (const loc of commonLocations) {
        if (fs.existsSync(path.join(loc, 'platforms'))) {
          androidHome = loc;
          log(`Found Android SDK at: ${loc}`);
          break;
        }
      }
    }

    if (!androidHome) {
      logError('ANDROID_HOME or ANDROID_SDK_ROOT not set');
      return classpath;
    }

    // Find android.jar
    const platformsDir = path.join(androidHome, 'platforms');
    if (fs.existsSync(platformsDir)) {
      const platforms = fs.readdirSync(platformsDir)
        .filter(d => d.startsWith('android-'))
        .sort((a, b) => {
          const aNum = parseInt(a.replace('android-', ''));
          const bNum = parseInt(b.replace('android-', ''));
          return bNum - aNum;
        });

      if (platforms.length > 0) {
        const androidJar = path.join(platformsDir, platforms[0], 'android.jar');
        if (fs.existsSync(androidJar)) {
          classpath.push(androidJar);
          log(`Using Android SDK: ${platforms[0]}`);
        }
      }
    }

    // Add ALL Gradle cached dependencies (Compose, AndroidX, Kotlin, etc.)
    const gradleCache = path.join(os.homedir(), '.gradle', 'caches', 'modules-2', 'files-2.1');
    if (fs.existsSync(gradleCache)) {
      // Scan for all required dependency groups
      const requiredGroups = [
        'androidx.compose.runtime',
        'androidx.compose.ui',
        'androidx.compose.foundation',
        'androidx.compose.material3',
        'androidx.compose.material',
        'androidx.compose.animation',
        'androidx.annotation',
        'androidx.core',
        'androidx.activity',
        'androidx.lifecycle',
        'androidx.savedstate',
        'androidx.collection',
        'org.jetbrains.kotlin',
        'org.jetbrains.kotlinx',
        'org.jetbrains.annotations',
      ];

      for (const group of requiredGroups) {
        const groupDir = path.join(gradleCache, group);
        if (fs.existsSync(groupDir)) {
          // Get all artifacts in this group
          const artifacts = fs.readdirSync(groupDir);
          for (const artifact of artifacts) {
            const artifactDir = path.join(groupDir, artifact);
            if (!fs.statSync(artifactDir).isDirectory()) continue;

            // Find latest version
            const versions = fs.readdirSync(artifactDir)
              .filter(v => fs.statSync(path.join(artifactDir, v)).isDirectory())
              .sort().reverse();

            if (versions.length > 0) {
              const versionDir = path.join(artifactDir, versions[0]);
              const hashes = fs.readdirSync(versionDir);
              for (const hash of hashes) {
                const hashDir = path.join(versionDir, hash);
                if (!fs.statSync(hashDir).isDirectory()) continue;

                const files = fs.readdirSync(hashDir);
                // Add all JARs (not sources or javadoc)
                for (const file of files) {
                  if (file.endsWith('.jar') &&
                      !file.endsWith('-sources.jar') &&
                      !file.endsWith('-javadoc.jar')) {
                    classpath.push(path.join(hashDir, file));
                  }
                }
              }
            }
          }
        }
      }
    }

    // Scan transforms-3 cache for extracted AAR JARs (Compose, Material3, etc.)
    const transformsCache = path.join(os.homedir(), '.gradle', 'caches', 'transforms-3');
    if (fs.existsSync(transformsCache)) {
      const requiredPatterns = [
        'runtime-release',
        'runtime-saveable-release',
        'ui-release',
        'ui-graphics-release',
        'ui-text-release',
        'ui-geometry-release',
        'ui-unit-release',
        'ui-util-release',
        'foundation-release',
        'foundation-layout-release',
        'material3',
        'material-release',
        'material-ripple-release',
        'material-icons-core-release',
        'animation-core-release',
        'animation-release',
        'activity-compose',
        'lifecycle-viewmodel-compose',
        'lifecycle-viewmodel-2',  // AndroidViewModel
        'lifecycle-viewmodel-ktx',
        'lifecycle-viewmodel-savedstate',
        'lifecycle-runtime',
        'lifecycle-livedata',
        'lifecycle-common',
        'savedstate',
        'core-',
        'annotation-',
        'collection-',
        'room-runtime',  // For database access
        'room-common',
        'kotlinx-coroutines',  // For Flow
      ];

      try {
        const transforms = fs.readdirSync(transformsCache);
        for (const hash of transforms) {
          const transformedDir = path.join(transformsCache, hash, 'transformed');
          if (!fs.existsSync(transformedDir)) continue;

          try {
            const packages = fs.readdirSync(transformedDir);
            for (const pkg of packages) {
              // Check if this package matches any required pattern
              const isRequired = requiredPatterns.some(pattern =>
                pkg.toLowerCase().includes(pattern.toLowerCase())
              );

              if (isRequired) {
                const classesJar = path.join(transformedDir, pkg, 'jars', 'classes.jar');
                if (fs.existsSync(classesJar) && !classpath.includes(classesJar)) {
                  classpath.push(classesJar);
                  log(`Added transformed: ${pkg}`);
                }
              }
            }
          } catch (e) {
            // Ignore permission errors
          }
        }
      } catch (e) {
        // Ignore
      }
    }

    // Add project's compiled classes (multiple possible locations)
    const projectClassPaths = [
      path.join(this.projectPath, 'app', 'build', 'intermediates', 'javac', 'debug', 'classes'),
      path.join(this.projectPath, 'app', 'build', 'tmp', 'kotlin-classes', 'debug'),
      path.join(this.projectPath, 'app', 'build', 'intermediates', 'compile_and_runtime_not_namespaced_r_class_jar', 'debug', 'R.jar'),
      path.join(this.projectPath, 'app', 'build', 'intermediates', 'runtime_library_classes_jar', 'debug', 'classes.jar'),
    ];

    for (const classPath of projectClassPaths) {
      if (fs.existsSync(classPath)) {
        classpath.push(classPath);
        log(`Added project classes: ${path.basename(classPath)}`);
      }
    }

    // Also scan intermediates for any JAR files we might need
    const intermediatesDir = path.join(this.projectPath, 'app', 'build', 'intermediates');
    if (fs.existsSync(intermediatesDir)) {
      this.findJarsRecursive(intermediatesDir, classpath, 2); // Max depth 2
    }

    this.projectClasspath = classpath;
    log(`Built classpath with ${classpath.length} entries`);
    return classpath;
  }

  /**
   * Recursively find JAR files in a directory up to maxDepth
   */
  private findJarsRecursive(dir: string, classpath: string[], maxDepth: number, currentDepth = 0): void {
    if (currentDepth > maxDepth || !fs.existsSync(dir)) return;

    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          this.findJarsRecursive(fullPath, classpath, maxDepth, currentDepth + 1);
        } else if (entry.name.endsWith('.jar') && !classpath.includes(fullPath)) {
          classpath.push(fullPath);
        }
      }
    } catch (e) {
      // Ignore permission errors
    }
  }

  /**
   * Compile a single Kotlin file
   */
  async compileFile(filePath: string): Promise<CompileResult> {
    const kotlinc = await this.findKotlinc();
    if (!kotlinc) {
      return {
        success: false,
        classFiles: [],
        errors: ['kotlinc not found'],
        outputDir: ''
      };
    }

    const classpath = await this.buildClasspath();
    if (classpath.length === 0) {
      return {
        success: false,
        classFiles: [],
        errors: ['Failed to build classpath - Android SDK not found'],
        outputDir: ''
      };
    }

    // Create temp output directory
    const outputDir = path.join(os.tmpdir(), 'jetstart-compile', Date.now().toString());
    fs.mkdirSync(outputDir, { recursive: true });

    log(`Compiling ${path.basename(filePath)}...`);

    // Find Compose compiler plugin for @Composable support
    const composeCompiler = await this.findComposeCompiler();

    // On Windows, command line can be too long with many classpath entries
    // Use an argument file (@argfile) to avoid this limitation
    const classpathStr = classpath.join(os.platform() === 'win32' ? ';' : ':');
    const argLines = [
      `-d`,
      outputDir,
      `-classpath`,
      classpathStr,
      `-jvm-target`,
      `17`,
      `-Xskip-prerelease-check`,
      `-Xno-call-assertions`,
      `-Xno-param-assertions`,
    ];

    // Add Compose compiler plugin if found
    if (composeCompiler) {
      argLines.push(`-Xplugin=${composeCompiler}`);
      log(`Using Compose compiler plugin`);
    }

    argLines.push(filePath);
    const argFileContent = argLines.join('\n');

    const argFilePath = path.join(outputDir, 'kotlinc-args.txt');
    fs.writeFileSync(argFilePath, argFileContent);

    log(`Using argument file: ${argFilePath}`);

    // Build kotlinc arguments using @argfile
    const args = [`@${argFilePath}`];

    const result = await this.runCommand(kotlinc, args);

    if (!result.success) {
      return {
        success: false,
        classFiles: [],
        errors: [result.stderr || 'Compilation failed'],
        outputDir
      };
    }

    // Find generated class files
    const classFiles = this.findClassFiles(outputDir);

    log(`Compiled ${classFiles.length} class files`);

    return {
      success: true,
      classFiles,
      errors: [],
      outputDir
    };
  }

  /**
   * Find all .class files in a directory
   */
  private findClassFiles(dir: string): string[] {
    const files: string[] = [];

    const walk = (d: string) => {
      if (!fs.existsSync(d)) return;
      const entries = fs.readdirSync(d, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(d, entry.name);
        if (entry.isDirectory()) {
          walk(fullPath);
        } else if (entry.name.endsWith('.class')) {
          files.push(fullPath);
        }
      }
    };

    walk(dir);
    return files;
  }

  /**
   * Run a command and return result
   */
  private runCommand(cmd: string, args: string[]): Promise<{ success: boolean; stdout: string; stderr: string }> {
    return new Promise((resolve) => {
      const proc = spawn(cmd, args, {
        shell: os.platform() === 'win32',
        env: process.env
      });

      let stdout = '';
      let stderr = '';

      proc.stdout?.on('data', (data) => {
        stdout += data.toString();
      });

      proc.stderr?.on('data', (data) => {
        stderr += data.toString();
      });

      proc.on('close', (code) => {
        resolve({
          success: code === 0,
          stdout,
          stderr
        });
      });

      proc.on('error', (err) => {
        resolve({
          success: false,
          stdout: '',
          stderr: err.message
        });
      });
    });
  }
}
