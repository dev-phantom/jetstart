/**
 * Create Command
 * Scaffolds a new JetStart project
 */

import path from 'path';
import fs from 'fs-extra';
import chalk from 'chalk';
import { log, success, error } from '../utils/logger';
import { startSpinner, stopSpinner } from '../utils/spinner';
import { prompt } from '../utils/prompt';
import { generateProjectTemplate } from '../utils/template';
import { isValidProjectName, isValidPackageName } from '@jetstart/shared';

interface CreateOptions {
  package?: string;
  template?: string;
  skipInstall?: boolean;
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

    // Get package name
    let packageName = options.package;
    if (!packageName) {
      const defaultPackage = `com.example.${name.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
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