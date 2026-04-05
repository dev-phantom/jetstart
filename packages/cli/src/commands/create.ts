/**
 * Create Command
 * Scaffolds a new JetStart project
 */

import path from 'path';
import * as os from 'os';
import fs from 'fs-extra';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { log, success, error, info, warning } from '../utils/logger';
import { startSpinner, stopSpinner } from '../utils/spinner';
import { prompt } from '../utils/prompt';
import { generateProjectTemplate } from '../utils/template';
import { isValidProjectName, isValidPackageName } from '@jetstart/shared';
import { CreateOptions } from '../types';
import { detectJava, installJava, isJavaCompatible, getDefaultJDKPath } from '../utils/java';
import { createSDKManager, REQUIRED_SDK_COMPONENTS } from '../utils/android-sdk';
import { findAndroidSDK } from '../utils/system-tools';

/**
 * Run full installation (automated mode)
 */
async function runFullInstallation(): Promise<void> {
  info('Starting full automated installation...');
  info('⏱  This typically takes 10–20 minutes on first run (downloads ~1–2 GB).');
  info('   Keep this terminal open — the spinner will show elapsed time on slow steps.');
  console.log();

  // Check and install Java
  const java = await detectJava();
  if (!java || !(await isJavaCompatible(java.version))) {
    try {
      await installJava();
    } catch (err) {
      warning('Automated Java installation failed.');
      info('Please download and install JDK 17 manually from:');
      info('👉 https://adoptium.net/temurin/releases/?version=17');
      info('After installing, you may need to restart your terminal.');
      console.log();
   
    }
  } else {
    success(`Java ${java.version} already installed`);
    // detectJava() doesn't set process.env.JAVA_HOME — only installJava() does.
    // sdkmanager requires JAVA_HOME, so ensure it's set for all child processes.
    if (!process.env.JAVA_HOME) {
      const javaHome = java.path || getDefaultJDKPath();
      if (await fs.pathExists(javaHome)) {
        process.env.JAVA_HOME = javaHome;
        process.env.PATH = `${path.join(javaHome, 'bin')}${path.delimiter}${process.env.PATH || ''}`;
        info(`JAVA_HOME set to: ${javaHome}`);
      }
    }
  }

  // Check and install Android SDK
  const sdkManager = createSDKManager();
  const sdkRoot = await findAndroidSDK();

  if (!sdkRoot) {
    info('Android SDK not found. Installing...');
    await sdkManager.installCmdlineTools();
  } else {
    success(`Android SDK found at ${sdkRoot}`);
    // Check if cmdline-tools are installed within this SDK
    if (!(await sdkManager.hasCmdlineTools())) {
      info('Android cmdline-tools missing. Installing...');
      await sdkManager.installCmdlineTools();
    }
  }

  // Accept licenses once before the loop (avoids a JVM cold-start per component)
  await sdkManager.acceptLicenses();

  // Install required SDK components — errors per component are non-fatal so a
  // single large download failure (e.g. system-images on a slow connection)
  // doesn't abort project creation. All critical build components come first.
  const failedComponents: string[] = [];
  for (const component of REQUIRED_SDK_COMPONENTS) {
    try {
      await sdkManager.installComponent(component, undefined, { skipLicenses: true });
    } catch (err) {
      warning(`Failed to install ${component}: ${(err as Error).message}`);
      warning(`  → Install manually later: sdkmanager "${component}"`);
      failedComponents.push(component);
    }
  }

  console.log();
  if (failedComponents.length === 0) {
    success('All dependencies installed successfully!');
  } else {
    warning(`${failedComponents.length} component(s) failed to install (see above).`);
    info('You can install them manually later with:');
    failedComponents.forEach(c => info(`  sdkmanager "${c}"`));
    info('Project creation will continue with the components that were installed.');
  }
  console.log();
}

/**
 * Run interactive installation
 */
