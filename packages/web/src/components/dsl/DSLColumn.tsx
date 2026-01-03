import React from 'react';
import { DSLElement } from '../../types/dsl';
import { parseModifier } from '../../services/dsl/modifierParser';
import {
  parseHorizontalAlignment,
  parseVerticalArrangement,
} from '../../services/dsl/alignmentParser';
import { DSLRenderer } from './DSLRenderer';
import './DSLComponents.css';

interface DSLColumnProps {
  element: DSLElement;
}

export function DSLColumn({ element }: DSLColumnProps) {
  const modifierStyles = parseModifier(element.modifier);
  const alignItems = parseHorizontalAlignment(element.horizontalAlignment);
  const justifyContent = parseVerticalArrangement(element.verticalArrangement);

  const styles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems,
    justifyContent,
    ...modifierStyles,
  };

  return (
    <div className="dsl-column" style={styles}>
      {element.children?.map((child, index) => (
        <DSLRenderer key={index} element={child} />
      ))}
    </div>
  );
}
