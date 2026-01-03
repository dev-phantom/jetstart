import React from 'react';
import { DSLElement } from '../../types/dsl';
import { parseModifier } from '../../services/dsl/modifierParser';
import { parseContentAlignment } from '../../services/dsl/alignmentParser';
import { DSLRenderer } from './DSLRenderer';
import './DSLComponents.css';

interface DSLBoxProps {
  element: DSLElement;
}

export function DSLBox({ element }: DSLBoxProps) {
  const modifierStyles = parseModifier(element.modifier);
  const { justifyContent, alignItems } = parseContentAlignment(
    element.contentAlignment
  );

  const styles: React.CSSProperties = {
    display: 'flex',
    position: 'relative',
    justifyContent,
    alignItems,
    ...modifierStyles,
  };

  return (
    <div className="dsl-box" style={styles}>
      {element.children?.map((child, index) => (
        <DSLRenderer key={index} element={child} />
      ))}
    </div>
  );
}
