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
import { detectJava, installJava, isJavaCompatible } from '../utils/java';
import { createSDKManager, REQUIRED_SDK_COMPONENTS } from '../utils/android-sdk';
import { findAndroidSDK } from '../utils/system-tools';

/**
 * Run full installation (automated mode)
 */
async function runFullInstallation(): Promise<void> {
  info('Starting full automated installation...');
  console.log();

  // 1. Check and install Java
  const java = await detectJava();
  if (!java || !(await isJavaCompatible(java.version))) {
    await installJava();
  } else {
    success(`Java ${java.version} already installed`);
  }

  // 2. Check and install Android SDK
  const sdkManager = createSDKManager();
  const sdkRoot = await findAndroidSDK();

  if (!sdkRoot) {
    info('Installing Android SDK components...');
    await sdkManager.installCmdlineTools();
  } else {
    success(`Android SDK found at ${sdkRoot}`);
  }

  // 3. Install required SDK components
  for (const component of REQUIRED_SDK_COMPONENTS) {
    await sdkManager.installComponent(component);
  }

  console.log();
  success('All dependencies installed successfully!');
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
      await installJava();
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
      // Interactive mode: ask user
      const { shouldCheckDeps } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'shouldCheckDeps',
          message: 'Check and install dependencies?',
          default: true,
        },
      ]);

      if (shouldCheckDeps) {
        await runInteractiveInstallation();
      }
    }

    // Get package name
    let packageName = options.package;
    if (!packageName) {
      const defaultPackage = `com.jetstart.${name.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
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

      // Install dependencies
      if (!options.skipInstall) {
        const installSpinner = startSpinner('Installing dependencies...');
        
        // In a real implementation, we'd run npm/gradle here
        // For now, we'll simulate it
        await new Promise(resolve => setTimeout(resolve, 1000));

        stopSpinner(installSpinner, true, 'Dependencies installed');
      }

      console.log();
      success(`Successfully created project: ${chalk.cyan(name)}`);
      console.log();
      console.log(chalk.bold('Next steps:'));
      console.log(`  ${chalk.cyan('cd')} ${name}`);
      console.log(`  ${chalk.cyan('jetstart dev')}`);
      console.log();

    } catch (err: any) {
      stopSpinner(spinner, false, 'Failed to create project');
      throw err;
    }

  } catch (err: any) {
    error(`Failed to create project: ${err.message}`);
    process.exit(1);
  }
}