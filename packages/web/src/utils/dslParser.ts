/**
 * DSL Parser
 * Parses JSON DSL string to typed UIDefinition
 * Mirrors the Kotlin parseUIDefinition and parseDSLElement functions
 */

import { UIDefinition, DSLElement, DSLModifier } from '../types/dsl';

export class DSLParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DSLParseError';
  }
}

/**
 * Parse JSON string to UIDefinition
 * Throws DSLParseError if parsing fails
 */
export function parseUIDefinition(jsonString: string): UIDefinition {
  try {
    const json = JSON.parse(jsonString);

    if (!json.screen) {
      throw new DSLParseError('Missing "screen" property in UI definition');
    }

    return {
      version: json.version || '1.0',
      screen: parseDSLElement(json.screen),
    };
  } catch (error) {
    if (error instanceof DSLParseError) throw error;
    if (error instanceof SyntaxError) {
      throw new DSLParseError(`Invalid JSON: ${error.message}`);
    }
    throw new DSLParseError(`Failed to parse DSL: ${(error as Error).message}`);
  }
}

/**
 * Parse JSONObject to DSLElement recursively
 * Mirrors Kotlin parseDSLElement function
 */
function parseDSLElement(obj: any): DSLElement {
  if (!obj || typeof obj !== 'object') {
    throw new DSLParseError('DSL element must be an object');
  }

  if (!obj.type) {
    throw new DSLParseError('Missing "type" property in DSL element');
  }

  const element: DSLElement = {
    type: obj.type,
  };

  // Optional string properties
  if (obj.text !== undefined) element.text = obj.text;
  if (obj.style !== undefined) element.style = obj.style;
  if (obj.color !== undefined) element.color = obj.color;
  if (obj.horizontalAlignment !== undefined)
    element.horizontalAlignment = obj.horizontalAlignment;
  if (obj.verticalArrangement !== undefined)
    element.verticalArrangement = obj.verticalArrangement;
  if (obj.contentAlignment !== undefined)
    element.contentAlignment = obj.contentAlignment;
  if (obj.onClick !== undefined) element.onClick = obj.onClick;
  if (obj.imageVector !== undefined) element.imageVector = obj.imageVector;
  if (obj.tint !== undefined) element.tint = obj.tint;
  if (obj.contentDescription !== undefined)
    element.contentDescription = obj.contentDescription;

  // Optional number properties
  if (obj.height !== undefined) element.height = obj.height;
  if (obj.width !== undefined) element.width = obj.width;

  // Optional boolean property
  if (obj.enabled !== undefined) element.enabled = obj.enabled;

  // Parse modifier if present
  if (obj.modifier) {
    element.modifier = parseDSLModifier(obj.modifier);
  }

  // Parse children recursively
  if (obj.children && Array.isArray(obj.children)) {
    try {
      element.children = obj.children.map((child: any, index: number) => {
        try {
          return parseDSLElement(child);
        } catch (error) {
          throw new DSLParseError(
            `Error parsing child element at index ${index}: ${(error as Error).message}`
          );
        }
      });
    } catch (error) {
      throw error; // Re-throw with context already added
    }
  }

  return element;
}

/**
 * Parse DSL modifier object
 * Mirrors Kotlin DSLModifier parsing
 */
function parseDSLModifier(obj: any): DSLModifier {
  if (!obj || typeof obj !== 'object') {
    throw new DSLParseError('Modifier must be an object');
  }

  const modifier: DSLModifier = {};

  // Boolean properties
  if (obj.fillMaxSize !== undefined)
    modifier.fillMaxSize = Boolean(obj.fillMaxSize);
  if (obj.fillMaxWidth !== undefined)
    modifier.fillMaxWidth = Boolean(obj.fillMaxWidth);
  if (obj.fillMaxHeight !== undefined)
    modifier.fillMaxHeight = Boolean(obj.fillMaxHeight);

  // Number properties
  if (obj.padding !== undefined) modifier.padding = Number(obj.padding);
  if (obj.paddingHorizontal !== undefined)
    modifier.paddingHorizontal = Number(obj.paddingHorizontal);
  if (obj.paddingVertical !== undefined)
    modifier.paddingVertical = Number(obj.paddingVertical);
  if (obj.size !== undefined) modifier.size = Number(obj.size);
  if (obj.height !== undefined) modifier.height = Number(obj.height);
  if (obj.width !== undefined) modifier.width = Number(obj.width);
  if (obj.weight !== undefined) modifier.weight = Number(obj.weight);

  return modifier;
}
