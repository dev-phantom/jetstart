/**
 * Spinner Utility
 * Loading spinners for long-running operations
 */

import ora, { Ora } from 'ora';

export function startSpinner(text: string): Ora {
  return ora({
    text,
    color: 'cyan',
  }).start();
}

export function stopSpinner(spinner: Ora, success: boolean, text?: string) {
  if (success) {
    spinner.succeed(text || spinner.text);
  } else {
    spinner.fail(text || spinner.text);
  }
}

export function updateSpinner(spinner: Ora, text: string) {
  spinner.text = text;
}