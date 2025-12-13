/**
 * Download utilities with progress tracking
 */

import axios from 'axios';
import * as fs from 'fs-extra';
import * as path from 'path';
import { startSpinner, stopSpinner } from './spinner';
import { error as logError } from './logger';

export interface DownloadOptions {
  url: string;
  destination: string;
  progressLabel?: string;
  expectedSize?: number;
  timeout?: number;
}

/**
 * Format bytes into human-readable format
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

/**
 * Download a file with progress tracking
 */
export async function downloadWithProgress(options: DownloadOptions): Promise<void> {
  const {
    url,
    destination,
    progressLabel = 'Downloading',
    timeout = 300000, // 5 minutes default
  } = options;

  // Ensure destination directory exists
  await fs.ensureDir(path.dirname(destination));

  const response = await axios({
    url,
    method: 'GET',
    responseType: 'stream',
    timeout,
    headers: {
      'User-Agent': 'JetStart-CLI',
    },
  });

  const totalSize = parseInt(response.headers['content-length'] || '0', 10);
  let downloadedSize = 0;

  const spinner = startSpinner(`${progressLabel} (0%)`);

  return new Promise((resolve, reject) => {
    const writer = fs.createWriteStream(destination);

    response.data.on('data', (chunk: Buffer) => {
      downloadedSize += chunk.length;

      if (totalSize > 0) {
        const percent = Math.round((downloadedSize / totalSize) * 100);
        const downloaded = formatBytes(downloadedSize);
        const total = formatBytes(totalSize);
        spinner.text = `${progressLabel} (${percent}%) - ${downloaded} / ${total}`;
      } else {
        const downloaded = formatBytes(downloadedSize);
        spinner.text = `${progressLabel} - ${downloaded}`;
      }
    });

    response.data.pipe(writer);

    writer.on('finish', () => {
      stopSpinner(spinner, true, `${progressLabel} completed`);
      resolve();
    });

    writer.on('error', (err) => {
      stopSpinner(spinner, false, `${progressLabel} failed`);
      reject(err);
    });

    response.data.on('error', (err: Error) => {
      stopSpinner(spinner, false, `${progressLabel} failed`);
      reject(err);
    });
  });
}

/**
 * Sleep for a specified number of milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Download a file with retry logic and exponential backoff
 */
export async function downloadWithRetry(
  options: DownloadOptions,
  maxRetries: number = 3
): Promise<void> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await downloadWithProgress(options);
      return; // Success!
    } catch (err) {
      lastError = err as Error;

      if (attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
        console.log(`\nDownload failed (attempt ${attempt}/${maxRetries}). Retrying in ${delay / 1000}s...`);
        await sleep(delay);
      }
    }
  }

  logError(`Download failed after ${maxRetries} attempts: ${lastError?.message}`);
  throw lastError;
}

/**
 * Download and extract a ZIP file
 */
export async function downloadAndExtract(
  url: string,
  extractPath: string,
  progressLabel?: string
): Promise<void> {
  const extract = require('extract-zip');
  const tempZip = path.join(require('os').tmpdir(), `jetstart-download-${Date.now()}.zip`);

  try {
    // Download
    await downloadWithRetry({
      url,
      destination: tempZip,
      progressLabel: progressLabel || 'Downloading archive',
    });

    // Extract
    const spinner = startSpinner('Extracting archive...');
    try {
      await extract(tempZip, { dir: path.resolve(extractPath) });
      stopSpinner(spinner, true, 'Archive extracted successfully');
    } catch (err) {
      stopSpinner(spinner, false, 'Failed to extract archive');
      throw err;
    }
  } finally {
    // Clean up temp file
    try {
      await fs.remove(tempZip);
    } catch {
      // Ignore cleanup errors
    }
  }
}

/**
 * Check if a URL is accessible
 */
export async function checkUrlAccessible(url: string): Promise<boolean> {
  try {
    const response = await axios.head(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'JetStart-CLI',
      },
    });
    return response.status >= 200 && response.status < 400;
  } catch {
    return false;
  }
}

/**
 * Get file size from URL without downloading
 */
export async function getRemoteFileSize(url: string): Promise<number | null> {
  try {
    const response = await axios.head(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'JetStart-CLI',
      },
    });
    const size = response.headers['content-length'];
    return size ? parseInt(size, 10) : null;
  } catch {
    return null;
  }
}
