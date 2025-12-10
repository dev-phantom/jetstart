import React from 'react';
import { DSLElement, TextStyle } from '../../types/dsl';
import { parseModifier, parseColor } from '../../services/dsl/modifierParser';
import './DSLComponents.css';

interface DSLTextProps {
  element: DSLElement;
}

function getTextStyleClass(style?: TextStyle): string {
  if (!style) return 'm3-body-medium';

  const styleMap: Record<TextStyle, string> = {
    headlineLarge: 'm3-headline-large',
    headlineMedium: 'm3-headline-medium',
    headlineSmall: 'm3-headline-small',
    titleLarge: 'm3-title-large',
    titleMedium: 'm3-title-medium',
    titleSmall: 'm3-title-small',
    bodyLarge: 'm3-body-large',
    bodyMedium: 'm3-body-medium',
    bodySmall: 'm3-body-small',
    labelLarge: 'm3-label-large',
    labelMedium: 'm3-label-medium',
    labelSmall: 'm3-label-small',
  };

  return styleMap[style] || 'm3-body-medium';
}

export function DSLText({ element }: DSLTextProps) {
  const modifierStyles = parseModifier(element.modifier);
  const color = parseColor(element.color);
  const textStyleClass = getTextStyleClass(element.style);

  const styles: React.CSSProperties = {
    ...modifierStyles,
    ...(color && { color }),
  };

  return (
    <span className={`dsl-text ${textStyleClass}`} style={styles}>
      {element.text || ''}
    </span>
  );
}
