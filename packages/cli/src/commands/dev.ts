/**
 * Dev Command
 * Starts the development server
 */

import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs-extra';
import chalk from 'chalk';
import qrcode from 'qrcode-terminal';
import { log, success, error, info, warning } from '../utils/logger';
import { JetStartServer } from '@jetstart/core';
import { DEFAULT_CORE_PORT, DEFAULT_WS_PORT } from '@jetstart/shared';
import { DevOptions } from '../types';
import { EmulatorDeployer } from '../utils/emulator-deployer';
import { openBrowser } from '../utils/open';
import { execSync } from 'child_process';


/** Stop all Gradle daemons so the project folder can be deleted freely. */
function stopGradleDaemons(projectPath: string): void {
  try {
    const isWin = process.platform === 'win32';
    const gradle = isWin ? 'gradle.bat' : 'gradle';
    execSync(`"${gradle}" --stop`, { cwd: projectPath, stdio: 'ignore', timeout: 10000 });
  } catch {
    // Daemon may already be gone — not an error
  }
}

export async function devCommand(options: DevOptions) {
  try {
    const port = parseInt(options.port || String(DEFAULT_CORE_PORT));
    const wsPort = DEFAULT_WS_PORT;
    const host = options.host || getLocalIP();
    const showQR = options.qr !== false;

    log('Starting JetStart development server...');
    console.log();

    // Get project path and name
    const projectPath = process.cwd();
    const projectName = path.basename(projectPath);

    // Setup emulator deployment if requested
    let deployer: EmulatorDeployer | null = null;
    let packageName: string | null = null;

    if (options.emulator) {
      try {
        deployer = await EmulatorDeployer.findOrSelectEmulator(options.avd);

        // Try to read package name from build.gradle (modern Android)
        const buildGradlePath = path.join(projectPath, 'app/build.gradle');
        info(`Looking for build.gradle at: ${buildGradlePath}`);
        if (await fs.pathExists(buildGradlePath)) {
          const buildGradleContent = await fs.readFile(buildGradlePath, 'utf8');
          // Match both applicationId "..." and applicationId '...'
          const packageMatch = buildGradleContent.match(/applicationId\s+["']([^"']+)["']/);
          packageName = packageMatch ? packageMatch[1] : null;
          info(`Package name: ${packageName || 'NOT FOUND'}`);
        } else {
          warning('build.gradle not found - emulator deployment requires package name');
        }

        if (packageName) {
          success('Emulator deployment enabled');
        } else {
          warning('Emulator deployment disabled: package name not found');
        }
        console.log();
      } catch (err: any) {
        error(`Emulator setup failed: ${err.message}`);
        info('Continuing without emulator deployment...');
        console.log();
      }
    }

    // Create and start Core server
    // Bind to 0.0.0.0 to accept connections on all interfaces,
    // but pass the detected IP for display and client connections
    const server = new JetStartServer({
      httpPort: port,
      wsPort,
      host: '0.0.0.0', // Bind to all interfaces for maximum compatibility
      displayHost: host, // Use detected IP for display and client connections
      // Android emulators reach the host at 10.0.2.2 (not the LAN IP).
      // Inject this into BuildConfig so the emulator app connects correctly.
      emulatorHost: options.emulator ? '10.0.2.2' : undefined,
      webEnabled: !!options.web,
      projectPath,
      projectName,
    });

    const session = await server.start();

    // Listen for build completion and deploy to emulator
    if (deployer && packageName) {
      info(`Setting up build:complete listener for package: ${packageName}`);
      let hasDeployed = false; // Track if we've already deployed to prevent reinstall loops

      server.on('build:complete', async (result: any) => {
        info(`Build complete event received! APK: ${result.apkPath || 'NO APK PATH'}`);

        // Only deploy if this is the first time OR if it's a file-change build (not initial client connection)
        if (!hasDeployed && result.apkPath && deployer) {
          try {
            info('Deploying to emulator (initial deployment)...');
            await deployer.installAPK(result.apkPath, packageName!);
            await deployer.launchApp(packageName!);
            hasDeployed = true; // Mark as deployed to prevent reinstall loop
            success('Initial deployment complete. Future builds will be sent via hot reload.');
          } catch (err: any) {
            warning(`Emulator deployment failed: ${err.message}`);
          }
        } else if (hasDeployed) {
          info('Skipping deployment (app already installed, using hot reload)');
        } else {
          warning(`Skipping deployment: apkPath=${result.apkPath}, deployer=${!!deployer}`);
        }
      });
    } else {
      info(`Emulator deployment not configured: deployer=${!!deployer}, packageName=${packageName}`);
    }

    // Get URLs
    const serverUrl = `http://${host}:${port}`;
    const localUrl = `http://localhost:${port}`;

    console.log();
    success('JetStart dev server is running!');
    console.log();
    info(`Local:    ${chalk.cyan(localUrl)}`);
    info(`Network:  ${chalk.cyan(serverUrl)}`);
    info(`Project:  ${chalk.cyan(projectName)}`);
    console.log();

    // Generate QR code for mobile connection
    if (showQR) {
      // Ultra-compact format: host|port|wsPort|sessionId|token|projectName
      // Using short alphanumeric IDs for minimal QR code size
      const qrData = `${host}|${port}|${wsPort}|${session.id}|${session.token}|${projectName}`;

      console.log(chalk.bold('Scan QR or connect manually:'));
      qrcode.generate(qrData, { small: true });
      console.log();
      info(`IP: ${chalk.cyan(host)}`);
      info(`Session: ${chalk.dim(session.id)}`);
      info(`Token: ${chalk.dim(session.token)}`);
    }

    // Auto-open browser for Web Emulator if requested
    if (options.web && options.open !== false) {
      info('Opening Web Emulator...');
      openBrowser(localUrl);
    }

    info('Watching for file changes...');
    info('Press Ctrl+C to stop');
    console.log();

    // Handle graceful shutdown
    process.on('SIGINT', async () => {
      console.log();
      log('Shutting down dev server...');
      stopGradleDaemons(projectPath);
      await server.stop();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      console.log();
      log('Shutting down dev server...');
      stopGradleDaemons(projectPath);
      await server.stop();
      process.exit(0);
    });

    // Keep process alive
    await new Promise(() => {}); // Keep alive forever

  } catch (err: any) {
    error(`Failed to start dev server: ${err.message}`);
    console.error(err.stack);
    process.exit(1);
  }
}

