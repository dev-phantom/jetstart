/**
 * Android emulator management command
 */

import inquirer from 'inquirer';
import chalk from 'chalk';
import { createAVDManager } from '../utils/emulator';
import { error as logError, success, info, warning } from '../utils/logger';

/**
 * Display list of AVDs
 */
async function handleListAVDs(): Promise<void> {
  const avdManager = createAVDManager();

  const avds = await avdManager.listAVDs();

  if (avds.length === 0) {
    console.log();
    warning('No Android emulators found.');
    console.log();

    const { shouldCreate } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'shouldCreate',
        message: 'Would you like to create a JetStart-optimized emulator?',
        default: true,
      },
    ]);

    if (shouldCreate) {
      await handleCreateJetStartAVD();
    }
    return;
  }

  console.log();
  console.log(chalk.bold('Available Android Virtual Devices:'));
  console.log('━'.repeat(70));
  console.log();

  for (const avd of avds) {
    const statusIcon = avd.running ? chalk.green('✓') : chalk.gray('○');
    const statusText = avd.running ? chalk.green('(Running)') : '';

    console.log(`  ${statusIcon} ${chalk.bold(avd.name)} ${statusText}`);
    console.log(`    - Device: ${avd.device || 'Unknown'}`);
    console.log(`    - Target: ${avd.target || 'Unknown'}`);
    if (avd.basedOn) {
      console.log(`    - Based on: ${avd.basedOn}`);
    }
    console.log();
  }
}

/**
 * Start an emulator
 */
async function handleStartEmulator(): Promise<void> {
  const avdManager = createAVDManager();
  const avds = await avdManager.listAVDs();

  if (avds.length === 0) {
    warning('No emulators available. Create one first.');
    return;
  }

  // Filter out running emulators
  const availableAVDs = avds.filter((avd) => !avd.running);

  if (availableAVDs.length === 0) {
    info('All emulators are already running.');
    return;
  }

  const { avdName } = await inquirer.prompt([
    {
      type: 'list',
      name: 'avdName',
      message: 'Select emulator to start:',
      choices: availableAVDs.map((avd) => ({ name: `${avd.name} (${avd.target})`, value: avd.name })),
    },
  ]);

  await avdManager.startEmulator({ avdName });
}

/**
 * Stop an emulator
 */
async function handleStopEmulator(): Promise<void> {
  const avdManager = createAVDManager();
  const avds = await avdManager.listAVDs();

  // Filter running emulators
  const runningAVDs = avds.filter((avd) => avd.running);

  if (runningAVDs.length === 0) {
    warning('No emulators are currently running.');
    return;
  }

  const { avdName } = await inquirer.prompt([
    {
      type: 'list',
      name: 'avdName',
      message: 'Select emulator to stop:',
      choices: runningAVDs.map((avd) => ({ name: `${avd.name} (${avd.target})`, value: avd.name })),
    },
  ]);

  await avdManager.stopEmulator(avdName);
}

/**
 * Create JetStart-optimized AVD
 */
async function handleCreateJetStartAVD(): Promise<void> {
  const avdManager = createAVDManager();

  try {
    await avdManager.createJetStartAVD();
  } catch (err: any) {
    logError(`Failed to create AVD: ${err.message}`);
  }
}

/**
 * Create custom AVD
 */
