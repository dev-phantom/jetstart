import React from 'react';
import { DSLElement } from '../../types/dsl';

interface DSLSpacerProps {
  element: DSLElement;
}

export function DSLSpacer({ element }: DSLSpacerProps) {
  const styles: React.CSSProperties = {
    width: element.width ? `${element.width}px` : 'auto',
    height: element.height ? `${element.height}px` : 'auto',
  };

  return <div className="dsl-spacer" style={styles}></div>;
}