function getLocalIP(): string {
  const interfaces = os.networkInterfaces();
  const preferredAddresses: string[] = [];
  const otherAddresses: string[] = [];

  for (const name of Object.keys(interfaces)) {
    const iface = interfaces[name];
    if (!iface) continue;

    // Skip virtual interfaces (Hyper-V, WSL, VPN, Docker, etc.)
    const lowerName = name.toLowerCase();
    if (lowerName.includes('vethernet') ||
        lowerName.includes('wsl') ||
        lowerName.includes('docker') ||
        lowerName.includes('vmware') ||
        lowerName.includes('virtualbox') ||
        lowerName.includes('vbox')) {
      continue;
    }

    for (const alias of iface) {
      // Handle both 'IPv4' string (Node.js 18+) and numeric 4 (older versions)
      const isIPv4 = alias.family === 'IPv4' || (alias.family as any) === 4;

      if (isIPv4 && !alias.internal) {
        // Prefer real network addresses (Wi-Fi, Ethernet, Hotspot)
        if (alias.address.startsWith('192.168') ||
            alias.address.startsWith('10.') ||
            alias.address.startsWith('172.')) {
          // Wi-Fi and regular network interfaces are preferred
          if (lowerName.includes('wi-fi') || lowerName.includes('wifi') ||
              lowerName.includes('wlan') || lowerName.includes('ethernet')) {
            return alias.address; // Return immediately for real interfaces
          }
          preferredAddresses.push(alias.address);
        } else {
          otherAddresses.push(alias.address);
        }
      }
    }
  }

  // Return first preferred address, then other addresses, then localhost
  if (preferredAddresses.length > 0) {
    return preferredAddresses[0];
  }
  if (otherAddresses.length > 0) {
    return otherAddresses[0];
  }

  return 'localhost';
}
