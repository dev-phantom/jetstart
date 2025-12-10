import React from 'react';
import { DSLElement } from '../../types/dsl';
import { parseModifier } from '../../services/dsl/modifierParser';
import {
  parseVerticalAlignment,
  parseHorizontalArrangement,
} from '../../services/dsl/alignmentParser';
import { DSLRenderer } from './DSLRenderer';
import './DSLComponents.css';

interface DSLRowProps {
  element: DSLElement;
}

export function DSLRow({ element }: DSLRowProps) {
  const modifierStyles = parseModifier(element.modifier);
  const alignItems = parseVerticalAlignment(element.verticalAlignment);
  const justifyContent = parseHorizontalArrangement(
    element.horizontalArrangement
  );

  const styles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'row',
    alignItems,
    justifyContent,
    ...modifierStyles,
  };

  return (
    <div className="dsl-row" style={styles}>
      {element.children?.map((child, index) => (
        <DSLRenderer key={index} element={child} />
      ))}
    </div>
  );
}
