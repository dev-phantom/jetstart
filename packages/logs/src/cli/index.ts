/**
 * CLI Log Viewer
 * Terminal-based log viewer
 */

import { LogViewer } from './viewer';
import { LogFilter } from '@jetstart/shared';

export async function viewLogs(filter?: LogFilter): Promise<void> {
  const viewer = new LogViewer();
  await viewer.connect();
  viewer.subscribe(filter);

  // Keep process alive
  process.on('SIGINT', async () => {
    await viewer.disconnect();
    process.exit(0);
  });
}

export { LogViewer } from './viewer';
export { formatLog } from './formatter';