async function handleCreateCustomAVD(): Promise<void> {
  const avdManager = createAVDManager();

  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'name',
      message: 'Enter AVD name:',
      default: 'my-android-emulator',
      validate: (input: string) => {
        if (!input || input.trim().length === 0) {
          return 'Name cannot be empty';
        }
        if (!/^[a-zA-Z0-9_-]+$/.test(input)) {
          return 'Name can only contain letters, numbers, hyphens, and underscores';
        }
        return true;
      },
    },
    {
      type: 'list',
      name: 'device',
      message: 'Select device profile:',
      choices: [
        { name: 'Pixel 5', value: 'pixel_5' },
        { name: 'Pixel 6', value: 'pixel_6' },
        { name: 'Pixel 8', value: 'pixel_8' },
        { name: 'Nexus 5', value: 'Nexus 5' },
      ],
      default: 'pixel_5',
    },
    {
      type: 'list',
      name: 'apiLevel',
      message: 'Select API level:',
      choices: [
        { name: 'API 34 (Android 14) - Recommended', value: 34 },
        { name: 'API 33 (Android 13)', value: 33 },
        { name: 'API 31 (Android 12)', value: 31 },
        { name: 'API 29 (Android 10)', value: 29 },
        { name: 'API 24 (Android 7.0) - Minimum', value: 24 },
      ],
      default: 34,
    },
    {
      type: 'list',
      name: 'abi',
      message: 'Select ABI (architecture):',
      choices: [
        { name: 'x86_64 (Intel/AMD 64-bit)', value: 'x86_64' },
        { name: 'arm64-v8a (ARM 64-bit)', value: 'arm64-v8a' },
      ],
      default: process.arch === 'arm64' ? 'arm64-v8a' : 'x86_64',
    },
  ]);

  try {
    await avdManager.createAVD({
      name: answers.name,
      device: answers.device,
      apiLevel: answers.apiLevel,
      abi: answers.abi,
    });
  } catch (err: any) {
    logError(`Failed to create AVD: ${err.message}`);
  }
}

/**
 * Delete an AVD
 */
async function handleDeleteAVD(): Promise<void> {
  const avdManager = createAVDManager();
  const avds = await avdManager.listAVDs();

  if (avds.length === 0) {
    warning('No emulators available to delete.');
    return;
  }

  const { avdName } = await inquirer.prompt([
    {
      type: 'list',
      name: 'avdName',
      message: 'Select emulator to delete:',
      choices: avds.map((avd) => ({ name: `${avd.name} (${avd.target})`, value: avd.name })),
    },
  ]);

  const { confirm } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirm',
      message: `Are you sure you want to delete "${avdName}"?`,
      default: false,
    },
  ]);

  if (confirm) {
    await avdManager.deleteAVD(avdName);
  } else {
    info('Deletion cancelled');
  }
}

/**
 * Android emulator command handler
 */
export async function androidEmulatorCommand(): Promise<void> {
  try {
    console.log();
    console.log(chalk.cyan.bold('  JetStart Android Emulator Manager'));
    console.log();

    let running = true;

    while (running) {
      const { action } = await inquirer.prompt([
        {
          type: 'list',
          name: 'action',
          message: 'What would you like to do?',
          choices: [
            { name: 'List existing emulators', value: 'list' },
            { name: 'Start emulator', value: 'start' },
            { name: 'Stop emulator', value: 'stop' },
            new inquirer.Separator(),
            { name: 'Create JetStart-optimized emulator', value: 'create-jetstart' },
            { name: 'Create custom emulator', value: 'create-custom' },
            { name: 'Delete emulator', value: 'delete' },
            new inquirer.Separator(),
            { name: 'Exit', value: 'exit' },
          ],
        },
      ]);

      switch (action) {
        case 'list':
          await handleListAVDs();
          break;
        case 'start':
          await handleStartEmulator();
          break;
        case 'stop':
          await handleStopEmulator();
          break;
        case 'create-jetstart':
          await handleCreateJetStartAVD();
          break;
        case 'create-custom':
          await handleCreateCustomAVD();
          break;
        case 'delete':
          await handleDeleteAVD();
          break;
        case 'exit':
          running = false;
          console.log();
          success('Goodbye!');
          console.log();
          break;
      }

      if (running && action !== 'list') {
        console.log();
      }
    }
  } catch (err: any) {
    console.log();
    logError(`Emulator management failed: ${err.message}`);
    process.exit(1);
  }
}
