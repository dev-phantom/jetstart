/**
 * Modifier Parser
 * Converts DSL modifiers to CSS styles
 * Mirrors the Kotlin parseModifier function
 */

import { DSLModifier } from '../../types/dsl';

export interface CSSStyles {
  [key: string]: string | number;
}

/**
 * Convert DSL modifier to CSS styles
 * Mirrors the Kotlin parseModifier function
 * dp units converted to px at 1:1 ratio for web
 */
export function parseModifier(modifier?: DSLModifier): CSSStyles {
  const styles: CSSStyles = {};

  if (!modifier) return styles;

  // Fill modifiers
  if (modifier.fillMaxSize) {
    styles.width = '100%';
    styles.height = '100%';
  }
  if (modifier.fillMaxWidth) {
    styles.width = '100%';
  }
  if (modifier.fillMaxHeight) {
    styles.height = '100%';
  }

  // Padding modifiers (dp converted to px at 1:1 ratio for web)
  if (modifier.padding !== undefined) {
    styles.padding = `${modifier.padding}px`;
  }
  if (modifier.paddingHorizontal !== undefined) {
    styles.paddingLeft = `${modifier.paddingHorizontal}px`;
    styles.paddingRight = `${modifier.paddingHorizontal}px`;
  }
  if (modifier.paddingVertical !== undefined) {
    styles.paddingTop = `${modifier.paddingVertical}px`;
    styles.paddingBottom = `${modifier.paddingVertical}px`;
  }

  // Size modifiers
  if (modifier.size !== undefined) {
    styles.width = `${modifier.size}px`;
    styles.height = `${modifier.size}px`;
  }
  if (modifier.height !== undefined) {
    styles.height = `${modifier.height}px`;
  }
  if (modifier.width !== undefined) {
    styles.width = `${modifier.width}px`;
  }

  // Weight is handled by parent flexbox
  if (modifier.weight !== undefined) {
    styles.flex = modifier.weight;
  }

  return styles;
}

/**
 * Parse color string (hex format)
 */
export function parseColor(colorString?: string): string | undefined {
  if (!colorString) return undefined;

  // Support hex colors
  if (colorString.startsWith('#')) {
    return colorString;
  }

  return undefined;
}
