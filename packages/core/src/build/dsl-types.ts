/**
 * DSL Type Definitions for Server-Side
 * Represents UI elements that can be sent to Android app as JSON
 */

export interface UIDefinition {
  version: string;
  screen: DSLElement;
}

export interface DSLElement {
  type: string;
  text?: string;
  style?: string;
  color?: string;
  modifier?: DSLModifier;
  horizontalAlignment?: string;
  verticalArrangement?: string;
  contentAlignment?: string;
  height?: number;
  width?: number;
  onClick?: string;
  enabled?: boolean;
  imageVector?: string;
  tint?: string;
  contentDescription?: string;
  children?: DSLElement[];
}

export interface DSLModifier {
  fillMaxSize?: boolean;
  fillMaxWidth?: boolean;
  fillMaxHeight?: boolean;
  padding?: number;
  paddingHorizontal?: number;
  paddingVertical?: number;
  size?: number;
  height?: number;
  width?: number;
  weight?: number;
}

/**
 * Parse result from Kotlin file
 */
export interface ParseResult {
  success: boolean;
  dsl?: UIDefinition;
  errors?: string[];
}
