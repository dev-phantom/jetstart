/**
 * DSL Type Definitions
 * TypeScript interfaces matching the Kotlin DSL types from DSLTypes.kt
 */

export interface UIDefinition {
  version: string;
  screen: DSLElement;
}

export interface DSLElement {
  type: DSLElementType;
  text?: string;
  style?: TextStyle;
  color?: string;
  modifier?: DSLModifier;
  horizontalAlignment?: HorizontalAlignment;
  verticalAlignment?: VerticalAlignment;
  horizontalArrangement?: HorizontalArrangement;
  verticalArrangement?: VerticalArrangement;
  contentAlignment?: ContentAlignment;
  height?: number;
  width?: number;
  onClick?: string;
  enabled?: boolean;
  imageVector?: string;
  tint?: string;
  contentDescription?: string;
  children?: DSLElement[];
}

export type DSLElementType =
  | 'Column'
  | 'Row'
  | 'Box'
  | 'Text'
  | 'Button'
  | 'Spacer';

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

export type HorizontalAlignment =
  | 'Start'
  | 'CenterHorizontally'
  | 'End'
  | 'Center';

export type VerticalAlignment =
  | 'Top'
  | 'CenterVertically'
  | 'Bottom'
  | 'Center';

export type VerticalArrangement =
  | 'Top'
  | 'Center'
  | 'Bottom'
  | 'SpaceBetween'
  | 'SpaceAround'
  | 'SpaceEvenly';

export type HorizontalArrangement =
  | 'Start'
  | 'Center'
  | 'End'
  | 'SpaceBetween'
  | 'SpaceAround'
  | 'SpaceEvenly';

export type ContentAlignment =
  | 'Center'
  | 'TopCenter'
  | 'TopStart'
  | 'TopEnd'
  | 'BottomCenter'
  | 'BottomStart'
  | 'BottomEnd'
  | 'CenterStart'
  | 'CenterEnd';

export type TextStyle =
  | 'headlineLarge'
  | 'headlineMedium'
  | 'headlineSmall'
  | 'titleLarge'
  | 'titleMedium'
  | 'titleSmall'
  | 'bodyLarge'
  | 'bodyMedium'
  | 'bodySmall'
  | 'labelLarge'
  | 'labelMedium'
  | 'labelSmall';
