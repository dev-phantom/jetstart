/**
 * JetStart Brand Colors
 * Official color palette for consistent branding
 */

export const BRAND_COLORS = {
  // Primary Colors
  ORANGE: '#FA8F14',
  RED_ORANGE: '#F04023',

  // Background Colors
  DARK_PURPLE: '#160E36',
  DEEPER_PURPLE: '#120A24',

  // Text/Foreground
  CREAM: '#F8F3F0',
} as const;

/**
 * Terminal color codes for CLI output
 */
export const TERMINAL_COLORS = {
  // Foreground colors
  ORANGE: '\x1b[38;2;250;143;20m',
  RED_ORANGE: '\x1b[38;2;240;64;35m',
  CREAM: '\x1b[38;2;248;243;240m',

  // Background colors
  BG_DARK_PURPLE: '\x1b[48;2;22;14;54m',
  BG_DEEPER_PURPLE: '\x1b[48;2;18;10;36m',

  // Utility
  RESET: '\x1b[0m',
  BOLD: '\x1b[1m',
  DIM: '\x1b[2m',
} as const;

/**
 * Helper function to colorize terminal output
 */
export function colorize(text: string, color: keyof typeof TERMINAL_COLORS): string {
  return `${TERMINAL_COLORS[color]}${text}${TERMINAL_COLORS.RESET}`;
}

/**
 * Commonly used color combinations
 */
export const COLOR_PRESETS = {
  success: (text: string) => colorize(text, 'ORANGE'),
  error: (text: string) => colorize(text, 'RED_ORANGE'),
  info: (text: string) => colorize(text, 'CREAM'),
  highlight: (text: string) => `${TERMINAL_COLORS.BOLD}${colorize(text, 'ORANGE')}`,
} as const;
