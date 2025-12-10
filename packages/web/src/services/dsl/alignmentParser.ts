/**
 * Alignment Parser
 * Converts DSL alignments to CSS flexbox properties
 * Mirrors Kotlin alignment parsing functions
 */

import {
  HorizontalAlignment,
  VerticalAlignment,
  ContentAlignment,
  VerticalArrangement,
  HorizontalArrangement,
} from '../../types/dsl';

export function parseHorizontalAlignment(
  alignment?: HorizontalAlignment
): string {
  switch (alignment?.toLowerCase()) {
    case 'start':
      return 'flex-start';
    case 'centerhorizontally':
    case 'center':
      return 'center';
    case 'end':
      return 'flex-end';
    default:
      return 'flex-start';
  }
}

export function parseVerticalAlignment(alignment?: VerticalAlignment): string {
  switch (alignment?.toLowerCase()) {
    case 'top':
      return 'flex-start';
    case 'centervertically':
    case 'center':
      return 'center';
    case 'bottom':
      return 'flex-end';
    default:
      return 'flex-start';
  }
}

export function parseContentAlignment(
  alignment?: ContentAlignment
): { justifyContent: string; alignItems: string } {
  const lowerAlignment = alignment?.toLowerCase();

  const map: Record<string, { justifyContent: string; alignItems: string }> = {
    center: { justifyContent: 'center', alignItems: 'center' },
    topcenter: { justifyContent: 'center', alignItems: 'flex-start' },
    topstart: { justifyContent: 'flex-start', alignItems: 'flex-start' },
    topend: { justifyContent: 'flex-end', alignItems: 'flex-start' },
    bottomcenter: { justifyContent: 'center', alignItems: 'flex-end' },
    bottomstart: { justifyContent: 'flex-start', alignItems: 'flex-end' },
    bottomend: { justifyContent: 'flex-end', alignItems: 'flex-end' },
    centerstart: { justifyContent: 'flex-start', alignItems: 'center' },
    centerend: { justifyContent: 'flex-end', alignItems: 'center' },
  };

  return (
    map[lowerAlignment || ''] || {
      justifyContent: 'flex-start',
      alignItems: 'flex-start',
    }
  );
}

export function parseVerticalArrangement(
  arrangement?: VerticalArrangement
): string {
  switch (arrangement?.toLowerCase()) {
    case 'top':
      return 'flex-start';
    case 'center':
      return 'center';
    case 'bottom':
      return 'flex-end';
    case 'spacebetween':
      return 'space-between';
    case 'spacearound':
      return 'space-around';
    case 'spaceevenly':
      return 'space-evenly';
    default:
      return 'flex-start';
  }
}

export function parseHorizontalArrangement(
  arrangement?: HorizontalArrangement
): string {
  switch (arrangement?.toLowerCase()) {
    case 'start':
      return 'flex-start';
    case 'center':
      return 'center';
    case 'end':
      return 'flex-end';
    case 'spacebetween':
      return 'space-between';
    case 'spacearound':
      return 'space-around';
    case 'spaceevenly':
      return 'space-evenly';
    default:
      return 'flex-start';
  }
}
