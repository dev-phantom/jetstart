/**
 * Template Generator
 * Creates project structure from file-based templates
 *
 * Instead of inline string templates, this uses the `packages/template/base/`
 * folder. Template files contain {{PLACEHOLDER}} variables that are substituted
 * at scaffold time.
 */

import path from 'path';
import fs from 'fs-extra';
import os from 'os';
import { spawn } from 'child_process';
import { TemplateOptions } from '../types';
import { MIN_ANDROID_API_LEVEL, TARGET_ANDROID_API_LEVEL } from '@jetstart/shared';

/**
 * Build the variable map from TemplateOptions
 */
function buildVariableMap(options: TemplateOptions): Record<string, string> {
  const themeName = options.projectName.replace(/[^a-zA-Z0-9]/g, '');

  return {
    '{{PROJECT_NAME}}': options.projectName,
    '{{PACKAGE_NAME}}': options.packageName,
    '{{THEME_NAME}}': themeName,
    '{{MIN_SDK}}': String(MIN_ANDROID_API_LEVEL),
    '{{TARGET_SDK}}': String(TARGET_ANDROID_API_LEVEL),
  };
}

/**
 * Resolve the template directory.
 * When compiled, template.ts lives at packages/cli/dist/utils/template.js,
 * so we go up to packages/ then into template/base/.
 * When running via ts-node, template.ts lives at packages/cli/src/utils/template.ts,
 * same relative traversal works.
 */
function getTemplateDir(): string {
  // Published:  __dirname = .../node_modules/@jetstart/cli/dist/utils
  //             2 levels up = @jetstart/cli root → template/base 
  // Local dev:  __dirname = packages/cli/dist/utils or src/utils
  //             2 levels up = packages/cli → template/base 
  return path.resolve(__dirname, '..', '..', 'template', 'base');
}

/**
 * Known binary/non-text extensions that should be copied without substitution.
 */
const BINARY_EXTENSIONS = new Set([
  '.jar',
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
  '.webp',
  '.ico',
  '.pdf',
  '.zip',
  '.gz',
  '.tar',
  '.class',
]);

/**
 * Check if a file is a text file that should have placeholders replaced.
 */
function isTextFile(filePath: string): boolean {
  const ext = path.extname(filePath).toLowerCase();
  return !BINARY_EXTENSIONS.has(ext);
}

/**
 * Replace all {{PLACEHOLDER}} variables in a text string.
 */
function replaceVariables(content: string, variables: Record<string, string>): string {
  let result = content;
  for (const [placeholder, value] of Object.entries(variables)) {
    // Use split+join for global replace (no regex needed)
    result = result.split(placeholder).join(value);
  }
  return result;
}

/**
 * Recursively walk a directory tree and return all file paths (relative).
 */
async function walkDir(dir: string, base?: string): Promise<string[]> {
  const root = base ?? dir;
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walkDir(fullPath, root)));
    } else {
      files.push(path.relative(root, fullPath));
    }
  }

  return files;
}

/**
 * Copy the template folder to the project path, replacing placeholders.
 */
async function copyTemplateWithVariables(
  templateDir: string,
  projectPath: string,
  variables: Record<string, string>,
  packageName: string
): Promise<void> {
  const files = await walkDir(templateDir);

  for (const relPath of files) {
    const srcPath = path.join(templateDir, relPath);

    // Replace __PACKAGE_PATH__ in the directory structure
    const packageDir = packageName.replace(/\./g, '/');
    const destRelPath = relPath.replace('__PACKAGE_PATH__', packageDir);
    const destPath = path.join(projectPath, destRelPath);

    // Ensure the destination directory exists
    await fs.ensureDir(path.dirname(destPath));

    if (isTextFile(srcPath)) {
      // Read, substitute, and write
      const raw = await fs.readFile(srcPath, 'utf-8');
      // Strip UTF-8 BOM if present - Gradle/Groovy parsers reject it
      const content = raw.charCodeAt(0) === 0xFEFF ? raw.slice(1) : raw;
      const processed = replaceVariables(content, variables);
      await fs.writeFile(destPath, processed);
    } else {
      // Binary file — copy as-is
      await fs.copy(srcPath, destPath);
    }
  }
}

/**
 * Generate jetstart.config.json (dynamic JSON structure)
 */