async function runInteractiveInstallation(): Promise<void> {
  info('Checking dependencies...');
  console.log();

  // Check Java
  const java = await detectJava();
  if (!java || !(await isJavaCompatible(java.version))) {
    const { shouldInstall } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'shouldInstall',
        message: 'Java 17+ not found. Would you like to install it?',
        default: true,
      },
    ]);

    if (shouldInstall) {
      try {
        await installJava();
      } catch (err) {
        warning('Automated Java installation failed.');
        info('Please download and install JDK 17 manually from:');
        info('👉 https://adoptium.net/temurin/releases/?version=17');
        info('After installing, you may need to restart your terminal.');
        console.log();
      }
    } else {
      warning('Java installation skipped. You may need to install it manually.');
    }
  } else {
    success(`Java ${java.version} detected`);
  }

  // Check Android SDK
  const sdkRoot = await findAndroidSDK();
  if (!sdkRoot) {
    const { shouldInstall } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'shouldInstall',
        message: 'Android SDK not found. Would you like to install it?',
        default: true,
      },
    ]);

    if (shouldInstall) {
      const sdkManager = createSDKManager();
      await sdkManager.installCmdlineTools();

      // Ask about components
      const { installComponents } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'installComponents',
          message: 'Install required SDK components?',
          default: true,
        },
      ]);

      if (installComponents) {
        for (const component of REQUIRED_SDK_COMPONENTS) {
          await sdkManager.installComponent(component);
        }
      }
    } else {
      warning('Android SDK installation skipped. Project creation may fail without SDK.');
    }
  } else {
    success(`Android SDK found at ${sdkRoot}`);
    const sdkManager = createSDKManager();
    // Check if cmdline-tools are installed within this SDK
    if (!(await sdkManager.hasCmdlineTools())) {
      const { shouldInstall } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'shouldInstall',
          message: 'Android cmdline-tools missing. Would you like to install them?',
          default: true,
        },
      ]);

      if (shouldInstall) {
        await sdkManager.installCmdlineTools();
      }
    }
  }

  console.log();
}

export async function createCommand(name: string, options: CreateOptions) {
  try {
    // Validate project name
    if (!isValidProjectName(name)) {
      error('Invalid project name. Use letters, numbers, hyphens, and underscores only.');
      error('Project name must start with a letter and be 1-64 characters long.');
      process.exit(1);
    }

    const projectPath = path.resolve(process.cwd(), name);

    // Check if directory already exists
    if (await fs.pathExists(projectPath)) {
      error(`Directory '${name}' already exists!`);
      process.exit(1);
    }

    log(`Creating JetStart project: ${chalk.cyan(name)}`);
    console.log();

    // Run installation if requested
    if (options.fullInstall) {
      await runFullInstallation();
    } else {
      await runInteractiveInstallation();
    }

    // Get package name
    let packageName = options.package;
    if (!packageName) {
      const defaultPackage = `com.jetstart.${name.toLowerCase().replace(/[^a-z0-9]/g, '')}`;

      // In --full-install (automated) mode or when stdin is not a TTY, skip the
      // interactive prompt and use the default. User can override with --package.
      if (options.fullInstall || !process.stdin.isTTY) {
        packageName = defaultPackage;
        info(`Using default package name: ${chalk.cyan(packageName)}`);
      } else {
        const answer = await prompt({
          type: 'input',
          name: 'packageName',
          message: 'Package name:',
          default: defaultPackage,
          validate: (input: string) => {
            if (!isValidPackageName(input)) {
              return 'Invalid package name. Use format: com.company.app';
            }
            return true;
          },
        });
        packageName = answer.packageName;
      }
    }

    // Validate package name
    if (!isValidPackageName(packageName!)) {
      error('Invalid package name. Use format: com.company.app');
      process.exit(1);
    }

    // Create project structure
    const spinner = startSpinner('Creating project structure...');

    try {
      await fs.ensureDir(projectPath);

      // Generate project files
      await generateProjectTemplate(projectPath, {
        projectName: name,
        packageName: packageName!,
        template: options.template || 'default',
      });

      // Install bundled Java dependencies to local Maven repository (~/.m2)
      //  CLI Bundling
      const bundledRepoPath = path.resolve(__dirname, '../../maven-repo');
      if (await fs.pathExists(bundledRepoPath)) {
        const m2RepoPath = path.join(os.homedir(), '.m2', 'repository');
        await fs.copy(bundledRepoPath, m2RepoPath, { overwrite: true });
      }

      stopSpinner(spinner, true, 'Project structure created');

      console.log();
      success(`Successfully created project: ${chalk.cyan(name)}`);
      console.log();
      console.log(chalk.bold('Next steps:'));
      console.log(`  ${chalk.cyan('cd')} ${name}`);
      console.log(`  ${chalk.cyan('jetstart dev')}`);
      console.log();

      // Ensure process exits promptly
      process.exit(0);
    } catch (err: any) {
      stopSpinner(spinner, false, 'Failed to create project');
      throw err;
    }

  } catch (err: any) {
    error(`Failed to create project: ${err.message}`);
    process.exit(1);
  }
}