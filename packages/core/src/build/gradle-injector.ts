/**
 * Gradle BuildConfig Injector
 * Injects buildConfigField values into build.gradle
 */

import * as fs from 'fs-extra';
import * as path from 'path';
import { log } from '../utils/logger';

export interface BuildConfigField {
  type: string;
  name: string;
  value: string;
}

/**
 * Inject buildConfigFields into app/build.gradle
 */
export async function injectBuildConfigFields(
  projectPath: string,
  fields: BuildConfigField[]
): Promise<void> {
  const buildGradlePath = path.join(projectPath, 'app', 'build.gradle');
  
  if (!fs.existsSync(buildGradlePath)) {
    log('Warning: build.gradle not found, skipping injection');
    return;
  }

  let content = await fs.readFile(buildGradlePath, 'utf-8');

  // Find the defaultConfig block
  const defaultConfigRegex = /defaultConfig\s*\{([^}]*(?:\{[^}]*\}[^}]*)*)\}/;
  const match = content.match(defaultConfigRegex);

  if (!match) {
    log('Warning: defaultConfig not found in build.gradle');
    return;
  }

  const defaultConfigBlock = match[1];
  
  // Remove existing JetStart buildConfigFields
  let updatedBlock = defaultConfigBlock.replace(
    /\/\/ JetStart injected fields[\s\S]*?\/\/ End JetStart fields\n/g,
    ''
  );

  // Add new buildConfigFields
  const fieldLines = fields.map(f => {
    // For String type, escape the value with quotes
    const escapedValue = f.type === 'String' ? `\\"${f.value}\\"` : f.value;
    return `        buildConfigField "${f.type}", "${f.name}", "${escapedValue}"`;
  }).join('\n');

  updatedBlock = updatedBlock.trimEnd() + '\n\n        // JetStart injected fields\n' + 
    fieldLines + '\n        // End JetStart fields\n    ';

  // Replace the defaultConfig block
  content = content.replace(defaultConfigRegex, `defaultConfig {${updatedBlock}}`);

  await fs.writeFile(buildGradlePath, content, 'utf-8');
  log('Injected buildConfigFields into build.gradle');
}