async function generateJetStartConfig(
  projectPath: string,
  options: TemplateOptions
): Promise<void> {
  const config = {
    projectName: options.projectName,
    packageName: options.packageName,
    version: '1.0.0',
    jetstart: {
      version: '2.0.0',
      enableHotReload: true,
      enableLogs: true,
      port: 8765,
    },
  };

  await fs.writeJSON(path.join(projectPath, 'jetstart.config.json'), config, { spaces: 2 });
}

/**
 * Generate Gradle wrapper by calling system gradle.
 */
async function generateGradleWrapper(projectPath: string): Promise<void> {
  return new Promise<void>((resolve) => {
    const gradleCmd = process.platform === 'win32' ? 'gradle.bat' : 'gradle';

    const gradleProcess = spawn(gradleCmd, ['wrapper', '--gradle-version', '8.2'], {
      cwd: projectPath,
      // On Windows, .bat files need a shell. On other platforms, we can run 'gradle' directly.
      // We use shell: true only on Windows to avoid the security warning on other platforms
      // and ensure .bat files execute.
      shell: process.platform === 'win32',
    });

    // Timeout after 30 seconds
    const timeout = setTimeout(() => {
      gradleProcess.kill();
      resolve();
    }, 30000);

    gradleProcess.on('close', () => {
      clearTimeout(timeout);
      resolve();
    });

    gradleProcess.on('error', () => {
      clearTimeout(timeout);
      resolve();
    });
  });
}

/**
 * Generate local.properties by auto-detecting Android SDK location.
 */
async function generateLocalProperties(projectPath: string): Promise<void> {
  let androidSdkPath: string | undefined;

  // Check environment variables first
  androidSdkPath = process.env.ANDROID_HOME || process.env.ANDROID_SDK_ROOT;

  // If not found, check common Windows locations
  if (!androidSdkPath && process.platform === 'win32') {
    const commonPaths = [
      'C:\\Android',
      path.join(os.homedir(), 'AppData', 'Local', 'Android', 'Sdk'),
      'C:\\Android\\Sdk',
      'C:\\Program Files (x86)\\Android\\android-sdk',
    ];

    for (const p of commonPaths) {
      if (fs.existsSync(p)) {
        androidSdkPath = p;
        break;
      }
    }
  }

  // If not found on macOS/Linux, check common paths
  if (!androidSdkPath && process.platform !== 'win32') {
    const commonPaths = [
      path.join(os.homedir(), 'Android', 'Sdk'),
      path.join(os.homedir(), 'Library', 'Android', 'sdk'),
      '/opt/android-sdk',
    ];

    for (const p of commonPaths) {
      if (fs.existsSync(p)) {
        androidSdkPath = p;
        break;
      }
    }
  }

  if (!androidSdkPath) {
    console.warn(
      '[Warning] Android SDK not found. You may need to set ANDROID_HOME or create local.properties manually.'
    );
    return;
  }

  const content = `# Auto-generated by JetStart
sdk.dir=${androidSdkPath.replace(/\\/g, '\\\\')}
`;

  await fs.writeFile(path.join(projectPath, 'local.properties'), content);
  console.log(`[JetStart] Created local.properties with SDK: ${androidSdkPath}`);
}

/**
 * Generate a new JetStart project from the file-based template.
 *
 * 1. Copy packages/template/base/ → projectPath
 * 2. Rename __PACKAGE_PATH__ → actual package dir (e.g. com/jetstart/myapp)
 * 3. Replace {{VAR}} placeholders in all text files
 * 4. Generate dynamic files (jetstart.config.json, gradle wrapper, local.properties)
 */
export async function generateProjectTemplate(
  projectPath: string,
  options: TemplateOptions
): Promise<void> {
  const templateDir = getTemplateDir();

  // Validate template directory exists
  if (!(await fs.pathExists(templateDir))) {
    throw new Error(
      `Template directory not found: ${templateDir}. ` + `Make sure packages/template/base/ exists.`
    );
  }

  // Build variable map
  const variables = buildVariableMap(options);

  // Copy template files with variable substitution + package path rename
  await copyTemplateWithVariables(templateDir, projectPath, variables, options.packageName);

  // Generate dynamic files
  await generateGradleWrapper(projectPath);
  await generateLocalProperties(projectPath);
  await generateJetStartConfig(projectPath, options);
}

