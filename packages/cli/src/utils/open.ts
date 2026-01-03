/**
 * Open Browser Utility
 * Opens the default browser to a specific URL
 */

import { exec } from 'child_process';
import { platform } from 'os';

export function openBrowser(url: string): void {
  let command = '';
  
  switch (platform()) {
    case 'win32':
      command = `start "" "${url}"`;
      break;
    case 'darwin':
      command = `open "${url}"`;
      break;
    case 'linux':
      command = `xdg-open "${url}"`;
      break;
    default:
      console.warn('Cannot open browser: unsupported platform');
      return;
  }

  try {
    exec(command, (error) => {
      if (error) {
        console.warn(`Failed to open browser: ${error.message}`);
      }
    });
  } catch (err) {
    // Ignore errors, this is a convenience feature
  }
}
