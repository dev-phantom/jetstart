/**
 * Dev Command
 * Starts the development server
 */

import chalk from 'chalk';
import qrcode from 'qrcode-terminal';
import { log, success, error, info } from '../utils/logger';
import { startSpinner, stopSpinner } from '../utils/spinner';
import { DEFAULT_CORE_PORT } from '@jetstart/shared';

interface DevOptions {
  port?: string;
  host?: string;
  qr?: boolean;
  open?: boolean;
}

export async function devCommand(options: DevOptions) {
  try {
    const port = parseInt(options.port || String(DEFAULT_CORE_PORT));
    const host = options.host || '0.0.0.0';
    const showQR = options.qr !== false;

    log('Starting JetStart development server...');
    console.log();

    // Start Core server (in real implementation, this would spawn the Core process)
    const spinner = startSpinner('Starting build server...');

    // Simulate server startup
    await new Promise(resolve => setTimeout(resolve, 1500));

    stopSpinner(spinner, true, 'Build server started');

    // Get local IP address
    const serverUrl = `http://${host}:${port}`;
    const localUrl = `http://localhost:${port}`;

    console.log();
    success('JetStart dev server is running!');
    console.log();
    info(`Local:    ${chalk.cyan(localUrl)}`);
    info(`Network:  ${chalk.cyan(serverUrl)}`);
    console.log();

    // Generate QR code for mobile connection
    if (showQR) {
      const qrData = {
        serverUrl,
        sessionId: 'demo-session-id',
        token: 'demo-token',
      };

      console.log(chalk.bold('📱 Scan this QR code with JetStart Client app:'));
      console.log();
      qrcode.generate(JSON.stringify(qrData), { small: true });
      console.log();
    }

    info('Watching for file changes...');
    info('Press Ctrl+C to stop');
    console.log();

    // Keep process alive
    process.on('SIGINT', () => {
      console.log();
      log('Shutting down dev server...');
      process.exit(0);
    });

    // Simulate watching for changes
    await new Promise(() => {}); // Keep alive forever

  } catch (err: any) {
    error(`Failed to start dev server: ${err.message}`);
    process.exit(1);
  }
}