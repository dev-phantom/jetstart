import { DSLElement } from '../../types/dsl';
import { DSLColumn } from './DSLColumn';
import { DSLRow } from './DSLRow';
import { DSLBox } from './DSLBox';
import { DSLText } from './DSLText';
import { DSLButton } from './DSLButton';
import { DSLSpacer } from './DSLSpacer';

interface DSLRendererProps {
  element: DSLElement;
  onButtonClick?: (action: string) => void;
}

/**
 * Main DSL Renderer component
 * Mirrors Kotlin DSLInterpreter.RenderElement
 */
export function DSLRenderer({ element, onButtonClick }: DSLRendererProps) {
  switch (element.type) {
    case 'Column':
      return <DSLColumn element={element} />;
    case 'Row':
      return <DSLRow element={element} />;
    case 'Box':
      return <DSLBox element={element} />;
    case 'Text':
      return <DSLText element={element} />;
    case 'Button':
      return <DSLButton element={element} onButtonClick={onButtonClick} />;
    case 'Spacer':
      return <DSLSpacer element={element} />;
    default:
      return (
        <div style={{ color: 'red', padding: '8px' }}>
          Unsupported element type: {element.type}
        </div>
      );
  }
}
