import React from 'react';
import { DSLElement } from '../../types/dsl';
import { parseModifier } from '../../services/dsl/modifierParser';
import './DSLComponents.css';

interface DSLButtonProps {
  element: DSLElement;
  onButtonClick?: (action: string) => void;
}

export function DSLButton({ element, onButtonClick }: DSLButtonProps) {
  const modifierStyles = parseModifier(element.modifier);
  const enabled = element.enabled !== false;

  const handleClick = () => {
    if (element.onClick && enabled) {
      onButtonClick?.(element.onClick);
    }
  };

  const styles: React.CSSProperties = {
    ...modifierStyles,
  };

  return (
    <button
      className="dsl-button"
      style={styles}
      onClick={handleClick}
      disabled={!enabled}
    >
      {element.text || 'Button'}
    </button>
  );
}
