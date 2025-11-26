/**
 * Dev Command
 * Starts the development server
 */

import * as path from 'path';
import * as os from 'os';
import chalk from 'chalk';
import qrcode from 'qrcode-terminal';
import { log, success, error, info } from '../utils/logger';
import { JetStartServer } from '@jetstart/core';
import { DEFAULT_CORE_PORT, DEFAULT_WS_PORT } from '@jetstart/shared';

interface DevOptions {
  port?: string;
  host?: string;
  qr?: boolean;
  open?: boolean;
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

    // Create and start Core server
    const server = new JetStartServer({
      httpPort: port,
      wsPort,
      host: '0.0.0.0',
      projectPath,
      projectName,
    });

    const session = await server.start();

    // Get URLs
    const serverUrl = `http://${host}:${port}`;
    const wsUrl = `ws://${host}:${wsPort}`;
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
      const qrData = {
        serverUrl,
        wsUrl,
        sessionId: session.id,
        token: session.token,
        projectName,
        version: '0.1.0',
      };

      console.log(chalk.bold('📱 Scan this QR code with JetStart Client app:'));
      console.log();
      qrcode.generate(JSON.stringify(qrData), { small: true });
      console.log();
      info(`Session ID: ${chalk.dim(session.id)}`);
      info(`Token: ${chalk.dim(session.token)}`);
      console.log();
    }

    info('Watching for file changes...');
    info('Press Ctrl+C to stop');
    console.log();

    // Handle graceful shutdown
    process.on('SIGINT', async () => {
      console.log();
      log('Shutting down dev server...');
      await server.stop();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      console.log();
      log('Shutting down dev server...');
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

  for (const name of Object.keys(interfaces)) {
    const iface = interfaces[name];
    if (!iface) continue;

    for (const alias of iface) {
      if (alias.family === 'IPv4' && !alias.internal) {
        return alias.address;
      }
    }
  }

  return '0.0.0.0';
}
